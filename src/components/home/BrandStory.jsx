import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";
import { motion } from "framer-motion";

export default function BrandStory({ siteSettings }) {
  const { language } = useLanguage();
  const he = language === "he";
  const title = (he ? siteSettings?.about_section_title : siteSettings?.about_section_title_en) || (he ? "קצת על ENGEE" : "About ENGEE");
  const text = (he ? siteSettings?.about_text : siteSettings?.about_text_en) || "";
  const excerpt = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).slice(0, 2);

  return (
    <section className="py-16 md:py-28">
      <div className="max-w-screen-2xl mx-auto px-5 md:px-12 grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        {siteSettings?.about_image_url && (
          <div className="md:col-span-6 overflow-hidden">
            <img src={siteSettings.about_image_url} alt={title} loading="lazy" className="w-full aspect-[4/5] object-cover" />
          </div>
        )}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }}
          className="md:col-span-5 md:col-start-8">
          <p className="eyebrow text-subtle mb-4">{he ? "הסיפור שלנו" : "Our story"}</p>
          <h2 className="custom-font font-editorial text-main text-3xl md:text-5xl leading-tight mb-8">{title}</h2>
          <div className="space-y-5 text-main/90 leading-relaxed text-base md:text-lg whitespace-pre-line">
            {excerpt.map((p, i) => <p key={i} className="text-main">{p}</p>)}
          </div>
          <div className="flex flex-wrap gap-6 mt-10">
            <Link to="/About" className="btn-editorial">{he ? "לסיפור המלא" : "Read our story"}</Link>
            {siteSettings?.workshop_enabled !== false && (
              <Link to="/Workshop" className="eyebrow text-main link-underline self-center">
                {(he ? siteSettings?.home_workshop_button_text : siteSettings?.home_workshop_button_text_en) || (he ? "לסדנאות" : "Workshops")}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}