
import React, { useState, useEffect } from "react";
import { Order } from "@/entities/Order";
import { User } from "@/entities/User";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage } from "@/components/LanguageProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Clock, Truck, CheckCircle, XCircle, Package } from "lucide-react";

export default function Orders() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrdersData();
  }, []);

  const loadOrdersData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userOrders = await Order.filter({ user_email: currentUser.email }, "-created_date");
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      navigate(createPageUrl("Home"));
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusTexts = {
      he: {
        pending: 'ממתין לתשלום',
        paid: 'שולם',
        processing: 'בהכנה',
        shipped: 'נשלח',
        delivered: 'נמסר',
        cancelled: 'בוטל'
      },
      en: {
        pending: 'Pending Payment',
        paid: 'Paid',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      }
    };
    return statusTexts[language][status] || status;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-main mb-2">
            {language === 'he' ? 'ההזמנות שלי' : 'My Orders'}
          </h1>
          <p className="text-subtle">
            {language === 'he' ? 'כאן תוכלי לראות את כל ההזמנות שלך' : 'Here you can see all your orders'}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-main mb-2">
              {language === 'he' ? 'אין הזמנות עדיין' : 'No orders yet'}
            </h3>
            <p className="text-subtle mb-6">
              {language === 'he' ? 'כשתבצעי הזמנה ראשונה, היא תופיע כאן' : 'When you place your first order, it will appear here'}
            </p>
            <Button onClick={() => navigate(createPageUrl("Products"))}>
              {language === 'he' ? 'התחילי לקנות' : 'Start Shopping'}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-accent/10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                      <CardTitle className="text-xl text-main">
                        {language === 'he' ? 'הזמנה מספר' : 'Order'} #{order.order_number}
                      </CardTitle>
                      <p className="text-sm text-subtle mt-1">
                        {new Date(order.created_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                      </p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </Badge>
                      <p className="text-lg font-bold text-main">
                        ₪{order.total_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-main mb-3">
                      {language === 'he' ? 'פריטים בהזמנה:' : 'Items in order:'}
                    </h4>
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-accent/5 rounded">
                        <div className="flex-1">
                          <h5 className="font-medium text-main">{item.product_name}</h5>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-subtle">
                            <span>{language === 'he' ? 'כמות:' : 'Quantity:'} {item.quantity}</span>
                            {item.size && <span>{language === 'he' ? 'מידה:' : 'Size:'} {item.size}</span>}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-medium text-main">₪{item.price?.toLocaleString()}</p>
                          <p className="text-sm text-subtle">
                            {language === 'he' ? 'לפריט' : 'per item'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {order.shipping_address && (
                    <div className="mt-6 pt-6 border-t border-accent/20">
                      <h4 className="font-medium text-main mb-2">
                        {language === 'he' ? 'כתובת משלוח:' : 'Shipping Address:'}
                      </h4>
                      <div className="text-sm text-subtle space-y-1">
                        <p>{order.shipping_address.street}</p>
                        <p>{order.shipping_address.city} {order.shipping_address.postal_code}</p>
                        <p>{order.shipping_address.country}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
