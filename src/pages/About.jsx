
import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { SiteSettings } from '@/entities/SiteSettings';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to convert line breaks to JSX
const formatTextWithLineBreaks = (text) => {
  if (!text) return '';
  return text.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <br />}
    </React.Fragment>
  ));
};

export default function About() {
  const { language } = useLanguage();
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getOptimizedUrl = useCallback((url, options = {}) => {
    if (!url || !url.includes('supabase.co')) return url;
    const { width, quality = 75, format = 'webp' } = options; // איכות 75
    const urlObj = new URL(url);
    if (width) {
        urlObj.searchParams.set('width', width);
    }
    urlObj.searchParams.set('quality', quality);
    urlObj.searchParams.set('format', format);
    return urlObj.toString();
  }, []); // Empty dependency array as it doesn't depend on component props or state
  
  const loadSiteSettings = useCallback(async () => {
    try {
      const settings = await SiteSettings.list();
      if (settings.length > 0) {
        setSiteSettings(settings[0]);
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    }
    setIsLoading(false);
  }, []); // Empty dependency array as it only depends on stable setters and SiteSettings.list

  useEffect(() => {
    loadSiteSettings();
  }, [loadSiteSettings]); // Now loadSiteSettings is memoized, preventing infinite loops

  const aboutTitle = language === 'he' ? 
    (siteSettings?.about_title ?? "אודותינו") : 
    (siteSettings?.about_title_en ?? "About Us");
    
  const aboutSubtitle = language === 'he' ? 
    (siteSettings?.about_subtitle ?? "") : 
    (siteSettings?.about_subtitle_en ?? "");
    
  const aboutSectionTitle = language === 'he' ? 
    (siteSettings?.about_section_title ?? "") : 
    (siteSettings?.about_section_title_en ?? "");
    
  const aboutText = language === 'he' ? 
    (siteSettings?.about_text ?? "") : 
    (siteSettings?.about_text_en ?? "");
    
  const aboutAdditionalText = language === 'he' ? 
    (siteSettings?.about_additional_text ?? "") : 
    (siteSettings?.about_additional_text_en ?? "");

  // Get the about image URL, default to the jewelry making image
  const aboutImageUrl = siteSettings?.about_image_url || 
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-background min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16 min-h-[100px]">
          {isLoading || !siteSettings ? (
            <div className="space-y-4">
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-7 w-3/4 mx-auto" />
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-main mb-4">{aboutTitle}</h1>
              <p className="text-xl text-subtle max-w-3xl mx-auto">
                {formatTextWithLineBreaks(aboutSubtitle)}
              </p>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img 
              src={getOptimizedUrl(aboutImageUrl, { width: 600 })}
              srcSet={`${getOptimizedUrl(aboutImageUrl, { width: 400 })} 400w,
                       ${getOptimizedUrl(aboutImageUrl, { width: 600 })} 600w,
                       ${getOptimizedUrl(aboutImageUrl, { width: 800 })} 800w`}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Jewelry making process"
              loading="lazy"
              className="rounded-2xl shadow-2xl w-full h-auto object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-main">{aboutSectionTitle}</h2>
            <div className="text-subtle leading-relaxed space-y-4">
              <p>{formatTextWithLineBreaks(aboutText)}</p>
              {aboutAdditionalText && (
                <p>{formatTextWithLineBreaks(aboutAdditionalText)}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
