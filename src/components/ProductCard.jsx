import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";
import { useCart } from "@/components/CartProvider";
import { Heart, Plus, Loader2 } from "lucide-react";
import { getSalePrice } from "@/lib/saleUtils";

const formatPrice = (value, language) =>
  language === "he" ? `₪${value.toLocaleString()}` : `${value.toLocaleString()} NIS`;

export default function ProductCard({ product, wishlist = [], onToggleWishlist, isTogglingWishlist, activeSale }) {
  const { language } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  if (!product || typeof product !== "object") return null;

  const isInWishlist = Array.isArray(wishlist) && wishlist.some((item) => item.product_id === product.id);
  const name = language === "he" ? product.name || product.name_en || "" : product.name_en || product.name || "";
  const images = Array.isArray(product.images) ? product.images : [];
  const isSoldOut = (product.stock_quantity || 0) <= 0;
  const salePrice = getSalePrice(product, activeSale);
  const needsOptions = (product.available_sizes?.length || product.size_options?.length || 0) > 0;
  const productUrl = `/Product?id=${product.id}`;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (needsOptions) return navigate(productUrl);
    setAdding(true);
    await addToCart({ product_id: product.id, quantity: 1, gold_plating: false });
    setAdding(false);
  };

  const quickLabel = needsOptions
    ? language === "he" ? "בחירת מידה" : "Choose size"
    : language === "he" ? "הוספה מהירה" : "Quick add";

  return (
    <div className="group">
      <Link to={productUrl} className="block relative overflow-hidden aspect-[4/5] bg-surface">
        {images[0] ? (
          <>
            <img src={images[0]} alt={name} loading="lazy" className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.03] ${images[1] ? "md:group-hover:opacity-0" : ""} ${isSoldOut ? "grayscale" : ""}`} />
            {images[1] && (
              <img src={images[1]} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 ease-out hidden md:block md:group-hover:opacity-100" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-surface" />
        )}
        {(isSoldOut || salePrice !== null) && (
          <span className="absolute top-3 start-3 eyebrow bg-background text-main px-2 py-1">
            {isSoldOut ? (language === "he" ? "אזל" : "Sold out") : language === "he" ? "מבצע" : "Sale"}
          </span>
        )}
        <button type="button" aria-label={language === "he" ? "רשימת משאלות" : "Wishlist"}
          onClick={(e) => { e.preventDefault(); onToggleWishlist?.(product.id); }} disabled={isTogglingWishlist}
          className="absolute top-2 end-2 p-2 rounded-full hover:bg-white/50 transition-colors">
          <Heart className={`w-4 h-4 ${isInWishlist ? "fill-current text-secondary" : "text-main"}`} strokeWidth={1.5} />
        </button>
        {!isSoldOut && (
          <button type="button" onClick={handleQuickAdd} disabled={adding}
            className="absolute bottom-0 inset-x-0 hidden md:flex items-center justify-center gap-2 py-3 bg-background eyebrow text-main translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            {adding ? <Loader2 className="w-3 h-3 animate-spin" /> : quickLabel}
          </button>
        )}
        {!isSoldOut && (
          <button type="button" onClick={handleQuickAdd} disabled={adding} aria-label={quickLabel}
            className="md:hidden absolute bottom-2 end-2 w-9 h-9 rounded-full bg-background flex items-center justify-center">
            {adding ? <Loader2 className="w-4 h-4 animate-spin text-main" /> : <Plus className="w-4 h-4 text-main" strokeWidth={1.5} />}
          </button>
        )}
      </Link>
      <div className="pt-4 text-start">
        <Link to={productUrl} className="block text-main text-sm md:text-base leading-snug hover:opacity-70 transition-opacity">{name}</Link>
        <div className="mt-1 text-sm flex gap-2 items-baseline">
          {salePrice !== null ? (
            <>
              <span className="text-secondary">{formatPrice(salePrice, language)}</span>
              <span className="text-subtle line-through text-xs">{formatPrice(product.price, language)}</span>
            </>
          ) : typeof product.price === "number" ? (
            <span className="text-subtle">{formatPrice(product.price, language)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}