import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/Product";
import { SiteSettings } from "@/entities/SiteSettings";
import { WishlistItem } from "@/entities/WishlistItem";
import { User } from "@/entities/User";
import { Sale } from "@/entities/Sale";
import { useLanguage, t } from "@/components/LanguageProvider";
import { toast } from "sonner";

import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BrandStory from "@/components/home/BrandStory";
import InstagramGallery from "@/components/home/InstagramGallery";
import ValuesStrip from "@/components/home/ValuesStrip";
import FAQ from "@/components/home/FAQ";

export default function Home() {
  const { language } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [siteSettings, setSiteSettings] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [activeSale, setActiveSale] = useState(null);

  const loadWishlist = useCallback(async (currentUser) => {
    if (!currentUser) return;
    const items = await WishlistItem.filter({ user_email: currentUser.email });
    setWishlist(items);
  }, []);

  useEffect(() => {
    (async () => {
      const [featured, latest, settings, sales] = await Promise.all([
        Product.filter({ is_featured: true }, "-created_date", 8),
        Product.filter({ is_featured: { $ne: true } }, "-created_date", 4),
        SiteSettings.list(),
        Sale.filter({ is_active: true }),
      ]);
      setFeaturedProducts(featured);
      setLatestProducts(latest);
      if (settings.length > 0) setSiteSettings(settings[0]);
      if (sales.length > 0) setActiveSale(sales[0]);
      setIsLoadingProducts(false);
      if (window.location.hash === "#faq") setTimeout(() => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }), 300);
      const currentUser = await User.me().catch(() => null);
      if (currentUser) {
        setUser(currentUser);
        loadWishlist(currentUser);
      }
    })();
  }, [loadWishlist]);

  const handleToggleWishlist = useCallback(async (productId) => {
    if (isTogglingWishlist) return;
    if (!user) {
      toast.error(t("loginRequired", language));
      User.login();
      return;
    }
    setIsTogglingWishlist(true);
    const existing = wishlist.find((item) => item.product_id === productId);
    try {
      if (existing) await WishlistItem.delete(existing.id);
      else await WishlistItem.create({ product_id: productId, user_email: user.email });
      await loadWishlist(user);
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (e) {
      toast.error(t("error", language));
    } finally {
      setIsTogglingWishlist(false);
    }
  }, [isTogglingWishlist, user, wishlist, language, loadWishlist]);

  const he = language === "he";
  const cardProps = { wishlist, onToggleWishlist: handleToggleWishlist, isTogglingWishlist, activeSale, siteSettings, isLoading: isLoadingProducts };
  const galleryImages = [...featuredProducts, ...latestProducts].map((p) => p.images?.[1] || p.images?.[0]).filter(Boolean);

  return (
    <div className="bg-background">
      <Hero siteSettings={siteSettings} />
      <FeaturedProducts products={featuredProducts} {...cardProps} />
      <CategoryGrid siteSettings={siteSettings} />
      <BrandStory siteSettings={siteSettings} />
      {latestProducts.length > 0 && (
        <FeaturedProducts products={latestProducts} {...cardProps} count={4}
          eyebrow={he ? "חדש באתר" : "New in"} title={he ? "תכשיטים לכל יום" : "Everyday essentials"} />
      )}
      <ValuesStrip siteSettings={siteSettings} />
      <div id="faq"><FAQ siteSettings={siteSettings} /></div>
      <InstagramGallery siteSettings={siteSettings} images={galleryImages} />
    </div>
  );
}