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
        @import url('https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&family=Barlow+Condensed:wght@300;400;500;600;700&family=Truculenta:wght@300;400;500;600;700&family=Karantina:wght@300;400;700&family=Varela+Round&family=Heebo:wght@300;400;500;600;700&display=swap');
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
          className="bg-secondary text-center py-2 md:py-4 px-2 md:px-4 text-sm md:text-lg font-medium"
          style={{ color: siteSettings?.top_bar_text_color || 'white' }}
        >
          {language === 'he' ? siteSettings.top_bar_text : siteSettings.top_bar_text_en}
        </div>
      )}

      {/* --- Desktop Header --- */}
                  <header className="hidden md:flex bg-background w-full items-center justify-between px-4 py-2 h-auto" role="banner">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
              <Menu className="w-6 h-6 text-main" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={() => alert(t('searchFeatureComingSoon', language))}>
              <Search className="w-6 h-6 text-gray-600" />
            </Button>
             
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={t('language', language)}>
                  <Globe className="w-6 h-6 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('he')}>עברית</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex-1 flex justify-center">
            <Link to="/">
              {siteSettings?.logo_url ? (
                <>
                  <img
                    src={siteSettings.logo_url}
                    alt={siteName}
                    className="w-auto object-contain hidden md:block logo-img-desktop"
                  />
                  <img
                    src={siteSettings.logo_url}
                    alt={siteName}
                    className="w-auto object-contain block md:hidden logo-img-mobile"
                  />
                </>
              ) : (
                <span className="text-xl font-bold text-main">{siteName}</span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button asChild variant="ghost" size="icon" title={t('admin', language)}>
                    <Link to={createPageUrl("Admin")}>
                      <Settings className="w-6 h-6 text-gray-600" />
                    </Link>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" title={t('profile', language)}>
                      <UserIcon className="w-6 h-6 text-gray-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Profile')}>
                      <UserIcon className="w-4 h-4 mr-2" />
                      {t('profile', language)}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Orders')}>
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      {t('orders', language)}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <X className="w-4 h-4 mr-2" />
                      {t('logout', language)}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="ghost" onClick={() => base44.auth.redirectToLogin()} className="text-gray-700 text-sm p-2">
                {t('login', language)}
              </Button>
            )}

            <Button asChild variant="ghost" size="icon" className="relative" title={t('wishlist', language)}>
              <Link to={createPageUrl("Wishlist")}>
                  <Heart className="w-6 h-6 text-gray-600" />
                  {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{wishlistCount}</span>
                  )}
              </Link>
            </Button>

            <Button asChild variant="ghost" size="icon" className="relative" title={t('cart', language)}>
              <Link to={createPageUrl("Cart")}>
                <ShoppingBag className="w-6 h-6 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </Link>
            </Button>
          </div>
      </header>

      {/* --- Mobile Header --- */}
                  <header className="md:hidden bg-background w-full" role="banner">
        <div className="flex justify-center items-center h-auto py-0">
           <Link to="/">
              {siteSettings?.logo_url ? (
                <>
                  <img
                    src={siteSettings.logo_url}
                    alt={siteName}
                    className="w-auto object-contain hidden md:block logo-img-desktop"
                  />
                  <img
                    src={siteSettings.logo_url}
                    alt={siteName}
                    className="w-auto object-contain block md:hidden logo-img-mobile"
                  />
                </>
              ) : (
                <span className="text-xl font-bold text-main">{siteName}</span>
              )}
            </Link>
        </div>
        <div className="flex justify-between items-center h-10 px-2 -mt-4">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
                    <Menu className="w-5 h-5 text-main" />
                </Button>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" title={t('language', language)}>
                            <Globe className="w-5 h-5 text-gray-600" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => changeLanguage('he')}>עברית</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage('en')}>English</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {user?.role === 'admin' && (
                    <Button asChild variant="ghost" size="icon" title={t('admin', language)}>
                        <Link to={createPageUrl("Admin")}>
                            <Settings className="w-5 h-5 text-gray-600" />
                        </Link>
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-1">
                {user ? (
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" title={t('profile', language)}>
                                <UserIcon className="w-5 h-5 text-gray-600" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <div className="px-3 py-2 border-b">
                                <p className="text-sm font-medium">{user.full_name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Profile')}>
                                <UserIcon className="w-4 h-4 mr-2" />
                                {t('profile', language)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Orders')}>
                                <ShoppingBag className="w-4 h-4 mr-2" />
                                {t('orders', language)}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleLogout}>
                                <X className="w-4 h-4 mr-2" />
                                {t('logout', language)}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button variant="ghost" size="icon" onClick={() => base44.auth.redirectToLogin()}>
                        <UserIcon className="w-5 h-5 text-gray-600" />
                    </Button>
                )}
                <Button asChild variant="ghost" size="icon" className="relative" title={t('wishlist', language)}>
                    <Link to={createPageUrl("Wishlist")}>
                        <Heart className="w-5 h-5 text-gray-600" />
                        {wishlistCount > 0 && (
                           <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{wishlistCount}</span>
                        )}
                    </Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="relative" title={t('cart', language)}>
                    <Link to={createPageUrl("Cart")}>
                        <ShoppingBag className="w-5 h-5 text-gray-600" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">{cartCount}</span>
                        )}
                    </Link>
                </Button>
            </div>
        </div>
      </header>

      <AnimatePresence>
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

      <footer className="bg-secondary text-white" role="contentinfo">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {language === 'he' ?
                  (siteSettings?.footer_links_title ?? t('quickLinks', language)) :
                  (siteSettings?.footer_links_title_en ?? t('quickLinks', language))
                }
              </h3>
              <div className="space-y-2">
                <Link to={createPageUrl("About")} className="block text-white hover:text-accent transition-colors">{t('about', language)}</Link>
                <Link to={createPageUrl("Contact")} className="block text-white hover:text-accent transition-colors">{t('contact', language)}</Link>
                <Link to={createPageUrl("Products")} className="block text-white hover:text-accent transition-colors">{t('products', language)}</Link>
                <Link to={createPageUrl("Workshop")} className="block text-white hover:text-accent transition-colors">
                  {language === 'he' ? 'סדנאות' : 'Workshops'}
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {language === 'he' ?
                  (siteSettings?.footer_categories_title ?? t('categories', language)) :
                  (siteSettings?.footer_categories_title_en ?? t('categories', language))
                }
              </h3>
              <div className="space-y-2">
                <Link to={createPageUrl("Products") + "?category=rings"} className="block text-white hover:text-accent transition-colors">{t('rings', language)}</Link>
                <Link to={createPageUrl("Products") + "?category=necklaces"} className="block text-white hover:text-accent transition-colors">{t('necklaces', language)}</Link>
                <Link to={createPageUrl("Products") + "?category=earrings"} className="block text-white hover:text-accent transition-colors">{t('earrings', language)}</Link>
                <Link to={createPageUrl("Products") + "?category=bracelets"} className="block text-white hover:text-accent transition-colors">{t('bracelets', language)}</Link>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {language === 'he' ?
                  (siteSettings?.footer_contact_title ?? t('contact', language)) :
                  (siteSettings?.footer_contact_title_en ?? t('contact', language))
                }
              </h3>
              <div className="space-y-2 text-white">
                <p className="text-white">{siteSettings?.contact_phone ?? "03-123-4567"}</p>
                <p className="text-white">{siteSettings?.contact_email ?? "info@engeejewelry.com"}</p>
                <p className="text-white">
                  {language === 'he' ?
                    (siteSettings?.contact_address ?? "רחוב היהלומים 12, תל אביב") :
                    (siteSettings?.contact_address_en ?? "12 Diamond Street, Tel Aviv")
                  }
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {language === 'he' ?
                  (siteSettings?.footer_social_title ?? t('followUs', language)) :
                  (siteSettings?.footer_social_title_en ?? t('followUs', language))
                }
              </h3>
              <div className="space-y-2">
                {siteSettings?.instagram_url && (
                  <a
                    href={siteSettings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white hover:text-accent transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {siteSettings?.whatsapp_number && (
                  <a
                    href={`https://wa.me/${siteSettings.whatsapp_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white hover:text-accent transition-colors"
                  >
                    WhatsApp
                  </a>
                )}
                {!siteSettings?.instagram_url && !siteSettings?.whatsapp_number && (
                  <>
                    <p className="text-white">Instagram</p>
                    <p className="text-white">WhatsApp</p>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-primary/20 mt-8 pt-8 text-center text-white">
            <div className="flex justify-center gap-4 mb-4 flex-wrap">
              <Link to="/privacy-policy" className="text-white hover:text-accent transition-colors text-sm">
                {language === 'he' ? 'מדיניות פרטיות' : 'Privacy Policy'}
              </Link>
              <span className="text-white/50">|</span>
              <Link to="/accessibility" className="text-white hover:text-accent transition-colors text-sm">
                {language === 'he' ? 'הצהרת נגישות' : 'Accessibility'}
              </Link>
              <span className="text-white/50">|</span>
              <Link to="/terms" className="text-white hover:text-accent transition-colors text-sm">
                {language === 'he' ? 'תקנון האתר' : 'Terms of Use'}
              </Link>
            </div>
            <p className="text-white">&copy; {new Date().getFullYear()} {siteName}. {t('allRightsReserved', language)}.</p>
          </div>
        </div>
      </footer>
      
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