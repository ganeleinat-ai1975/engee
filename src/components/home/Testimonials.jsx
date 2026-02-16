
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { Testimonial } from "@/entities/Testimonial";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials({ siteSettings }) {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTestimonials();
  }, [language]); // Add language to dependency array to re-load on language change

  const loadTestimonials = async () => {
    try {
      let activeTestimonials;
      if (language === 'he') {
        // בעברית - הצג את כל ההמלצות הפעילות
        activeTestimonials = await Testimonial.filter({ is_active: true }, "-created_date", 6);
      } else {
        // באנגלית - הצג רק המלצות עם טקסט באנגלית
        const allTestimonials = await Testimonial.filter({ is_active: true }, "-created_date", 12);
        activeTestimonials = allTestimonials.filter(testimonial => testimonial.text_en).slice(0, 6);
      }
      setTestimonials(activeTestimonials);
    } catch (error) {
      console.error("Error loading testimonials:", error);
    }
    setIsLoading(false);
  };

  const title = language === 'he' ? 
    (siteSettings?.home_testimonials_title ?? "מה אומרים הלקוחות שלנו") :
    (siteSettings?.home_testimonials_title_en ?? "What Our Customers Say");
    
  const subtitle = language === 'he' ? 
    (siteSettings?.home_testimonials_subtitle ?? "אלפי לקוחות מרוצים בחרו בנו") :
    (siteSettings?.home_testimonials_subtitle_en ?? "Thousands of satisfied customers chose us");

  const starColor = siteSettings?.testimonial_star_color || '#D4AF37';

  if (isLoading || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-main mb-4">
            {title}
          </h2>
          <p className="text-xl text-subtle max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex mb-4">
                {Array(testimonial.rating).fill(0).map((_, i) => (
                  <Star key={i} className="w-5 h-5" color={starColor} fill={starColor} />
                ))}
              </div>
              <p className="text-subtle italic mb-6 leading-relaxed">
                "{language === 'he' ? testimonial.text : (testimonial.text_en || testimonial.text)}"
              </p>
              <div className="border-t pt-4">
                <h4 className="font-semibold text-main">{language === 'he' ? testimonial.name : (testimonial.name_en || testimonial.name)}</h4>
                {testimonial.location && (
                  <p className="text-sm text-subtle">{language === 'he' ? testimonial.location : (testimonial.location_en || testimonial.location)}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
