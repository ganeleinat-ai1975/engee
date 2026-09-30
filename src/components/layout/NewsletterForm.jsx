import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useLanguage } from "@/components/LanguageProvider";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export default function NewsletterForm() {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const he = language === "he";
  const Arrow = he ? ArrowLeft : ArrowRight;

  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await base44.entities.NewsletterSubscriber.create({ email, language });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return <p className="text-white text-sm">{he ? "תודה שהצטרפת! נתראה בתיבת המייל." : "Thank you for joining — see you in your inbox."}</p>;
  }

  return (
    <form onSubmit={submit} className="flex items-center border-b border-white/40 focus-within:border-white transition-colors">
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={he ? "כתובת אימייל" : "Email address"}
        aria-label={he ? "כתובת אימייל" : "Email address"}
        className="flex-1 bg-transparent py-3 text-sm text-white placeholder:text-white/60 outline-none" />
      <button type="submit" disabled={status === "loading"} aria-label={he ? "הרשמה" : "Subscribe"} className="p-2">
        {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Arrow className="w-4 h-4 text-white" strokeWidth={1.25} />}
      </button>
      {status === "error" && <span className="text-white text-xs ms-2">{he ? "שגיאה, נסי שוב" : "Error, try again"}</span>}
    </form>
  );
}