import React from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/home/SectionHeading";

export default function FeaturedProducts({ products, isLoading, siteSettings, wishlist, onToggleWishlist, isTogglingWishlist, activeSale, eyebrow, title, count = 8 }) {
  const { language } = useLanguage();
  const he = language === "he";
  const heading = title ?? ((he ? siteSettings?.home_featured_title : siteSettings?.home_featured_title_en) || (he ? "הנבחרים" : "Featured"));
  const linkText = (he ? siteSettings?.home_featured_button_text : siteSettings?.home_featured_button_text_en) || (he ? "לכל התכשיטים" : "View all");

  return (
    <section className="py-16 md:py-28">
      <div className="max-w-screen-2xl mx-auto px-5 md:px-12">
        <SectionHeading eyebrow={eyebrow ?? (he ? "נבחרו במיוחד" : "Curated")} title={heading} linkText={linkText} linkTo="/Products" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-8 md:gap-y-16">
          {isLoading
            ? Array.from({ length: count }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/5] w-full mb-4 rounded-none" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))
            : products.slice(0, count).map((product) => (
                <ProductCard key={product.id} product={product} wishlist={wishlist} onToggleWishlist={onToggleWishlist} isTogglingWishlist={isTogglingWishlist} activeSale={activeSale} />
              ))}
        </div>
      </div>
    </section>
  );
}