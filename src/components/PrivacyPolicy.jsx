import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/components/LanguageProvider";

export default function PrivacyPolicy({ siteEmail }) {
  const { language } = useLanguage();

  const email = siteEmail || 'info@engeejewelry.com';

  return (
    <div className="w-full max-w-4xl mx-auto my-16 px-4">
      <Accordion type="single" collapsible className="w-full bg-white p-6 rounded-2xl shadow-lg">
        <AccordionItem value="privacy-policy">
          <AccordionTrigger className="text-xl font-bold text-main hover:no-underline text-right">
            {language === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy'}
          </AccordionTrigger>
          <AccordionContent className="pt-4 text-subtle">
            {language === 'he' ? (
              <div dir="rtl" className="space-y-4 text-right prose prose-sm max-w-none">
                <h3 className="font-bold">עודכנה לאחרונה: 14 באוגוסט 2025</h3>
                <p>אנחנו ב־**Engee** (להלן: "האתר") מכבדים את פרטיותך ופועלים בהתאם לחוק הגנת הפרטיות, תשמ"א–1981, ולתיקון 13 שנכנס לתוקף באוגוסט 2025.</p>
                <h4 className="font-semibold">מידע שנאסף באתר</h4>
                <p>בעת הגלישה באתר וביצוע רכישות או יצירת קשר, עשוי להיאסף עליך מידע הכולל:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>פרטים שמסרת ביוזמתך (כגון שם, אימייל, כתובת, פרטי הזמנה)</li>
                  <li>מידע טכני ואנליטי (כגון כתובת IP, סוג דפדפן, מזהים דיגיטליים)</li>
                  <li>שימוש בעוגיות (Cookies) לצרכים תפעוליים, שיווקיים וסטטיסטיים</li>
                </ul>
                <p><strong>המשך השימוש באתר מהווה הסכמה לשימוש זה</strong>, בהתאם לבאנר שנמצא באתר.</p>
                <h4 className="font-semibold">מטרות השימוש במידע</h4>
                <p>המידע שנאסף משמש לצרכים הבאים:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>תפעול האתר ומתן שירות תקין</li>
                  <li>ניהול הזמנות ומשלוחים</li>
                  <li>שיפור חוויית המשתמשת באתר</li>
                  <li>התאמת תכנים, מדידה וסטטיסטיקה</li>
                  <li>שליחת עדכונים (רק בהסכמתך)</li>
                </ul>
                <h4 className="font-semibold">שמירה ואבטחת מידע</h4>
                <p>המידע מאוחסן במערכות מאובטחות, ואנו נוקטים באמצעי הגנה העומדים בדרישות החוק. הגישה למידע מוגבלת ומפוקחת.</p>
                <h4 className="font-semibold">שיתוף מידע עם צדדים שלישיים</h4>
                <p>המידע לא יועבר לצדדים שלישיים אלא לצורך תפעול האתר, שירות לקוחות, סליקה, משלוחים, עמידה בהוראות החוק או בהסכמתך המפורשת.</p>
                <h4 className="font-semibold">זכויותיך לפי חוק</h4>
                <p>בהתאם לחוק הגנת הפרטיות, עומדות לך הזכויות הבאות:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>לעיין במידע שנשמר עליך</li>
                  <li>לבקש תיקון או מחיקה של מידע אישי</li>
                  <li>למשוך הסכמה לשימוש עתידי במידע</li>
                </ul>
                <p>לפניות בנושא פרטיות, ניתן ליצור קשר דרך הטופס באתר או במייל: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></p>
              </div>
            ) : (
              <div dir="ltr" className="space-y-4 text-left prose prose-sm max-w-none">
                <h3 className="font-bold">Last updated: August 14, 2025</h3>
                <p>We at **Engee** ("the Website") are committed to protecting your privacy. We operate in accordance with Israel's Privacy Protection Law, 1981, including Amendment 13, which came into effect in August 2025.</p>
                <h4 className="font-semibold">Information We Collect</h4>
                <p>While browsing the site or making purchases, we may collect:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Information you voluntarily provide (e.g., name, email, shipping address, order details)</li>
                  <li>Technical and analytical data (e.g., IP address, browser type, digital identifiers)</li>
                  <li>Use of cookies for operational, marketing, and analytical purposes</li>
                </ul>
                <p><strong>By continuing to use the site and clicking “Accept” on the banner, you agree to this use.</strong></p>
                <h4 className="font-semibold">Why We Collect Data</h4>
                <p>The information is used for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Site operation and customer service</li>
                  <li>Order processing and delivery</li>
                  <li>Improving your user experience</li>
                  <li>Analytics and content customization</li>
                  <li>Updates and marketing (only with your consent)</li>
                </ul>
                <h4 className="font-semibold">Data Security</h4>
                <p>Your information is stored on secure systems, and we apply appropriate legal and technical safeguards. Access is limited and monitored.</p>
                <h4 className="font-semibold">Sharing with Third Parties</h4>
                <p>We do not share your data with third parties except for the purpose of operating the site, customer service, payment processing, shipping, legal compliance, or with your explicit consent.</p>
                <h4 className="font-semibold">Your Rights</h4>
                <p>According to Israeli law, you have the right to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Request access to your data</li>
                  <li>Request correction or deletion</li>
                  <li>Withdraw consent for future use</li>
                </ul>
                <p>To exercise your privacy rights, please contact us via the contact form or email: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}