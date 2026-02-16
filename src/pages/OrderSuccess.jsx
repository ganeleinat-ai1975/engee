import React, { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Order } from "@/entities/Order";
import { useCart } from "@/components/CartProvider";
import { useLanguage, t } from "@/components/LanguageProvider";
import { processOrderSuccess } from "@/functions/processOrderSuccess";
import { CheckCircle2, Loader, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccess() {
  const { search } = useLocation();
  const { clearCart } = useCart();
  const { language } = useLanguage();
  
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(false);

  const orderNumber = new URLSearchParams(search).get("orderNumber");
  const status = new URLSearchParams(search).get("status");
  
  const fetchOrderAndFinalize = useCallback(async () => {
    if (!orderNumber) {
      setIsLoading(false);
      return;
    }

    // אם הסטטוס הוא error מקארדקום - זה באמת שגיאה
    if (status === "error") {
      setPaymentError(true);
      setIsLoading(false);
      return;
    }

    try {
      // קריאה לפונקציית Backend שמטפלת בכל הלוגיקה עם הרשאות מלאות
      // זה מעדכן סטטוס ושולח מיילים - גם לאורחים!
      await processOrderSuccess({ orderNumber: parseInt(orderNumber, 10) });
      
      // מנסים לטעון את ההזמנה להצגה (לא קריטי אם נכשל)
      try {
        const orders = await Order.filter({ order_number: parseInt(orderNumber, 10) });
        if (orders.length > 0) {
          setOrder(orders[0]);
        }
      } catch (fetchErr) {
        console.log("Could not fetch order for display (non-critical):", fetchErr);
        // לא קריטי - ההזמנה כבר עודכנה בשרת
      }
      
      // ניקוי הסל
      try {
        await clearCart();
      } catch (clearErr) {
        console.error("Failed to clear cart:", clearErr);
        // גם זה לא קריטי
      }
      
    } catch (err) {
      console.error("Order finalization error:", err);
      // גם אם יש שגיאה כלשהי, אנחנו מציגים הצלחה כי התשלום עבר בקארדקום
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber, status, clearCart]);

  useEffect(() => {
    fetchOrderAndFinalize();
  }, [fetchOrderAndFinalize]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <Loader className="w-12 h-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold text-main">{t('processingOrder', language)}</h1>
        <p className="text-subtle">{t('pleaseWait', language)}</p>
      </div>
    );
  }

  // רק אם קארדקום החזיר error - אז זו שגיאה אמיתית
  if (paymentError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-main">{t('orderFailed', language)}</h1>
        <p className="text-subtle max-w-md mx-auto">
          {t('paymentFailedError', language)}
        </p>
        <Button asChild className="mt-6">
            <Link to={createPageUrl("Contact")}>{t('contactSupport', language)}</Link>
        </Button>
      </div>
    );
  }
  
  // אם אין הזמנה אבל יש orderNumber והסטטוס success - מציגים הצלחה בכל מקרה
  if (!order && orderNumber && status === "success") {
     return (
       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-main mb-2">{t('thankYou', language)}</h1>
          <p className="text-subtle mb-6">{t('orderConfirmationSent', language)}</p>
          
          <div className="text-left bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2">
              <p><strong>{t('orderNumber', language)}:</strong> {orderNumber}</p>
          </div>

          <Button asChild className="mt-8 w-full">
            <Link to={createPageUrl("Products")}>{t('continueShopping', language)}</Link>
          </Button>
        </div>
      </div>
     );
  }

  // אם יש הזמנה - מציגים פרטים מלאים
  if (order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-main mb-2">{t('thankYou', language)}</h1>
          <p className="text-subtle mb-6">{t('orderConfirmationSent', language)}</p>
          
          <div className="text-left bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2">
              <p><strong>{t('orderNumber', language)}:</strong> {order.order_number}</p>
              <p><strong>{t('totalAmount', language)}:</strong> ₪{order.total_amount?.toLocaleString()}</p>
          </div>

          {order.receipt_pdf_url && (
              <a 
                  href={order.receipt_pdf_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block mt-6 text-primary hover:underline"
              >
              {t('viewReceipt', language)}
              </a>
          )}

          <Button asChild className="mt-8 w-full">
            <Link to={createPageUrl("Products")}>{t('continueShopping', language)}</Link>
          </Button>
        </div>
      </div>
    );
  }

  // במקרה שלא אמור להגיע - ברירת מחדל
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
      <h1 className="text-2xl font-bold text-main">{t('orderNotFound', language)}</h1>
      <p className="text-subtle max-w-md mx-auto">{t('couldNotFindOrder', language)}</p>
      <Button asChild className="mt-6">
          <Link to={createPageUrl("Contact")}>{t('contactSupport', language)}</Link>
      </Button>
    </div>
  );
}