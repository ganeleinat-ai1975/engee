
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/entities/Product";
import { SiteSettings } from "@/entities/SiteSettings";
import { WishlistItem } from "@/entities/WishlistItem";
import { User } from "@/entities/User";
import { useLanguage, t } from "@/components/LanguageProvider";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";

export default function Products() {
  const { language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [siteSettings, setSiteSettings] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const allProducts = await Product.filter({}, "-created_date");
      console.log("Data received from API in Products.js:", allProducts);
      
      // Add safety checks for products array
      if (Array.isArray(allProducts)) {
        setProducts(allProducts);
        
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam && typeof categoryParam === 'string') {
          setSelectedCategory(decodeURIComponent(categoryParam));
        }
      } else {
        console.error("Invalid products data received:", allProducts);
        setProducts([]);
      }
    } catch (error) {
      // Per user request, only log the error, do not show a toast to avoid false alarms.
      console.error("Error loading products:", error);
      setProducts([]);
    }
  }, []); // No external dependencies that would change the function's identity

  const loadSiteSettings = useCallback(async () => {
    try {
      const settings = await SiteSettings.list();
      if (Array.isArray(settings) && settings.length > 0) {
        setSiteSettings(settings[0]);
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    }
  }, []); // No external dependencies that would change the function's identity
  
  const loadWishlist = useCallback(async (currentUser) => {
    if (!currentUser) return;
    try {
        const items = await WishlistItem.filter({ user_email: currentUser.email });
        if (Array.isArray(items)) {
          setWishlist(items);
        }
    } catch(e) {
        console.error("Failed to load wishlist", e);
    }
  }, []); // No external dependencies that would change the function's identity

  const loadInitialData = useCallback(async () => {
    await loadProducts();
    await loadSiteSettings();
    try {
        const currentUser = await User.me();
        setUser(currentUser);
        await loadWishlist(currentUser);
    } catch(e) {
        console.info("User not logged in or failed to fetch user:", e);
    } finally {
        setIsLoading(false);
    }
  }, [loadProducts, loadSiteSettings, loadWishlist]); // Dependencies are the memoized functions

  const filterProducts = useCallback(() => {
    if (!Array.isArray(products)) return;
    
    let filtered = [...products];

    if (searchTerm && typeof searchTerm === 'string') {
      filtered = filtered.filter(product => {
        const productName = product.name || '';
        const productDescription = product.description || '';
        const searchLower = searchTerm.toLowerCase();
        
        return productName.toLowerCase().includes(searchLower) ||
               productDescription.toLowerCase().includes(searchLower);
      });
    }

    if (selectedCategory !== "all" && typeof selectedCategory === 'string') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleToggleWishlist = async (productId) => {
    if (isTogglingWishlist) return;
    if (!user) {
        toast.error(t('loginRequired', language));
        User.login();
        return;
    }

    setIsTogglingWishlist(true);
    const wishlistItem = wishlist.find(item => item.product_id === productId);

    try {
        if (wishlistItem) {
            await WishlistItem.delete(wishlistItem.id);
            toast.info(t('removedFromWishlist', language));
        } else {
            await WishlistItem.create({ product_id: productId, user_email: user.email });
            toast.success(t('addedToWishlist', language));
        }
        // Since loadWishlist is memoized and relies on its argument,
        // it's safe to call it directly here.
        await loadWishlist(user); 
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch(e) {
        toast.error(t('error', language));
        console.error("Error toggling wishlist item:", e);
    } finally {
        setIsTogglingWishlist(false);
    }
  }

  const categories = [
    { value: "all", label: t('allCategories', language) },
    { value: "rings", label: t('rings', language) },
    { value: "necklaces", label: t('necklaces', language) },
    { value: "earrings", label: t('earrings', language) },
    { value: "bracelets", label: t('bracelets', language) }
  ];

  const getPageTitle = () => {
    if (selectedCategory && selectedCategory !== 'all') {
      const category = categories.find(c => c.value === selectedCategory);
      return category ? category.label : (language === 'he' ? "מוצרים" : "Products");
    }
    return language === 'he' 
      ? (siteSettings?.products_page_title || t('products', language)) 
      : (siteSettings?.products_page_title_en || t('products', language));
  };

  const pageTitle = getPageTitle();

  const pageSubtitle = language === 'he' ? 
    (siteSettings?.products_page_subtitle ?? "") : 
    (siteSettings?.products_page_subtitle_en ?? "");

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 min-h-[80px]">
          {isLoading || !siteSettings ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 max-w-md mx-auto" />
              <Skeleton className="h-6 w-full max-w-lg mx-auto" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-main mb-4">
                {pageTitle}
              </h1>
              <p className="text-lg text-subtle max-w-2xl mx-auto">
                {pageSubtitle}
              </p>
            </>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array(12).fill(0).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="aspect-[4/5] w-full max-w-[180px] md:max-w-[220px] mb-4 mx-auto" />
                <Skeleton className="h-4 w-3/4 mb-2 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
                isTogglingWishlist={isTogglingWishlist}
              />
            ))
          )}
        </div>

        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💎</div>
            <h3 className="text-xl font-semibold text-main mb-2">
              {t('noProductsFound', language)}
            </h3>
            <p className="text-subtle">
              {t('tryDifferentCategory', language)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
