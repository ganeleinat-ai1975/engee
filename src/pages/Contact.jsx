
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { SiteSettings } from '@/entities/SiteSettings';
import { SendEmail } from '@/integrations/Core';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/components/LanguageProvider';
import { toast } from 'sonner';
import PrivacyPolicy from '@/components/PrivacyPolicy';

export default function Contact() {
  const { language } = useLanguage();
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(language === 'he' ? 'אנא מלאי את כל השדות הנדרשים' : 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const adminEmail = 'noamatga@gmail.com'; // This should ideally come from siteSettings or environment variables
      const siteName = language === 'he' ? 
        (siteSettings?.site_name || "אנג'י תכשיטים") : 
        (siteSettings?.site_name_en || "Engee Jewelry");

      console.log('Sending email to admin:', adminEmail);

      // שליחת מייל לאדמין
      const adminSubject = language === 'he' ? 
        `פנייה חדשה מהאתר - ${formData.name}` : 
        `New Contact Form Submission - ${formData.name}`;

      const adminBody = language === 'he' ? 
        `נתקבלה פנייה חדשה מהאתר ${siteName}:

שם: ${formData.name}
אימייל: ${formData.email}
טלפון: ${formData.phone || 'לא צוין'}

הודעה:
${formData.message}

---
פנייה זו נשלחה מטופס יצירת הקשר באתר.` :
        `New contact form submission received from ${siteName}:

Name: ${formData.name}
Email: ${formData.email}  
Phone: ${formData.phone || 'Not provided'}

Message:
${formData.message}

---
This message was sent from the website contact form.`;

      const adminEmailResult = await SendEmail({
        to: adminEmail,
        subject: adminSubject,
        body: adminBody,
        from_name: siteName
      });

      console.log('Admin email result:', adminEmailResult);

      // שליחת מייל אישור ללקוחה
      const customerSubject = language === 'he' ? 
        `תודה על פנייתך - ${siteName}` : 
        `Thank you for contacting us - ${siteName}`;

      const customerBody = language === 'he' ? 
        `שלום ${formData.name},

תודה רבה על פנייתך אלינו!

קיבלנו את הודעתך:
"${formData.message}"

אנו נשמח לחזור אליך בהקדם האפשרי.

בברכה,
צוות ${siteName}

---
זהו מייל אוטומטי, אנא אל תשיבי עליו.` :
        `Hello ${formData.name},

Thank you very much for contacting us!

We have received your message:
"${formData.message}"

We will be happy to get back to you as soon as possible.

Best regards,
${siteName} Team

---
This is an automated email, please do not reply to it.`;

      console.log('Sending confirmation email to customer:', formData.email);

      const customerEmailResult = await SendEmail({
        to: formData.email,
        subject: customerSubject,
        body: customerBody,
        from_name: siteName
      });

      console.log('Customer email result:', customerEmailResult);

      // הצגת הודעת הצלחה
      toast.success(language === 'he' ? 'הפנייה נשלחה בהצלחה! ניצור קשר בהקדם.' : 'Your message has been sent successfully! We will contact you soon.');
      
      // איפוס הטופס
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });

    } catch (error) {
      console.error('Error sending contact form:', error);
      toast.error(language === 'he' ? 'אירעה שגיאה בשליחת הפנייה. אנא נסי שנית.' : 'An error occurred while sending your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = language === 'he' ? 
    (siteSettings?.contact_page_title ?? "צרו איתנו קשר") :
    (siteSettings?.contact_page_title_en ?? "Contact Us");

  const pageSubtitle = language === 'he' ?
    (siteSettings?.contact_page_subtitle ?? "נשמח לעמוד לשירותכם בכל שאלה, בקשה או ייעוץ.") :
    (siteSettings?.contact_page_subtitle_en ?? "We'd love to hear from you. Please reach out with any questions or requests.");

  const formTitle = language === 'he' ?
    (siteSettings?.contact_form_title ?? "שלחו לנו הודעה") :
    (siteSettings?.contact_form_title_en ?? "Send us a Message");
    
  const detailsTitle = language === 'he' ?
    (siteSettings?.contact_details_title ?? "פרטי התקשרות") :
    (siteSettings?.contact_details_title_en ?? "Contact Details");

  const address = language === 'he' ?
    (siteSettings?.contact_address ?? "רחוב היהלומים 12, תל אביב") :
    (siteSettings?.contact_address_en ?? "12 Diamond St, Tel Aviv");
    
  const hoursTitle = language === 'he' ?
    (siteSettings?.contact_hours_title ?? "שעות פתיחה") :
    (siteSettings?.contact_hours_title_en ?? "Opening Hours");

  const hours1 = language === 'he' ?
    (siteSettings?.contact_hours_text_1 ?? "ימים א'-ה': 10:00 - 19:00") :
    (siteSettings?.contact_hours_text_1_en ?? "Sun-Thu: 10:00 AM - 7:00 PM");

  const hours2 = language === 'he' ?
    (siteSettings?.contact_hours_text_2 ?? "יום ו': 10:00 - 14:00") :
    (siteSettings?.contact_hours_text_2_en ?? "Fri: 10:00 AM - 2:00 PM");

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
              <h1 className="text-4xl md:text-5xl font-bold text-main mb-4">{pageTitle}</h1>
              <p className="text-xl text-subtle max-w-3xl mx-auto">
                {pageSubtitle}
              </p>
            </>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-2xl shadow-2xl">
          <div>
            <h2 className="text-2xl font-bold text-main mb-6">{formTitle}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-subtle mb-1">{language === 'he' ? 'שם מלא *' : 'Full Name *'}</label>
                <Input 
                  type="text" 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="border-accent focus:border-primary" 
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-subtle mb-1">{language === 'he' ? 'אימייל *' : 'Email *'}</label>
                <Input 
                  type="email" 
                  id="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-accent focus:border-primary" 
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-subtle mb-1">{language === 'he' ? 'טלפון' : 'Phone'}</label>
                <Input 
                  type="tel" 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="border-accent focus:border-primary" 
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-subtle mb-1">{language === 'he' ? 'הודעה *' : 'Message *'}</label>
                <Textarea 
                  id="message" 
                  rows={4} 
                  required 
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="border-accent focus:border-primary" 
                />
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="w-full btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 
                  (language === 'he' ? 'שולח...' : 'Sending...') : 
                  (language === 'he' ? 'שליחה' : 'Send')
                }
                {!isSubmitting && <ArrowLeft className="w-5 h-5 mr-2" />}
              </Button>
            </form>
          </div>

          <div className="space-y-8">
             <h2 className="text-2xl font-bold text-main mb-6">{detailsTitle}</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-main">{language === 'he' ? 'כתובת' : 'Address'}</h3>
                <p className="text-subtle">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-main">{language === 'he' ? 'טלפון' : 'Phone'}</h3>
                <p className="text-subtle">{siteSettings?.contact_phone ?? "03-123-4567"}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-main">{language === 'he' ? 'אימייל' : 'Email'}</h3>
                <p className="text-subtle">{siteSettings?.contact_email ?? "info@engeejewelry.com"}</p>
              </div>
            </div>
            <div className="pt-4">
                <h3 className="text-lg font-semibold text-main mb-2">{hoursTitle}</h3>
                <p className="text-subtle">{hours1}</p>
                <p className="text-subtle">{hours2}</p>
            </div>
          </div>
        </div>

        <PrivacyPolicy siteEmail={siteSettings?.contact_email} />

      </div>
    </div>
  );
}
