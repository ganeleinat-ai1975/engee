import { createClient } from "npm:@base44/sdk@0.1.0";

const b44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") });

const cfg = {
  term: "171388",
  user: "wCeznIjAHJmLGMVrNVAp",
  pass: Deno.env.get("CARDCOM_API_PASSWORD") ?? "",
  lpUrl: "https://secure.cardcom.solutions/Interface/LowProfile.aspx",
};

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  try {
    const { orderId } = await req.json();
    if (!orderId) return json({ success: false, error: "orderId required" }, 400);

    const order = await b44.entities.Order.get(orderId);
    if (!order) return json({ success: false, error: "Order not found" }, 404);

    const formData = new URLSearchParams({
      TerminalNumber: cfg.term,
      UserName: cfg.user,
      Password: cfg.pass,
      Operation: "1",
      CoinID: "1",
      Sum: order.total_amount.toString(),
      SumToBill: order.total_amount.toString(),
      NumOfPayments: "1",
      APILevel: "10",
      codepage: "65001",
      LowProfileCode: "",
      InternalDealNumber: order.order_number.toString(),
      SuccessRedirectUrl: `${req.headers.get("origin")}/OrderSuccess?orderNumber=${order.order_number}&status=success`,
      ErrorRedirectUrl: `${req.headers.get("origin")}/OrderSuccess?orderNumber=${order.order_number}&status=error`,
      "InvoiceHead.CustName": order.customer_name,
      "InvoiceHead.SendByEmail": "true",
      "InvoiceHead.Email": order.user_email,
      "InvoiceHead.Language": "he",
      "InvoiceHead.CoinID": "1",
      "InvoiceLines1.Description": "רכישה באתר אנג׳י",
      "InvoiceLines1.Price": order.total_amount.toString(),
      "InvoiceLines1.Quantity": "1",
    });

    const cardcomResponse = await fetch(cfg.lpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const responseText = await cardcomResponse.text();
    const params = new URLSearchParams(responseText);

    if (params.get("ResponseCode") !== "0") {
      return json({ success: false, error: params.get("Description") }, 502);
    }
    
    // The receipt details might be in the response here, or might come via webhook later.
    // This assumes they are in the immediate response.
    const receiptNumber = params.get("InvoiceNumber");
    const receiptPdfUrl = params.get("InvoiceUrlPDF");

    await b44.entities.Order.update(orderId, {
      payment_intent_id: params.get("LowProfileCode"),
      receipt_number: receiptNumber || null,
      receipt_pdf_url: receiptPdfUrl || null,
    });

    return json({
      success: true,
      paymentUrl: decodeURIComponent(params.get("url") || ""),
    });

  } catch (error) {
    console.error("createCardcomPayment error:", error);
    return json({ success: false, error: error.message }, 500);
  }
});