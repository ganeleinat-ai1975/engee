import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function CookieConsentBanner() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('cookie_consent') !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary text-white p-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left text-white">
          {language === 'he' 
            ? <>אתר זה משתמש בעוגיות לצרכים תפעוליים ואנליטיים. לפרטים נוספים ראו את <Link to="/privacy-policy" className="underline font-bold text-white">מדיניות הפרטיות</Link>.</>
            : <>This site uses cookies for operational and analytical purposes. See our <Link to="/privacy-policy" className="underline font-bold text-white">Privacy Policy</Link> for details.</>
          }
        </p>
        <Button 
          onClick={handleAccept} 
          className="bg-white text-secondary hover:bg-gray-200 flex-shrink-0"
        >
          {language === 'he' ? 'אישור' : 'Accept'}
        </Button>
      </div>
    </div>
  );
}