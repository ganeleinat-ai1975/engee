import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { SiteSettings } from '@/entities/SiteSettings';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    SiteSettings.list().then(s => { if (s.length > 0) setSiteSettings(s[0]); });
  }, []);

  const email = siteSettings?.contact_email || 'info@engeejewelry.com';
  const phone = siteSettings?.contact_phone || '';
  const siteName = language === 'he' ? (siteSettings?.site_name || "אנג'י תכשיטים") : (siteSettings?.site_name_en || "Engee Jewelry");

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {language === 'he' ? (
          <div dir="rtl" className="bg-white p-8 md:p-12 rounded-2xl shadow-lg space-y-6 text-right">
            <h1 className="text-3xl md:text-4xl font-bold text-main mb-2">מדיניות פרטיות</h1>
            <p className="text-subtle">עודכנה לאחרונה: אפריל 2026</p>

            <p>אנחנו ב־<strong>{siteName}</strong> (להלן: "האתר") מכבדים את פרטיותך ופועלים בהתאם לחוק הגנת הפרטיות, תשמ"א–1981, ולתקנותיו, לרבות תיקון 13 שנכנס לתוקף באוגוסט 2025.</p>

            <h2 className="text-xl font-bold text-main">מידע שנאסף באתר</h2>
            <p>בעת הגלישה באתר, ביצוע רכישות או יצירת קשר, עשוי להיאסף מידע הכולל:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>פרטים שמסרת ביוזמתך (שם, אימייל, כתובת, טלפון, פרטי הזמנה)</li>
              <li>מידע טכני ואנליטי (כתובת IP, סוג דפדפן, מזהים דיגיטליים)</li>
              <li>שימוש בעוגיות (Cookies) לצרכים תפעוליים, שיווקיים וסטטיסטיים</li>
            </ul>

            <h2 className="text-xl font-bold text-main">שימוש בעוגיות (Cookies)</h2>
            <p>האתר משתמש בעוגיות לצרכים הבאים:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li><strong>עוגיות הכרחיות:</strong> תפעול בסיסי של האתר, סל קניות, התחברות</li>
              <li><strong>עוגיות אנליטיות:</strong> ניתוח שימוש באתר ושיפור חוויית הגלישה (Microsoft Clarity)</li>
              <li><strong>עוגיות פונקציונליות:</strong> שמירת העדפות שפה והגדרות אישיות</li>
            </ul>
            <p>המשך השימוש באתר ולחיצה על "אישור" בבאנר הקוקיז מהווים הסכמה לשימוש בעוגיות.</p>

            <h2 className="text-xl font-bold text-main">מטרות השימוש במידע</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>תפעול האתר ומתן שירות תקין</li>
              <li>ניהול הזמנות, סליקה ומשלוחים</li>
              <li>שיפור חוויית המשתמש/ת באתר</li>
              <li>התאמת תכנים, מדידה וסטטיסטיקה</li>
              <li>שליחת עדכונים ומבצעים (רק בהסכמתך)</li>
            </ul>

            <h2 className="text-xl font-bold text-main">שמירה ואבטחת מידע</h2>
            <p>המידע מאוחסן במערכות מאובטחות, ואנו נוקטים באמצעי הגנה טכנולוגיים וארגוניים העומדים בדרישות החוק. הגישה למידע מוגבלת ומפוקחת.</p>

            <h2 className="text-xl font-bold text-main">שיתוף מידע עם צדדים שלישיים</h2>
            <p>המידע לא יועבר לצדדים שלישיים, למעט לצורך:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>תפעול האתר ושירות לקוחות</li>
              <li>סליקת תשלומים ומשלוחים</li>
              <li>עמידה בהוראות החוק או צו שיפוטי</li>
              <li>בהסכמתך המפורשת</li>
            </ul>

            <h2 className="text-xl font-bold text-main">זכויותיך לפי חוק</h2>
            <p>בהתאם לחוק הגנת הפרטיות, עומדות לך הזכויות הבאות:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>לעיין במידע שנשמר עליך</li>
              <li>לבקש תיקון או מחיקה של מידע אישי</li>
              <li>למשוך הסכמה לשימוש עתידי במידע</li>
              <li>לבקש העברת מידע (ניידות מידע)</li>
            </ul>

            <h2 className="text-xl font-bold text-main">יצירת קשר בנושא פרטיות</h2>
            <p>לפניות בנושא פרטיות, ניתן ליצור קשר עם צוות {siteName}:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>אימייל: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></li>
              {phone && <li>טלפון: <a href={`tel:${phone}`} className="text-primary underline">{phone}</a></li>}
              <li>דרך טופס יצירת הקשר באתר</li>
            </ul>
          </div>
        ) : (
          <div dir="ltr" className="bg-white p-8 md:p-12 rounded-2xl shadow-lg space-y-6 text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-main mb-2">Privacy Policy</h1>
            <p className="text-subtle">Last updated: April 2026</p>

            <p>We at <strong>{siteName}</strong> ("the Website") are committed to protecting your privacy. We operate in accordance with Israel's Privacy Protection Law, 1981, including Amendment 13, which came into effect in August 2025.</p>

            <h2 className="text-xl font-bold text-main">Information We Collect</h2>
            <p>While browsing the site, making purchases, or contacting us, we may collect:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>Information you voluntarily provide (name, email, address, phone, order details)</li>
              <li>Technical and analytical data (IP address, browser type, digital identifiers)</li>
              <li>Use of cookies for operational, marketing, and analytical purposes</li>
            </ul>

            <h2 className="text-xl font-bold text-main">Use of Cookies</h2>
            <p>This website uses the following types of cookies:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li><strong>Essential cookies:</strong> Basic site operation, shopping cart, login</li>
              <li><strong>Analytical cookies:</strong> Site usage analysis and experience improvement (Microsoft Clarity)</li>
              <li><strong>Functional cookies:</strong> Saving language preferences and personal settings</li>
            </ul>
            <p>By continuing to use the site and clicking "Accept" on the cookie banner, you agree to the use of cookies.</p>

            <h2 className="text-xl font-bold text-main">Why We Collect Data</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>Site operation and customer service</li>
              <li>Order processing, payment, and delivery</li>
              <li>Improving your user experience</li>
              <li>Analytics and content customization</li>
              <li>Updates and promotions (only with your consent)</li>
            </ul>

            <h2 className="text-xl font-bold text-main">Data Security</h2>
            <p>Your information is stored on secure systems, and we apply appropriate technical and organizational safeguards as required by law. Access is limited and monitored.</p>

            <h2 className="text-xl font-bold text-main">Sharing with Third Parties</h2>
            <p>We do not share your data with third parties except for:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>Site operation and customer service</li>
              <li>Payment processing and shipping</li>
              <li>Legal compliance or court orders</li>
              <li>With your explicit consent</li>
            </ul>

            <h2 className="text-xl font-bold text-main">Your Rights</h2>
            <p>According to Israeli law, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>Request access to your data</li>
              <li>Request correction or deletion of personal data</li>
              <li>Withdraw consent for future use</li>
              <li>Request data portability</li>
            </ul>

            <h2 className="text-xl font-bold text-main">Contact Us About Privacy</h2>
            <p>For privacy-related inquiries, please contact the {siteName} team:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>Email: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></li>
              {phone && <li>Phone: <a href={`tel:${phone}`} className="text-primary underline">{phone}</a></li>}
              <li>Via the contact form on the website</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}