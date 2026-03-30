import React, { useState, useEffect } from "react";
import { Sale } from "@/entities/Sale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Tag, Trash2, Power, AlertTriangle } from "lucide-react";
import { applyDiscount } from "@/lib/saleUtils";

const EXAMPLE_PRICE = 369;

const scopeLabels = {
  all: "כל האתר",
  specific: "מוצרים ספציפיים",
  all_plus_specific: "כל האתר + כפל למוצרים ספציפיים"
};

const discountTypeLabels = {
  percentage: "אחוזים",
  fixed: "סכום קבוע (₪)"
};

export default function SaleManager({ products = [] }) {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    scope: "all",
    discount_type: "percentage",
    discount_value: "",
    product_ids: [],
    extra_discount_type: "percentage",
    extra_discount_value: "",
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setIsLoading(true);
    const allSales = await Sale.list("-created_date");
    setSales(allSales);
    setIsLoading(false);
  };

  const activeSale = sales.find(s => s.is_active);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("יש להזין שם מבצע");
      return;
    }
    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      toast.error("יש להזין ערך הנחה תקין");
      return;
    }
    if ((formData.scope === "specific" || formData.scope === "all_plus_specific") && formData.product_ids.length === 0) {
      toast.error("יש לבחור לפחות מוצר אחד");
      return;
    }

    const saleData = {
      name: formData.name.trim(),
      scope: formData.scope,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      product_ids: formData.scope !== "all" ? formData.product_ids : [],
      extra_discount_type: formData.scope === "all_plus_specific" ? formData.extra_discount_type : "percentage",
      extra_discount_value: formData.scope === "all_plus_specific" ? Number(formData.extra_discount_value) || 0 : 0,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      is_active: false
    };

    await Sale.create(saleData);
    toast.success("מבצע נוצר בהצלחה!");
    setFormData({
      name: "", scope: "all", discount_type: "percentage", discount_value: "",
      product_ids: [], extra_discount_type: "percentage", extra_discount_value: "",
      start_date: "", end_date: ""
    });
    await loadSales();
  };

  const handleToggle = async (sale, newActive) => {
    if (newActive && activeSale && activeSale.id !== sale.id) {
      const confirmed = window.confirm(`מבצע "${activeSale.name}" יכובה אוטומטית. להמשיך?`);
      if (!confirmed) return;
      await Sale.update(activeSale.id, { is_active: false });
    }
    await Sale.update(sale.id, { is_active: newActive });
    toast.success(newActive ? "מבצע הופעל!" : "מבצע כובה");
    await loadSales();
  };

  const handleDeactivate = async () => {
    if (!activeSale) return;
    await Sale.update(activeSale.id, { is_active: false });
    toast.success("מבצע כובה");
    await loadSales();
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm("האם למחוק את המבצע?")) return;
    await Sale.delete(saleId);
    toast.success("מבצע נמחק");
    await loadSales();
  };

  const toggleProductSelection = (productId) => {
    setFormData(prev => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter(id => id !== productId)
        : [...prev.product_ids, productId]
    }));
  };

  const discountExample = formData.discount_value && Number(formData.discount_value) > 0
    ? applyDiscount(EXAMPLE_PRICE, formData.discount_type, Number(formData.discount_value))
    : null;

  const extraDiscountExample = formData.scope === "all_plus_specific" && discountExample && formData.extra_discount_value && Number(formData.extra_discount_value) > 0
    ? applyDiscount(discountExample, formData.extra_discount_type, Number(formData.extra_discount_value))
    : null;

  return (
    <div className="space-y-6">
      {/* כרטיס מבצע פעיל */}
      <Card className={activeSale ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Power className={`w-5 h-5 ${activeSale ? "text-green-600" : "text-gray-400"}`} />
            {activeSale ? "מבצע פעיל כרגע" : "אין מבצע פעיל כרגע"}
          </CardTitle>
        </CardHeader>
        {activeSale && (
          <CardContent className="pt-0 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-bold text-lg">{activeSale.name}</span>
              <Badge className="bg-green-100 text-green-800">{scopeLabels[activeSale.scope]}</Badge>
            </div>
            <p className="text-sm text-gray-700">
              הנחה: {activeSale.discount_value}{activeSale.discount_type === "percentage" ? "%" : "₪"}
              {activeSale.scope === "all_plus_specific" && activeSale.extra_discount_value > 0 && (
                <span> + הנחה נוספת: {activeSale.extra_discount_value}{activeSale.extra_discount_type === "percentage" ? "%" : "₪"} למוצרים ספציפיים</span>
              )}
            </p>
            {(activeSale.start_date || activeSale.end_date) && (
              <p className="text-xs text-gray-500">
                {activeSale.start_date && `מתאריך: ${new Date(activeSale.start_date).toLocaleDateString('he-IL')}`}
                {activeSale.start_date && activeSale.end_date && " | "}
                {activeSale.end_date && `עד תאריך: ${new Date(activeSale.end_date).toLocaleDateString('he-IL')}`}
              </p>
            )}
            <Button variant="destructive" size="sm" onClick={handleDeactivate} className="mt-2">
              כיבוי מבצע
            </Button>
          </CardContent>
        )}
      </Card>

      {/* טופס יצירת מבצע */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            יצירת מבצע חדש
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>שם המבצע</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="למשל: מבצע אביב 2026"
            />
          </div>

          <div>
            <Label>כיסוי המבצע</Label>
            <Select value={formData.scope} onValueChange={(v) => setFormData(p => ({ ...p, scope: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל האתר</SelectItem>
                <SelectItem value="specific">מוצרים ספציפיים בלבד</SelectItem>
                <SelectItem value="all_plus_specific">כל האתר + כפל למוצרים ספציפיים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>סוג הנחה</Label>
              <Select value={formData.discount_type} onValueChange={(v) => setFormData(p => ({ ...p, discount_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">אחוזים (%)</SelectItem>
                  <SelectItem value="fixed">סכום קבוע (₪)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ערך הנחה</Label>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData(p => ({ ...p, discount_value: e.target.value }))}
                placeholder={formData.discount_type === "percentage" ? "למשל: 30" : "למשל: 50"}
              />
            </div>
          </div>

          {/* דוגמה דינמית */}
          {discountExample !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              לדוגמה: מוצר ב-₪{EXAMPLE_PRICE} → <strong>₪{discountExample}</strong>
            </div>
          )}

          {/* הנחה נוספת ב-all_plus_specific */}
          {formData.scope === "all_plus_specific" && (
            <>
              <Separator />
              <h4 className="font-medium text-gray-700">הנחה נוספת למוצרים ספציפיים (כפל)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>סוג הנחה נוספת</Label>
                  <Select value={formData.extra_discount_type} onValueChange={(v) => setFormData(p => ({ ...p, extra_discount_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">אחוזים (%)</SelectItem>
                      <SelectItem value="fixed">סכום קבוע (₪)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ערך הנחה נוספת</Label>
                  <Input
                    type="number"
                    value={formData.extra_discount_value}
                    onChange={(e) => setFormData(p => ({ ...p, extra_discount_value: e.target.value }))}
                  />
                </div>
              </div>
              {extraDiscountExample !== null && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-800">
                  למוצרים ספציפיים: ₪{EXAMPLE_PRICE} → ₪{discountExample} → <strong>₪{extraDiscountExample}</strong>
                </div>
              )}
            </>
          )}

          {/* בחירת מוצרים */}
          {(formData.scope === "specific" || formData.scope === "all_plus_specific") && (
            <>
              <Separator />
              <div>
                <Label className="mb-2 block">בחירת מוצרים ({formData.product_ids.length} נבחרו)</Label>
                <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                  {products.map(product => (
                    <label key={product.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <Checkbox
                        checked={formData.product_ids.includes(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                      <span className="text-sm flex-1">{product.name}</span>
                      <span className="text-xs text-gray-500">₪{product.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* תאריכים */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>תאריך התחלה (אופציונלי)</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label>תאריך סיום (אופציונלי)</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))}
              />
            </div>
          </div>

          <Button onClick={handleCreate} className="w-full btn-primary">
            הוסף מבצע
          </Button>
        </CardContent>
      </Card>

      {/* רשימת מבצעים */}
      <Card>
        <CardHeader>
          <CardTitle>מבצעים קיימים</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-4">טוען...</p>
          ) : sales.length === 0 ? (
            <p className="text-center text-gray-500 py-4">אין מבצעים עדיין</p>
          ) : (
            <div className="space-y-3">
              {sales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{sale.name}</span>
                      <Badge variant="outline" className="text-xs">{scopeLabels[sale.scope]}</Badge>
                      {sale.is_active && <Badge className="bg-green-100 text-green-800 text-xs">פעיל</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">
                      {sale.discount_value}{sale.discount_type === "percentage" ? "%" : "₪"} הנחה
                      {sale.scope === "all_plus_specific" && sale.extra_discount_value > 0 && (
                        <span> + {sale.extra_discount_value}{sale.extra_discount_type === "percentage" ? "%" : "₪"} נוסף</span>
                      )}
                    </p>
                    {(sale.start_date || sale.end_date) && (
                      <p className="text-xs text-gray-400">
                        {sale.start_date && new Date(sale.start_date).toLocaleDateString('he-IL')}
                        {sale.start_date && sale.end_date && " - "}
                        {sale.end_date && new Date(sale.end_date).toLocaleDateString('he-IL')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={sale.is_active}
                      onCheckedChange={(checked) => handleToggle(sale, checked)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}