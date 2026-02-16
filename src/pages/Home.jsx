
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/Product";
import { SiteSettings } from "@/entities/SiteSettings";
import { WishlistItem } from "@/entities/WishlistItem";
import { User } from "@/entities/User";
import { useLanguage, t } from "@/components/LanguageProvider";
import { toast } from "sonner";

// Import components
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FAQ from "@/components/home/FAQ";

import { Shield, Truck, Heart } from "lucide-react";

export default function Home() {
  const { language } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isSiteSettingsLoading, setIsSiteSettingsLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const loadFeaturedProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      const products = await Product.filter({ is_featured: true }, "-created_date", 6);
      setFeaturedProducts(products);
    } catch (error) {
      console.error("Error loading featured products:", error);
    }
    setIsLoadingProducts(false);
  }, []);

  const loadSiteSettings = useCallback(async () => {
    setIsSiteSettingsLoading(true);
    try {
      const settings = await SiteSettings.list();
      if (settings.length > 0) {
        setSiteSettings(settings[0]);
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    } finally {
      setIsSiteSettingsLoading(false);
    }
  }, []);

  const loadWishlist = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
        const items = await WishlistItem.filter({ user_email: currentUser.email });
        setWishlist(items);
    } catch(e) {
        console.error("Failed to load wishlist:", e);
    }
  }, []); // setWishlist is stable, so no need to add it to deps

  const loadInitialData = useCallback(async () => {
    await Promise.all([
      loadFeaturedProducts(),
      loadSiteSettings()
    ]);
    
    try {
        const currentUser = await User.me();
        setUser(currentUser);
        // We need the current `user` state here for `loadWishlist`
        // Since `loadInitialData` is only called once initially, `user` won't be set yet
        // so we pass `currentUser` directly.
        loadWishlist(currentUser);
    } catch(e) {
        console.info("User not logged in or failed to fetch user:", e); // Changed to info to be less noisy
    }
  }, [loadFeaturedProducts, loadSiteSettings, loadWishlist]);

  useEffect(() => {
    // יצירת מסך פתיחה - רק בטעינה ראשונית של דף הבית
    if (typeof window !== 'undefined') {
      // בדיקה אם מסך הפתיחה כבר הוצג בסשן הנוכחי
      if (!sessionStorage.getItem('splashShown')) {
        // הוספת ה-CSS לאנימציות ועיצוב מסך הפתיחה
        const style = document.createElement('style');
        style.textContent = `
          .splash-screen {
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background-color: #FDF6E3; z-index: 9999;
            display: flex; align-items: center; justify-content: center; flex-direction: column;
          }
          .splash-logo { width: 160px; height: auto; animation: splashPulse 1.5s ease-in-out; }
          .splash-loader { width: 48px; height: 3px; background-color: #E5DCC5; border-radius: 2px; margin-top: 24px; overflow: hidden; }
          .splash-progress { height: 100%; background-color: #B8860B; border-radius: 2px; animation: splashProgress 1.2s ease-out forwards; }
          @keyframes splashPulse { 0% { opacity: 0.7; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1); } 100% { opacity: 0.9; transform: scale(0.98); } }
          @keyframes splashProgress { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
          .fade-out { animation: fadeOut 1s forwards; }
        `;
        document.head.appendChild(style);

        // יצירת אלמנט מסך הפתיחה
        const splash = document.createElement('div');
        splash.className = 'splash-screen';
        splash.innerHTML = `
          <img src="${window.location.origin}/logo.png" alt="ENGEE Logo" class="splash-logo" onerror="this.style.display='none'" />
          <div class="splash-loader"><div class="splash-progress"></div></div>
        `;
        document.body.appendChild(splash);

        // קביעת דגל ב-sessionStorage כדי למנוע הופעה חוזרת
        sessionStorage.setItem('splashShown', 'true');

        // הסרת מסך הפתיחה לאחר 1.2 שניות
        setTimeout(() => {
          splash.classList.add('fade-out');
          setTimeout(() => {
            splash.remove();
            // הסרת ה-style לאחר שהאנימציה הסתיימה
            style.remove();
          }, 1000);
        }, 1200);
      }
    }
    
    loadInitialData();
  }, [loadInitialData]);

  const handleToggleWishlist = useCallback(async (productId) => {
    if (isTogglingWishlist) return; // Prevent multiple clicks while toggling
    if (!user) {
        toast.error(t('loginRequired', language));
        User.login(); // Assuming this is a static method to redirect/show login
        return;
    }

    setIsTogglingWishlist(true);
    const wishlistItem = wishlist.find(item => item.product_id === productId);

    try {
        if (wishlistItem) {
            await WishlistItem.delete(wishlistItem.id);
        } else {
            await WishlistItem.create({ product_id: productId, user_email: user.email });
        }
        await loadWishlist(user); // Use the memoized loadWishlist
        window.dispatchEvent(new CustomEvent('wishlistUpdated')); // Notify other components of wishlist change
    } catch(e) {
        toast.error(t('error', language));
        console.error("Failed to toggle wishlist item:", e);
    } finally {
        setIsTogglingWishlist(false);
    }
  }, [isTogglingWishlist, user, wishlist, language, loadWishlist]);

  if (isSiteSettingsLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6E3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#B8860B] mx-auto mb-4"></div>
          <p className="text-lg text-[#2D1810]">{language === 'he' ? 'טוען את האתר...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <Hero siteSettings={siteSettings} isLoading={isSiteSettingsLoading} />
      
      <CategoryGrid siteSettings={siteSettings} />
      <FeaturedProducts 
        products={featuredProducts} 
        isLoading={isLoadingProducts} 
        siteSettings={siteSettings}
        wishlist={wishlist}
        onToggleWishlist={handleToggleWishlist}
        isTogglingWishlist={isTogglingWishlist}
       />
      <FAQ siteSettings={siteSettings} />
      
      {/* Features Section - הועבר לסוף הדף, לפני הפוטר */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Shield className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
              </div>
              <h3 className="text-sm md:text-xl font-semibold text-main mb-1 md:mb-2">
                {language === 'he' ? 
                  (siteSettings?.home_feature_1_title ?? "איכות מובטחת") : 
                  (siteSettings?.home_feature_1_title_en ?? "Quality Assured")
                }
              </h3>
              <p className="text-xs md:text-base text-subtle leading-tight">
                {language === 'he' ? 
                  (siteSettings?.home_feature_1_desc ?? "תכשיטים באיכות גבוהה") : 
                  (siteSettings?.home_feature_1_desc_en ?? "High quality jewelry")
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
              </div>
              <h3 className="text-sm md:text-xl font-semibold text-main mb-1 md:mb-2">
                {language === 'he' ? 
                  (siteSettings?.home_feature_2_title ?? "משלוח לכל הארץ") : 
                  (siteSettings?.home_feature_2_title_en ?? "Nationwide Shipping")
                }
              </h3>
              <p className="text-xs md:text-base text-subtle leading-tight">
                {language === 'he' ? 
                  (siteSettings?.home_feature_2_desc ?? "משלוח חינם בהזמנה מעל 499₪") : 
                  (siteSettings?.home_feature_2_desc_en ?? "Free shipping over 499₪")
                }
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
              </div>
              <h3 className="text-sm md:text-xl font-semibold text-main mb-1 md:mb-2">
                {language === 'he' ? 
                  (siteSettings?.home_feature_3_title ?? "שירות איכותי") : 
                  (siteSettings?.home_feature_3_title_en ?? "Quality Service")
                }
              </h3>
              <p className="text-xs md:text-base text-subtle leading-tight">
                {language === 'he' ? 
                  (siteSettings?.home_feature_3_desc ?? "ייעוץ אישי, התעניינות והקשבה") : 
                  (siteSettings?.home_feature_3_desc_en ?? "Personal consultation and care")
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
