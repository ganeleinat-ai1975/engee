import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/LanguageProvider';

export default function CookieConsentBanner() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    if (localStorage.getItem('cookie_consent') !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Set consent in localStorage and hide the banner
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const text = language === 'he' 
    ? "אתר זה משתמש בעוגיות לצרכים תפעוליים ואנליטיים. אנא אשרו את השימוש להמשך."
    : "This site uses cookies for operational and analytical purposes. Please approve to continue.";

  const buttonText = language === 'he' ? "אישור" : "Accept";
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary text-white p-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-center sm:text-left text-white">{text}</p>
        <Button 
          onClick={handleAccept} 
          className="bg-white text-secondary hover:bg-gray-200 flex-shrink-0"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}