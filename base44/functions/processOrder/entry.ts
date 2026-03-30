import { createClient } from "npm:@base44/sdk@0.1.0";

const b44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") });

const cardcomCfg = {
  term : "171388",
  user : "wCeznIjAHJmLGMVrNVAp",
  pass : Deno.env.get("CARDCOM_API_PASSWORD") ?? "",
  lpUrl: "https://secure.cardcom.solutions/Interface/LowProfile.aspx",
};

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });

// פונקציה ליצירת מספר הזמנה רצוף
const generateOrderNumber = async () => {
  try {
    // שליפת 200 ההזמנות האחרונות לפי מספר הזמנה יורד
    const latestOrdersByNumber = await b44.entities.Order.list("-order_number", 200);

    if (latestOrdersByNumber.length === 0) {
      return 1095; // נקודת התחלה בטוחה אם אין הזמנות כלל
    }

    // מציאת ההזמנה הראשונה עם מספר רציף (קטן מ-100,000)
    const lastSequentialOrder = latestOrdersByNumber.find(o => o.order_number < 100000);
    
    if (lastSequentialOrder) {
      // אם נמצאה הזמנה כזו, ממשיכים מהמספר הבא
      return lastSequentialOrder.order_number + 1;
    } else {
      // אם לא נמצא (מקרה קצה), מתחילים מ-1095 כפי שביקשת
      return 1095;
    }

  } catch (error) {
    console.error("Error generating order number:", error);
    // גיבוי למקרה של שגיאה - מספר רנדומלי גבוה כדי למנוע התנגשות
    return Math.floor(Math.random() * 90000) + 10000;
  }
};

Deno.serve(async (req) => {
  try {
    const { orderData } = await req.json();

    if (!orderData || !orderData.items || orderData.items.length === 0) {
      return json({ success: false, error: "Order data is missing or invalid" }, 400);
    }

    // הוסף logging לבדיקת המייל שמגיע
    console.log("Order data received:", {
      user_email: orderData.user_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone
    });

    // יצירת מספר הזמנה רצוף ופשוט
    const orderNumber = await generateOrderNumber();
    
    // 1. Create the Order with proper order number
    const newOrder = await b44.entities.Order.create({
      ...orderData,
      order_number: orderNumber
    });

    if (!newOrder || !newOrder.id) {
       return json({ success: false, error: "Failed to create order in DB" }, 500);
    }

    console.log("Order created with email:", newOrder.user_email);

    // 2. Create Cardcom Payment
    if (!cardcomCfg.pass) {
      return json({ success: false, error: "Payment system not configured" }, 500);
    }

    // ודא שהמייל הנכון נשלח לקארדקום
    const customerEmail = newOrder.user_email || orderData.user_email;
    
    console.log("Sending to Cardcom with email:", customerEmail);

    const formData = new URLSearchParams({
      TerminalNumber: cardcomCfg.term,
      UserName: cardcomCfg.user,
      Password: cardcomCfg.pass,
      Operation: "1",
      CoinID: "1",
      Sum: newOrder.total_amount.toString(),
      SumToBill: newOrder.total_amount.toString(),
      NumOfPayments: "1",
      APILevel: "10",
      codepage: "65001",
      LowProfileCode: "",
      InternalDealNumber: newOrder.order_number.toString(),
      SuccessRedirectUrl: `${req.headers.get("origin")}/OrderSuccess?orderNumber=${newOrder.order_number}&status=success`,
      ErrorRedirectUrl: `${req.headers.get("origin")}/OrderSuccess?orderNumber=${newOrder.order_number}&status=error`,
      "InvoiceHead.CustName": newOrder.customer_name,
      "InvoiceHead.SendByEmail": "true",
      "InvoiceHead.Email": customerEmail, // השתמש במייל המאומת
      "InvoiceHead.Language": "he",
      "InvoiceHead.CoinID": "1",
      "InvoiceLines1.Description": "רכישה באתר אנג׳י",
      "InvoiceLines1.Price": newOrder.total_amount.toString(),
      "InvoiceLines1.Quantity": "1",
    });

    console.log("Cardcom form data:", Object.fromEntries(formData.entries()));

    const cardcomResponse = await fetch(cardcomCfg.lpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const responseText = await cardcomResponse.text();
    const params = new URLSearchParams(responseText);
    const responseCode = params.get("ResponseCode");

    console.log("Cardcom response:", responseText);

    if (responseCode !== "0") {
      const errorDesc = params.get("Description") || "Unknown Cardcom error";
      // Attempt to delete the failed order to prevent clutter
      await b44.entities.Order.delete(newOrder.id);
      return json({ success: false, error: `Cardcom error ${responseCode}: ${errorDesc}` }, 502);
    }

    const paymentUrl = decodeURIComponent(params.get("url") || "");
    const lowProfileCode = params.get("LowProfileCode");

    // 3. Update the order with payment intent ID
    await b44.entities.Order.update(newOrder.id, {
      payment_intent_id: lowProfileCode,
    });

    return json({
      success: true,
      paymentUrl,
    });

  } catch (error) {
    console.error('Process Order function error:', error);
    return json({ success: false, error: error.message || "Internal server error" }, 500);
  }
});