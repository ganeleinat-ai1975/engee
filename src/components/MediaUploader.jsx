import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";
import { UploadFile } from "@/integrations/Core";
import { toast } from "sonner";

export default function MediaUploader({ onFileSelect, currentUrl, accept = "image/*", label }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        toast.info("מעלה קובץ...");

        try {
            const { file_url } = await UploadFile({ file });
            onFileSelect(file_url);
            toast.success("קובץ הועלה בהצלחה!");
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("שגיאה בהעלאת הקובץ");
        } finally {
            setIsUploading(false);
            event.target.value = null;
        }
    };

    const uniqueId = `upload-media-${label?.replace(/\s/g, '-') || Math.random().toString(36).substring(2, 9)}`;

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <Input
                value={currentUrl || ''}
                onChange={(e) => onFileSelect(e.target.value)}
                placeholder="הכנס קישור ישיר או העלה קובץ"
            />
            <div className="flex items-center gap-2">
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileUpload}
                    className="hidden"
                    id={uniqueId}
                    disabled={isUploading}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(uniqueId)?.click()}
                    disabled={isUploading}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? 'מעלה...' : 'העלה קובץ'}
                </Button>
                {currentUrl && (
                    <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                        {/\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(currentUrl) ? (
                            <video
                                src={currentUrl}
                                className="h-12 w-12 object-cover rounded border"
                                muted
                            />
                        ) : accept.startsWith('image/') ? (
                            <img
                                src={currentUrl}
                                alt="תצוגה מקדימה"
                                className="h-12 w-12 object-cover rounded border"
                            />
                        ) : (
                            <FileText className="w-12 h-12 text-gray-500" />
                        )}
                    </a>
                )}
            </div>
        </div>
    );
}