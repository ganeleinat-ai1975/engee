import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const generateCustomerEmailHtml = (order, siteSettings, language) => {
    const itemsHtml = order.items.map(
      (item, i) => `
      <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
        <strong>${i + 1}. ${item.product_name}</strong><br>
        <span style="color: #555;">
        ${language === 'he' ? `כמות: ${item.quantity}${item.size ? ` | מידה: ${item.size}` : ''}` :
        `Quantity: ${item.quantity}${item.size ? ` | Size: ${item.size}` : ''}`}
        ${item.gold_plating ? (language === 'he' ? ' | ציפוי זהב' : ' | Gold Plating') : ''}
        </span><br>
        <strong>₪${(item.price * item.quantity).toLocaleString()}</strong>
      </div>`
    ).join('');

    const summaryHtml = `
      <div style="margin-top: 20px; padding-top: 10px; border-top: 2px solid #ddd;">
          <p style="margin: 5px 0;">${language === 'he' ? 'סכום ביניים' : 'Subtotal'}: ₪${order.subtotal.toLocaleString()}</p>
          ${order.coupon_discount > 0 ? `<p style="margin: 5px 0; color: green;">${language === 'he' ? 'הנחת קופון' : 'Coupon Discount'}: -₪${order.coupon_discount.toLocaleString()}</p>` : ''}
          <p style="margin: 5px 0;">${language === 'he' ? 'משלוח' : 'Shipping'}: ${order.shipping_cost === 0 ? (language === 'he' ? 'חינם 🎁' : 'Free 🎁') : `₪${order.shipping_cost}`}</p>
          <p style="margin: 10px 0; font-size: 1.2em;"><strong>${language === 'he' ? 'סה"כ' : 'Total'}: ₪${order.total_amount.toLocaleString()}</strong></p>
      </div>
    `;

    const greeting = language === 'he'
      ? `<h2>איזה כיף שרכשת ב-ENGEE!</h2><p>ההזמנה שלך התקבלה ומספרה ${order.order_number}. היא תכף יוצאת להכנה ✨</p>`
      : `<h2>Thank you for your purchase from ENGEE!</h2><p>Your order #${order.order_number} has been received and is being prepared ✨</p>`;

    return `
      <div style="font-family:Arial,sans-serif;direction:${language === 'he' ? 'rtl' : 'ltr'};text-align:${language === 'he' ? 'right' : 'left'};max-width:600px;margin:auto;border:1px solid #ddd;padding:20px;">
        ${siteSettings?.logo_url ? `<div style="text-align:center;margin-bottom:20px;"><img src="${siteSettings.logo_url}" alt="ENGEE" style="max-width:150px;"></div>` : ''}
        ${greeting}
        <h3 style="border-bottom:2px solid #eee;padding-bottom:10px;">${language === 'he' ? 'פירוט ההזמנה' : 'Order Details'}</h3>
        ${itemsHtml}
        ${summaryHtml}
        <p style="margin-top:20px;"><strong>${language === 'he' ? 'שלך, צוות ENGEE' : 'Yours, The ENGEE Team'}</strong></p>
      </div>`;
};

const generateAdminEmailHtml = (order, targetEmail) => {
    const itemsHtml = order.items.map(
      (item, i) => `
      <div style="padding: 5px 0;">
        ${i + 1}. ${item.product_name} (x${item.quantity}) ${item.size ? `[מידה: ${item.size}]` : ''} ${item.gold_plating ? '[ציפוי זהב]' : ''} - ₪${(item.price * item.quantity).toLocaleString()}
      </div>`
    ).join('');

    const shippingInfo = order.shipping_method === 'delivery' && order.shipping_address
        ? `${order.shipping_address.street}, ${order.shipping_address.city}, ${order.shipping_address.country || ''} ${order.shipping_address.postal_code || ''}`
        : 'איסוף עצמי';

    return `
      <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
        <h2>התקבלה הזמנה חדשה!</h2>
        <p><strong>הזמנה מס׳ ${order.order_number}</strong></p>
        <hr>
        <h3>פרטי לקוח:</h3>
        <p><strong>שם:</strong> ${order.customer_name}</p>
        <p><strong>טלפון:</strong> ${order.customer_phone}</p>
        <p><strong>אימייל:</strong> ${targetEmail || "לא נמצא (אורח)"}</p>
        <p><strong>כתובת למשלוח:</strong> ${shippingInfo}</p>
        <p><strong>הערות:</strong> ${order.notes || '—'}</p>
        <hr>
        <h3>פרטי הזמנה:</h3>
        ${itemsHtml}
        <hr>
        <p><strong>סה"כ: ₪${order.total_amount.toLocaleString()}</strong></p>
        <p>תאריך: ${new Date(order.created_date).toLocaleString('he-IL')}</p>
      </div>`;
};

