import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { UploadFile } from "@/integrations/Core";

const getSizeOptions = (category) => {
  switch(category) {
    case 'rings': return Array.from({length: 16}, (_, i) => (48 + i).toString());
    case 'necklaces': return ['37', '42', '45', '50', '55'];
    case 'bracelets': return ['15', '18'];
    default: return [];
  }
};

export default function ProductForm({ product, onSubmit, onCancel }) {
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: { name: '', name_en: '', description: '', description_en: '', price: '', category: 'rings', is_featured: false, stock_quantity: 100 }
  });
  const [currentImages, setCurrentImages] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCategory = watch('category');
  const currentSizeOptions = getSizeOptions(selectedCategory);

  useEffect(() => {
    if (product) {
      reset({ name: product.name || '', name_en: product.name_en || '', description: product.description || '', description_en: product.description_en || '', price: product.price || '', category: product.category || 'rings', is_featured: product.is_featured || false, stock_quantity: product.stock_quantity ?? 100 });
      setCurrentImages(product.images || []);
      const productCategorySizes = getSizeOptions(product.category);
      setAvailableSizes(product.available_sizes ? product.available_sizes.filter(size => productCategorySizes.includes(size)) : []);
    } else {
      reset({ name: '', name_en: '', description: '', description_en: '', price: '', category: 'rings', is_featured: false, stock_quantity: 100 });
      setCurrentImages([]); setAvailableSizes([]);
    }
  }, [product, reset]);

  useEffect(() => {
    const newSizeOptions = getSizeOptions(selectedCategory);
    setAvailableSizes(prev => prev.filter(size => newSizeOptions.includes(size)));
  }, [selectedCategory]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setCurrentImages(prev => [...prev, file_url]);
      toast.success('תמונה הועלתה בהצלחה');
    } catch (error) { toast.error('שגיאה בהעלאת התמונה'); }
    setIsUploadingImage(false);
    e.target.value = null;
  };

  const toggleAvailableSize = (size) => {
    setAvailableSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const internalSubmitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      const productData = { ...data, images: currentImages, ...(currentSizeOptions.length > 0 && { available_sizes: availableSizes }) };
      await onSubmit(productData);
      if (!product) { reset(); setCurrentImages([]); setAvailableSizes([]); }
    } catch (error) { console.error('Product save error:', error); }
    finally { setIsSubmitting(false); }
  };

  const getSizeLabel = (category) => {
    switch(category) {
      case 'rings': return 'מידות טבעות זמינות (בחר מידות במלאי)';
      case 'necklaces': return 'אורכי שרשרת זמינים (בחר אורכים במלאי)';
      case 'bracelets': return 'מידות צמיד זמינות (בחר מידות במלאי)';
      default: return 'מידות זמינות';
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{product ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(internalSubmitHandler)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>שם המוצר (עברית) *</Label><Input {...register('name', { required: true })} /></div>
            <div><Label>שם המוצר (אנגלית)</Label><Input {...register('name_en')} /></div>
          </div>
          <div><Label>מחיר *</Label><Input type="number" {...register('price', { required: true, valueAsNumber: true })} /></div>
          <div><Label>כמות במלאי</Label><Input type="number" {...register('stock_quantity', { valueAsNumber: true, min: 0 })} /></div>
          <div>
            <Label>קטגוריה *</Label>
            <Select value={selectedCategory} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger><SelectValue placeholder="בחר קטגוריה" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rings">טבעות</SelectItem>
                <SelectItem value="necklaces">שרשראות</SelectItem>
                <SelectItem value="earrings">עגילים</SelectItem>
                <SelectItem value="bracelets">צמידים</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>תיאור (עברית)</Label><Textarea {...register('description')} rows={3} /></div>
            <div><Label>תיאור (אנגלית)</Label><Textarea {...register('description_en')} rows={3} /></div>
          </div>
          <div>
            <Label>תמונות המוצר</Label>
            <div className="space-y-4">
              {currentImages.map((image, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-accent/20 rounded">
                  <img src={image} alt={`תמונה ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                  <span className="flex-grow text-sm truncate">{image}</span>
                  <Button type="button" variant="outline" size="sm" onClick={() => setCurrentImages(prev => prev.filter((_, i) => i !== index))}><Trash2 className="w-3 h-3" /></Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" disabled={isUploadingImage} />
                <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()} disabled={isUploadingImage}>
                  {isUploadingImage ? 'מעלה...' : <><Plus className="w-4 h-4 mr-2" />הוסף תמונה</>}
                </Button>
              </div>
            </div>
          </div>
          {currentSizeOptions.length > 0 && (
            <div>
              <Label>{getSizeLabel(selectedCategory)}</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {currentSizeOptions.map((size) => (
                  <button key={size} type="button" onClick={() => toggleAvailableSize(size)} className={`p-2 border rounded text-sm transition-colors ${availableSizes.includes(size) ? 'bg-green-100 border-green-300 text-green-800' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>{size}</button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="is_featured" checked={watch('is_featured')} onCheckedChange={(checked) => setValue('is_featured', checked)} />
            <Label htmlFor="is_featured">מוצר מומלץ</Label>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'שומר...' : (product ? 'עדכן מוצר' : 'הוסף מוצר')}</Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>ביטול</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}