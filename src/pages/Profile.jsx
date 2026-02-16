
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { useLanguage, t } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserIcon, Mail, Phone, Edit } from "lucide-react";

export default function Profile() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setEditData({
        full_name: currentUser.full_name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        birth_date: currentUser.birth_date || ''
      });
    } catch (error) {
      toast.error(t('error', language));
    }
    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    try {
      await User.updateMyUserData(editData);
      setUser({ ...user, ...editData });
      setIsEditing(false);
      toast.success(language === 'he' ? 'הפרופיל עודכן בהצלחה' : 'Profile updated successfully');
    } catch (error) {
      toast.error(t('error', language));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-4">
              {language === 'he' ? 'נדרשת התחברות' : 'Login Required'}
            </h2>
            <Button onClick={() => User.login()}>
              {t('login', language)}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-main">
            {language === 'he' ? 'הפרופיל שלי' : 'My Profile'}
          </h1>
          <p className="text-subtle mt-2">
            {language === 'he' ? 'נהל את פרטי החשבון שלך' : 'Manage your account details'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* פרטים אישיים */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                {language === 'he' ? 'פרטים אישיים' : 'Personal Information'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{language === 'he' ? 'שם מלא' : 'Full Name'}</Label>
                {isEditing ? (
                  <Input
                    value={editData.full_name}
                    onChange={(e) => setEditData({...editData, full_name: e.target.value})}
                  />
                ) : (
                  <p className="text-main font-medium">{user.full_name}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {language === 'he' ? 'אימייל' : 'Email'}
                </Label>
                <p className="text-subtle">{user.email}</p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {language === 'he' ? 'טלפון' : 'Phone'}
                </Label>
                {isEditing ? (
                  <Input
                    value={editData.phone}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    placeholder={language === 'he' ? 'הכנס מספר טלפון' : 'Enter phone number'}
                  />
                ) : (
                  <p className="text-main">{user.phone || (language === 'he' ? 'לא צוין' : 'Not specified')}</p>
                )}
              </div>

              <div>
                <Label>{language === 'he' ? 'כתובת' : 'Address'}</Label>
                {isEditing ? (
                  <Input
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    placeholder={language === 'he' ? 'הכנס כתובת' : 'Enter address'}
                  />
                ) : (
                  <p className="text-main">{user.address || (language === 'he' ? 'לא צוינה' : 'Not specified')}</p>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile} className="btn-primary">
                    {language === 'he' ? 'שמור שינויים' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {language === 'he' ? 'ביטול' : 'Cancel'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* סטטיסטיקות */}
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'he' ? 'סטטיסטיקות' : 'Statistics'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-subtle">
                  {language === 'he' ? 'תאריך הצטרפות' : 'Member since'}
                </span>
                <span className="font-medium">
                  {new Date(user.created_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-subtle">
                  {language === 'he' ? 'סוג חשבון' : 'Account Type'}
                </span>
                <span className="font-medium capitalize">
                  {user.role === 'admin' ? 
                    (language === 'he' ? 'מנהל' : 'Admin') : 
                    (language === 'he' ? 'לקוח' : 'Customer')
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
