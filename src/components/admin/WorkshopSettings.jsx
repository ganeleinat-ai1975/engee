import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MediaUploader from "@/components/MediaUploader";

export default function WorkshopSettings({ settings, onUpdate }) {
  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">הגדרות דף סדנאות</h2>
        <div className="flex items-center gap-3">
          <Label htmlFor="workshop-enabled" className="text-sm font-medium">
            הפעלת דף סדנאות
          </Label>
          <Switch
            id="workshop-enabled"
            checked={settings?.workshop_enabled ?? true}
            onCheckedChange={(checked) => onUpdate({ ...settings, workshop_enabled: checked })}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תמונת רקע וצבעים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaUploader
            label="תמונת רקע לדף הסדנאות"
            onFileSelect={(url) => onUpdate({ ...settings, workshop_background_image: url })}
            currentUrl={settings?.workshop_background_image}
            accept="image/*"
          />
          
          <div>
            <Label htmlFor="workshop-text-color">צבע טקסט</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="workshop-text-color"
                type="color"
                value={settings?.workshop_text_color || '#ffffff'}
                onChange={(e) => onUpdate({ ...settings, workshop_text_color: e.target.value })}
                className="w-20 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={settings?.workshop_text_color || '#ffffff'}
                onChange={(e) => onUpdate({ ...settings, workshop_text_color: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">בחרי צבע טקסט שיהיה קריא על רקע התמונה</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>טקסטים - עברית</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workshop-title-he">כותרת ראשית</Label>
            <Input
              id="workshop-title-he"
              value={settings?.workshop_title ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_title: e.target.value })}
              placeholder="מזמינה אותך לקבוע סדנת תכשיטים"
            />
          </div>

          <div>
            <Label htmlFor="workshop-subtitle-he">תת-כותרת</Label>
            <Textarea
              id="workshop-subtitle-he"
              value={settings?.workshop_subtitle ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_subtitle: e.target.value })}
              placeholder="שבמהלכה כל אחת תצא עם תכשיט בעיצוב אישי שלה"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="workshop-description-he">תיאור נוסף</Label>
            <Input
              id="workshop-description-he"
              value={settings?.workshop_description ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_description: e.target.value })}
              placeholder="כסף 925 או פליז בצפוי זהב"
            />
          </div>

          <div>
            <Label htmlFor="workshop-button-he">טקסט כפתור</Label>
            <Input
              id="workshop-button-he"
              value={settings?.workshop_button_text ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_button_text: e.target.value })}
              placeholder="למידע נוסף"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>טקסטים - אנגלית</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workshop-title-en">Main Title</Label>
            <Input
              id="workshop-title-en"
              value={settings?.workshop_title_en ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_title_en: e.target.value })}
              placeholder="Join Our Jewelry Workshop"
            />
          </div>

          <div>
            <Label htmlFor="workshop-subtitle-en">Subtitle</Label>
            <Textarea
              id="workshop-subtitle-en"
              value={settings?.workshop_subtitle_en ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_subtitle_en: e.target.value })}
              placeholder="Create your own unique piece of jewelry"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="workshop-description-en">Additional Description</Label>
            <Input
              id="workshop-description-en"
              value={settings?.workshop_description_en ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_description_en: e.target.value })}
              placeholder="925 Silver or Gold Plated Brass"
            />
          </div>

          <div>
            <Label htmlFor="workshop-button-en">Button Text</Label>
            <Input
              id="workshop-button-en"
              value={settings?.workshop_button_text_en ?? ""}
              onChange={(e) => onUpdate({ ...settings, workshop_button_text_en: e.target.value })}
              placeholder="Learn More"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}