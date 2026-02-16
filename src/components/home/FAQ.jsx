import React, { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ({ siteSettings }) {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const title = language === 'he' ? 
    (siteSettings?.faq_title ?? "שאלות ותשובות") :
    (siteSettings?.faq_title_en ?? "Frequently Asked Questions");
    
  const subtitle = language === 'he' ? 
    (siteSettings?.faq_subtitle ?? "תשובות לשאלות הנפוצות ביותר") :
    (siteSettings?.faq_subtitle_en ?? "Answers to the most common questions");

  // יצירת מערך השאלות מהגדרות האתר
  const faqItems = [];
  for (let i = 1; i <= 10; i++) {
    const question = language === 'he' ? 
      siteSettings?.[`faq_question_${i}`] : 
      siteSettings?.[`faq_question_${i}_en`];
    const answer = language === 'he' ? 
      siteSettings?.[`faq_answer_${i}`] : 
      siteSettings?.[`faq_answer_${i}_en`];
    
    if (question && answer) {
      faqItems.push({ question, answer });
    }
  }

  if (faqItems.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-accent/5 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-main pr-4">
                  {item.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-primary" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2">
                      <div className="text-subtle leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}