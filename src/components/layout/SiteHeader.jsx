import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Search, Heart, ShoppingBag } from "lucide-react";
import { useLanguage, t } from "@/components/LanguageProvider";
import AccountMenu from "@/components/layout/AccountMenu";

const NAV = [
  { key: "products", to: "/Products" },
  { key: "rings", to: "/Products?category=rings" },
  { key: "necklaces", to: "/Products?category=necklaces" },
  { key: "earrings", to: "/Products?category=earrings" },
  { key: "bracelets", to: "/Products?category=bracelets" },
  { key: "workshops", to: "/Workshop" },
];

const Badge = ({ n }) => n > 0 ? <span className="absolute top-0.5 end-0 min-w-[16px] h-4 px-1 rounded-full bg-secondary text-white text-[10px] leading-4 text-center">{n}</span> : null;

export default function SiteHeader({ siteSettings, siteName, user, wishlistCount, cartCount, onOpenMenu, onOpenSearch, onLogout }) {
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconCls = "w-5 h-5 text-main";
  const logo = siteSettings?.logo_url ? (
    <img src={siteSettings.logo_url} alt={siteName} className={`w-auto object-contain transition-all duration-500 ${scrolled ? "h-14 md:h-20" : "h-20 md:h-28"}`} />
  ) : (
    <span className="custom-font font-editorial text-2xl text-main">{siteName}</span>
  );

  return (
    <header role="banner" className={`sticky top-0 z-40 bg-background transition-all duration-500 ${scrolled ? "shadow-[0_1px_0_rgba(101,80,60,0.12)]" : ""}`}>
      <div className={`max-w-screen-2xl mx-auto px-3 md:px-10 grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500 ${scrolled ? "py-1.5" : "py-3"}`}>
        <div className="flex items-center gap-1">
          <button onClick={onOpenMenu} aria-label="Menu" className="p-2 lg:hidden"><Menu className={iconCls} strokeWidth={1.25} /></button>
          <button onClick={onOpenSearch} aria-label={t("search", language)} className="p-2 lg:hidden"><Search className={iconCls} strokeWidth={1.25} /></button>
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
            {NAV.map((item) => (
              <button key={item.key} onClick={() => navigate(item.to)} className="eyebrow text-main link-underline whitespace-nowrap">{t(item.key, language)}</button>
            ))}
          </nav>
        </div>

        <Link to="/" className="justify-self-center">{logo}</Link>

        <div className="flex items-center justify-end gap-0.5 md:gap-1">
          <button onClick={() => changeLanguage(language === "he" ? "en" : "he")} className="eyebrow text-main px-2 hidden md:block">{language === "he" ? "EN" : "עב"}</button>
          <button onClick={onOpenSearch} aria-label={t("search", language)} className="p-2 hidden lg:block"><Search className={iconCls} strokeWidth={1.25} /></button>
          <div className="hidden md:block"><AccountMenu user={user} onLogout={onLogout} /></div>
          <Link to="/Wishlist" aria-label={t("wishlist", language)} className="p-2 relative hidden md:block"><Heart className={iconCls} strokeWidth={1.25} /><Badge n={wishlistCount} /></Link>
          <Link to="/Cart" aria-label={t("cart", language)} className="p-2 relative"><ShoppingBag className={iconCls} strokeWidth={1.25} /><Badge n={cartCount} /></Link>
        </div>
      </div>
    </header>
  );
}