// ===================== Takbull =====================
const TAKBULL_API = "https://api.takbull.co.il";
const TAKBULL_COMPLETED = 3; // GetOrder.orderStatus: 0=Pending,1=Failed,2=Processing,3=Completed,4=OnHold,5=Cancelled,6=Refunded,9=Abandoned

// קורא את הבקשה בכל צורה: POST JSON מהדף, או IPN מתקבול (GET עם query / POST form / POST JSON)
async function readInput(req) {
    const url = new URL(req.url);
    const q = Object.fromEntries(url.searchParams.entries());
    let body = {};
    if (req.method === "POST") {
        const text = await req.text();
        if (text) {
            try { body = JSON.parse(text); }
            catch (_e) { body = Object.fromEntries(new URLSearchParams(text).entries()); }
        }
    }
    const all = { ...q, ...body };
    const uniqId = all.uniqId || all.uniqid || all.UniqId || null;
    const orderNumber = all.orderNumber || all.order_reference || all.orderReference || null;
    return { uniqId, orderNumber, isIpn: !!uniqId };
}

async function verifyTakbull(order) {
    const key = Deno.env.get("TAKBULL_API_KEY") ?? "";
    const secret = Deno.env.get("TAKBULL_API_SECRET") ?? "";
    if (!key || !secret) return { ok: false, reason: "Takbull not configured" };

    const res = await fetch(`${TAKBULL_API}/api/ExtranalAPI/GetOrder?orderUniqId=${encodeURIComponent(order.payment_intent_id)}`, {
        headers: { "API_Key": key, "API_Secret": secret },
    });
    if (!res.ok) return { ok: false, reason: `GetOrder HTTP ${res.status}` };
    const t = await res.json();

    const expected = Number(order.payment_charge_amount ?? order.total_amount);
    const checks = {
        uniqId: t.uniqId === order.payment_intent_id,
        reference: String(t.order_reference) === String(order.order_number),
        amount: Math.abs(Number(t.orderTotalSum) - expected) < 0.01,
        completed: t.orderStatus === TAKBULL_COMPLETED,
    };
    console.log(`verifyTakbull #${order.order_number}: orderStatus=${t.orderStatus} checks=${JSON.stringify(checks)} invoices=${JSON.stringify(t.invoices ?? null).slice(0, 500)}`);

    const ok = Object.values(checks).every(Boolean);
    const inv = Array.isArray(t.invoices) && t.invoices.length > 0 ? t.invoices[t.invoices.length - 1] : null;
    return {
        ok,
        failed: [1, 5, 9].includes(t.orderStatus),
        reason: ok ? null : `checks failed: ${JSON.stringify(checks)}`,
        receipt: inv ? {
            receipt_number: String(inv.documentNumber ?? inv.number ?? "") || null,
            receipt_pdf_url: inv.documentUrl || inv.pdfUrl || inv.url || inv.link || null,
        } : null,
    };
}

