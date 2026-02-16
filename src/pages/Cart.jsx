
import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage, t } from "@/components/LanguageProvider";
import { useCart } from "@/components/CartProvider";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cart() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { 
    cartItems, 
    products, 
    cartCount,
    isLoading,
    removeFromCart,
    updateQuantity,
    user 
  } = useCart();

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, newQuantity);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
      const product = products[item.product_id];
      if (!product) return sum;
      const basePrice = product.price || 0;
      const goldPlatingPrice = item.gold_plating ? 100 : 0;
      return sum + (basePrice + goldPlatingPrice) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (user) {
      navigate(createPageUrl("Payment"));
    } else {
      // For guest, directly go to payment page where they will enter details
      navigate(createPageUrl("Payment"));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-2 md:px-4 py-8 md:py-12">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-2 md:px-4 py-8 md:py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">{t('emptyCart', language)}</h2>
            <p className="mt-2 text-gray-500">{language === 'he' ? 'הוסיפו פריטים לסל כדי לראות אותם כאן.' : 'Add items to your cart to see them here.'}</p>
            <Button onClick={() => navigate(createPageUrl("Products"))} className="mt-6 btn-primary">
              {t('continueShopping', language)}
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            <div className="lg:col-span-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('yourCart', language)} ({cartCount})</h1>
              <div className="space-y-4 md:space-y-6">
                {cartItems.map(item => {
                  const product = products[item.product_id];
                  if (!product) return null;
                  const imageUrl = product.images?.[0];
                  
                  const basePrice = product.price || 0;
                  const goldPlatingPrice = item.gold_plating ? 100 : 0;
                  const itemPrice = basePrice + goldPlatingPrice;
                  
                  return (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        <img 
                          src={imageUrl ? `${imageUrl}?width=200&quality=80` : ''} 
                          alt={product.name} 
                          loading="lazy" 
                          className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base md:text-lg text-gray-800 truncate">{product.name}</h3>
                          {item.size && (
                            <p className="text-sm text-gray-500">{t('size', language)}: {item.size}</p>
                          )}
                          {item.gold_plating && (
                            <p className="text-sm text-amber-600 font-medium">{language === 'he' ? 'ציפוי זהב (+₪100)' : 'Gold plating (+₪100)'}</p>
                          )}
                          <p className="text-amber-800 font-semibold">₪{itemPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end md:gap-6">
                        <div className="flex items-center border rounded-full">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)} 
                            className="rounded-full h-8 w-8 md:h-10 md:w-10"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                          <span className="w-8 md:w-10 text-center text-sm md:text-base">{item.quantity}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)} 
                            className="rounded-full h-8 w-8 md:h-10 md:w-10"
                          >
                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>

                        <p className="font-bold text-base md:text-lg text-gray-800 w-24 text-center">
                          ₪{(itemPrice * item.quantity).toLocaleString()}
                        </p>

                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">{t('subtotal', language)}</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>{t('subtotal', language)}</span>
                    <span>₪{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('total', language)}</span>
                    <span>₪{subtotal.toLocaleString()}</span>
                  </div>
                </div>
                <Button onClick={handleCheckout} className="w-full btn-primary" size="lg">
                  {t('checkout', language)}
                </Button>
                <Button onClick={() => navigate(createPageUrl("Products"))} className="w-full mt-3" variant="outline">
                  {t('continueShopping', language)}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
