import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { useCart } from "@/components/CartProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CreditCard, Lock, Truck, Shield } from "lucide-react";
import { SiteSettings } from "@/entities/SiteSettings";
import { Coupon } from "@/entities/Coupon";
import { Sale } from "@/entities/Sale";
import { getSalePrice } from "@/lib/saleUtils";
import { processOrder } from "@/functions/processOrder"; // Changed import to processOrder

export default function Payment() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { 
    cartItems, 
    products, 
    user, 
    guestId,
    isLoading: isCartLoading, 
    clearCart,
  } = useCart();
  
  const [siteSettings, setSiteSettings] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [activeSale, setActiveSale] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [total, setTotal] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("delivery");
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    shipping_address: {
      street: '',
      city: '',
      postal_code: '',
      country: 'IL'
    },
    notes: ''
  });

  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0) {
      toast.error(language === 'he' ? 'הסל ריק' : 'Cart is empty');
      navigate(createPageUrl("Cart"));
    }
    if (user) {
      setFormData(prev => ({ 
        ...prev, 
        customer_name: user.full_name || '',
        customer_email: user.email 
      }));
    }
    loadSiteSettings();
    Sale.filter({ is_active: true }).then(sales => {
      if (sales.length > 0) setActiveSale(sales[0]);
    }).catch(() => {});
  }, [user, cartItems, isCartLoading, navigate, language]);

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

  useEffect(() => {
    if (cartItems.length === 0) return;

    const newSubtotal = cartItems.reduce((sum, item) => {
      const product = products[item.product_id];
      if (!product) return sum;
      const basePrice = getSalePrice(product, activeSale) || product.price || 0;
      const goldPlatingPrice = item.gold_plating ? 100 : 0;
      return sum + (basePrice + goldPlatingPrice) * item.quantity;
    }, 0);
    
    setSubtotal(newSubtotal);

    let discount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discount = (newSubtotal * appliedCoupon.value) / 100;
      } else {
        discount = appliedCoupon.value;
      }
      discount = Math.min(discount, newSubtotal);
    }
    setCouponDiscount(discount);
    
    if (shippingMethod === "pickup") {
      setShippingCost(0);
      setTotal(newSubtotal - discount);
    } else {
      const freeShippingThreshold = siteSettings?.free_shipping_threshold ?? 999999;
      const defaultShippingCost = siteSettings?.shipping_cost ?? 0;
      const calculatedShipping = (newSubtotal - discount) >= freeShippingThreshold ? 0 : defaultShippingCost;
      setShippingCost(calculatedShipping);
      setTotal(newSubtotal - discount + calculatedShipping);
    }
  }, [cartItems, products, siteSettings, appliedCoupon, shippingMethod, activeSale]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      // Fetching coupon directly on the client-side
      const coupons = await Coupon.filter({ 
        code: couponCode.trim().toUpperCase(), 
        is_active: true 
      });

      if (coupons.length === 0) {
        const errorMsg = language === 'he' ? 'קוד קופון לא חוקי או לא פעיל' : 'Invalid or inactive coupon code';
        setCouponError(errorMsg);
        toast.error(errorMsg);
        setAppliedCoupon(null);
        return;
      }

      const coupon = coupons[0];
      
      // Date validity check
      const now = new Date();
      
      if (coupon.start_date && new Date(coupon.start_date) > now) {
        const errorMsg = language === 'he' ? 'הקופון עדיין לא תקף' : 'Coupon not yet valid';
        setCouponError(errorMsg);
        toast.error(errorMsg);
        setAppliedCoupon(null);
        return;
      }
      
      if (coupon.end_date && new Date(coupon.end_date) < now) {
        const errorMsg = language === 'he' ? 'הקופון פג תוקף' : 'Coupon has expired';
        setCouponError(errorMsg);
        toast.error(errorMsg);
        setAppliedCoupon(null);
        return;
      }
      
      // Coupon is valid - apply it
      setAppliedCoupon(coupon);
      setCouponCode('');
      toast.success(language === 'he' ? 'קופון הופעל בהצלחה!' : 'Coupon applied successfully!');

    } catch (e) {
      const errorMsg = language === 'he' ? 'שגיאה בהפעלת הקופון' : 'Error applying coupon';
      setCouponError(errorMsg);
      toast.error(errorMsg);
      console.error("Coupon application failed:", e);
    } finally {
      setIsApplyingCoupon(false);
    }
  };
  
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
    toast.info(language === 'he' ? 'הקופון הוסר' : 'Coupon removed');
  };
  
  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    } else if (field.includes('.') && errors[field.split('.')[0]]) {
      setErrors(prev => ({ ...prev, [field.split('.')[0]]: '' }));
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = language === 'he' ? 'שם מלא חייב להכיל לפחות 2 תווים' : 'Full name must be at least 2 characters';
    }
    
    // Email is now always validated, whether it's from user object or user input
    if (!formData.customer_email || !/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = language === 'he' ? 'כתובת אימייל לא תקינה' : 'Invalid email address';
    }

    const cleanedPhone = formData.customer_phone.replace(/[^\d]/g, '');
    if (cleanedPhone.length < 9) {
        newErrors.customer_phone = language === 'he' ? 'מספר טלפון חייב להכיל לפחות 9 ספרות' : 'Phone number must have at least 9 digits';
    }

    if (shippingMethod === "delivery") {
      if (!formData.shipping_address.street || formData.shipping_address.street.trim().length < 3) {
        newErrors.street = language === 'he' ? 'כתובת רחוב חייבת להכיל לפחות 3 תווים' : 'Street address must be at least 3 characters';
      }

      if (!formData.shipping_address.city || formData.shipping_address.city.trim().length < 2) {
        newErrors.city = language === 'he' ? 'שם עיר חייב להכיל לפחות 2 תווים' : 'City must be at least 2 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePhoneChange = (value) => {
    const cleanedValue = value.replace(/[^0-9\s\-\+\(\)]/g, '');
    handleInputChange('customer_phone', cleanedValue);
  };
  
  // Removed generateOrderNumber as processOrder will handle it

  const handlePayment = async () => {
    if (!validateForm()) {
      toast.error(language === 'he' ? 'יש לתקן את השגיאות בטופס' : 'Please fix the errors in the form');
      return;
    }

    setIsProcessing(true);
    toast.info(language === 'he' ? 'יוצר הזמנה ומעביר לתשלום...' : 'Creating order and redirecting to payment...');

    try {
      const orderItems = cartItems.map(item => {
        const product = products[item.product_id];
        if (!product) return null;
        
        const saleItemPrice = getSalePrice(product, activeSale);
        const basePrice = saleItemPrice || product.price || 0;
        const goldPlatingPrice = item.gold_plating ? 100 : 0;
        
        return {
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          price: basePrice + goldPlatingPrice,
          size: item.size || null,
          gold_plating: item.gold_plating || false,
        };
      }).filter(Boolean); // Filter out any nulls if product not found
      
      const orderData = {
        // order_number will be generated by processOrder
        user_id: user ? user.id : null, // Link to user if logged in
        guest_id: user ? null : guestId, // Link to guest ID if not logged in
        user_email: formData.customer_email, // Use validated email from form data
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        shipping_address: shippingMethod === 'delivery' ? formData.shipping_address : null,
        shipping_method: shippingMethod,
        items: orderItems,
        subtotal: subtotal,
        shipping_cost: shippingCost,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        coupon_discount: couponDiscount,
        sale_discount: activeSale ? cartItems.reduce((sum, item) => {
          const product = products[item.product_id];
          if (!product) return sum;
          const sp = getSalePrice(product, activeSale);
          return sp !== null ? sum + (product.price - sp) * item.quantity : sum;
        }, 0) : 0,
        total_amount: total,
        status: 'pending', // Initial status before payment confirmation
        notes: formData.notes,
        language: language,
      };

      // Using the existing and working processOrder function
      const result = await processOrder({ orderData });

      if (result.error || !result.data?.success) {
        throw new Error(result.error || result.data?.error || (language === 'he' ? 'כשל בהכנת התשלום.' : 'Failed to prepare payment.'));
      }
      
      const paymentResponse = result.data;
      
      // Redirect to Cardcom payment page
      if (paymentResponse.paymentUrl) {
        // Cart clearing logic should ideally happen on the backend after payment confirmation
        // or on a success page that confirms the order is paid.
        // For now, we are not clearing the cart here as the outline suggests removing it.
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error(language === 'he' ? 'לא התקבלה כתובת לתשלום מאתר הסליקה.' : 'No payment URL received from payment gateway.');
      }

    } catch (error) {
      console.error("Payment process failed:", error);
      toast.error(error.message || (language === 'he' ? 'אירעה שגיאה בתהליך התשלום' : 'An error occurred during payment'));
      // Ensure processing state is reset on error
      setIsProcessing(false);
    }
  };

  if (isCartLoading || !siteSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-main mb-2">
            {language === 'he' ? 'ביצוע הזמנה' : 'Checkout'}
          </h1>
          <p className="text-subtle text-sm md:text-base">
            {language === 'he' ? 'מלאי את הפרטים ולחצי על "המשך לתשלום"' : 'Fill in your details and click "Proceed to Payment"'}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8">
          <div className="space-y-4 md:space-y-6 order-2 lg:order-1">
            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lock className="w-5 h-5" />
                  {language === 'he' ? 'פרטים אישיים' : 'Personal Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="w-full">
                  <Label className="text-main font-medium text-sm">
                    {language === 'he' ? 'שם מלא *' : 'Full Name *'}
                  </Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => handleInputChange('customer_name', e.target.value)}
                    className={`w-full mt-1 ${errors.customer_name ? 'border-red-500' : ''}`}
                  />
                  {errors.customer_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
                  )}
                </div>
                {/* Email input is shown only for guests or if user wants to change it later.
                    If user is logged in, their email is pre-filled and not editable here for simplicity.
                    The validation now always applies to formData.customer_email. */}
                {!user && ( 
                    <div className="w-full">
                        <Label className="text-main font-medium text-sm">
                            {language === 'he' ? 'כתובת אימייל *' : 'Email Address *'}
                        </Label>
                        <Input
                            type="email"
                            value={formData.customer_email}
                            onChange={(e) => handleInputChange('customer_email', e.target.value)}
                            className={`w-full mt-1 ${errors.customer_email ? 'border-red-500' : ''}`}
                            placeholder={language === 'he' ? 'לכאן תישלח הקבלה' : 'Your receipt will be sent here'}
                        />
                        {errors.customer_email && (
                            <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>
                        )}
                    </div>
                )}
                <div className="w-full">
                  <Label className="text-main font-medium text-sm">
                    {language === 'he' ? 'טלפון *' : 'Phone *'}
                  </Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full mt-1 ${errors.customer_phone ? 'border-red-500' : ''}`}
                    dir="ltr"
                  />
                  {errors.customer_phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="w-5 h-5" />
                  {language === 'he' ? 'כתובת משלוח' : 'Shipping Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="w-full">
                  <Label className="text-main font-medium text-sm">
                    {language === 'he' ? 'רחוב וכתובת *' : 'Street Address *'}
                  </Label>
                  <Input
                    value={formData.shipping_address.street}
                    onChange={(e) => handleInputChange('shipping_address.street', e.target.value)}
                    className={`w-full mt-1 ${errors.street ? 'border-red-500' : ''}`}
                    disabled={shippingMethod === "pickup"}
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="w-full">
                    <Label className="text-main font-medium text-sm">
                      {language === 'he' ? 'עיר *' : 'City *'}
                    </Label>
                    <Input
                      value={formData.shipping_address.city}
                      onChange={(e) => handleInputChange('shipping_address.city', e.target.value)}
                      className={`w-full mt-1 ${errors.city ? 'border-red-500' : ''}`}
                      disabled={shippingMethod === "pickup"}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div className="w-full">
                    <Label className="text-main font-medium text-sm">
                      {language === 'he' ? 'מיקוד' : 'Postal Code'}
                    </Label>
                    <Input
                      value={formData.shipping_address.postal_code}
                      onChange={(e) => handleInputChange('shipping_address.postal_code', e.target.value)}
                      className="w-full mt-1"
                      disabled={shippingMethod === "pickup"}
                    />
                  </div>
                </div>
                <div className="w-full">
                  <Label className="text-main font-medium text-sm">
                    {language === 'he' ? 'מדינה' : 'Country'}
                  </Label>
                  <Select
                    value={formData.shipping_address.country}
                    onValueChange={(value) => handleInputChange('shipping_address.country', value)}
                    disabled={shippingMethod === "pickup"}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IL">{language === 'he' ? 'ישראל' : 'Israel'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full">
                  <Label className="text-main font-medium text-sm">
                    {language === 'he' ? 'הערות להזמנה' : 'Order Notes'}
                  </Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="order-1 lg:order-2">
            <Card className="w-full lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle className="text-lg">{language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => {
                  const product = products[item.product_id];
                  if (!product) return null;
                  
                  const itemSalePrice = getSalePrice(product, activeSale);
                  const basePrice = itemSalePrice || product.price || 0;
                  const goldPlatingPrice = item.gold_plating ? 100 : 0;
                  const itemPrice = basePrice + goldPlatingPrice;
                  
                  return (
                    <div key={item.id} className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {product.images?.[0] && (
                          <img
                            src={`${product.images[0]}?width=100&quality=80`}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          {item.size && (
                            <p className="text-xs text-subtle">
                              {language === 'he' ? 'מידה:' : 'Size:'} {item.size}
                            </p>
                          )}
                          {item.gold_plating && (
                            <p className="text-xs text-amber-600">
                              {language === 'he' ? 'ציפוי זהב' : 'Gold plating'}
                            </p>
                          )}
                          <p className="text-xs text-subtle">
                            {language === 'he' ? 'כמות:' : 'Qty:'} {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-sm flex-shrink-0">₪{(itemPrice * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}
                
                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium text-main text-sm">
                    {language === 'he' ? 'שיטת משלוח:' : 'Shipping Method:'}
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer text-sm">
                      <input
                        type="radio"
                        name="shipping"
                        value="delivery"
                        checked={shippingMethod === "delivery"}
                        onChange={() => setShippingMethod("delivery")}
                        className="text-primary mt-0.5 flex-shrink-0"
                      />
                      <span className="flex-1 break-words">
                        {language === 'he' ? 'משלוח' : 'Delivery'} - {shippingCost === 0 ? 
                          (language === 'he' ? 'חינם' : 'Free') : 
                          `₪${shippingCost}`
                        }
                      </span>
                    </label>

                    {siteSettings?.enable_self_pickup && (
                      <label className="flex items-start gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="shipping"
                          value="pickup"
                          checked={shippingMethod === "pickup"}
                          onChange={() => setShippingMethod("pickup")}
                          className="text-primary mt-0.5 flex-shrink-0"
                        />
                        <span className="flex-1 break-words">
                          {language === 'he' ? 
                            (siteSettings?.self_pickup_text ?? "איסוף עצמי מכפר האורנים (בתיאום מראש)") : 
                            (siteSettings?.self_pickup_text_en ?? "Self pickup from Kfar HaOranim (by appointment)")
                          } - ₪0
                        </span>
                      </label>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{language === 'he' ? 'סכום ביניים:' : 'Subtotal:'}</span>
                    <span>₪{subtotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        {language === 'he' ? `הנחת קופון (${appliedCoupon.code})` : `Coupon Discount (${appliedCoupon.code})`}
                      </span>
                      <span>-₪{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
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
                  <div className="flex justify-between text-base font-bold">
                    <span>{language === 'he' ? 'סה"כ:' : 'Total:'}</span>
                    <span>₪{total.toLocaleString()}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                {appliedCoupon ? (
                  <div className="text-center">
                    <Button variant="link" onClick={handleRemoveCoupon} className="text-sm">
                      {language === 'he' ? 'הסר קופון' : 'Remove Coupon'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder={language === 'he' ? 'הזן קוד קופון' : 'Enter coupon code'}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        disabled={isApplyingCoupon}
                        className="flex-1 text-sm"
                      />
                      <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon} className="text-sm">
                        {isApplyingCoupon ? (language === 'he' ? 'מאמת...' : 'Applying...') : (language === 'he' ? 'הפעל' : 'Apply')}
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                  </div>
                )}
                
                <div className="bg-accent/10 p-3 rounded-lg mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-main text-sm">
                      {language === 'he' ? 'תשלום מאובטח' : 'Secure Payment'}
                    </span>
                  </div>
                  <p className="text-xs text-subtle">
                    {language === 'he' ? 
                      'התשלום מתבצע באתר המאובטח של קארדקום' : 
                      'Payment is processed through Cardcom secure site'
                    }
                  </p>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || cartItems.length === 0}
                  className="w-full btn-primary text-sm md:text-base py-4 md:py-6"
                  size="lg"
                >
                  <CreditCard className="w-4 h-4 ml-2" />
                  {isProcessing ? 
                    (language === 'he' ? 'מעבר לתשלום...' : 'Processing...') : 
                    (language === 'he' ? `מעבר לתשלום ₪${total.toLocaleString()}` : `Pay ₪${total.toLocaleString()}`)
                  }
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}