async function verifyCardcom(order) {
    const verifyParams = new URLSearchParams({
        terminalnumber: "171388",
        username: "wCeznIjAHJmLGMVrNVAp",
        lowprofilecode: order.payment_intent_id,
        codepage: "65001",
    });
    const verifyResponse = await fetch(
        `https://secure.cardcom.solutions/Interface/BillGoldGetLowProfileIndicator.aspx?${verifyParams.toString()}`
    );
    const verifyResult = new URLSearchParams(await verifyResponse.text());
    const operationResponse = verifyResult.get("OperationResponse");
    const dealResponse = verifyResult.get("DealResponse");
    console.log(`verifyCardcom #${order.order_number} - OperationResponse: ${operationResponse}, DealResponse: ${dealResponse}`);
    return { ok: operationResponse === "0" && dealResponse === "0" };
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { orderNumber, uniqId, isIpn } = await readInput(req);
        
        if (!orderNumber) {
            return new Response(JSON.stringify({ success: false, error: "Order number is required" }), { status: 400 });
        }

        console.log(`processOrderSuccess: Processing order #${orderNumber}`);

        // שימוש ב-service role כדי לגשת לנתונים ללא תלות באם המשתמש מחובר או לא
        const [orders, settingsList] = await Promise.all([
            base44.asServiceRole.entities.Order.filter({ order_number: parseInt(orderNumber, 10) }),
            base44.asServiceRole.entities.SiteSettings.list()
        ]);

        if (!orders || orders.length === 0) {
            console.error(`processOrderSuccess: Order #${orderNumber} not found`);
            return new Response(JSON.stringify({ success: false, error: "Order not found" }), { status: 404 });
        }

        const order = orders[0];
        const siteSettings = settingsList.length > 0 ? settingsList[0] : null;
        const adminEmail = siteSettings?.order_notification_email || "info@engee-jewelry.com";
        const language = order.language || 'he';

        console.log(`processOrderSuccess: Found order #${order.order_number}, current status: ${order.status}`);

        // IPN מתקבול: חייב להתאים למזהה התשלום שנשמר על ההזמנה
        if (isIpn && order.payment_intent_id !== uniqId) {
            console.error(`processOrderSuccess: IPN uniqId mismatch for order #${order.order_number}`);
            return new Response(JSON.stringify({ success: false, error: "Order not found" }), { status: 404 });
        }

        // שלב 1: אימות התשלום מול ספק הסליקה לפני עדכון הסטטוס
        if (order.status !== 'paid') {
            if (!order.payment_intent_id) {
                console.error(`processOrderSuccess: Order #${order.order_number} has no payment_intent_id - cannot verify payment`);
                return new Response(JSON.stringify({ success: false, error: "Payment not verified" }), { status: 402 });
            }

            const provider = order.payment_provider || 'cardcom';
            const verification = provider === 'takbull' ? await verifyTakbull(order) : await verifyCardcom(order);

            if (!verification.ok) {
                console.error(`processOrderSuccess: Payment verification failed for order #${order.order_number} (${provider}): ${verification.reason || ''}`);
                if (verification.failed) {
                    await base44.asServiceRole.entities.Order.update(order.id, { payment_status: 'failed' });
                }
                return new Response(JSON.stringify({ success: false, error: "Payment not verified" }), { status: 402 });
            }

            await base44.asServiceRole.entities.Order.update(order.id, {
                status: 'paid',
                payment_status: 'succeeded',
                ...(verification.receipt?.receipt_number ? { receipt_number: verification.receipt.receipt_number } : {}),
                ...(verification.receipt?.receipt_pdf_url ? { receipt_pdf_url: verification.receipt.receipt_pdf_url } : {}),
            });
            console.log(`processOrderSuccess: Order #${order.order_number} status updated to paid (${provider}${isIpn ? ', IPN' : ''})`);
        }

        // מניעת מיילים כפולים כשה-IPN והדף מגיעים יחד - קריאה טרייה של ההזמנה
        const fresh = await base44.asServiceRole.entities.Order.get(order.id).catch(() => null);
        if (fresh?.email_sent) order.email_sent = true;

        // שלב 2: מציאת כתובת המייל (גם לאורחים)
        let targetEmail = order.user_email;
        if (!targetEmail) targetEmail = order.customer_email;
        if (!targetEmail && order.shipping_address?.email) targetEmail = order.shipping_address.email;
        if (!targetEmail && order.billing_address?.email) targetEmail = order.billing_address.email;
        targetEmail = targetEmail?.trim() || null;

        console.log(`processOrderSuccess: Order #${order.order_number} target email: ${targetEmail || 'NONE'}`);

        // שלב 3: שליחת מיילים (רק אם טרם נשלחו)
        if (!order.email_sent) {
            // שליחה ללקוח (אם יש מייל)
            if (targetEmail) {
                try {
                    const htmlToCustomer = generateCustomerEmailHtml(order, siteSettings, language);
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        from_name: "ENGEE",
                        to: targetEmail,
                        subject: language === 'he' ? `אישור הזמנה #${order.order_number} - ENGEE` : `Order confirmation #${order.order_number} - ENGEE`,
                        body: htmlToCustomer,
                    });
                    console.log(`processOrderSuccess: Customer email sent to ${targetEmail}`);
                } catch (e) {
                    console.error(`processOrderSuccess: Failed to send customer email:`, e.message);
                    // ממשיכים לשלוח למנהל גם אם המייל ללקוח נכשל
                }
            } else {
                console.warn(`processOrderSuccess: No customer email found for order #${order.order_number}`);
            }

            // שליחה למנהל (תמיד, גם אם המייל ללקוח נכשל)
            try {
                const htmlToAdmin = generateAdminEmailHtml(order, targetEmail);
                await base44.asServiceRole.integrations.Core.SendEmail({
                    from_name: "התראת הזמנה חדשה",
                    to: adminEmail,
                    subject: `הזמנה חדשה #${order.order_number} - ${order.customer_name}`,
                    body: htmlToAdmin,
                });
                console.log(`processOrderSuccess: Admin email sent to ${adminEmail}`);
            } catch (e) {
                console.error(`processOrderSuccess: Failed to send admin email:`, e.message);
            }

            // סימון שהמיילים נשלחו
            await base44.asServiceRole.entities.Order.update(order.id, {
                email_sent: true
            });
        }

        return new Response(JSON.stringify({ success: true, message: "ההזמנה התקבלה", order_number: order.order_number }), { status: 200 });

    } catch (error) {
        console.error('processOrderSuccess critical error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message || "Internal server error" }), { status: 500 });
    }
});