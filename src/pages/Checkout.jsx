
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CartItem } from "@/entities/CartItem";
import { Product } from "@/entities/Product";
import { Order } from "@/entities/Order";
import { User } from "@/entities/User";
import { SiteSettings } from "@/entities/SiteSettings";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Lock, Truck } from "lucide-react";
import { SendEmail } from "@/integrations/Core";

export default function Checkout() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // New state variables for totals
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'IL'
    },
    notes: ''
  });

  // Card data
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadSiteSettings = async () => {
    try {
      const settings = await SiteSettings.list();
      if (settings.length > 0) {
        setSiteSettings(settings[0]);
      }
    } catch (e) {
      console.error("Error loading site settings:", e);
    }
  };

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      // Pre-fill user data
      setFormData(prev => ({
        ...prev,
        customer_name: currentUser.full_name || ''
      }));
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error(language === 'he' ? 'שגיאה בטעינת פרטי משתמש' : 'Error loading user data');
      User.login(); // This will navigate away.
    }
  };

  const loadCart = async () => {
    try {
      // It is safer to re-fetch user here or ensure it's loaded to filter cart items
      const currentUser = await User.me(); 
      if (!currentUser?.email) {
        toast.error(language === 'he' ? 'שגיאת משתמש, נא להתחבר מחדש.' : 'User error, please log in again.');
        navigate(createPageUrl("Login")); 
        return;
      }

      const items = await CartItem.filter({ user_email: currentUser.email });
      if (items.length === 0) {
        toast.error(language === 'he' ? 'הסל ריק' : 'Cart is empty');
        navigate(createPageUrl("Cart"));
        return;
      }

      const productIds = [...new Set(items.map(item => item.product_id))];
      const productData = await Promise.all(
        productIds.map(id => Product.get(id))
      );
      const productsMap = productData.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});

      // Enrich cart items with product data for easier access
      const enrichedCartItems = items.map(item => ({
        ...item,
        product: productsMap[item.product_id] 
      })).filter(item => item.product); // Filter out items if product data couldn't be loaded

      setCartItems(enrichedCartItems);
    } catch (error) {
      console.error("Error loading cart data:", error);
      toast.error(language === 'he' ? 'שגיאה בטעינת עגלת קניות' : 'Error loading cart data');
    }
  };


  const loadCheckoutData = async () => {
    setIsLoading(true);
    await Promise.all([
      loadCart(),
      loadUser(),
      loadSiteSettings()
    ]);
    setIsLoading(false);
  };

  // Calculate totals whenever cartItems or siteSettings change
  useEffect(() => {
    if (cartItems.length === 0 && !isLoading) {
      // If cart is empty and done loading, implies it was cleared or initially empty
      // `loadCart` already handles navigation if empty on initial load.
      // This `useEffect` primarily recalculates values on subsequent changes.
      return; 
    }

    const newSubtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    setSubtotal(newSubtotal);

    const freeShippingThreshold = siteSettings?.free_shipping_threshold ?? 999999;
    const defaultShippingCost = siteSettings?.shipping_cost ?? 0;

    const calculatedShipping = newSubtotal >= freeShippingThreshold ? 0 : defaultShippingCost;
    setShippingCost(calculatedShipping);
    
    setTotal(newSubtotal + calculatedShipping);
  }, [cartItems, siteSettings, isLoading]);


  // Handle form changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleCardChange = (field, value) => {
    // Format card number
    if (field === 'number') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    }
    
    // Format expiry
    if (field === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (value.length > 5) return;
    }
    
    // Format CVC
    if (field === 'cvc') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) return;
    }

    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = [
      formData.customer_name,
      formData.customer_phone,
      formData.shipping_address.street,
      formData.shipping_address.city,
      cardData.number,
      cardData.expiry,
      cardData.cvc,
      cardData.name
    ];
    
    return required.every(field => field && field.trim().length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(language === 'he' ? 'יש למלא את כל השדות החובה' : 'Please fill all required fields');
      return;
    }

    setIsProcessing(true);

    const orderNumber = `ORD-${Date.now()}`;
    
    try {
      // Prepare order items
      const orderItems = cartItems.map(item => {
        return {
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size || ''
        };
      });

      // Create order
      const orderData = {
        order_number: orderNumber,
        user_email: user?.email, // Ensure user email is available
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        shipping_address: formData.shipping_address,
        items: orderItems,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        total_amount: total,
        status: 'pending', // ממתין לתשלום
        payment_status: 'pending',
        notes: formData.notes,
        language: language
      };

      await Order.create(orderData);

      // --- HTML Email Templates ---

      // Send email to business owner
      const businessEmailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 10px; }
        .item { background-color: #f8f9fa; padding: 10px; margin-bottom: 10px; border-radius: 3px; }
        .total { background-color: #e7f3ff; padding: 15px; border-radius: 5px; font-weight: bold; }
        .notes { background-color: #fff3cd; padding: 10px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>התקבלה הזמנה חדשה מלקוח</h2>
            <p><strong>הזמנה מס׳ ${orderNumber}</strong></p>
        </div>
        
        <div class="section">
            <div class="section-title">פרטי לקוח:</div>
            <p><strong>שם:</strong> ${formData.customer_name}</p>
            <p><strong>טלפון:</strong> ${formData.customer_phone}</p>
            <p><strong>אימייל:</strong> ${user?.email || 'לא זמין'}</p>
        </div>
        
        <div class="section">
            <div class="section-title">כתובת משלוח:</div>
            <p>${formData.customer_name}<br>
            ${formData.shipping_address.street}<br>
            ${formData.shipping_address.city} ${formData.shipping_address.postal_code}<br>
            ${formData.shipping_address.country}</p>
        </div>
        
        <div class="section">
            <div class="section-title">פריטים בהזמנה:</div>
            ${orderItems.map((item, index) => `
                <div class="item">
                    <strong>${index + 1}. ${item.product_name}</strong><br>
                    כמות: ${item.quantity}<br>
                    ${item.size ? `מידה: ${item.size}<br>` : ''}
                    מחיר יחידה: ₪${item.price.toLocaleString()}<br>
                    <strong>סה״כ פריט: ₪${(item.price * item.quantity).toLocaleString()}</strong>
                </div>
            `).join('')}
        </div>
        
        <div class="total">
            <div class="section-title">סיכום תשלום:</div>
            <p>סכום ביניים: ₪${subtotal.toLocaleString()}</p>
            <p>משלוח: ${shippingCost === 0 ? 'חינם' : `₪${shippingCost}`}</p>
            <p><strong>סה״כ לתשלום: ₪${total.toLocaleString()}</strong></p>
        </div>
        
        ${formData.notes ? `
            <div class="section">
                <div class="section-title">הערות הלקוח:</div>
                <div class="notes">${formData.notes}</div>
            </div>
        ` : ''}
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
            תאריך ושעה: ${new Date().toLocaleString('he-IL')}
        </p>
    </div>
</body>
</html>`;

      // Send email to customer
      const customerEmailContent = language === 'he' ? `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; text-align: right; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; text-align: right; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
        .section { margin-bottom: 25px; text-align: right; }
        .section-title { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 10px; text-align: right; }
        .item { background-color: #f8f9fa; padding: 10px; margin-bottom: 8px; border-radius: 3px; text-align: right; }
        .summary { background-color: #e7f3ff; padding: 15px; border-radius: 5px; text-align: right; }
        .address { background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: right; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        p { text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${siteSettings?.logo_url ? `<img src="${siteSettings.logo_url}" alt="ENGEE" class="logo">` : ''}
            <h2>איזה כיף שרכשת ב-ENGEE!</h2>
            <p>ההזמנה שלך ממש תכף יוצאת להכנה! ✨</p>
        </div>
        
        <div class="section">
            <div class="section-title">פרטי הזמנה:</div>
            <p><strong>מספר הזמנה:</strong> ${orderNumber}</p>
            <p><strong>תאריך:</strong> ${new Date().toLocaleDateString('he-IL')}</p>
        </div>
        
        <div class="section">
            <div class="section-title">המוצרים שלך:</div>
            ${orderItems.map((item, index) => `
                <div class="item">
                    <strong>${index + 1}. ${item.product_name}</strong><br>
                    כמות: ${item.quantity}${item.size ? ` | מידה: ${item.size}` : ''}<br>
                    <strong>מחיר: ₪${(item.price * item.quantity).toLocaleString()}</strong>
                </div>
            `).join('')}
        </div>
        
        <div class="summary">
            <div class="section-title">סיכום תשלום:</div>
            <p>סכום ביניים: ₪${subtotal.toLocaleString()}</p>
            <p>משלוח: ${shippingCost === 0 ? 'חינם 🎁' : `₪${shippingCost}`}</p>
            <p><strong>סה״כ: ₪${total.toLocaleString()}</strong></p>
        </div>
        
        <div class="section">
            <div class="section-title">כתובת המשלוח:</div>
            <div class="address">
                ${formData.customer_name}<br>
                ${formData.shipping_address.street}<br>
                ${formData.shipping_address.city} ${formData.shipping_address.postal_code}<br>
                ${formData.shipping_address.country}
            </div>
        </div>
        
        <div class="footer">
            <p><strong>שלך,<br>ENGEE</strong></p>
        </div>
    </div>
</body>
</html>` : `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; direction: ltr; text-align: left; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; height: auto; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 10px; }
        .item { background-color: #f8f9fa; padding: 10px; margin-bottom: 8px; border-radius: 3px; }
        .summary { background-color: #e7f3ff; padding: 15px; border-radius: 5px; }
        .address { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${siteSettings?.logo_url ? `<img src="${siteSettings.logo_url}" alt="ENGEE" class="logo">` : ''}
            <h2>How exciting that you purchased from ENGEE!</h2>
            <p>Your order is about to go into preparation! ✨</p>
        </div>
        
        <div class="section">
            <div class="section-title">Order Details:</div>
            <p><strong>Order Number:</strong> ${orderNumber}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US')}</p>
        </div>
        
        <div class="section">
            <div class="section-title">Your Products:</div>
            ${orderItems.map((item, index) => `
                <div class="item">
                    <strong>${index + 1}. ${item.product_name}</strong><br>
                    Quantity: ${item.quantity}${item.size ? ` | Size: ${item.size}` : ''}<br>
                    <strong>Price: ₪${(item.price * item.quantity).toLocaleString()}</strong>
                </div>
            `).join('')}
        </div>
        
        <div class="summary">
            <div class="section-title">Payment Summary:</div>
            <p>Subtotal: ₪${subtotal.toLocaleString()}</p>
            <p>Shipping: ${shippingCost === 0 ? 'Free 🎁' : `₪${shippingCost}`}</p>
            <p><strong>Total: ₪${total.toLocaleString()}</strong></p>
        </div>
        
        <div class="section">
            <div class="section-title">Shipping Address:</div>
            <div class="address">
                ${formData.customer_name}<br>
                ${formData.shipping_address.street}<br>
                ${formData.shipping_address.city} ${formData.shipping_address.postal_code}<br>
                ${formData.shipping_address.country}
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Yours,<br>ENGEE</strong></p>
        </div>
    </div>
</body>
</html>`;

      // Send emails
      try {
        console.log('Attempting to send emails...');
        const ownerEmail = siteSettings?.order_notification_email; 
        console.log('Business email (from settings):', ownerEmail || "Not configured");
        console.log('Customer email:', user?.email || "Not available");
        
        // Email to business - with high priority
        if (ownerEmail) {
          await SendEmail({
            to: ownerEmail,
            subject: `הזמנה חדשה #${orderNumber} - ${formData.customer_name}`,
            body: businessEmailContent
          });
          console.log('Business email sent successfully');
        } else {
          console.warn("Order notification email is not configured in site settings. Business email not sent.");
        }

        // Email to customer
        if (user?.email) { 
            await SendEmail({
              to: user.email,
              subject: language === 'he' ? 
                `אישור הזמנה #${orderNumber} - ENGEE` :
                `Order confirmation #${orderNumber} - ENGEE`,
              body: customerEmailContent
            });
            console.log('Customer email sent successfully');
        } else {
            console.warn("Customer email not available. Customer order confirmation email not sent.");
        }
        
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        // Show error to user but don't fail the order
        toast.error(language === 'he' ? 
          'ההזמנה נשמרה אך לא נשלח מייל. ניצור קשר בהקדם.' : 
          'Order saved but email failed. We will contact you soon.'
        );
      }

      // Clear cart
      await Promise.all(cartItems.map(item => CartItem.delete(item.id)));

      // Update cart count
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      toast.success(language === 'he' ? 'ההזמנה התקבלה בהצלחה!' : 'Order received successfully!');
      
      // Redirect to success page
      window.location.href = createPageUrl('OrderSuccess') + `?orderNumber=${orderNumber}`;

    } catch (error) {
      console.error("Error processing order:", error);
      toast.error(language === 'he' ? 'שגיאה בעיבוד ההזמנה' : 'Error processing order');
    }

    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Cart"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'he' ? 'חזרה לסל' : 'Back to Cart'}
          </Button>
          <h1 className="text-3xl font-bold text-main">
            {language === 'he' ? 'השלמת ההזמנה' : 'Checkout'}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {language === 'he' ? 'פרטים אישיים' : 'Personal Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{language === 'he' ? 'שם מלא *' : 'Full Name *'}</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>{language === 'he' ? 'טלפון *' : 'Phone *'}</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {language === 'he' ? 'כתובת משלוח' : 'Shipping Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{language === 'he' ? 'רחוב וכתובת *' : 'Street Address *'}</Label>
                  <Input
                    value={formData.shipping_address.street}
                    onChange={(e) => handleInputChange('shipping_address.street', e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'he' ? 'עיר *' : 'City *'}</Label>
                    <Input
                      value={formData.shipping_address.city}
                      onChange={(e) => handleInputChange('shipping_address.city', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>{language === 'he' ? 'מיקוד' : 'Postal Code'}</Label>
                    <Input
                      value={formData.shipping_address.postal_code}
                      onChange={(e) => handleInputChange('shipping_address.postal_code', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>{language === 'he' ? 'מדינה' : 'Country'}</Label>
                  <Select
                    value={formData.shipping_address.country}
                    onValueChange={(value) => handleInputChange('shipping_address.country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IL">{language === 'he' ? 'ישראל' : 'Israel'}</SelectItem>
                      <SelectItem value="US">{language === 'he' ? 'ארצות הברית' : 'United States'}</SelectItem>
                      <SelectItem value="GB">{language === 'he' ? 'בריטניה' : 'United Kingdom'}</SelectItem>
                      <SelectItem value="DE">{language === 'he' ? 'גרמניה' : 'Germany'}</SelectItem>
                      <SelectItem value="FR">{language === 'he' ? 'צרפת' : 'France'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{language === 'he' ? 'הערות להזמנה' : 'Order Notes'}</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={language === 'he' ? 'הערות נוספות לספק...' : 'Additional notes...'}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {language === 'he' ? 'פרטי תשלום' : 'Payment Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{language === 'he' ? 'מספר כרטיס *' : 'Card Number *'}</Label>
                  <Input
                    value={cardData.number}
                    onChange={(e) => handleCardChange('number', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'he' ? 'תוקף *' : 'Expiry *'}</Label>
                    <Input
                      value={cardData.expiry}
                      onChange={(e) => handleCardChange('expiry', e.target.value)}
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <Label>{language === 'he' ? 'קוד אבטחה *' : 'CVC *'}</Label>
                    <Input
                      value={cardData.cvc}
                      onChange={(e) => handleCardChange('cvc', e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>{language === 'he' ? 'שם על הכרטיס *' : 'Name on Card *'}</Label>
                  <Input
                    value={cardData.name}
                    onChange={(e) => handleCardChange('name', e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>{language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => {
                  const product = item.product; // CartItem is now enriched with product
                  if (!product) return null; // Should not happen with filtering in loadCart
                  return (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {item.size && (
                            <p className="text-sm text-subtle">
                              {language === 'he' ? 'מידה:' : 'Size:'} {item.size}
                            </p>
                          )}
                          <p className="text-sm text-subtle">
                            {language === 'he' ? 'כמות:' : 'Qty:'} {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">₪{(product.price * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{language === 'he' ? 'סכום ביניים:' : 'Subtotal:'}</span>
                    <span>₪{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'he' ? 'משלוח:' : 'Shipping:'}</span>
                    <span>
                      {shippingCost === 0 ? 
                        (language === 'he' ? 'חינם' : 'Free') : 
                        `₪${shippingCost}`
                      }
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{language === 'he' ? 'סה"כ:' : 'Total:'}</span>
                    <span>₪{total.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full btn-primary text-lg py-6"
                  size="lg"
                >
                  {isProcessing ? 
                    (language === 'he' ? 'מעבד...' : 'Processing...') : 
                    (language === 'he' ? `שלם ₪${total.toLocaleString()}` : `Pay ₪${total.toLocaleString()}`)
                  }
                </Button>
                
                <p className="text-xs text-center text-subtle">
                  {language === 'he' ? 
                    'התשלום מאובטח ומוצפן ע"י Stripe' : 
                    'Payment secured and encrypted by Stripe'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
