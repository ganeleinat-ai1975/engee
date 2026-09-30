import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { LanguageProvider, useLanguage, t } from "@/components/LanguageProvider";
import { CartProvider, useCart } from "@/components/CartProvider";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  User as UserIcon,
  Settings,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WishlistItem } from "@/entities/WishlistItem";
import { User as UserEntity } from "@/entities/User";
import { SiteSettings } from "@/entities/SiteSettings";
import { Toaster } from "@/components/ui/sonner";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import AccessibilityWidget from "@/components/AccessibilityWidget";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SearchOverlay from "@/components/layout/SearchOverlay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

// מסך פתיחה חדש
function LoadingScreen({ siteSettings }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#EDECDD' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        {siteSettings?.logo_url && (
          <img
            src={siteSettings.logo_url}
            alt="Loading..."
            className="h-80 md:h-[480px] max-w-[90vw] w-auto object-contain mx-auto animate-pulse"
          />
        )}
      </motion.div>
    </div>
  );
}

function LayoutContent({ children, currentPageName, siteSettings }) {
  const { language, changeLanguage } = useLanguage();
  const { cartCount, initializeCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    loadInitialData();
    window.addEventListener('wishlistUpdated', loadWishlistCount);

    return () => {
      window.removeEventListener('wishlistUpdated', loadWishlistCount);
    }
  }, []);

  useEffect(() => {
    // Prevent adding multiple Clarity tags
    if (document.querySelector('script[data-clarity-script="true"]')) {
      return;
    }
    // Microsoft Clarity Script
    const clarityScript = document.createElement('script');
    clarityScript.type = 'text/javascript';
    clarityScript.dataset.clarityScript = 'true';
    clarityScript.innerHTML = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "sibx9cgdfj");
    `;
    document.head.appendChild(clarityScript);
  }, []);

  const loadInitialData = async () => {
    loadUser();
    loadWishlistCount();
  };

  const loadUser = async () => {
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
    } catch (e) {
      setUser(null);
    }
  };

  const loadWishlistCount = async () => {
    try {
      const currentUser = await UserEntity.me();
      const items = await WishlistItem.filter({ user_email: currentUser.email });
      setWishlistCount(items.length);
    } catch (e) {
      setWishlistCount(0);
    }
  };

  const handleLogout = async () => {
    await UserEntity.logout();
    setUser(null);
    setWishlistCount(0);
    sessionStorage.removeItem('guestCart');
    initializeCart();
    window.location.href = createPageUrl("Home");
  };

  const getFontCssValue = (fontFamily) => {
    switch(fontFamily) {
      case 'Amatic SC':
        return "'Amatic SC', sans-serif";
      case 'Barlow Condensed':
        return "'Barlow Condensed', sans-serif";
      case 'Truculenta':
        return "'Truculenta', sans-serif";
      case 'Dina':
        return "'Dina', 'Open Sans Hebrew', sans-serif";
      case 'Yarden':
        return "'Yarden', 'Alef Hebrew', sans-serif";
      case 'Karantina':
        return "'Karantina', sans-serif";
      case 'Varela Round':
        return "'Varela Round', sans-serif";
      case 'Heebo':
        return "'Heebo', sans-serif";
      default:
        return "'Barlow Condensed', sans-serif";
    }
  };

  const getRootFontSize = () => {
    const sizeSetting = language === 'he' ? siteSettings?.font_size_hebrew : siteSettings?.font_size_english;
    switch (sizeSetting) {
      case 'small': return '20px';
      case 'large': return '24px';
      case 'extra_large': return '26px';
      case 'huge': return '30px';
      default: return '22px';
    }
  };

  const navigate = useNavigate();
  
  const NavLink = ({ to, children }) => (
    <button
      className="text-lg text-main transition-none font-normal block py-3 w-full text-start bg-transparent border-none cursor-pointer p-0"
      onClick={() => {
        setIsMenuOpen(false);
        navigate(to);
      }}
    >
      {children}
    </button>
  );

  const siteName = language === 'he' ?
    (siteSettings?.site_name ?? "אנג'י תכשיטים") :
    (siteSettings?.site_name_en ?? "Engee Jewelry");

  const mobileHebrewFontName = siteSettings?.font_family_hebrew_mobile ?? siteSettings?.font_family_hebrew ?? 'Amatic SC';
  const mobileEnglishFontName = siteSettings?.font_family_english_mobile ?? siteSettings?.font_family_english ?? 'Barlow Condensed';
  const desktopHebrewFontName = siteSettings?.font_family_hebrew_desktop ?? siteSettings?.font_family_hebrew ?? 'Amatic SC';
  const desktopEnglishFontName = siteSettings?.font_family_english_desktop ?? siteSettings?.font_family_english ?? 'Barlow Condensed';

  const bodyFontMobileCssValue = language === 'he' ? getFontCssValue(mobileHebrewFontName) : getFontCssValue(mobileEnglishFontName);
  const bodyFontDesktopCssValue = language === 'he' ? getFontCssValue(desktopHebrewFontName) : getFontCssValue(desktopEnglishFontName);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EDECDD' }} dir={language === 'he' ? 'rtl' : 'ltr'}>
      <Toaster position="top-center" richColors />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Truculenta:wght@300;400;500;600;700&family=Karantina:wght@300;400;700&family=Varela+Round&family=Heebo:wght@300;400;500;600;700&family=Frank+Ruhl+Libre:wght@300;400;500&display=swap');
        @import url('https://fonts.googleapis.com/earlyaccess/opensanshebrew.css');
        @import url('https://fonts.googleapis.com/earlyaccess/alefhebrew.css');

        @font-face {
          font-family: 'Dina';
          src: url('https://fonts.gstatic.com/s/opensanshebrew/v14/EacWWgNaNFYNdGjNGWTj7U5Qlqh5bx_lqmX9cN0WnHBfKZNM2w.woff2') format('woff2'),
               url('https://fonts.gstatic.com/s/opensanshebrew/v14/EacWWgNaNFYNdGjNGWTj7U5Qlqh5bx_lqmX9cN0WnHBfKZNM2w.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'Yarden';
          src: url('https://fonts.gstatic.com/s/alefhebrew/v16/HhyJU4wt9vOmLxlo4YKDG_bUbcQnIA.woff2') format('woff2'),
               url('https://fonts.gstatic.com/s/alefhebrew/v16/HhyJU4wt9vOmLxlo4YKDG_bUbcQnIA.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        html, body {
          background-color: #EDECDD !important;
          opacity: 1 !important;
          visibility: visible !important;
          margin: 0;
          padding: 0;
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #EDECDD;
          z-index: -1;
        }

        [class*="base44"],
        [id*="base44"],
        iframe[src*="base44"],
        script[src*="base44"],
        div[style*="base44"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
        }

        html {
          font-size: ${getRootFontSize()};
        }

        :root {
          --primary: ${siteSettings?.primary_color ?? '#D4AF37'};
          --secondary: ${siteSettings?.secondary_color ?? '#B8860B'};
          --accent: ${siteSettings?.accent_color ?? '#F5E6A8'};
          --background: ${siteSettings?.background_color ?? '#EDECDD'};
          --text-main: ${siteSettings?.text_color ?? '#2D1810'};
          --text-subtle: #7a5f0b;

          --font-family-body: ${bodyFontMobileCssValue};
        }

        @media (min-width: 768px) {
          :root {
            --font-family-body: ${bodyFontDesktopCssValue};
          }
        }

        body, *,
        h1, h2, h3, h4, h5, h6,
        .font-serif, input, textarea, select,
        a, span, p, div, li, ul, ol,
        .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl, .text-6xl,
        .font-bold, .font-semibold, .font-medium,
        .font-sans, .font-serif, .font-mono {
          font-family: var(--font-family-body) !important;
          color: var(--text-main);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        @media (max-width: 767px) {
          body, *, 
          h1, h2, h3, h4, h5, h6,
          .font-serif, input, textarea, select,
          a, span, p, div, li, ul, ol,
          .text-lg, .text-xl, .text-2xl, .text-3xl, .text-4xl, .text-5xl, .text-6xl,
          .font-bold, .font-semibold, .font-medium,
          .font-sans, .font-serif, .font-mono,
          button, .btn {
            font-family: ${bodyFontMobileCssValue} !important;
          }
        }
        
        @media (max-width: 768px) {
          body:not(.custom-font) {
            font-family: 'Heebo', sans-serif !important;
            font-size: 15px;
            line-height: 1.5;
          }
          h1:not(.custom-font) {
            font-size: 20px !important;
            line-height: 1.3;
          }
          h2:not(.custom-font),
          h3:not(.custom-font) {
            font-size: 17px !important;
            line-height: 1.4;
          }
          small:not(.custom-font),
          .small-text:not(.custom-font) {
            font-size: 13px !important;
            line-height: 1.4;
          }
        }

        button, .btn {
          font-family: var(--font-family-body) !important;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* --- Editorial design system --- */
        .font-editorial {
          font-family: 'Frank Ruhl Libre', Georgia, serif !important;
          font-weight: 300 !important;
          letter-spacing: -0.01em;
        }
        .eyebrow {
          font-family: 'Heebo', sans-serif !important;
          font-size: 0.62rem;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .text-white { color: #fff !important; }
        .hairline { border-color: rgba(101, 80, 60, 0.16) !important; }
        .bg-surface { background-color: #E4E2D0; }
        .link-underline { position: relative; background: none; border: 0; cursor: pointer; padding: 0.25rem 0; }
        .link-underline::after {
          content: ''; position: absolute; inset-inline-start: 0; bottom: 0; height: 1px; width: 100%;
          background: currentColor; transform: scaleX(0); transform-origin: var(--origin, left);
          transition: transform 0.45s cubic-bezier(.2,.7,.2,1);
        }
        [dir="rtl"] .link-underline::after { transform-origin: right; }
        .link-underline:hover::after { transform: scaleX(1); }
        .btn-editorial, .btn-editorial-light {
          display: inline-flex; align-items: center; justify-content: center;
          font-family: 'Heebo', sans-serif !important; font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase;
          padding: 1rem 2.2rem; transition: background-color .4s, color .4s, border-color .4s;
        }
        .btn-editorial { background: var(--secondary); color: #fff !important; border: 1px solid var(--secondary); }
        .btn-editorial:hover { background: transparent; color: var(--secondary) !important; }
        .btn-editorial-light { background: transparent; color: #fff !important; border: 1px solid rgba(255,255,255,.85); }
        .btn-editorial-light:hover { background: #fff; color: var(--text-main) !important; }

        .price-text {
          color: var(--text-main) !important;
        }

        .bg-primary { background-color: var(--primary); }
        .bg-secondary { background-color: var(--secondary); }
        .bg-accent { background-color: var(--accent); }
        .bg-background { background-color: var(--background); }

        .text-primary { color: var(--primary); }
        .text-secondary { color: var(--secondary); }
        .text-accent { color: var(--accent); }

        .text-main { color: var(--text-main); }
        .text-subtle { color: var(--text-subtle); }

        .border-primary { border-color: var(--primary) !important; }
        .border-secondary { border-color: var(--secondary) !important; }
        .border-accent { border-color: var(--accent) !important; }

        .hover-text-primary:hover { color: var(--primary) !important; }
        .hover-bg-primary:hover { background-color: var(--primary) !important; }

        .btn-primary {
          background-color: var(--secondary);
          color: white !important;
          transition: background-color 0.3s;
          font-family: var(--font-family-body) !important;
        }
        .btn-primary:hover {
          background-color: var(--primary);
        }

        .btn-outline {
          background-color: transparent;
          border: 1px solid var(--primary);
          color: var(--primary);
          transition: background-color 0.3s, color 0.3s;
          font-family: var(--font-family-body) !important;
        }
        .btn-outline:hover {
          background-color: var(--primary);
          color: white;
        }

        .dropdown-menu {
          pointer-events: auto;
        }
        .dropdown-menu:hover {
          display: block;
        }

        .blob-shape {
          transition: border-radius 0.8s ease-in-out, box-shadow 0.3s ease-in-out;
          will-change: border-radius;
        }
        .blob-shape:hover {
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 12px 20px -8px rgba(0, 0, 0, 0.1);
        }
        .blob-shape-1 {
          border-radius: 42% 58% 65% 35% / 28% 48% 52% 72%;
        }
        .blob-shape-2 {
          border-radius: 62% 38% 53% 47% / 39% 59% 41% 61%;
        }
        .blob-shape-3 {
          border-radius: 32% 68% 37% 63% / 59% 37% 63% 41%;
        }
        .blob-shape-4 {
          border-radius: 45% 55% 34% 66% / 62% 54% 46% 38%;
        }

        @media (max-width: 768px) {
          .product-container {
            max-width: 100px;
          }
          .category-container {
            max-width: 120px;
          }
        }
        @media (min-width: 769px) {
          .product-container {
            max-width: 160px;
          }
          .category-container {
            max-width: 180px;
          }
        }

        .logo-img-desktop {
          height: ${siteSettings?.logo_height_desktop ?? 80}px;
          max-height: none !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        .logo-img-mobile {
          height: ${siteSettings?.logo_height_mobile ?? 64}px;
          max-height: none !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
      `}</style>

      {(language === 'he' ? siteSettings?.top_bar_text : siteSettings?.top_bar_text_en) && (
        <div
          className="bg-secondary text-center py-2 px-3 eyebrow"
          style={{ color: siteSettings?.top_bar_text_color || 'white' }}
        >
          {language === 'he' ? siteSettings.top_bar_text : siteSettings.top_bar_text_en}
        </div>
      )}

      <SiteHeader
        siteSettings={siteSettings}
        siteName={siteName}
        user={user}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onLogout={handleLogout}
      />
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div key="menu-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40" onClick={() => setIsMenuOpen(false)} />
        )}
        {isMenuOpen && (
          <motion.div
            initial={{ x: language === 'he' ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: language === 'he' ? "100%" : "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className={`fixed top-0 ${language === 'he' ? 'right-0' : 'left-0'} h-full w-72 bg-background z-50 shadow-2xl flex flex-col`}
          >
            <div className={`flex-shrink-0 flex ${language === 'he' ? 'justify-end' : 'justify-start'} items-center p-4 border-b border-accent/20`}>
               <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                 <X className="w-5 h-5 text-main" />
               </Button>
            </div>

            <nav className="flex-grow p-6 overflow-y-auto">
              <NavLink to={createPageUrl("Home")}>{t('home', language)}</NavLink>
              <NavLink to={createPageUrl("Products")}>{t('products', language)}</NavLink>
              <NavLink to={createPageUrl("Products") + "?category=rings"}>{t('rings', language)}</NavLink>
              <NavLink to={createPageUrl("Products") + "?category=necklaces"}>{t('necklaces', language)}</NavLink>
              <NavLink to={createPageUrl("Products") + "?category=earrings"}>{t('earrings', language)}</NavLink>
              <NavLink to={createPageUrl("Products") + "?category=bracelets"}>{t('bracelets', language)}</NavLink>
              <NavLink to={createPageUrl("Workshop")}>
                {language === 'he' ? 'סדנאות' : 'Workshops'}
              </NavLink>
              <NavLink to={createPageUrl("Wishlist")}>{t('wishlist', language)}</NavLink>
              <NavLink to={createPageUrl("About")}>{t('about', language)}</NavLink>
              <NavLink to={createPageUrl("Contact")}>{t('contact', language)}</NavLink>
            </nav>

            <div className="flex-shrink-0 p-6 border-t border-accent/20">
              {user ? (
                <div className="space-y-2">
                  <div className="text-sm text-subtle">{language === 'he' ? `שלום, ${user.full_name}` : `Hello, ${user.full_name}`}</div>
                  {user.role === 'admin' && (
                    <Link
                      to={createPageUrl("Admin")}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-lg text-main hover-text-primary transition-colors font-normal block"
                    >
                      {t('admin', language)}
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="text-lg text-main hover-text-primary transition-colors font-normal block text-right"
                  >
                    {t('logout', language)}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { base44.auth.redirectToLogin(); setIsMenuOpen(false); }}
                  className="text-lg text-main hover-text-primary transition-colors font-normal"
                >
                  {t('login', language)}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main role="main">{children}</main>

      <SiteFooter siteSettings={siteSettings} siteName={siteName} />
      
      <CookieConsentBanner />
      <AccessibilityWidget />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.body.style.backgroundColor = '#EDECDD';
      document.documentElement.style.backgroundColor = '#EDECDD';

      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('cache') || key.includes('app-') || key.includes('react-query'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (e) {
        console.log('Could not access localStorage in Layout component:', e);
      }
    }

    const loadSettingsAndHideSplash = async () => {
      const settings = await SiteSettings.list();
      if (settings.length > 0) {
        setSiteSettings(settings[0]);
      }
      setTimeout(() => {
        setShowLoadingScreen(false);
      }, 2000);
    };

    loadSettingsAndHideSplash();
  }, []);

  return (
    <LanguageProvider>
      <CartProvider>
        <AnimatePresence>
          {showLoadingScreen && (
            <LoadingScreen siteSettings={siteSettings} />
          )}
        </AnimatePresence>
        <LayoutContent currentPageName={currentPageName} siteSettings={siteSettings}>
          {children}
        </LayoutContent>
      </CartProvider>
    </LanguageProvider>
  )
}