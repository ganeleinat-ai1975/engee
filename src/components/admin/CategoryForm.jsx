import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from 'react-hook-form';
import MediaUploader from "@/components/MediaUploader";

export default function CategoryForm({ category, onSubmit, onCancel }) {
  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: { name: '', name_en: '', slug: '', description: '', description_en: '', order: 0, is_active: true }
  });
  const [currentImage, setCurrentImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const watchedName = watch('name');

  const generalSlugify = (text) => text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

  const generateSlugFromHebrewName = (hebrewName) => {
    if (!hebrewName) return '';
    const map = { 'טבעות': 'rings', 'שרשראות': 'necklaces', 'עגילים': 'earrings', 'צמידים': 'bracelets', 'קולקציות': 'collections' };
    return map[hebrewName] || generalSlugify(hebrewName);
  };

  useEffect(() => { setValue('slug', generateSlugFromHebrewName(watchedName)); }, [watchedName, setValue]);

  useEffect(() => {
    if (category) {
      reset({ name: category.name || '', name_en: category.name_en || '', slug: category.slug || '', description: category.description || '', description_en: category.description_en || '', order: category.order || 0, is_active: category.is_active !== undefined ? category.is_active : true });
      setCurrentImage(category.image_url || '');
    } else { reset({ name: '', name_en: '', slug: '', description: '', description_en: '', order: 0, is_active: true }); setCurrentImage(''); }
  }, [category, reset]);

  const internalSubmitHandler = async (data) => {
    setIsSubmitting(true);
    try { await onSubmit({ ...data, image_url: currentImage }); reset(); setCurrentImage(''); }
    catch (error) { console.error('Category save error:', error); }
    finally { setIsSubmitting(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{category ? 'עריכת קטגוריה' : 'הוספת קטגוריה חדשה'}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(internalSubmitHandler)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>שם הקטגוריה (עברית) *</Label><Input {...register('name', { required: true })} placeholder="לדוגמה: טבעות" /></div>
            <div><Label>שם הקטגוריה (אנגלית)</Label><Input {...register('name_en')} placeholder="For example: Rings" /></div>
          </div>
          <div><Label>URL (slug) - אוטומטי</Label><Input {...register('slug')} readOnly className="bg-gray-100" dir="ltr" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>תיאור (עברית)</Label><Textarea {...register('description')} rows={3} /></div>
            <div><Label>תיאור (אנגלית)</Label><Textarea {...register('description_en')} rows={3} /></div>
          </div>
          <MediaUploader label="תמונת קטגוריה" onFileSelect={setCurrentImage} currentUrl={currentImage} accept="image/*" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>סדר תצוגה</Label><Input type="number" {...register('order', { valueAsNumber: true })} defaultValue={0} /></div>
            <div className="flex items-center space-x-2"><input type="checkbox" id="is_active_category" {...register('is_active')} className="rounded" /><Label htmlFor="is_active_category">קטגוריה פעילה</Label></div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'שומר...' : (category ? 'עדכן קטגוריה' : 'הוסף קטגוריה')}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}