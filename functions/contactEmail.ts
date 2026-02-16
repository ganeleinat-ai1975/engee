import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, phone, message } = await req.json();

    // שליחת מייל לאדמין עם הרשאות מערכת
    await base44.asServiceRole.integrations.SendEmail({
      to: "noamatga@gmail.com",
      subject: `פנייה חדשה מהאתר ENGEE - ${name}`,
      body: `
        <div dir="rtl" style="font-family:Arial;">
          <h3>פנייה חדשה מהאתר</h3>
          <p><strong>שם:</strong> ${name}</p>
          <p><strong>אימייל:</strong> ${email}</p>
          <p><strong>טלפון:</strong> ${phone || "לא צוין"}</p>
          <p><strong>הודעה:</strong><br/>${message}</p>
          <hr/>
          <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
        </div>
      `,
      from_name: "Engee Jewelry"
    });

    // שליחת מייל אישור ללקוח
    await base44.asServiceRole.integrations.SendEmail({
      to: email,
      subject: "תודה על פנייתך - Engee Jewelry",
      body: `
        <div dir="rtl" style="font-family:Arial;">
          <p>שלום ${name},</p>
          <p>תודה רבה על פנייתך אלינו!</p>
          <p>קיבלנו את הודעתך ונחזור אליך בהקדם האפשרי.</p>
          <p>בברכה,<br/>צוות Engee Jewelry</p>
        </div>
      `,
      from_name: "צוות Engee Jewelry"
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error('Contact email error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});