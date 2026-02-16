import React, { useEffect, useState } from "react";
import { Coupon } from "@/entities/Coupon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Plus, Calendar, Percent, DollarSign } from "lucide-react";

export default function CouponsManager() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage",
    value: 0,
    description: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const fetchCoupons = async () => {
    try {
      const all = await Coupon.list("-created_date");
      setCoupons(all);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("שגיאה בטעינת הקופונים");
    } finally {
      setIsLoading(false);
    }
  };

  const addCoupon = async () => {
    if (!newCoupon.code.trim()) {
      toast.error("יש להזין קוד קופון");
      return;
    }
    
    if (newCoupon.value <= 0) {
      toast.error("ערך ההנחה חייב להיות גדול מ-0");
      return;
    }

    try {
      const couponToCreate = {
        ...newCoupon,
        code: newCoupon.code.trim().toUpperCase()
      };
      
      await Coupon.create(couponToCreate);
      setNewCoupon({
        code: "",
        type: "percentage",
        value: 0,
        description: "",
        start_date: "",
        end_date: "",
        is_active: true,
      });
      toast.success("קופון נוסף בהצלחה!");
      fetchCoupons();
    } catch (error) {
      console.error("Error adding coupon:", error);
      toast.error("שגיאה בהוספת הקופון");
    }
  };

  const updateCoupon = async (id, field, value) => {
    try {
      await Coupon.update(id, { [field]: value });
      toast.success("קופון עודכן בהצלחה!");
      fetchCoupons();
    } catch (error) {
      console.error("Error updating coupon:", error);
      toast.error("שגיאה בעדכון הקופון");
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הקופון?")) return;
    
    try {
      await Coupon.delete(id);
      toast.success("קופון נמחק בהצלחה!");
      fetchCoupons();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("שגיאה במחיקת הקופון");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "לא מוגדר";
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const isNotStarted = (startDate) => {
    if (!startDate) return false;
    return new Date(startDate) > new Date();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">ניהול קופונים</h2>
        <Badge variant="secondary">{coupons.length} קופונים</Badge>
      </div>

      {/* Add New Coupon Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            הוספת קופון חדש
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="code">קוד קופון *</Label>
              <Input
                id="code"
                placeholder="למשל: SALE10"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                className="uppercase"
              />
            </div>
            
            <div>
              <Label htmlFor="type">סוג הנחה *</Label>
              <Select value={newCoupon.type} onValueChange={(value) => setNewCoupon({ ...newCoupon, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">הנחה באחוזים</SelectItem>
                  <SelectItem value="fixed">הנחה כספית (₪)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="value">ערך ההנחה *</Label>
              <Input
                id="value"
                type="number"
                placeholder={newCoupon.type === 'percentage' ? '10' : '50'}
                value={newCoupon.value}
                onChange={(e) => setNewCoupon({ ...newCoupon, value: Number(e.target.value) })}
                min="0"
                step={newCoupon.type === 'percentage' ? '1' : '0.01'}
              />
            </div>
            
            <div>
              <Label htmlFor="description">תיאור</Label>
              <Input
                id="description"
                placeholder="למשל: הנחת חג"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="start_date">תאריך התחלה</Label>
              <Input
                id="start_date"
                type="date"
                value={newCoupon.start_date}
                onChange={(e) => setNewCoupon({ ...newCoupon, start_date: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="end_date">תאריך סיום</Label>
              <Input
                id="end_date"
                type="date"
                value={newCoupon.end_date}
                onChange={(e) => setNewCoupon({ ...newCoupon, end_date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Switch
              checked={newCoupon.is_active}
              onCheckedChange={(checked) => setNewCoupon({ ...newCoupon, is_active: checked })}
            />
            <Label>פעיל</Label>
          </div>
          
          <Button onClick={addCoupon} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            הוספת קופון
          </Button>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <div className="space-y-4">
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-gray-500">
              אין קופונים במערכת
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-lg font-mono">
                        {coupon.code}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        {coupon.type === 'percentage' ? (
                          <>
                            <Percent className="w-4 h-4" />
                            {coupon.value}% הנחה
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4" />
                            ₪{coupon.value} הנחה
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!coupon.is_active && (
                          <Badge variant="destructive">לא פעיל</Badge>
                        )}
                        {isExpired(coupon.end_date) && (
                          <Badge variant="destructive">פג תוקף</Badge>
                        )}
                        {isNotStarted(coupon.start_date) && (
                          <Badge variant="secondary">עדיין לא התחיל</Badge>
                        )}
                        {coupon.is_active && !isExpired(coupon.end_date) && !isNotStarted(coupon.start_date) && (
                          <Badge variant="success" className="bg-green-100 text-green-800">פעיל</Badge>
                        )}
                      </div>
                    </div>
                    
                    {coupon.description && (
                      <p className="text-gray-600 text-sm mb-2">{coupon.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {coupon.start_date ? formatDate(coupon.start_date) : "ללא תאריך התחלה"}
                      </div>
                      <span>-</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {coupon.end_date ? formatDate(coupon.end_date) : "ללא תאריך סיום"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={coupon.is_active}
                        onCheckedChange={(checked) => updateCoupon(coupon.id, "is_active", checked)}
                      />
                      <Label className="text-sm">פעיל</Label>
                    </div>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}