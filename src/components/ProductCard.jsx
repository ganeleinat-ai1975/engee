
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductCard({ product, wishlist = [], onToggleWishlist, isTogglingWishlist }) {
  const { language } = useLanguage();
  
  // Safety checks to prevent errors
  if (!product || typeof product !== 'object') {
    return null;
  }

  const isInWishlist = Array.isArray(wishlist) && wishlist.some(item => item.product_id === product.id);
  
  const productName = language === 'he' ? 
    (product.name || product.name_en || '') : 
    (product.name_en || product.name || '');
    
  const imageUrl = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
  const isSoldOut = (product.stock_quantity || 0) <= 0;

  const getOptimizedUrl = (url, options = {}) => {
    if (!url || typeof url !== 'string' || !url.includes('supabase.co')) return url;
    const { width, quality = 75, format = 'webp' } = options; // איכות 75
    
    try {
      const urlObj = new URL(url);
      if (width) {
          urlObj.searchParams.set('width', width);
      }
      urlObj.searchParams.set('quality', quality);
      urlObj.searchParams.set('format', format);
      return urlObj.toString();
    } catch (e) {
      console.warn('Invalid URL for optimization:', url);
      return url;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group text-center"
    >
      <div className={`relative overflow-hidden border border-accent/20 w-full aspect-[4/5] mx-auto mb-4`}>
        {isSoldOut && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            {language === 'he' ? 'אזל' : 'Sold out'}
          </div>
        )}
        <Link to={createPageUrl("Product") + `?id=${product.id}`}>
          {imageUrl ? (
            <img
              src={getOptimizedUrl(imageUrl, { width: 300 })}
              srcSet={`${getOptimizedUrl(imageUrl, { width: 200 })} 200w,
                       ${getOptimizedUrl(imageUrl, { width: 300 })} 300w,
                       ${getOptimizedUrl(imageUrl, { width: 400 })} 400w`}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16.6vw"
              alt={productName}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isSoldOut ? 'grayscale' : ''}`}
            />
          ) : (
            <div className="w-full h-full bg-accent flex items-center justify-center">
              <div className="w-8 h-8 bg-main/20" />
            </div>
          )}
        </Link>
      </div>

      <div className="px-2">
        <div className="flex justify-between items-start gap-2">
            <div className="text-left flex-1">
                <h3 className="font-semibold text-main text-base mb-1">
                  <Link to={createPageUrl("Product") + `?id=${product.id}`} className="hover-text-primary transition-colors">
                    {productName}
                  </Link>
                </h3>
                <p className="text-main font-bold text-lg price-text">
                  {typeof product.price === 'number' ? (
                    language === 'he' ? `₪${product.price.toLocaleString()}` : `${product.price.toLocaleString()} NIS`
                  ) : (
                    language === 'he' ? 'ללא מחיר' : 'No price'
                  )}
                </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleWishlist?.(product.id)}
              disabled={isTogglingWishlist}
              className="text-gray-600 hover:text-red-500 rounded-full h-8 w-8 flex-shrink-0"
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </Button>
        </div>
      </div>
    </motion.div>
  );
}
