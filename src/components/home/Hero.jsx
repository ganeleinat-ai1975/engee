import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";
import { motion } from "framer-motion";

const isVideo = (url) => /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url || "");

export default function Hero({ siteSettings }) {
  const { language } = useLanguage();
  const [index, setIndex] = useState(0);
  const media = [1, 2, 3, 4, 5].map((n) => siteSettings?.[n === 1 ? "hero_image_url" : `hero_image_url_${n}`]).filter(Boolean);

  useEffect(() => {
    if (media.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % media.length), 6000);
    return () => clearInterval(id);
  }, [media.length]);

  const he = language === "he";
  const title = (he ? siteSettings?.hero_title : siteSettings?.hero_title_en) || (he ? "תכשיטים שנולדו להיענד כל יום" : "Jewelry made to be worn every day");
  const subtitle = he ? siteSettings?.hero_subtitle : siteSettings?.hero_subtitle_en;

  return (
    <section className="relative h-[82vh] md:h-[92vh] min-h-[520px] overflow-hidden bg-surface">
      {media.map((src, i) => {
        const cls = `absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`;
        return isVideo(src) ? (
          <video key={src} src={src} className={cls} autoPlay muted loop playsInline preload={i === 0 ? "auto" : "metadata"} />
        ) : (
          <img key={src} src={src} alt="" className={cls} loading={i === 0 ? "eager" : "lazy"} />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-14 md:pb-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }} className="max-w-2xl">
          <p className="eyebrow text-white mb-5">{he ? "קולקציה חדשה" : "New collection"}</p>
          <h1 className="custom-font font-editorial text-white text-4xl md:text-7xl leading-[1.05] mb-6">{title}</h1>
          {subtitle && <p className="text-white/90 text-base md:text-lg mb-8 max-w-md">{subtitle}</p>}
          <Link to="/Products" className="btn-editorial-light">{he ? "לקולקציה" : "Shop the collection"}</Link>
        </motion.div>
      </div>

      {media.length > 1 && (
        <div className="absolute bottom-6 end-6 md:end-12 z-10 flex gap-2">
          {media.map((_, i) => (
            <button key={i} aria-label={`${i + 1}`} onClick={() => setIndex(i)} className="py-2">
              <span className={`block h-px transition-all duration-500 ${i === index ? "w-10 bg-white" : "w-5 bg-white/50"}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}