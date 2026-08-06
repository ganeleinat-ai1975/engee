import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });

function applyDiscount(price, type, value) {
  if (!price || !value) return price;
  if (type === 'percentage') return Math.round(price * (1 - value / 100));
  if (type === 'fixed') return Math.max(0, price - value);
  return price;
}

function getSalePrice(product, activeSale) {
  if (!activeSale || !activeSale.is_active || !product?.price) return null;

  const now = new Date();
  if (activeSale.start_date && new Date(activeSale.start_date) > now) return null;
  if (activeSale.end_date) {
    const endDate = new Date(activeSale.end_date);
    endDate.setHours(23, 59, 59, 999);
    if (endDate < now) return null;
  }

  const isSpecific = activeSale.product_ids?.includes(product.id);
  let salePrice = null;

  if (activeSale.scope === 'all') {
    salePrice = applyDiscount(product.price, activeSale.discount_type, activeSale.discount_value);
  } else if (activeSale.scope === 'specific') {
    if (!isSpecific) return null;
    salePrice = applyDiscount(product.price, activeSale.discount_type, activeSale.discount_value);
  } else if (activeSale.scope === 'all_plus_specific') {
    salePrice = applyDiscount(product.price, activeSale.discount_type, activeSale.discount_value);
    if (isSpecific && activeSale.extra_discount_value > 0) {
      salePrice = applyDiscount(salePrice, activeSale.extra_discount_type, activeSale.extra_discount_value);
    }
  }

  if (salePrice !== null && salePrice >= product.price) return null;
  return salePrice;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const cardcomCfg = {
      term: "171388",
      user: "wCeznIjAHJmLGMVrNVAp",
      pass: Deno.env.get("CARDCOM_API_PASSWORD") ?? "",
      lpUrl: "https://secure.cardcom.solutions/Interface/LowProfile.aspx",
    };

    const { orderData } = await req.json();

    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return json({ success: false, error: "Order data is missing or invalid" }, 400);
    }
    if (!orderData.user_email || !orderData.customer_name) {
      return json({ success: false, error: "Missing customer details" }, 400);
    }

    // === אבטחה: חישוב כל המחירים בצד השרת - מתעלמים מהמחירים שנשלחו מהלקוח ===
    const [settingsList, activeSales] = await Promise.all([
      svc.entities.SiteSettings.list(),
      svc.entities.Sale.filter({ is_active: true }),
    ]);
    const settings = settingsList.length > 0 ? settingsList[0] : null;
    const activeSale = activeSales.length > 0 ? activeSales[0] : null;
    const goldPlatingPrice = settings?.gold_plating_price ?? 100;

    const productIds = [...new Set(orderData.items.map((i) => i.product_id))];
    const productsList = await Promise.all(productIds.map((id) => svc.entities.Product.get(id).catch(() => null)));
    const productsMap = {};
    for (const p of productsList) {
      if (p) productsMap[p.id] = p;
    }

    let subtotal = 0;
    let saleDiscount = 0;
    const serverItems = [];

    for (const item of orderData.items) {
      const product = productsMap[item.product_id];
      if (!product) {
        return json({ success: false, error: `Product not found: ${item.product_id}` }, 400);
      }
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const salePrice = getSalePrice(product, activeSale);
      const basePrice = salePrice !== null ? salePrice : (product.price || 0);
      const goldPlating = item.gold_plating === true;
      const unitPrice = basePrice + (goldPlating ? goldPlatingPrice : 0);

      if (salePrice !== null) {
        saleDiscount += (product.price - salePrice) * quantity;
      }
      subtotal += unitPrice * quantity;

      serverItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity,
        price: unitPrice,
        size: item.size || null,
        gold_plating: goldPlating,
      });
    }

    // אימות קופון בצד השרת
    let couponDiscount = 0;
    let couponCode = null;
    if (orderData.coupon_code) {
      const coupons = await svc.entities.Coupon.filter({
        code: String(orderData.coupon_code).trim().toUpperCase(),
        is_active: true,
      });
      if (coupons.length > 0) {
        const coupon = coupons[0];
        const now = new Date();
        const validStart = !coupon.start_date || new Date(coupon.start_date) <= now;
        const validEnd = !coupon.end_date || new Date(coupon.end_date) >= now;
        if (validStart && validEnd) {
          couponDiscount = coupon.type === 'percentage'
            ? (subtotal * coupon.value) / 100
            : coupon.value;
          couponDiscount = Math.min(couponDiscount, subtotal);
          couponCode = coupon.code;
        }
      }
    }

    // חישוב משלוח בצד השרת
    const shippingMethod = orderData.shipping_method === 'pickup' ? 'pickup' : 'delivery';
    let shippingCost = 0;
    if (shippingMethod === 'delivery') {
      const freeShippingThreshold = settings?.free_shipping_threshold ?? 999999;
      const defaultShippingCost = settings?.shipping_cost ?? 0;
      shippingCost = (subtotal - couponDiscount) >= freeShippingThreshold ? 0 : defaultShippingCost;
    }

    const totalAmount = Math.round((subtotal - couponDiscount + shippingCost) * 100) / 100;

    if (totalAmount <= 0) {
      return json({ success: false, error: "Invalid order total" }, 400);
    }

    // יצירת מספר הזמנה רצוף
    let orderNumber;
    try {
      const latestOrdersByNumber = await svc.entities.Order.list("-order_number", 200);
      const lastSequentialOrder = latestOrdersByNumber.find((o) => o.order_number < 100000);
      orderNumber = lastSequentialOrder ? lastSequentialOrder.order_number + 1 : 1095;
    } catch (_e) {
      orderNumber = Math.floor(Math.random() * 90000) + 10000;
    }

    // יצירת ההזמנה - רק עם שדות מאושרים וערכים שחושבו בשרת
    const newOrder = await svc.entities.Order.create({
      order_number: orderNumber,
      user_email: orderData.user_email,
      guest_id: orderData.guest_id || null,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone || '',
      shipping_address: shippingMethod === 'delivery' ? orderData.shipping_address : null,
      shipping_method: shippingMethod,
      items: serverItems,
      subtotal,
      shipping_cost: shippingCost,
      coupon_code: couponCode,
      coupon_discount: couponDiscount,
      sale_discount: saleDiscount,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
      email_sent: false,
      notes: orderData.notes || '',
      language: orderData.language === 'en' ? 'en' : 'he',
    });

    if (!newOrder || !newOrder.id) {
      return json({ success: false, error: "Failed to create order in DB" }, 500);
    }

    if (!cardcomCfg.pass) {
      return json({ success: false, error: "Payment system not configured" }, 500);
    }

    const formData = new URLSearchParams({
      TerminalNumber: cardcomCfg.term,
      UserName: cardcomCfg.user,
      Password: cardcomCfg.pass,
      Operation: "1",
      CoinID: "1",
      Sum: totalAmount.toString(),
      SumToBill: totalAmount.toString(),
      NumOfPayments: "1",
      APILevel: "10",
      codepage: "65001",
      LowProfileCode: "",
      InternalDealNumber: orderNumber.toString(),
      SuccessRedirectUrl: `${req.headers.get("origin")}/OrderSuccess?orderNumber=${orderNumber}&status=success`,
      ErrorRedirectUrl: `${req.headers.get("origin")}/OrderSuccess?orderNumber=${orderNumber}&status=error`,
      "InvoiceHead.CustName": newOrder.customer_name,
      "InvoiceHead.SendByEmail": "true",
      "InvoiceHead.Email": orderData.user_email,
      "InvoiceHead.Language": "he",
      "InvoiceHead.CoinID": "1",
      "InvoiceLines1.Description": "רכישה באתר אנג׳י",
      "InvoiceLines1.Price": totalAmount.toString(),
      "InvoiceLines1.Quantity": "1",
    });

    const cardcomResponse = await fetch(cardcomCfg.lpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const responseText = await cardcomResponse.text();
    const params = new URLSearchParams(responseText);
    const responseCode = params.get("ResponseCode");

    if (responseCode !== "0") {
      const errorDesc = params.get("Description") || "Unknown Cardcom error";
      await svc.entities.Order.delete(newOrder.id);
      return json({ success: false, error: `Cardcom error ${responseCode}: ${errorDesc}` }, 502);
    }

    const paymentUrl = decodeURIComponent(params.get("url") || "");
    const lowProfileCode = params.get("LowProfileCode");

    await svc.entities.Order.update(newOrder.id, {
      payment_intent_id: lowProfileCode,
    });

    return json({ success: true, paymentUrl });

  } catch (error) {
    console.error('Process Order function error:', error);
    return json({ success: false, error: error.message || "Internal server error" }, 500);
  }
}