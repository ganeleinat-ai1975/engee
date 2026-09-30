
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/entities/Category";

export default function CategoryGrid({ siteSettings }) {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const fetchedCategories = await Category.list("order", 4); // Fetch top 4 ordered categories
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const getOptimizedUrl = useCallback((url, options = {}) => {
    if (!url || !url.includes('supabase.co')) return url;
    const { width, quality = 75, format = 'webp' } = options; // Changed quality from 65 to 75 as per outline
    const urlObj = new URL(url);
    if (width) {
        urlObj.searchParams.set('width', width);
    }
    urlObj.searchParams.set('quality', quality);
    urlObj.searchParams.set('format', format);
    return urlObj.toString();
  }, []);

  const title = language === 'he' ? siteSettings?.home_categories_title : siteSettings?.home_categories_title_en;
  const subtitle = language === 'he' ? siteSettings?.home_categories_subtitle : siteSettings?.home_categories_subtitle_en;

  if (isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-1/3 mx-auto mb-4" />
          <Skeleton className="h-5 w-1/2 mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="aspect-square w-full mb-3" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-main mb-4">{title}</h2>
        <p className="text-subtle mb-8 max-w-2xl mx-auto">{subtitle}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => {
            const categoryName = language === 'he' ? category.name : (category.name_en || category.name);
            const imageUrl = category.image_url;
            return (
              <div key={category.slug} className="text-center">
                <Link
                  to={createPageUrl("Products") + `?category=${category.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden border border-accent/30 mb-3">
                    {imageUrl ? (
                      <img
                        src={getOptimizedUrl(imageUrl, { width: 300 })} // Changed width from 400 to 300
                        srcSet={`${getOptimizedUrl(imageUrl, { width: 200 })} 200w, ${getOptimizedUrl(imageUrl, { width: 300 })} 300w, ${getOptimizedUrl(imageUrl, { width: 400 })} 400w`} // Updated srcSet
                        sizes="(max-width: 768px) 50vw, 25vw"
                        alt={categoryName}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-accent flex items-center justify-center">
                        <span className="text-main text-lg font-medium">{categoryName}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                      <h3 className="text-white text-xl font-bold">{categoryName}</h3>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-main group-hover:text-primary transition-colors duration-300">
                    {categoryName}
                  </h3>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
