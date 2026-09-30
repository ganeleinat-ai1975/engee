import React from "react";
import { Link } from "react-router-dom";
import { useLanguage, t } from "@/components/LanguageProvider";
import NewsletterForm from "@/components/layout/NewsletterForm";

const Col = ({ title, links }) => (
  <div>
    <p className="eyebrow text-white/70 mb-5">{title}</p>
    <ul className="space-y-3">
      {links.map(([label, to, external]) => (
        <li key={label}>
          {external ? (
            <a href={to} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:opacity-70 transition-opacity">{label}</a>
          ) : (
            <Link to={to} className="text-white text-sm hover:opacity-70 transition-opacity">{label}</Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default function SiteFooter({ siteSettings, siteName }) {
  const { language } = useLanguage();
  const he = language === "he";
  const social = [
    siteSettings?.instagram_url && ["Instagram", siteSettings.instagram_url, true],
    siteSettings?.whatsapp_number && ["WhatsApp", `https://wa.me/${siteSettings.whatsapp_number.replace(/\D/g, "")}`, true],
  ].filter(Boolean);

  return (
    <footer role="contentinfo" className="bg-secondary">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">
          <div className="col-span-2 md:col-span-4">
            <p className="custom-font font-editorial text-white text-2xl md:text-3xl mb-3">{he ? "הצטרפי למועדון" : "Join the list"}</p>
            <p className="text-white/80 text-sm mb-6 max-w-sm">{he ? "קולקציות חדשות, סדנאות והטבות — ישר למייל." : "New collections, workshops and offers — straight to your inbox."}</p>
            <NewsletterForm />
          </div>
          <div className="md:col-span-2 md:col-start-6">
            <Col title={he ? "חנות" : "Shop"} links={[[he ? "חדש באתר" : "New in", "/Products"], [t("rings", language), "/Products?category=rings"], [t("necklaces", language), "/Products?category=necklaces"], [t("earrings", language), "/Products?category=earrings"], [t("bracelets", language), "/Products?category=bracelets"]]} />
          </div>
          <div className="md:col-span-2">
            <Col title={he ? "עזרה" : "Help"} links={[[he ? "משלוחים והחזרות" : "Shipping & returns", "/#faq"], [he ? "שאלות נפוצות" : "FAQ", "/#faq"], [t("contact", language), "/Contact"]]} />
          </div>
          <div className="md:col-span-2">
            <Col title={he ? "אודות" : "About"} links={[[he ? "הסיפור שלנו" : "Our story", "/About"], [t("workshops", language), "/Workshop"]]} />
          </div>
          {social.length > 0 && (
            <div className="md:col-span-2">
              <Col title={he ? "עקבי אחרינו" : "Follow"} links={social} />
            </div>
          )}
        </div>

        <div className="mt-16 pt-6 border-t border-white/20 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <p className="text-white/70 text-xs">&copy; {new Date().getFullYear()} {siteName}. {t("allRightsReserved", language)}.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/privacy-policy" className="text-white/70 hover:text-white text-xs">{he ? "מדיניות פרטיות" : "Privacy Policy"}</Link>
            <Link to="/accessibility" className="text-white/70 hover:text-white text-xs">{he ? "הצהרת נגישות" : "Accessibility"}</Link>
            <Link to="/terms" className="text-white/70 hover:text-white text-xs">{he ? "תקנון האתר" : "Terms of Use"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}