
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";

export default function FeaturedProducts({ products, isLoading, siteSettings, wishlist, onToggleWishlist, isTogglingWishlist }) {
  const { language } = useLanguage();

  const title = language === 'he' ?
    (siteSettings?.home_featured_title ?? "המוצרים המומלצים שלנו") :
    (siteSettings?.home_featured_title_en ?? "Our Featured Products");

  const subtitle = language === 'he' ?
    (siteSettings?.home_featured_subtitle ?? "תכשיטים נבחרים מהקולקציה שלנו") :
    (siteSettings?.home_featured_subtitle_en ?? "Selected pieces from our collection");

  const buttonText = language === 'he' ?
    (siteSettings?.home_featured_button_text ?? "צפו בכל המוצרים") :
    (siteSettings?.home_featured_button_text_en ?? "View All Products");

  const workshopButtonText = language === 'he' ?
    (siteSettings?.home_workshop_button_text ?? "לסדנאות שלי") :
    (siteSettings?.home_workshop_button_text_en ?? "To My Workshops");

  const ArrowIcon = language === 'he' ? ArrowLeft : ArrowRight;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">
            {title}
          </h2>
          <p className="text-xl text-subtle max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="aspect-[4/5] w-full max-w-[180px] md:max-w-[220px] mb-4 mx-auto" />
                <Skeleton className="h-4 w-3/4 mb-2 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlist={wishlist}
                onToggleWishlist={onToggleWishlist}
                isTogglingWishlist={isTogglingWishlist}
              />
            ))
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12 space-y-4"
        >
          <Button size="lg" className="btn-primary font-semibold px-6 py-3 sm:px-8 sm:py-4 sm:text-lg" asChild>
            <Link to={createPageUrl("Products")}>
              {buttonText}
              <ArrowIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Link>
          </Button>
          
          <div>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 sm:text-lg transition-all duration-300"
              asChild
            >
              <Link to={createPageUrl("Workshop")}>
                {workshopButtonText}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
