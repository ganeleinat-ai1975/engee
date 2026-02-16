import { createClient } from "npm:@base44/sdk@0.1.0";

const b44 = createClient({ appId: Deno.env.get("BASE44_APP_ID") });

const json = (d, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return json({ success: false, error: "Unauthorized" }, 401);
    
    b44.auth.setToken(token);
    const user = await b44.auth.me();
    if (!user) return json({ success: false, error: "Unauthorized" }, 401);

    const { code } = await req.json();
    if (!code) return json({ success: false, error: "Coupon code required" }, 400);

    const coupons = await b44.entities.Coupon.filter({ 
      code: code.trim().toUpperCase(), 
      is_active: true 
    });

    if (coupons.length === 0) {
      return json({ success: false, error: "Invalid or inactive coupon" }, 404);
    }

    const coupon = coupons[0];
    
    // בדיקת תוקף תאריכים
    const now = new Date();
    
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return json({ success: false, error: "Coupon not yet valid" }, 400);
    }
    
    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return json({ success: false, error: "Coupon has expired" }, 400);
    }
    
    return json({ success: true, coupon });

  } catch (error) {
    console.error('Apply coupon error:', error);
    return json({ success: false, error: error.message || "Internal server error" }, 500);
  }
});