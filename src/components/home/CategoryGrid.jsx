import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Category } from "@/entities/Category";
import { useLanguage } from "@/components/LanguageProvider";
import SectionHeading from "@/components/home/SectionHeading";

export default function CategoryGrid({ siteSettings }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const he = language === "he";

  useEffect(() => {
    Category.filter({ is_active: true }, "order", 6).then(setCategories);
  }, []);

  if (categories.length === 0) return null;

  const title = (he ? siteSettings?.home_categories_title : siteSettings?.home_categories_title_en) || (he ? "קטגוריות" : "Shop by category");
  const eyebrow = (he ? siteSettings?.home_categories_subtitle : siteSettings?.home_categories_subtitle_en) || (he ? "לפי קטגוריה" : "Explore");

  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="max-w-screen-2xl mx-auto px-5 md:px-12">
        <SectionHeading eyebrow={eyebrow} title={title} center />
        <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-6 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 md:mx-0 md:px-0 pb-2">
          {categories.map((cat, i) => (
            <button key={cat.id} onClick={() => navigate(`/Products?category=${cat.slug}`)}
              className={`group relative shrink-0 w-[70vw] md:w-auto snap-start overflow-hidden aspect-[3/4] text-start ${i === 0 && categories.length > 4 ? "md:col-span-2 md:aspect-auto" : ""}`}>
              {cat.image_url && <img src={cat.image_url} alt={he ? cat.name : cat.name_en || cat.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-5 md:p-7">
                <h3 className="custom-font font-editorial text-white text-2xl md:text-3xl">{he ? cat.name : cat.name_en || cat.name}</h3>
                <span className="eyebrow text-white/90 mt-2 inline-block">{he ? "לצפייה" : "Discover"}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}