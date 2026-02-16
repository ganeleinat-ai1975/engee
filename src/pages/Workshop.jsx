import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { SiteSettings } from '@/entities/SiteSettings';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function Workshop() {
  const { language } = useLanguage();
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSiteSettings();
  }, []);

  const loadSiteSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await SiteSettings.list();
      if (settings.length > 0) {
        setSiteSettings(settings[0]);
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getOptimizedUrl = (url, options = {}) => {
    if (!url || !url.includes('supabase.co')) return url;
    const { width, quality = 75, format = 'webp' } = options;
    const urlObj = new URL(url);
    if (width) {
        urlObj.searchParams.set('width', width);
    }
    urlObj.searchParams.set('quality', quality);
    urlObj.searchParams.set('format', format);
    return urlObj.toString();
  };

  const workshopTitle = language === 'he' ? 
    (siteSettings?.workshop_title ?? "מזמינה אותך לקבוע סדנת תכשיטים") : 
    (siteSettings?.workshop_title_en ?? "Join Our Jewelry Workshop");
    
  const workshopSubtitle = language === 'he' ? 
    (siteSettings?.workshop_subtitle ?? "שבמהלכה כל אחת תצא עם תכשיט בעיצוב אישי שלה") : 
    (siteSettings?.workshop_subtitle_en ?? "Create your own unique piece of jewelry");
    
  const workshopDescription = language === 'he' ? 
    (siteSettings?.workshop_description ?? "כסף 925 או פליז בצפוי זהב") : 
    (siteSettings?.workshop_description_en ?? "925 Silver or Gold Plated Brass");
    
  const workshopButtonText = language === 'he' ? 
    (siteSettings?.workshop_button_text ?? "למידע נוסף") : 
    (siteSettings?.workshop_button_text_en ?? "Learn More");

  const backgroundImage = siteSettings?.workshop_background_image || 
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  const textColor = siteSettings?.workshop_text_color || '#ffffff';

  const handleContactClick = () => {
    if (siteSettings?.whatsapp_number) {
      window.open(`https://wa.me/${siteSettings.whatsapp_number}`, '_blank');
    } else if (siteSettings?.contact_phone) {
      window.location.href = `tel:${siteSettings.contact_phone}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* תמונת רקע */}
      <div className="absolute inset-0 z-0">
        <img
          src={getOptimizedUrl(backgroundImage, { width: 1200 })}
          srcSet={`${getOptimizedUrl(backgroundImage, { width: 640 })} 640w,
                   ${getOptimizedUrl(backgroundImage, { width: 1200 })} 1200w,
                   ${getOptimizedUrl(backgroundImage, { width: 1920 })} 1920w`}
          sizes="100vw"
          alt="Workshop"
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
      </div>

      {/* תוכן */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto"
      >
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg"
          style={{ color: textColor }}
        >
          {workshopTitle}
        </h1>
        
        <p 
          className="text-xl md:text-2xl mb-4 leading-relaxed drop-shadow-md"
          style={{ color: textColor, opacity: 0.9 }}
        >
          {workshopSubtitle}
        </p>

        <p 
          className="text-lg md:text-xl mb-8 drop-shadow-md"
          style={{ color: textColor, opacity: 0.8 }}
        >
          {workshopDescription}
        </p>

        <Button
          size="lg"
          onClick={handleContactClick}
          className="btn-primary text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-transform duration-300"
        >
          {workshopButtonText}
        </Button>
      </motion.div>
    </div>
  );
}