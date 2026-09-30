import React from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Instagram } from "lucide-react";

export default function InstagramGallery({ siteSettings, images }) {
  const { language } = useLanguage();
  const url = siteSettings?.instagram_url;
  const tiles = images.slice(0, 6);
  if (!url || tiles.length === 0) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="text-center mb-10 px-5">
        <p className="eyebrow text-subtle mb-3">@engee_jewelry</p>
        <h2 className="custom-font font-editorial text-main text-3xl md:text-4xl">
          {language === "he" ? "עקבי אחרינו באינסטגרם" : "Follow us on Instagram"}
        </h2>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
        {tiles.map((src, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative aspect-square overflow-hidden">
            <img src={src} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}