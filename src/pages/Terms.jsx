import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { SiteSettings } from '@/entities/SiteSettings';

// Fill these in once the business's legal registration details are available.
// Left empty on purpose - never render a placeholder like "[שם העסק]" when empty.
const BUSINESS_LEGAL = {
  name_he: "",
  name_en: "",
  id_number: "326191921",
};

export default function TermsPage() {
  const { language } = useLanguage();
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    SiteSettings.list().then(s => { if (s.length > 0) setSiteSettings(s[0]); });
  }, []);

  const email = siteSettings?.contact_email || '';
  const phone = siteSettings?.contact_phone || '';
  const whatsapp = (siteSettings?.whatsapp_number || '').replace(/\D/g, '');
  const address = language === 'he'
    ? (siteSettings?.contact_address || '')
    : (siteSettings?.contact_address_en || siteSettings?.contact_address || '');
  const siteName = language === 'he' ? (siteSettings?.site_name || "אנג'י תכשיטים") : (siteSettings?.site_name_en || "Engee Jewelry");

  const shippingCost = siteSettings?.shipping_cost ?? 40;
  const freeShippingThreshold = siteSettings?.free_shipping_threshold ?? 499;
  const goldPlatingPrice = siteSettings?.gold_plating_price ?? 100;
  const selfPickupEnabled = !!siteSettings?.enable_self_pickup;
  const selfPickupText = language === 'he'
    ? (siteSettings?.self_pickup_text || 'איסוף עצמי מכפר האורנים (בתיאום מראש)')
    : (siteSettings?.self_pickup_text_en || 'Self pickup from Kfar HaOranim (by appointment)');

  const operatedByHe = BUSINESS_LEGAL.name_he
    ? `האתר מופעל על ידי ${BUSINESS_LEGAL.name_he}${BUSINESS_LEGAL.id_number ? `, עוסק פטור מס' ${BUSINESS_LEGAL.id_number}` : ''}.`
    : (BUSINESS_LEGAL.id_number ? `האתר מופעל על ידי עוסק פטור מס' ${BUSINESS_LEGAL.id_number}.` : '');
  const operatedByEn = BUSINESS_LEGAL.name_en
    ? `This website is operated by ${BUSINESS_LEGAL.name_en}, a VAT-exempt dealer (Business ID ${BUSINESS_LEGAL.id_number}).`
    : (BUSINESS_LEGAL.id_number ? `This website is operated by a VAT-exempt dealer, Business ID ${BUSINESS_LEGAL.id_number}.` : '');

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {language === 'he' ? (
          <div dir="rtl" className="bg-white p-8 md:p-12 rounded-2xl shadow-lg space-y-6 text-right">
            <h1 className="text-3xl md:text-4xl font-bold text-main mb-2">תקנון האתר</h1>
            <p className="text-subtle">עודכן לאחרונה: ספטמבר 2026</p>

            <h2 className="text-xl font-bold text-main">1. כללי</h2>
            <p>
              ברוכות וברוכים הבאים לאתר <strong>{siteName}</strong> (להלן: "האתר"). {siteName} הוא מותג תכשיטי כסף 925 בעבודת יד בעיצובה של נועה, מתוך סטודיו בכפר האורנים.
              {operatedByHe && <> {operatedByHe}</>}
            </p>
            <p>גלישה ורכישה באתר מהוות הסכמה לתנאי תקנון זה במלואם. השימוש באתר מיועד לבני/בנות 18 ומעלה, או בליווי הורה/אפוטרופוס לקטינות/ים.</p>
            <p className="text-subtle text-sm">התקנון נכתב בלשון נקבה/זכר/רבים מטעמי נוחות בלבד, ופונה לכלל הלקוחות באופן שוויוני.</p>

            <h2 className="text-xl font-bold text-main">2. המוצרים והמחירים</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>כל המחירים באתר מוצגים בשקלים חדשים (₪) והם המחירים הסופיים לתשלום. העסק הוא עוסק פטור, ולכן לא נגבה מע"מ.</li>
              <li>תמונות המוצרים להמחשה בלבד. מאחר שמדובר בתכשיטים בעבודת יד, ייתכנו הבדלים קלים בין הפריט המוצג לפריט שיתקבל (גוון, מרקם, מידות).</li>
              <li>ניתן להוסיף ציפוי זהב אופציונלי בתוספת של ₪{goldPlatingPrice} לפריט.</li>
              <li>האתר שומר לעצמו את הזכות לתקן טעות סופר או טעות מחיר בולטת שנפלה בתיאור מוצר, גם לאחר ביצוע הזמנה, ולהודיע על כך ללקוח/ה.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">3. הזמנה ותשלום</h2>
            <p>התשלום באתר מתבצע באמצעות כרטיס אשראי, דרך סליקה מאובטחת של חברת סליקה חיצונית המורשית לכך. פרטי כרטיס האשראי אינם נשמרים באתר. ההזמנה תיחשב כמאושרת רק לאחר קבלת אישור עסקה מחברת הסליקה. קבלה תישלח ללקוח/ה בדוא"ל.</p>

            <h2 className="text-xl font-bold text-main">4. משלוחים ואספקה</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>האתר מספק משלוחים לכל רחבי הארץ בעלות של ₪{shippingCost}, ומשלוח חינם בהזמנה מעל ₪{freeShippingThreshold}.</li>
              {selfPickupEnabled && <li>{selfPickupText}.</li>}
              <li>זמן ייצור של עד 21 ימי עסקים (לרוב מוקדם יותר). במקרה של עיכוב חריג, נעדכן את הלקוח/ה מראש.</li>
              <li>לאחר יציאת ההזמנה למשלוח, זמן האספקה הוא עד 7 ימי עסקים.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">5. ביטול עסקה והחזרים</h2>
            <p>ביטול עסקה כפוף להוראות חוק הגנת הצרכן, התשמ"א-1981, ותקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>ניתן לבטל עסקה תוך 14 ימים מיום קבלת המוצר, או מיום קבלת מסמך פרטי העסקה - לפי המאוחר מביניהם.</li>
              <li>הודעת ביטול תימסר בטלפון, בדוא"ל או בהודעת וואטסאפ, בהתאם לפרטי יצירת הקשר בתחתית תקנון זה.</li>
              <li>במקרה של ביטול שאינו עקב פגם, אי-התאמה או אי-אספקה במועד - יגבה דמי ביטול בשיעור של 5% ממחיר המוצר או 100 ₪, לפי הנמוך מביניהם.</li>
              <li>ביטול עקב פגם במוצר, אי-אספקה או אי-התאמה לפרטי ההזמנה - לא יגבו דמי ביטול, וההחזר יינתן במלואו.</li>
              <li>ניתן לבטל את ההזמנה גם לפני יציאתה למשלוח - במקרה זה יוחזר מלוא הסכום ששולם, בניכוי דמי הביטול כאמור.</li>
              <li>ההחזר הכספי יבוצע תוך 14 ימים מקבלת הודעת הביטול, לאמצעי התשלום שבו בוצעה העסקה.</li>
              <li>המוצר יוחזר באריזתו המקורית וללא שימוש. עלות משלוח ההחזרה חלה על הלקוח/ה.</li>
              <li>פריטים שיוצרו במיוחד עבור הלקוח/ה לפי הזמנה אישית (עיצוב מותאם אישית, חריטה, מידה מיוחדת וכד') - אינם ניתנים לביטול בהתאם לסעיף 14ג(ד) לחוק הגנת הצרכן.</li>
              <li>בהתאם לסעיף 14ג1 לחוק, בני/בנות 65 ומעלה, אנשים עם מוגבלות ועולים חדשים (עד 4 שנים מיום העלייה) זכאים לתקופת ביטול מוארכת של עד 4 חודשים מיום קבלת המוצר.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">6. החלפות ותיקונים</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>ברכישה רגילה - ניתן להחליף מוצר תוך 14 יום מקבלתו, באריזתו המקורית וללא שימוש, בסטודיו בכפר האורנים בתיאום מראש, או בשליחה בדואר בעלות של ₪40.</li>
              <li>תכשיטים בעיצוב אישי/מותאם - אינם ניתנים להחלפה או להחזרה.</li>
              <li>פגם ייצור - יוחלף ללא עלות.</li>
              <li>שבר או קרע כתוצאה משימוש - תיקון בעלות סמלית.</li>
              <li>אובדן חלק מהתכשיט - ניתן לתקן בעלות.</li>
              <li>אין החזרה או תיקון בגין ציפוי זהב שנשחק או ירד עם הזמן.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">7. אחריות</h2>
            <p>{siteName} אחראי/ת למוצרים הנמכרים באתר, לאספקתם ולמתן שירות בגינם, בכפוף לאמור בתקנון זה. האתר אינו אחראי לעיכובים הנובעים מחברת השילוח או מנסיבות שאינן בשליטתו (כוח עליון), ופועל במאמץ סביר לצמצם עיכובים כאמור. תוכן האתר (תיאורים, תמונות, מחירים) עשוי להתעדכן מעת לעת ללא הודעה מוקדמת.</p>

            <h2 className="text-xl font-bold text-main">8. פרטיות</h2>
            <p>
              האתר מכבד את פרטיות הלקוחות ופועל בהתאם למדיניות הפרטיות המלאה, הכוללת מידע על איסוף ושימוש בנתונים, עוגיות (Cookies) וזכויות הלקוח/ה על פי חוק.
              {' '}לצפייה במדיניות הפרטיות המלאה: <a href="/privacy-policy" className="text-primary underline">מדיניות פרטיות</a>.
            </p>

            <h2 className="text-xl font-bold text-main">9. קניין רוחני</h2>
            <p>כל הזכויות בתכני האתר - לרבות עיצובים, תמונות, טקסטים, לוגו וסימני מסחר - שייכות ל-{siteName} בלבד, ואין להעתיק, לשכפל או להשתמש בהם ללא אישור מראש ובכתב.</p>

            <h2 className="text-xl font-bold text-main">10. יצירת קשר</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              {email && <li>אימייל: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></li>}
              {phone && <li>טלפון: <a href={`tel:${phone}`} className="text-primary underline">{phone}</a></li>}
              {whatsapp && <li>וואטסאפ: <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">שליחת הודעה</a></li>}
              {address && <li>כתובת: {address}</li>}
              <li>דרך טופס יצירת הקשר באתר</li>
            </ul>

            <h2 className="text-xl font-bold text-main">11. דין וסמכות שיפוט</h2>
            <p>על תקנון זה ועל כל עסקה שתתבצע באתר יחולו דיני מדינת ישראל בלבד. סמכות השיפוט הייחודית בכל מחלוקת תהיה נתונה לבתי המשפט המוסמכים במחוז הרלוונטי בישראל.</p>
          </div>
        ) : (
          <div dir="ltr" className="bg-white p-8 md:p-12 rounded-2xl shadow-lg space-y-6 text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-main mb-2">Terms of Use</h1>
            <p className="text-subtle">Last updated: September 2026</p>

            <h2 className="text-xl font-bold text-main">1. General</h2>
            <p>
              Welcome to <strong>{siteName}</strong> ("the Website"). {siteName} is a handmade 925 silver jewelry brand designed by Noa, made in a studio in Kfar HaOranim, Israel.
              {operatedByEn && <> {operatedByEn}</>}
            </p>
            <p>Browsing and purchasing on the website constitutes full agreement to these Terms of Use. The website is intended for users aged 18 and over, or minors accompanied by a parent/guardian.</p>

            <h2 className="text-xl font-bold text-main">2. Products and Prices</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>All prices on the site are shown in New Israeli Shekels (₪) and are the final prices to pay. The business is a VAT-exempt dealer, so no VAT is charged.</li>
              <li>Product photos are for illustration only. As these are handmade items, slight variations between the displayed item and the item received (shade, texture, dimensions) may occur.</li>
              <li>Optional gold plating can be added for an additional ₪{goldPlatingPrice} per item.</li>
              <li>The website reserves the right to correct an obvious typo or pricing error in a product listing, even after an order was placed, and will notify the customer accordingly.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">3. Orders and Payment</h2>
            <p>Payment on the website is made by credit card through a secure clearing process handled by a licensed external payment clearing provider. Card details are not stored on the website. Orders are confirmed only after payment approval is received from the clearing provider. A receipt is sent to the customer by email.</p>

            <h2 className="text-xl font-bold text-main">4. Shipping and Delivery</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>We ship anywhere in Israel for ₪{shippingCost}, with free shipping on orders above ₪{freeShippingThreshold}.</li>
              {selfPickupEnabled && <li>{selfPickupText}.</li>}
              <li>Production time is up to 21 business days (usually sooner). In case of an unusual delay, we will update the customer in advance.</li>
              <li>Once dispatched, delivery takes up to 7 business days.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">5. Cancellation and Refunds</h2>
            <p>Transaction cancellation is subject to Israel's Consumer Protection Law, 1981, and the Consumer Protection (Transaction Cancellation) Regulations, 2010:</p>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>You may cancel a transaction within 14 days of receiving the product, or of receiving the transaction disclosure document - whichever is later.</li>
              <li>Cancellation notice may be given by phone, email, or WhatsApp message, using the contact details at the bottom of these Terms.</li>
              <li>For a cancellation not due to a defect, non-conformity, or failure to supply on time, a cancellation fee of 5% of the price or ₪100 (whichever is lower) will be charged.</li>
              <li>Cancellation due to a product defect, failure to supply, or mismatch with the order will not incur a fee, and a full refund will be issued.</li>
              <li>If cancelled before the order has shipped, a full refund will be given, less the cancellation fee noted above where applicable.</li>
              <li>Refunds will be issued within 14 days of the cancellation notice, to the original payment method.</li>
              <li>The product must be returned unused, in its original packaging. Return shipping costs are borne by the customer.</li>
              <li>Items custom-made for the customer per a personal request (custom design, engraving, special size, etc.) are excluded from the right of cancellation under section 14c(d) of the law.</li>
              <li>Under section 14c1 of the law, customers aged 65+, people with disabilities, and new immigrants (within 4 years of immigration) are entitled to an extended cancellation period of up to 4 months from receiving the product.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">6. Exchanges and Repairs</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              <li>For a regular purchase, items may be exchanged within 14 days of receipt, unused and in original packaging, at the Kfar HaOranim studio by appointment, or by mail for ₪40.</li>
              <li>Custom/personalized jewelry cannot be exchanged or returned.</li>
              <li>Manufacturing defects are replaced free of charge.</li>
              <li>Breakage or tearing from use is repaired for a symbolic fee.</li>
              <li>Lost parts can be repaired for a fee.</li>
              <li>No returns or repairs are offered for worn or faded gold plating.</li>
            </ul>

            <h2 className="text-xl font-bold text-main">7. Liability</h2>
            <p>{siteName} is responsible for the products sold on the website, their supply, and the service provided in connection with them, subject to these Terms. The website is not responsible for delays caused by the shipping carrier or by circumstances beyond its reasonable control (force majeure), and will make reasonable efforts to minimize such delays. Website content (descriptions, images, prices) may be updated from time to time without prior notice.</p>

            <h2 className="text-xl font-bold text-main">8. Privacy</h2>
            <p>
              The website respects customer privacy and operates in accordance with its full Privacy Policy, which covers data collection and use, cookies, and customers' statutory rights.
              {' '}Read the full policy here: <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.
            </p>

            <h2 className="text-xl font-bold text-main">9. Intellectual Property</h2>
            <p>All rights in the website's content - including designs, images, text, logo, and trademarks - belong exclusively to {siteName}, and may not be copied, reproduced, or used without prior written permission.</p>

            <h2 className="text-xl font-bold text-main">10. Contact Us</h2>
            <ul className="list-disc list-inside space-y-1 text-subtle">
              {email && <li>Email: <a href={`mailto:${email}`} className="text-primary underline">{email}</a></li>}
              {phone && <li>Phone: <a href={`tel:${phone}`} className="text-primary underline">{phone}</a></li>}
              {whatsapp && <li>WhatsApp: <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary underline">Send a message</a></li>}
              {address && <li>Address: {address}</li>}
              <li>Via the contact form on the website</li>
            </ul>

            <h2 className="text-xl font-bold text-main">11. Governing Law and Jurisdiction</h2>
            <p>These Terms and any transaction made on the website are governed solely by the laws of the State of Israel. Exclusive jurisdiction over any dispute shall lie with the competent courts of the relevant district in Israel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
