import React from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function ValuesStrip({ siteSettings }) {
  const { language } = useLanguage();
  const he = language === "he";
  const items = [1, 2, 3].map((n) => ({
    title: he ? siteSettings?.[`home_feature_${n}_title`] : siteSettings?.[`home_feature_${n}_title_en`],
    desc: he ? siteSettings?.[`home_feature_${n}_desc`] : siteSettings?.[`home_feature_${n}_desc_en`],
  })).filter((i) => i.title);
  if (items.length === 0) return null;

  return (
    <section className="border-y hairline">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-3 md:divide-x md:rtl:divide-x-reverse divide-[color:rgba(101,80,60,0.16)]">
        {items.map((item, i) => (
          <div key={i} className="py-8 px-6 text-center">
            <p className="eyebrow text-main mb-2">{item.title}</p>
            {item.desc && <p className="text-subtle text-sm">{item.desc}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}