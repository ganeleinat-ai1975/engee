import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2 } from "lucide-react";
import { Product } from "@/entities/Product";
import { useLanguage, t } from "@/components/LanguageProvider";

const CATEGORIES = ["rings", "necklaces", "earrings", "bracelets"];
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function SearchOverlay({ open, onClose }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const he = language === "he";

  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    const id = setTimeout(async () => {
      const rx = { $regex: escape(q), $options: "i" };
      const items = await Product.filter({ $or: [{ name: rx }, { name_en: rx }] }, "-created_date", 8);
      setResults(items);
      setLoading(false);
    }, 300);
    return () => clearTimeout(id);
  }, [term]);

  const go = (path) => { onClose(); setTerm(""); navigate(path); };
  const cats = CATEGORIES.filter((c) => !term.trim() || t(c, language).toLowerCase().includes(term.trim().toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] bg-background overflow-y-auto">
          <div className="max-w-screen-xl mx-auto px-5 md:px-12 pt-6 md:pt-10 pb-16">
            <div className="flex justify-end">
              <button onClick={onClose} aria-label="Close" className="p-2"><X className="w-6 h-6 text-main" strokeWidth={1.25} /></button>
            </div>
            <div className="flex items-center gap-4 border-b hairline pb-4 mt-6">
              <Search className="w-6 h-6 text-subtle" strokeWidth={1.25} />
              <input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder={he ? "מה תרצי למצוא?" : "What are you looking for?"}
                className="custom-font font-editorial flex-1 bg-transparent outline-none text-2xl md:text-4xl text-main placeholder:text-subtle/60" />
              {loading && <Loader2 className="w-5 h-5 animate-spin text-subtle" />}
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              {cats.map((c) => (
                <button key={c} onClick={() => go(`/Products?category=${c}`)} className="eyebrow text-main border hairline px-4 py-2 hover:bg-surface transition-colors">{t(c, language)}</button>
              ))}
            </div>
            {results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                {results.map((p) => (
                  <button key={p.id} onClick={() => go(`/Product?id=${p.id}`)} className="text-start group">
                    <div className="aspect-[4/5] overflow-hidden bg-surface">
                      {p.images?.[0] && <img src={p.images[0]} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                    </div>
                    <p className="mt-3 text-main text-sm">{he ? p.name : p.name_en || p.name}</p>
                    <p className="text-subtle text-sm">₪{p.price?.toLocaleString()}</p>
                  </button>
                ))}
              </div>
            )}
            {!loading && term.trim().length >= 2 && results.length === 0 && (
              <div className="text-center py-20">
                <p className="custom-font font-editorial text-main text-2xl mb-2">{he ? "לא מצאנו תוצאות" : "No results found"}</p>
                <p className="text-subtle text-sm">{he ? "נסי מילה אחרת או עייני בקטגוריות" : "Try another word or browse the categories"}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}