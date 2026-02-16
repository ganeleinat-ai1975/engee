
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero({ siteSettings, isLoading }) {
  const { language } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getOptimizedUrl = (url, options = {}) => {
    if (!url || !url.includes('supabase.co')) return url;
    const { width, quality = 75, format = 'webp' } = options; // איכות 75 במקום 65
    const urlObj = new URL(url);
    if (width) {
        urlObj.searchParams.set('width', width);
    }
    urlObj.searchParams.set('quality', quality);
    urlObj.searchParams.set('format', format);
    return urlObj.toString();
  };

  const heroImages = [
    siteSettings?.hero_image_url,
    siteSettings?.hero_image_url_2,
    siteSettings?.hero_image_url_3
  ].filter(Boolean); // Filter out any null/undefined values if siteSettings don't provide a URL

  // Auto-change images every 4 seconds
  useEffect(() => {
    if (heroImages.length <= 1) return; // Only auto-change if more than one image
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  
  const heroTitle = language === 'he' ? 
    (siteSettings?.hero_title ?? 'תכשיטי כסף בעבודת יד') : 
    (siteSettings?.hero_title_en ?? 'Handmade silver jewelry');
  
  const heroSubtitle = language === 'he' ? 
    (siteSettings?.hero_subtitle ?? 'גלו את הקולקציה המיוחדת שלנו') : 
    (siteSettings?.hero_subtitle_en ?? 'Discover our unique collection');

  const ArrowIcon = language === 'he' ? ArrowLeft : ArrowRight;

  // Dynamic font size based on settings
  const titleFontSize = siteSettings?.title_font_size ?? 'default';
  const getTitleSizeClasses = () => {
    switch(titleFontSize) {
      case 'small': return 'text-2xl md:text-4xl lg:text-5xl';
      case 'large': return 'text-5xl md:text-7xl lg:text-8xl';
      default: return 'text-3xl md:text-5xl lg:text-6xl';
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <>
      {/* Hero Section with Carousel */}
      <section className="relative h-screen flex items-center justify-center" style={{ backgroundColor: siteSettings?.background_color || '#FDF6E3' }}>
        {/* Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.length > 0 ? (
            heroImages.map((image, index) => (
              <motion.img
                key={index}
                src={getOptimizedUrl(image, { width: 1200 })}
                srcSet={`${getOptimizedUrl(image, { width: 640 })} 640w,
                         ${getOptimizedUrl(image, { width: 1200 })} 1200w,
                         ${getOptimizedUrl(image, { width: 1920 })} 1920w`}
                sizes="100vw"
                alt="Luxury Jewelry"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                loading={index === 0 ? "eager" : "lazy"}
                fetchpriority={index === 0 ? "high" : "auto"}
              />
            ))
          ) : (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backgroundColor: siteSettings?.background_color || '#FDF6E3',
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"></div>
        </div>

        {/* Navigation Arrows - only show when more than one image */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-30 hover:opacity-60"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 opacity-30 hover:opacity-60"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <h1 className={`${getTitleSizeClasses()} font-bold text-white mb-6 leading-tight`}>
              {heroTitle}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Buttons Section - Below the Image */}
      <section className="py-8 bg-gradient-to-b from-black/5 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="btn-primary font-semibold px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg"
                asChild
              >
                <Link to={createPageUrl("Products")}>
                  {language === 'he' ? 'צפו בקולקציה' : 'View Collection'}
                  <ArrowIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-black bg-transparent hover:bg-primary hover:text-white font-semibold px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg"
                asChild
              >
                <Link to={createPageUrl("About")}>
                  {language === 'he' ? 'הסיפור שלנו' : 'Our Story'}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
