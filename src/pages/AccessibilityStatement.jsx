import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { SiteSettings } from '@/entities/SiteSettings';

export default function AccessibilityStatement() {
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
            <h1 className="text-3xl md:text-4xl font-bold text-main mb-2">הצהרת נגישות</h1>
            <p className="text-subtle">עודכנה לאחרונה: אפריל 2026</p>

            <p>אנו ב־<strong>{siteName}</strong> מחויבים להנגשת האתר לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות, וזאת בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, תשנ"ח–1998, ולתקנות הנגישות לשירותי אינטרנט (תקנות שוויון זכויות לאנשים עם מוגבלות – התאמות נגישות לשירות, התשע"ג–2013).</p>

            <h2 className="text-xl font-bold text-main">רמת הנגישות</h2>
            <p>אנו פועלים להתאמת האתר לדרישות תקן הנגישות הישראלי (ת"י 5568) המבוסס על הנחיות WCAG 2.1 ברמה AA, ומבצעים שיפורים שוטפים לצורך כך.</p>

            <h2 className="text-xl font-bold text-main">התאמות הנגישות באתר</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>ווידג'ט נגישות המאפשר שינוי גודל טקסט, ניגודיות גבוהה, הדגשת קישורים ועוד</li>
              <li>תמיכה בניווט באמצעות מקלדת</li>
              <li>תגיות ARIA לקוראי מסך</li>
              <li>טקסט חלופי (alt) לתמונות</li>
              <li>מבנה סמנטי ברור של דפי האתר</li>
              <li>ניגודיות צבעים מותאמת</li>
              <li>אפשרות לעצירת אנימציות</li>
            </ul>

            <h2 className="text-xl font-bold text-main">סייגים</h2>
            <p>למרות מאמצינו, ייתכנו חלקים באתר שטרם הונגשו במלואם. אנו עובדים באופן שוטף לשיפור הנגישות ופתרון בעיות ככל שיתגלו.</p>

            <h2 className="text-xl font-bold text-main">פנייה בנושא נגישות</h2>
            <p>אם נתקלת בבעיית נגישות באתר, אנא פנה/י אלינו ונשמח לסייע:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>רכז/ת נגישות: צוות {siteName}</li>
              <li>אימייל: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></li>
              {phone && <li>טלפון: <a href={`tel:${phone}`} className="text-primary underline">{phone}</a></li>}
              <li>דרך טופס יצירת הקשר באתר</li>
            </ul>
            <p className="text-subtle mt-4">אנו מתחייבים לטפל בכל פנייה בנושא נגישות בתוך זמן סביר.</p>
          </div>
        ) : (
          <div dir="ltr" className="bg-white p-8 md:p-12 rounded-2xl shadow-lg space-y-6 text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-main mb-2">Accessibility Statement</h1>
            <p className="text-subtle">Last updated: April 2026</p>

            <p>We at <strong>{siteName}</strong> are committed to making our website accessible to all users, including people with disabilities, in accordance with Israel's Equal Rights for Persons with Disabilities Law (1998) and the Accessibility of Internet Services Regulations (2013).</p>

            <h2 className="text-xl font-bold text-main">Accessibility Level</h2>
            <p>We strive to conform to the Israeli Standard (SI 5568) based on WCAG 2.1 Level AA guidelines, and continuously work to improve accessibility.</p>

            <h2 className="text-xl font-bold text-main">Accessibility Features</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>Accessibility widget allowing font resizing, high contrast, link highlighting, and more</li>
              <li>Keyboard navigation support</li>
              <li>ARIA labels for screen readers</li>
              <li>Alternative text (alt) for images</li>
              <li>Clear semantic page structure</li>
              <li>Adapted color contrast</li>
              <li>Option to stop animations</li>
            </ul>

            <h2 className="text-xl font-bold text-main">Limitations</h2>
            <p>Despite our efforts, some parts of the website may not yet be fully accessible. We are working continuously to improve accessibility and resolve issues as they are discovered.</p>

            <h2 className="text-xl font-bold text-main">Contact Us About Accessibility</h2>
            <p>If you encounter an accessibility issue on our website, please contact us and we will be happy to assist:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>Accessibility Coordinator: {siteName} Team</li>
              <li>Email: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></li>
              {phone && <li>Phone: <a href={`tel:${phone}`} className="text-primary underline">{phone}</a></li>}
              <li>Via the contact form on the website</li>
            </ul>
            <p className="text-subtle mt-4">We are committed to addressing all accessibility inquiries within a reasonable timeframe.</p>
          </div>
        )}
      </div>
    </div>
  );
}