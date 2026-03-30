import React, { useState, useEffect, useCallback } from "react";
import { Product as ProductEntity } from "@/entities/Product";
import { SiteSettings } from "@/entities/SiteSettings";
import { WishlistItem } from "@/entities/WishlistItem";
import { User } from "@/entities/User";
import { Sale } from "@/entities/Sale";
import { getSalePrice } from "@/lib/saleUtils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; 
import { toast } from "sonner";
import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage, t } from "@/components/LanguageProvider";
import ImageLightbox from "@/components/ImageLightbox"; 
import { useCart } from "@/components/CartProvider"; // Import useCart

export default function ProductPage() {
  const { language } = useLanguage();
  const { user, addToCart } = useCart(); // Use addToCart from context
  const [product, setProduct] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [goldPlating, setGoldPlating] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState(null);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeSale, setActiveSale] = useState(null);

  const getOptimizedUrl = (url, options = {}) => {
    if (!url || !url.includes('supabase.co')) return url;
    const { width, quality = 75, format = 'webp' } = options; // Changed default quality to 75
    const urlObj = new URL(url);
    if (width) {
        urlObj.searchParams.set('width', width);
    }
    urlObj.searchParams.set('quality', quality);
    urlObj.searchParams.set('format', format);
    return urlObj.toString();
  };

  // הגדרת מידות לפי קטגוריה
  const getSizeOptions = (category) => {
    switch(category) {
      case 'rings':
        return Array.from({length: 16}, (_, i) => (48 + i).toString());
      case 'necklaces':
        return ['37', '42', '45', '50', '55'];
      case 'bracelets':
        return ['15', '18'];
      default:
        return [];
    }
  };

  const checkWishlistStatus = useCallback(async (productId, userEmail) => {
    if (!userEmail || !productId) return;
    try {
        const wishListItems = await WishlistItem.filter({ product_id: productId, user_email: userEmail });
        if (wishListItems.length > 0) {
            setIsInWishlist(true);
            setWishlistItemId(wishListItems[0].id);
        } else {
            setIsInWishlist(false);
            setWishlistItemId(null);
        }
    } catch(e) {
        console.error("Could not check wishlist status", e);
    }
  }, []);

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      if (!productId) {
        setIsLoading(false);
        return;
      }
      
      // טוען את המוצר
      const productData = await ProductEntity.get(productId);

      // Validate that productData is a valid object before proceeding
      if (!productData || typeof productData.name !== 'string') {
        throw new Error("Received invalid product data from API.");
      }
      
      setProduct(productData);
      
      if (productData.images && productData.images.length > 0) {
        setSelectedImageIndex(0);
      }
      
      // הגדרת מידות לפי קטגוריה
      const sizeOptions = getSizeOptions(productData.category);
      if (sizeOptions.length > 0) {
        productData.size_options = sizeOptions;
        
        // אם אין available_sizes מוגדרים, נניח שכולם זמינים
        if (!productData.available_sizes || productData.available_sizes.length === 0) {
          productData.available_sizes = sizeOptions;
        }
        
        // בחירת מידה ראשונה זמינה כברירת מחדל
        const firstAvailableSize = sizeOptions.find(size => 
          productData.available_sizes.includes(size)
        );
        if (firstAvailableSize) {
          setSelectedSize(firstAvailableSize);
        }
      }

      // טוען את ההגדרות בנפרד, עם טיפול שגיאה שקט
      try {
        const settings = await SiteSettings.list();
        if (settings.length > 0) {
          setSiteSettings(settings[0]);
        }
      } catch (settingsError) {
        console.warn("Site settings failed to load, continuing without them:", settingsError);
        // לא מציגים שגיאה למשתמש כי זה לא קריטי
      }

      // Load active sale
      try {
        const sales = await Sale.filter({ is_active: true });
        if (sales.length > 0) setActiveSale(sales[0]);
      } catch (e) {
        console.error("Failed to load active sale", e);
      }

      if (user) {
        checkWishlistStatus(productId, user.email);
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setIsLoading(false); // Always set loading to false in finally
    }
  }, [user, checkWishlistStatus]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const salePrice = getSalePrice(product, activeSale);

  const calculateTotalPrice = () => {
    const basePrice = salePrice || product?.price || 0;
    const goldPlatingPrice = (goldPlating && siteSettings?.enable_gold_plating) ? (siteSettings?.gold_plating_price || 100) : 0;
    return (basePrice + goldPlatingPrice) * quantity;
  };

  const handleAddToCart = async () => {
    // Dependant on CartProvider's addToCart to handle user/guest logic.
    // Ensure product is available
    if (!product) {
      toast.error(t('errorLoadingProduct', language)); // Add a translation key for this
      return;
    }

    // דרישת בחירת מידה לקטגוריות עם מידות
    const categoriesWithSizes = ['rings', 'neckwear', 'bracelets'];
    if (categoriesWithSizes.includes(product.category) && !selectedSize) {
      toast.error(t('selectSize', language));
      return;
    }
    
    // בדיקה שהמידה זמינה
    if (categoriesWithSizes.includes(product.category) && selectedSize && !product.available_sizes?.includes(selectedSize)) {
      toast.error(t('selectedSizeUnavailable', language));
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart({
        product_id: product.id,
        quantity: quantity,
        size: selectedSize,
        gold_plating: goldPlating,
      });
      toast.success(t('addedToCart', language)); // This toast is now triggered by ProductPage
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(t('error', language));
    }
    setIsAddingToCart(false);
  };

  const handleToggleWishlist = async () => {
    if (isTogglingWishlist) return;
    if (!user) {
        toast.error(t('loginRequired', language));
        const loginUrl = createPageUrl('Login') + `?redirect=${window.location.pathname}${window.location.search}`;
        User.loginWithRedirect(loginUrl);
        return;
    }
    
    setIsTogglingWishlist(true);
    try {
        if (isInWishlist) {
            await WishlistItem.delete(wishlistItemId);
            toast.success(t('removedFromWishlist', language));
            setIsInWishlist(false);
            setWishlistItemId(null);
        } else {
            const newItem = await WishlistItem.create({
                product_id: product.id,
                user_email: user.email
            });
            toast.success(t('addedToWishlist', language));
            setIsInWishlist(true);
            setWishlistItemId(newItem.id);
        }
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
        console.error("Error toggling wishlist", error);
        toast.error(t('error', language));
    } finally {
        setIsTogglingWishlist(false);
    }
  }

  // פונקציה לקבלת תווית המידה לפי קטגוריה
  const getSizeLabel = (category) => {
    switch(category) {
      case 'rings': return t('size', language);
      case 'necklaces': return language === 'he' ? 'אורך שרשרת' : 'Chain Length';
      case 'bracelets': return language === 'he' ? 'מידת צמיד' : 'Bracelet Size';
      default: return t('size', language);
    }
  };

  if (isLoading) {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <Skeleton className="w-full aspect-square" />
                    <div className="flex gap-4 mt-4">
                        <Skeleton className="w-24 h-24" />
                        <Skeleton className="w-24 h-24" />
                        <Skeleton className="w-24 h-24" />
                    </div>
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!product) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-amber-900">{t('productNotFound', language)}</h2>
            <Link to={createPageUrl("Products")}>
                <Button className="mt-4">{t('backToCollection', language)}</Button>
            </Link>
        </div>
    );
  }

  const totalPrice = calculateTotalPrice();
  const productName = product.name;
  const productDescription = product.description;
  const categoriesWithSizes = ['rings', 'necklaces', 'bracelets'];
  const mainImageUrl = product.images?.[selectedImageIndex] || product.images?.[0];
  const isSoldOut = product.stock_quantity <= 0;

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* תמונות המוצר */}
          <div className="space-y-4 relative">
            {isSoldOut && (
              <div className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full z-10">
                אזל מהמלאי
              </div>
            )}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="w-full aspect-square overflow-hidden border border-accent/20 block cursor-zoom-in"
              aria-label="הגדל תמונה"
            >
              <img
                src={getOptimizedUrl(mainImageUrl, { width: 600 })}
                srcSet={`${getOptimizedUrl(mainImageUrl, { width: 400 })} 400w,
                         ${getOptimizedUrl(mainImageUrl, { width: 600 })} 600w,
                         ${getOptimizedUrl(mainImageUrl, { width: 800 })} 800w`}
                sizes="(max-width: 1024px) 100vw, 50vw"
                alt={productName}
                loading="eager"
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            </button>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-primary' : 'border-accent/30'
                    }`}
                  >
                    <img
                      src={getOptimizedUrl(image, { width: 120 })}
                      alt={`${productName} ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* פרטי המוצר */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-main mb-4">{productName}</h1>
              
              {/* הצגת מחיר כולל - מוצג תמיד */}
              <div className="mb-6 p-4 bg-accent/10 rounded-lg border-2 border-accent/20">
                {salePrice !== null && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {language === 'he' ? 'במבצע' : 'SALE'}
                    </span>
                    <span className="text-lg text-gray-400 line-through">₪{product?.price?.toLocaleString()}</span>
                  </div>
                )}
                <p className="text-3xl font-bold text-primary mb-2">
                  ₪{totalPrice.toLocaleString()}
                  {goldPlating && siteSettings?.enable_gold_plating && (
                    <span className="text-lg text-subtle block">
                      (כולל ₪{siteSettings?.gold_plating_price || 100} ציפוי זהב)
                    </span>
                  )}
                </p>
                {quantity > 1 && (
                  <p className="text-sm text-subtle">
                    ₪{(salePrice || product?.price)?.toLocaleString()} × {quantity} {goldPlating && siteSettings?.enable_gold_plating ? `+ ₪${(siteSettings?.gold_plating_price || 100) * quantity} ציפוי זהב` : ''}
                  </p>
                )}
              </div>
              
              {productDescription && (
                <p className="text-subtle leading-relaxed mb-4">{productDescription}</p>
              )}
            </div>

            {/* מידות - לקטגוריות עם מידות */}
            {categoriesWithSizes.includes(product.category) && product.size_options && product.size_options.length > 0 && (
              <div>
                <Label className="block text-sm font-medium text-main mb-3">
                  {getSizeLabel(product.category)}
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {product.size_options.map((size) => {
                    const isAvailable = product.available_sizes?.includes(size) ?? true;
                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && setSelectedSize(size)}
                        disabled={!isAvailable}
                        className={`px-3 py-2 rounded-md border-2 text-sm font-medium transition-all ${
                          !isAvailable
                            ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed line-through opacity-50'
                            : selectedSize === size
                              ? 'border-primary bg-primary text-white shadow-md'
                              : 'border-accent/30 text-main hover:border-primary/50 hover:bg-accent/10'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {product.available_sizes && product.available_sizes.length < product.size_options.length && (
                  <p className="text-sm text-gray-500 mt-2">
                    {language === 'he' ? 'מידות עם קו חוצה אינן זמינות כרגע' : 'Crossed out sizes are currently unavailable'}
                  </p>
                )}
              </div>
            )}

            {/* ציפוי זהב - מותנה בהגדרות אדמין */}
            {siteSettings?.enable_gold_plating && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={goldPlating}
                      onChange={(e) => setGoldPlating(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                      goldPlating ? 'border-primary bg-primary' : 'border-accent'
                    }`}>
                      {goldPlating && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-main font-medium">
                    {t('goldPlating', language)} (+₪{siteSettings?.gold_plating_price || 100})
                  </span>
                </label>
              </div>
            )}
            
            {isSoldOut ? (
              <div className="w-full text-lg py-7 text-center font-bold text-red-600 border-2 border-red-200 rounded-md">
                אזל מהמלאי
              </div>
            ) : (
              <>
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <Label className="text-lg font-medium">{t('quantity', language)}</Label>
                  <div className="flex items-center border rounded-full">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="rounded-full">
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center font-semibold">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)} className="rounded-full">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full text-lg py-7"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  style={{
                    backgroundColor: '#92400e',
                    color: '#ffffff',
                    borderColor: '#92400e'
                  }}
                >
                  <ShoppingBag className="w-5 h-5 ml-2" style={{ color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>
                    {isAddingToCart ? t('addingToCart', language) : `${t('addToCart', language)} - ₪${totalPrice.toLocaleString()}`}
                  </span>
                </Button>
              </>
            )}
            
            <Button 
                size="lg" 
                variant="outline" 
                className="w-full text-lg py-7 border-gray-200 hover:bg-gray-50"
                onClick={handleToggleWishlist}
                disabled={isTogglingWishlist}
                style={{
                  color: '#2D1810',
                  borderColor: '#e5e7eb'
                }}
            >
              <Heart className={`w-5 h-5 ml-2 transition-all ${isInWishlist ? 'text-red-500 fill-current' : ''}`} />
              <span style={{ color: '#2D1810' }}>
                {isInWishlist ? t('removeFromWishlist', language) : t('addToWishlist', language)}
              </span>
            </Button>
          </div>
        </div>
      </div>
      {isLightboxOpen && (
        <ImageLightbox
          imageUrl={mainImageUrl}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </div>
  );
}