import React, { useState, useEffect, useMemo } from "react";
import { Product } from "@/entities/Product";
import { SiteSettings } from "@/entities/SiteSettings";
import { User } from "@/entities/User";
import { Order } from "@/entities/Order";
import { Category } from "@/entities/Category";
import { useLanguage } from "@/components/LanguageProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Settings,
  ShoppingCart,
  ListOrdered,
  Plus,
  Edit,
  Trash2,
  Package,
  Percent,
  RefreshCw,
  Eye,
  CalendarDays, // CalendarDays is used for the workshop tab trigger icon
  FileText, // FileText for pages tab trigger
  Save,
  HelpCircle,
  Tag,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from 'react-hook-form';
import CouponsManager from "@/components/admin/CouponsManager";
import WorkshopSettings from "@/components/admin/WorkshopSettings";
import SaleManager from "@/components/admin/SaleManager";
import MediaUploader from "@/components/MediaUploader";
import ProductForm from "@/components/admin/ProductForm";
import CategoryForm from "@/components/admin/CategoryForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadFile } from "@/integrations/Core"; // Corrected import for UploadFile

// Helper components for new UI structure
const SettingsSection = ({ title, children }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {children}
        </CardContent>
    </Card>
);

const InputRow = ({ label, value, onChange, placeholder, type = "text", dir }) => (
    <div>
        <Label>{label}</Label>
        <Input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            dir={dir}
        />
    </div>
);

const TextareaRow = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div>
        <Label>{label}</Label>
        <Textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
        />
    </div>
);


export default function Admin() {
  const { language } = useLanguage();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Site Settings States
  const [siteSettings, setSiteSettings] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('siteSettings'); // State for active tab

  // Products States
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Orders States
  const [orders, setOrders] = useState([]);
  const [ordersFilter, setOrdersFilter] = useState('all'); // Filter for orders table
  const [isLoadingOrders, setIsLoadingOrders] = useState(false); // Loading state for orders
  const [ordersError, setOrdersError] = useState(null); // Error state for orders
  const [viewingOrder, setViewingOrder] = useState(null); // State for viewing a single order (not implemented yet, just for the button)


  // Categories States
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await User.me();
      if (currentUser.role !== 'admin') {
        toast.error('אין הרשאה לגשת לעמוד זה');
        window.location.href = '/Home';
        return;
      }
      setUser(currentUser);
      await loadAllData(); // Use loadAllData
    } catch (error) {
      toast.error('נדרשת התחברות');
      User.login();
    }
  };

  const loadAllData = async () => {
    setIsLoading(true); // Set loading true before fetching
    try {
      await Promise.all([
        loadSiteSettings(),
        loadProducts(),
        loadOrders(),
        loadCategories(),
        // loadWorkshops(), // Workshops loading is now handled by WorkshopSettings component
      ]);
    } catch (error) {
        console.error("Error loading all data:", error);
        toast.error("שגיאה בטעינת הנתונים");
    } finally {
        setIsLoading(false); // Set loading false after fetching
    }
  };

  const loadSiteSettings = async () => {
    try {
      const settings = await SiteSettings.list();
      if (settings.length > 0) {
        setSiteSettings(settings[0]);
      } else {
        // If no settings exist, initialize with a default structure including page_media and new self-pickup fields
        setSiteSettings({
          site_name: '',
          site_name_en: '',
          logo_url: '',
          favicon_url: '',
          top_bar_text: '',
          top_bar_text_en: '',
          shipping_cost: 0,
          free_shipping_threshold: 0,
          order_notification_email: '',
          enable_gold_plating: false,
          gold_plating_price: 0,
          enable_self_pickup: false,
          self_pickup_text: '',
          self_pickup_text_en: '',
          hero_image_url: '',
          hero_image_url_2: '',
          hero_image_url_3: '',
          hero_title: '',
          hero_title_en: '',
          hero_subtitle: '',
          hero_subtitle_en: '',
          home_feature_1_title: '',
          home_feature_1_title_en: '',
          home_feature_1_desc: '',
          home_feature_1_desc_en: '',
          home_feature_2_title: '',
          home_feature_2_title_en: '',
          home_feature_2_desc: '',
          home_feature_2_desc_en: '',
          home_feature_3_title: '',
          home_feature_3_title_en: '',
          home_feature_3_desc: '',
          home_feature_3_desc_en: '',
          home_categories_title: '',
          home_categories_title_en: '',
          home_categories_subtitle: '',
          home_categories_subtitle_en: '',
          home_featured_title: '',
          home_featured_title_en: '',
          home_featured_subtitle: '',
          home_featured_subtitle_en: '',
          home_featured_button_text: '',
          home_featured_button_text_en: '',
          products_page_title: '',
          products_page_title_en: '',
          products_page_subtitle: '',
          products_page_subtitle_en: '',
          primary_color: '#D4AF37',
          secondary_color: '#B8860B',
          accent_color: '#F5E6A8',
          background_color: '#FDF6E3',
          text_color: '#2D1810',
          testimonial_star_color: '#D4AF37',
          top_bar_text_color: '#FFFFFF',
          homepage_price_color: '#B8860B',
          logo_height_desktop: 80,
          logo_height_mobile: 64,
          font_family_hebrew_desktop: 'Amatic SC',
          font_family_english_desktop: 'Barlow Condensed',
          font_size_hebrew_desktop: 'default',
          font_size_english_desktop: 'default',
          font_family_hebrew_mobile: 'Amatic SC',
          font_family_english_mobile: 'Barlow Condensed',
          font_size_hebrew_mobile: 'default',
          font_size_english_mobile: 'default',
          faq_title: '',
          faq_title_en: '',
          faq_subtitle: '',
          faq_subtitle_en: '',
          workshops_page_title: '', // NEW
          workshops_page_title_en: '', // NEW
          workshops_page_subtitle: '', // NEW
          workshops_page_subtitle_en: '', // NEW
          page_media: {
            home: [],
            about: [],
            personal_workshops: [],
            corporate_lectures: [],
            testimonials: [],
            blog: [],
            contact: []
          }
        });
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const allProducts = await Product.list("-created_date");
      setProducts(allProducts);
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const allOrders = await Order.list("-created_date");
      setOrders(allOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrdersError('שגיאה בטעינת ההזמנות. אנא נסה שוב.');
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const refreshOrders = () => {
    loadOrders();
  };

  const loadCategories = async () => {
    try {
      const allCategories = await Category.list("order");
      setCategories(allCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const saveSiteSettings = async () => {
    setIsSaving(true);
    try {
      // Define page media defaults
      const pageMediaDefaults = {
        home: [],
        about: [],
        personal_workshops: [],
        corporate_lectures: [],
        testimonials: [],
        blog: [],
        contact: []
      };

      let settingsToSave = { ...siteSettings };

      if (siteSettings.id) {
        // For existing settings, merge current page_media with defaults
        const currentPageMedia = siteSettings?.page_media || {};
        const mergedPageMedia = { ...pageMediaDefaults };
        for (const key in currentPageMedia) {
            if (Object.prototype.hasOwnProperty.call(currentPageMedia, key)) {
                mergedPageMedia[key] = currentPageMedia[key];
            }
        }
        settingsToSave = {
            ...siteSettings,
            page_media: mergedPageMedia
        };
        await SiteSettings.update(siteSettings.id, settingsToSave);
      } else {
        // For new settings, ensure page_media is initialized with defaults before creation
        settingsToSave = {
            ...siteSettings,
            page_media: pageMediaDefaults // Initialize with all defaults for new settings
        };
        await SiteSettings.create(settingsToSave);
      }
      toast.success('הגדרות נשמרו בהצלחה!');
      await loadSiteSettings(); // Reload to get the latest state including page_media and ID if newly created
    } catch (error) {
      toast.error('שגיאה בשמירת ההגדרות');
      console.error('Error saving site settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Function to handle media upload for a specific page
  const handleMediaUpload = async (pageName, file) => {
    if (!file) return;

    try {
      // Use UploadFile directly, as MediaUploader is now a component
      const { file_url } = await UploadFile({ file });
      
      const currentPageMedia = siteSettings?.page_media || {};
      const pageMedia = currentPageMedia[pageName] || [];
      
      const newMediaItem = {
        type: file.type.startsWith('video/') ? 'video' : 'image',
        file_url: file_url,
        alt_he: '',
        alt_en: '',
        order_index: pageMedia.length
      };

      const updatedPageMedia = {
        ...currentPageMedia,
        [pageName]: [...pageMedia, newMediaItem]
      };

      setSiteSettings(prev => ({
        ...prev,
        page_media: updatedPageMedia
      }));

      toast.success('קובץ הועלה בהצלחה');
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('שגיאה בהעלאת הקובץ');
    }
  };

  // Function to remove media item
  const handleRemoveMediaItem = (pageName, itemIndex) => {
    const currentPageMedia = siteSettings?.page_media || {};
    const pageMedia = currentPageMedia[pageName] || [];
    
    const updatedPageMedia = {
      ...currentPageMedia,
      [pageName]: pageMedia.filter((_, index) => index !== itemIndex)
    };

    setSiteSettings(prev => ({
      ...prev,
      page_media: updatedPageMedia
    }));
    toast.success('קובץ הוסר בהצלחה');
  };

  const handleInputChange = (field, value) => {
    setSiteSettings(prevSettings => ({ ...prevSettings, [field]: value }));
  };

  const handleSave = async () => {
    await saveSiteSettings();
  };

  const handleProductSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await Product.update(editingProduct.id, productData);
        toast.success('מוצר עודכן בהצלחה!');
      } else {
        await Product.create(productData);
        toast.success('מוצר נוסף בהצלחה!');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (error) {
      toast.error('שגיאה בשמירת המוצר');
      console.error('Error saving product:', error);
    }
  };

  const deleteProduct = async (productId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק מוצר זה?')) {
      try {
        await Product.delete(productId);
        toast.success('מוצר נמחק בהצלחה!');
        await loadProducts();
      } catch (error) {
        toast.error('שגיאה במחיקת המוצר');
        console.error('Error deleting product:', error);
      }
    }
  };

  // Restored/Modified Order Management functions - Renamed to match outline
  const deleteOrder = async (orderId) => { // Renamed from handleDeleteOrder
    if (window.confirm('האם את בטוחה שברצונך למחוק את ההזמנה? לא ניתן לשחזר פעולה זו.')) {
      try {
        await Order.delete(orderId);
        toast.success('ההזמנה נמחקה בהצלחה');
        loadOrders(); // Refresh orders data
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error('שגיאה במחיקת ההזמנה');
      }
    }
  };

  const handleDeleteAllOrders = async () => {
    if (window.confirm('האם את בטוחה שברצונך למחוק את כל ההזמנות? פעולה זו בלתי הפיכה!')) {
      if (window.confirm('זו פעולה חמורה! האם את באמת בטוחה?')) {
        try {
          await Promise.all(orders.map(order => Order.delete(order.id)));
          toast.success('כל ההזמנות נמחקו בהצלחה');
          loadOrders(); // Refresh orders data
        } catch (error) {
          console.error("Error deleting all orders:", error);
          toast.error('שגיאה במחיקת ההזמנות');
        }
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => { // Renamed from handleStatusUpdate
    try {
      await Order.update(orderId, { status: newStatus });
      toast.success('סטטוס ההזמנה עודכן בהצלחה');
      loadOrders(); // Refresh orders data
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error('שגיאה בעדכון סטטוס ההזמנה');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'הוזמן';
      case 'paid': return 'שולם';
      case 'processing': return 'מוכן';
      case 'shipped': return 'נשלח';
      case 'delivered': return 'נמסר';
      case 'cancelled': return 'בוטל';
      default: return status;
    }
  };
  // End of Restored/Modified Order Management functions


  // New function for updating product stock
  const handleStockUpdate = async (productId, newStock) => {
    try {
      const stockValue = parseInt(newStock, 10);
      if (isNaN(stockValue) || stockValue < 0) {
        toast.error('כמות מלאי לא תקינה. אנא הכנס מספר חיובי.');
        return;
      }
      await Product.update(productId, { stock_quantity: stockValue });
      toast.success('מלאי עודכן בהצלחה');
      await loadProducts(); // Refresh products data only
    } catch (error) {
      toast.error('שגיאה בעדכון המלאי');
      console.error("Error updating stock:", error);
    }
  };

  // New functions for categories
  const handleCategorySubmit = async (categoryData) => {
    try {
      if (editingCategory) {
        await Category.update(editingCategory.id, categoryData);
        toast.success('קטגוריה עודכנה בהצלחה!');
      } else {
        await Category.create(categoryData);
        toast.success('קטגוריה נוספה בהצלחה!');
      }
      setShowCategoryForm(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      toast.error('שגיאה בשמירת הקטגוריה');
      console.error('Error saving category:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) {
      try {
        await Category.delete(categoryId);
        toast.success('קטגוריה נמחקה בהצלחה!');
        await loadCategories();
      } catch (error) {
        toast.error('שגיאה במחיקת הקטגוריה');
        console.error('Error deleting category:', error);
      }
    }
  };

  const filteredOrders = useMemo(() => {
    if (ordersFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === ordersFilter);
  }, [orders, ordersFilter]);


  if (isLoading && !orders.length && !products.length && !categories.length && Object.keys(siteSettings).length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 py-4 md:py-8"
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 mb-4 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">מרכז בקרה</h1>
          <p className="text-sm md:text-base text-gray-600">ניהול האתר והמוצרים</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto -mx-2 px-2">
            <TabsList className="inline-flex flex-nowrap md:grid md:grid-cols-5 lg:grid-cols-9 gap-1 md:gap-2 p-1 md:p-2 min-w-max md:min-w-0 md:w-full">
              <TabsTrigger value="siteSettings" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><Settings className="w-3 h-3 md:w-4 md:h-4" /> <span>הגדרות</span></TabsTrigger>
              <TabsTrigger value="products" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><ShoppingCart className="w-3 h-3 md:w-4 md:h-4" /> <span>מוצרים</span></TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><ListOrdered className="w-3 h-3 md:w-4 md:h-4" /> <span>הזמנות</span></TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><Package className="w-3 h-3 md:w-4 md:h-4" /> <span>מלאי</span></TabsTrigger>
              <TabsTrigger value="coupons" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><Percent className="w-3 h-3 md:w-4 md:h-4" /> <span>קופונים</span></TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><FileText className="w-3 h-3 md:w-4 md:h-4" /> <span>קטגוריות</span></TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><HelpCircle className="w-3 h-3 md:w-4 md:h-4" /> <span>שאלות</span></TabsTrigger>
              <TabsTrigger value="workshop" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><CalendarDays className="w-3 h-3 md:w-4 md:h-4" /> <span>סדנאות</span></TabsTrigger>
              <TabsTrigger value="sales" className="flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm px-2 md:px-4 py-1.5 md:py-3 whitespace-nowrap"><Tag className="w-3 h-3 md:w-4 md:h-4" /> <span>מבצעים</span></TabsTrigger>
            </TabsList>
          </div>

          {/* הגדרות כלליות */}
          <TabsContent value="siteSettings" className="space-y-8">
            <SettingsSection title="הגדרות כלליות">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>שם האתר (עברית)</Label>
                  <Input
                    value={siteSettings?.site_name || ''}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="אנג'י תכשיטים"
                  />
                </div>
                <div>
                  <Label>שם האתר (אנגלית)</Label>
                  <Input
                    value={siteSettings?.site_name_en || ''}
                    onChange={(e) => handleInputChange('site_name_en', e.target.value)}
                    placeholder="Engee Jewelry"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>לוגו האתר</Label>
                  <MediaUploader
                    label="logo_url"
                    onFileSelect={(url) => handleInputChange('logo_url', url)}
                    currentUrl={siteSettings?.logo_url}
                    accept="image/*"
                  />
                </div>
                <div>
                  <Label>Favicon</Label>
                  <MediaUploader
                    label="favicon_url"
                    onFileSelect={(url) => handleInputChange('favicon_url', url)}
                    currentUrl={siteSettings?.favicon_url}
                    accept="image/*"
                  />
                </div>
              </div>
            </SettingsSection>

            {/* הגדרות הבאנר העליון */}
            <SettingsSection title="הגדרות הבאנר העליון">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>טקסט הבאנר העליון (עברית)</Label>
                  <Input
                    value={siteSettings?.top_bar_text || ''}
                    onChange={(e) => handleInputChange('top_bar_text', e.target.value)}
                    placeholder="תכשיטי כסף 925 בעבודת יד | משלוח חינם בהזמנה מעל 499₪"
                  />
                </div>
                <div>
                  <Label>טקסט הבאנר העליון (אנגלית)</Label>
                  <Input
                    value={siteSettings?.top_bar_text_en || ''}
                    onChange={(e) => handleInputChange('top_bar_text_en', e.target.value)}
                    placeholder="925 Silver Jewelry Handmade | Free Shipping Over 499₪"
                  />
                </div>
              </div>

              <div>
                <Label>צבע טקסט הבאנר העליון</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={siteSettings?.top_bar_text_color || '#FFFFFF'}
                    onChange={(e) => handleInputChange('top_bar_text_color', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={siteSettings?.top_bar_text_color || '#FFFFFF'}
                    onChange={(e) => handleInputChange('top_bar_text_color', e.target.value)}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </SettingsSection>

            {/* הגדרות משלוח והתראות */}
            <SettingsSection title="הגדרות משלוח">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>עלות משלוח רגיל (₪)</Label>
                  <Input
                    type="number"
                    value={siteSettings?.shipping_cost ?? 30}
                    onChange={(e) => handleInputChange('shipping_cost', parseFloat(e.target.value) || 0)}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label>סכום מינימלי למשלוח חינם (₪)</Label>
                  <Input
                    type="number"
                    value={siteSettings?.free_shipping_threshold ?? 250}
                    onChange={(e) => handleInputChange('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                    placeholder="250"
                  />
                </div>
                <div>
                  <Label>אימייל התראות הזמנות</Label>
                  <Input
                    type="email"
                    value={siteSettings?.order_notification_email || ''}
                    onChange={(e) => handleInputChange('order_notification_email', e.target.value)}
                    placeholder="owner@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">זו הכתובת שתקבל את המיילים על כל הזמנה חדשה.</p>
                </div>
              </div>

              <Separator className="my-4" />
              <h3 className="text-lg font-medium text-gray-800">הגדרות איסוף עצמי</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable_self_pickup"
                    checked={siteSettings?.enable_self_pickup || false}
                    onChange={(e) => handleInputChange('enable_self_pickup', e.target.checked)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="enable_self_pickup">הפעלת אפשרות איסוף עצמי</Label>
                </div>

                {siteSettings?.enable_self_pickup && (
                  <>
                    <div>
                      <Label>טקסט איסוף עצמי (עברית)</Label>
                      <Input
                        value={siteSettings?.self_pickup_text || "איסוף עצמי מכפר האורנים (בתיאום מראש)"}
                        onChange={(e) => handleInputChange('self_pickup_text', e.target.value)}
                        placeholder="איסוף עצמי מכפר האורנים (בתיאום מראש)"
                      />
                    </div>
                    <div>
                      <Label>טקסט איסוף עצמי (אנגלית)</Label>
                      <Input
                        value={siteSettings?.self_pickup_text_en || "Self pickup from Kfar HaOranim (by appointment)"}
                        onChange={(e) => handleInputChange('self_pickup_text_en', e.target.value)}
                        placeholder="Self pickup from Kfar HaOranim (by appointment)"
                      />
                    </div>
                  </>
                )}
              </div>
              {/* ספק סליקה */}
              <Separator className="my-4" />
              <h3 className="text-lg font-medium text-gray-800">ספק סליקה</h3>
              <div>
                <Label>בחירת ספק סליקה</Label>
                <Select
                  value={siteSettings?.takbull_mode || 'off'}
                  onValueChange={(value) => handleInputChange('takbull_mode', value)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Cardcom (כרגיל)</SelectItem>
                    <SelectItem value="test">תקבול – מצב בדיקה (רק אדמין, חיוב 1 ₪)</SelectItem>
                    <SelectItem value="live">תקבול – פעיל לכל הלקוחות</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">במצב בדיקה רק משתמש אדמין מחובר עובר לתקבול. כל השאר ממשיכים ב-Cardcom.</p>
              </div>
            </SettingsSection>
            
            {/* הגדרות ציפוי זהב */}
            <Card>
              <CardHeader>
                <CardTitle>הגדרות ציפוי זהב</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.enable_gold_plating || false}
                      onChange={(e) => setSiteSettings({...siteSettings, enable_gold_plating: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="text-lg font-medium">
                      הפעלת אופציית ציפוי זהב במוצרים
                    </span>
                  </label>
                </div>
                
                <div>
                  <Label htmlFor="gold_plating_price">מחיר תוספת לציפוי זהב (₪)</Label>
                  <Input
                    id="gold_plating_price"
                    type="number"
                    value={siteSettings.gold_plating_price === undefined ? '' : siteSettings.gold_plating_price}
                    onChange={(e) => setSiteSettings({...siteSettings, gold_plating_price: e.target.value === '' ? undefined : parseInt(e.target.value, 10)})}
                    placeholder="100"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הגדרות דף הבית</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MediaUploader
                  label="תמונה או סרטון רקע דף הבית #1"
                  onFileSelect={(url) => handleInputChange('hero_image_url', url)}
                  currentUrl={siteSettings?.hero_image_url}
                  accept="image/*,video/*"
                />

                <MediaUploader
                  label="תמונה או סרטון רקע דף הבית #2"
                  onFileSelect={(url) => handleInputChange('hero_image_url_2', url)}
                  currentUrl={siteSettings?.hero_image_url_2}
                  accept="image/*,video/*"
                />

                <MediaUploader
                  label="תמונה או סרטון רקע דף הבית #3"
                  onFileSelect={(url) => handleInputChange('hero_image_url_3', url)}
                  currentUrl={siteSettings?.hero_image_url_3}
                  accept="image/*,video/*"
                />

                <MediaUploader
                  label="תמונה או סרטון רקע דף הבית #4"
                  onFileSelect={(url) => handleInputChange('hero_image_url_4', url)}
                  currentUrl={siteSettings?.hero_image_url_4}
                  accept="image/*,video/*"
                />

                <MediaUploader
                  label="תמונה או סרטון רקע דף הבית #5"
                  onFileSelect={(url) => handleInputChange('hero_image_url_5', url)}
                  currentUrl={siteSettings?.hero_image_url_5}
                  accept="image/*,video/*"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>כותרת ראשית דף הבית (עברית)</Label>
                    <Input
                      value={siteSettings.hero_title || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, hero_title: e.target.value})}
                      placeholder="תכשיטי כסף בעבודת יד"
                    />
                  </div>
                  <div>
                    <Label>כותרת ראשית דף הבית (אנגלית)</Label>
                    <Input
                      value={siteSettings.hero_title_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, hero_title_en: e.target.value})}
                      placeholder="Handmade silver jewelry"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>תת-כותרת דף הבית (עברית)</Label>
                    <Textarea
                      value={siteSettings.hero_subtitle || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, hero_subtitle: e.target.value})}
                      placeholder="גלו את הקולקציה המיוחדת שלנו"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>תת-כותרת דף הבית (אנגלית)</Label>
                    <Textarea
                      value={siteSettings.hero_subtitle_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, hero_subtitle_en: e.target.value})}
                      placeholder="Discover our unique collection"
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* מאפיינים דף הבית */}
                <h4 className="font-semibold text-lg">מאפיינים (3 הקוביות)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>מאפיין 1 - כותרת (עברית)</Label>
                    <Input
                      value={siteSettings.home_feature_1_title || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_1_title: e.target.value})}
                      placeholder="איכות מובטחת"
                    />
                  </div>
                  <div>
                    <Label>מאפיין 1 - כותרת (אנגלית)</Label>
                    <Input
                      value={siteSettings.home_feature_1_title_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_1_title_en: e.target.value})}
                      placeholder="Quality Guaranteed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>מאפיין 1 - תיאור (עברית)</Label>
                    <Textarea
                      value={siteSettings.home_feature_1_desc || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_1_desc: e.target.value})}
                      placeholder="כל מוצר עובר בדיקה קפדנית"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>מאפיין 1 - תיאור (אנגלית)</Label>
                    <Textarea
                      value={siteSettings.home_feature_1_desc_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_1_desc_en: e.target.value})}
                      placeholder="Every product undergoes careful inspection"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>מאפיין 2 - כותרת (עברית)</Label>
                    <Input
                      value={siteSettings.home_feature_2_title || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_2_title: e.target.value})}
                      placeholder="משלוח מהיר"
                    />
                  </div>
                  <div>
                    <Label>מאפיין 2 - כותרת (אנגלית)</Label>
                    <Input
                      value={siteSettings.home_feature_2_title_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_2_title_en: e.target.value})}
                      placeholder="Fast Shipping"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>מאפיין 2 - תיאור (עברית)</Label>
                    <Textarea
                      value={siteSettings.home_feature_2_desc || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_2_desc: e.target.value})}
                      placeholder="משלוח חינם בארץ על הזמנות מעל 200 ש״ח"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>מאפיין 2 - תיאור (אנגלית)</Label>
                    <Textarea
                      value={siteSettings.home_feature_2_desc_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_2_desc_en: e.target.value})}
                      placeholder="Free shipping in Israel on orders over 200 NIS"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>מאפיין 3 - כותרת (עברית)</Label>
                    <Input
                      value={siteSettings.home_feature_3_title || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_3_title: e.target.value})}
                      placeholder="יצירה בעבודת יד"
                    />
                  </div>
                  <div>
                    <Label>מאפיין 3 - כותרת (אנגלית)</Label>
                    <Input
                      value={siteSettings.home_feature_3_title_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_3_title_en: e.target.value})}
                      placeholder="Handmade Creation"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>מאפיין 3 - תיאור (עברית)</Label>
                    <Textarea
                      value={siteSettings.home_feature_3_desc || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_3_desc: e.target.value})}
                      placeholder="כל תכשיט נוצר באהבה ובקפידה"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>מאפיין 3 - תיאור (אנגלית)</Label>
                    <Textarea
                      value={siteSettings.home_feature_3_desc_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_feature_3_desc_en: e.target.value})}
                      placeholder="Every piece is created with love and care"
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                {/* קטגוריות דף הבית */}
                <h4 className="font-semibold text-lg">קטגוריות דף הבית</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>כותרת קטגוריות (עברית)</Label>
                    <Input
                      value={siteSettings.home_categories_title || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_categories_title: e.target.value})}
                      placeholder="הקטגוריות שלנו"
                    />
                  </div>
                  <div>
                    <Label>כותרת קטגוריות (אנגלית)</Label>
                    <Input
                      value={siteSettings.home_categories_title_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_categories_title_en: e.target.value})}
                      placeholder="Our Categories"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>תת-כותרת קטגוריות (עברית)</Label>
                    <Textarea
                      value={siteSettings.home_categories_subtitle || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_categories_subtitle: e.target.value})}
                      placeholder="גלו את מגוון התכשיטים המיוחדים שלנו"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>תת-כותרת קטגוריות (אנגלית)</Label>
                    <Textarea
                      value={siteSettings.home_categories_subtitle_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_categories_subtitle_en: e.target.value})}
                      placeholder="Discover our range of unique jewelry"
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                {/* מוצרים מומלצים דף הבית */}
                <h4 className="font-semibold text-lg">מוצרים מומלצים דף הבית</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>כותרת מוצרים מומלצים (עברית)</Label>
                    <Input
                      value={siteSettings.home_featured_title || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_featured_title: e.target.value})}
                      placeholder="המוצרים המומלצים שלנו"
                    />
                  </div>
                  <div>
                    <Label>כותרת מוצרים מומלצים (אנגלית)</Label>
                    <Input
                      value={siteSettings.home_featured_title_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_featured_title_en: e.target.value})}
                      placeholder="Our Featured Products"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>תת-כותרת מוצרים מומלצים (עברית)</Label>
                    <Textarea
                      value={siteSettings.home_featured_subtitle || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_featured_subtitle: e.target.value})}
                      placeholder="תכשיטים נבחרים מהקולקציה שלנו"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>תת-כותרת מוצרים מומלצים (אנגלית)</Label>
                    <Textarea
                      value={siteSettings.home_featured_subtitle_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_featured_subtitle_en: e.target.value})}
                      placeholder="Selected pieces from our collection"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>טקסט כפתור מוצרים מומלצים (עברית)</Label>
                    <Input
                      value={siteSettings.home_featured_button_text || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_featured_button_text: e.target.value})}
                      placeholder="צפו בכל המוצרים"
                    />
                  </div>
                  <div>
                    <Label>טקסט כפתור מוצרים מומלצים (אנגלית)</Label>
                    <Input
                      value={siteSettings.home_featured_button_text_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, home_featured_button_text_en: e.target.value})}
                      placeholder="View All Products"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הגדרות עמוד המוצרים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>כותרת עמוד המוצרים (עברית)</Label>
                    <Input
                      value={siteSettings.products_page_title || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, products_page_title: e.target.value})}
                      placeholder="הקולקציה שלנו"
                    />
                  </div>
                  <div>
                    <Label>כותרת עמוד המוצרים (אנגלית)</Label>
                    <Input
                      value={siteSettings.products_page_title_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, products_page_title_en: e.target.value})}
                      placeholder="Our Collection"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>תת-כותרת עמוד המוצרים (עברית)</Label>
                    <Textarea
                      value={siteSettings.products_page_subtitle || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, products_page_subtitle: e.target.value})}
                      placeholder="גלו את מגוון התכשיטים המיוחדים שלנו"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>תת-כותרת עמוד המוצרים (אנגלית)</Label>
                    <Textarea
                      value={siteSettings.products_page_subtitle_en || ''}
                      onChange={(e) => setSiteSettings({...siteSettings, products_page_subtitle_en: e.target.value})}
                      placeholder="Discover our unique jewelry collection"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* NEW: Settings for Workshops Page */}
            <Card>
              <CardHeader>
                <CardTitle>הגדרות עמוד הסדנאות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputRow
                    label="כותרת עמוד הסדנאות (עברית)"
                    value={siteSettings.workshops_page_title || ''}
                    onChange={(e) => handleInputChange('workshops_page_title', e.target.value)}
                    placeholder="הסדנאות שלנו"
                  />
                  <InputRow
                    label="כותרת עמוד הסדנאות (אנגלית)"
                    value={siteSettings.workshops_page_title_en || ''}
                    onChange={(e) => handleInputChange('workshops_page_title_en', e.target.value)}
                    placeholder="Our Workshops"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextareaRow
                    label="תת-כותרת עמוד הסדנאות (עברית)"
                    value={siteSettings.workshops_page_subtitle || ''}
                    onChange={(e) => handleInputChange('workshops_page_subtitle', e.target.value)}
                    placeholder="בואו ללמוד ליצור תכשיטים בעצמכם!"
                    rows={2}
                  />
                  <TextareaRow
                    label="תת-כותרת עמוד הסדנאות (אנגלית)"
                    value={siteSettings.workshops_page_subtitle_en || ''}
                    onChange={(e) => handleInputChange('workshops_page_subtitle_en', e.target.value)}
                    placeholder="Come and learn to create your own jewelry!"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* עיצוב ופונטים */}
          <TabsContent value="design" className="space-y-6">
            {/* צבעים */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  צבעי האתר
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>צבע ראשי (זהוב)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={siteSettings.primary_color || '#D4AF37'}
                        onChange={(e) => setSiteSettings({...siteSettings, primary_color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.primary_color || '#D4AF37'}
                        onChange={(e) => setSiteSettings({...siteSettings, primary_color: e.target.value})}
                        placeholder="#D4AF37"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>צבע משני (כפתורים)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={siteSettings.secondary_color || '#B8860B'}
                        onChange={(e) => setSiteSettings({...siteSettings, secondary_color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.secondary_color || '#B8860B'}
                        onChange={(e) => setSiteSettings({...siteSettings, secondary_color: e.target.value})}
                        placeholder="#B8860B"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>צבע הדגשה (בהיר)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={siteSettings.accent_color || '#F5E6A8'}
                        onChange={(e) => setSiteSettings({...siteSettings, accent_color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.accent_color || '#F5E6A8'}
                        onChange={(e) => setSiteSettings({...siteSettings, accent_color: e.target.value})}
                        placeholder="#F5E6A8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>צבע רקע</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={siteSettings.background_color || '#FDF6E3'}
                        onChange={(e) => setSiteSettings({...siteSettings, background_color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.background_color || '#FDF6E3'}
                        onChange={(e) => setSiteSettings({...siteSettings, background_color: e.target.value})}
                        placeholder="#FDF6E3"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>צבע טקסט ראשי</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={siteSettings.text_color || '#2D1810'}
                        onChange={(e) => setSiteSettings({...siteSettings, text_color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.text_color || '#2D1810'}
                        onChange={(e) => setSiteSettings({...siteSettings, text_color: e.target.value})}
                        placeholder="#2D1810"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>צבע כוכבים (המלצות)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={siteSettings.testimonial_star_color || '#D4AF37'}
                        onChange={(e) => setSiteSettings({...siteSettings, testimonial_star_color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.testimonial_star_color || '#D4AF37'}
                        onChange={(e) => setSiteSettings({...siteSettings, testimonial_star_color: e.target.value})}
                        placeholder="#D4AF37"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>צבע טקסט למחירים (דף הבית)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={siteSettings.homepage_price_color || '#B8860B'}
                        onChange={(e) => setSiteSettings({...siteSettings, homepage_price_color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={siteSettings.homepage_price_color || ''}
                        onChange={(e) => setSiteSettings({...siteSettings, homepage_price_color: e.target.value})}
                        placeholder="#B8860B"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* פונטים ולוגו */}
            <SettingsSection title="הגדרות פונטים ולוגו">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>גובה לוגו - דסקטופ (px)</Label>
                  <Input
                    type="number"
                    value={siteSettings?.logo_height_desktop ?? 80}
                    onChange={(e) => handleInputChange('logo_height_desktop', e.target.value)}
                  />
                </div>
                <div>
                  <Label>גובה לוגו - מובייל (px)</Label>
                  <Input
                    type="number"
                    value={siteSettings?.logo_height_mobile ?? 64}
                    onChange={(e) => handleInputChange('logo_height_mobile', e.target.value)}
                  />
                </div>
              </div>

              <Separator className="my-4" />
              <h3 className="text-lg font-medium text-gray-800">הגדרות גופנים (דסקטופ)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>משפחת גופן - עברית</Label>
                  <Select
                    value={siteSettings?.font_family_hebrew_desktop || 'Amatic SC'}
                    onValueChange={(value) => handleInputChange('font_family_hebrew_desktop', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amatic SC">Amatic SC</SelectItem>
                      <SelectItem value="Barlow Condensed">Barlow Condensed</SelectItem>
                      <SelectItem value="Truculenta">Truculenta</SelectItem>
                      <SelectItem value="Dina">דינה</SelectItem>
                      <SelectItem value="Yarden">ירדן</SelectItem>
                      <SelectItem value="Karantina">Karantina</SelectItem>
                      <SelectItem value="Varela Round">Varela Round</SelectItem>
                      <SelectItem value="Heebo">Heebo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>משפחת גופן - אנגלית</Label>
                  <Select
                    value={siteSettings?.font_family_english_desktop || 'Barlow Condensed'}
                    onValueChange={(value) => handleInputChange('font_family_english_desktop', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amatic SC">Amatic SC</SelectItem>
                      <SelectItem value="Barlow Condensed">Barlow Condensed</SelectItem>
                      <SelectItem value="Truculenta">Truculenta</SelectItem>
                      <SelectItem value="Heebo">Heebo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>גודל גופן - עברית</Label>
                  <Select
                    value={siteSettings?.font_size_hebrew_desktop || 'default'}
                    onValueChange={(value) => handleInputChange('font_size_hebrew_desktop', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">קטן</SelectItem>
                      <SelectItem value="default">רגיל</SelectItem>
                      <SelectItem value="large">גדול</SelectItem>
                      <SelectItem value="extra_large">גדול מאוד</SelectItem>
                      <SelectItem value="huge">ענק</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>גודל גופן - אנגלית</Label>
                  <Select
                    value={siteSettings?.font_size_english_desktop || 'default'}
                    onValueChange={(value) => handleInputChange('font_size_english_desktop', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra_large">Extra Large</SelectItem>
                      <SelectItem value="huge">Huge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-4" />
              <h3 className="text-lg font-medium text-gray-800">הגדרות גופנים (מובייל)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>משפחת גופן - עברית</Label>
                  <Select
                    value={siteSettings?.font_family_hebrew_mobile || 'Amatic SC'}
                    onValueChange={(value) => handleInputChange('font_family_hebrew_mobile', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amatic SC">Amatic SC</SelectItem>
                      <SelectItem value="Barlow Condensed">Barlow Condensed</SelectItem>
                      <SelectItem value="Truculenta">Truculenta</SelectItem>
                      <SelectItem value="Dina">דינה</SelectItem>
                      <SelectItem value="Yarden">ירדן</SelectItem>
                      <SelectItem value="Karantina">Karantina</SelectItem>
                      <SelectItem value="Varela Round">Varela Round</SelectItem>
                      <SelectItem value="Heebo">Heebo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>משפחת גופן - אנגלית</Label>
                  <Select
                    value={siteSettings?.font_family_english_mobile || 'Barlow Condensed'}
                    onValueChange={(value) => handleInputChange('font_family_english_mobile', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amatic SC">Amatic SC</SelectItem>
                      <SelectItem value="Barlow Condensed">Barlow Condensed</SelectItem>
                      <SelectItem value="Truculenta">Truculenta</SelectItem>
                      <SelectItem value="Heebo">Heebo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>גודל גופן - עברית</Label>
                  <Select
                    value={siteSettings?.font_size_hebrew_mobile || 'default'}
                    onValueChange={(value) => handleInputChange('font_size_hebrew_mobile', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">קטן</SelectItem>
                      <SelectItem value="default">רגיל</SelectItem>
                      <SelectItem value="large">גדול</SelectItem>
                      <SelectItem value="extra_large">גדול מאוד</SelectItem>
                      <SelectItem value="huge">ענק</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>גודל גופן - אנגלית</Label>
                  <Select
                    value={siteSettings?.font_size_english_mobile || 'default'}
                    onValueChange={(value) => handleInputChange('font_size_english_mobile', value)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra_large">Extra Large</SelectItem>
                      <SelectItem value="huge">Huge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SettingsSection>
          </TabsContent>

          {/* שאלות ותשובות */}
          <TabsContent value="faq" className="space-y-8">
            <SettingsSection title="הגדרות כלליות - שאלות ותשובות">
              <InputRow
                label="כותרת ראשית (עברית)"
                value={siteSettings.faq_title || ''}
                onChange={(e) => handleInputChange('faq_title', e.target.value)}
                placeholder="שאלות ותשובות"
              />
              <InputRow
                label="כותרת ראשית (אנגלית)"
                value={siteSettings.faq_title_en || ''}
                onChange={(e) => handleInputChange('faq_title_en', e.target.value)}
                placeholder="Frequently Asked Questions"
              />
              <TextareaRow
                label="תת-כותרת (עברית)"
                value={siteSettings.faq_subtitle || ''}
                onChange={(e) => handleInputChange('faq_subtitle', e.target.value)}
                placeholder="תשובות לשאלות הנפוצות ביותר"
              />
              <TextareaRow
                label="תת-כותרת (אנגלית)"
                value={siteSettings.faq_subtitle_en || ''}
                onChange={(e) => handleInputChange('faq_subtitle_en', e.target.value)}
                placeholder="Answers to the most common questions"
              />
            </SettingsSection>

            {/* שאלות ותשובות */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <SettingsSection key={num} title={`שאלה ותשובה מספר ${num}`}>
                <TextareaRow
                  label="שאלה (עברית)"
                  value={siteSettings[`faq_question_${num}`] || ''}
                  onChange={(e) => handleInputChange(`faq_question_${num}`, e.target.value)}
                  placeholder={`הכניסי כאן את השאלה מספר ${num} בעברית`}
                />
                <TextareaRow
                  label="שאלה (אנגלית)"
                  value={siteSettings[`faq_question_${num}_en`] || ''}
                  onChange={(e) => handleInputChange(`faq_question_${num}_en`, e.target.value)}
                  placeholder={`Enter question ${num} in English here`}
                />
                <TextareaRow
                  label="תשובה (עברית)"
                  value={siteSettings[`faq_answer_${num}`] || ''}
                  onChange={(e) => handleInputChange(`faq_answer_${num}`, e.target.value)}
                  placeholder={`הכניסי כאן את התשובה מספר ${num} בעברית`}
                  rows={4}
                />
                <TextareaRow
                  label="תשובה (אנגלית)"
                  value={siteSettings[`faq_answer_${num}_en`] || ''}
                  onChange={(e) => handleInputChange(`faq_answer_${num}_en`, e.target.value)}
                  placeholder={`Enter answer ${num} in English here`}
                  rows={4}
                />
              </SettingsSection>
            ))}
          </TabsContent>

          {/* ניהול מלאי */}
          <TabsContent value="inventory" className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">ניהול מלאי</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-subtle">טוען מוצרים...</p>
              </div>
            ) : (
                products.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">שם המוצר</th>
                                    <th scope="col" className="px-6 py-3">מחיר</th>
                                    <th scope="col" className="px-6 py-3">מלאי נוכחי</th>
                                    <th scope="col" className="px-6 py-3">סטטוס</th>
                                    <th scope="col" className="px-6 py-3">עדכון מלאי</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                        <td className="px-6 py-4">₪{product.price?.toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold">
                                            {product.stock_quantity ?? 100}
                                        </td>
                                        <td className="px-6 py-4">
                                            {(product.stock_quantity ?? 100) <= 0 ? (
                                                <Badge variant="destructive">אזל מהמלאי</Badge>
                                            ) : (
                                                <Badge variant="default" className="bg-green-100 text-green-800">זמין</Badge>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    defaultValue={product.stock_quantity ?? 100}
                                                    className="w-20"
                                                    onBlur={(e) => {
                                                        const newStock = e.target.value;
                                                        // Only update if value actually changed
                                                        if (parseInt(newStock, 10) !== (product.stock_quantity ?? 100)) {
                                                            handleStockUpdate(product.id, newStock);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => { // Allow Enter key to also trigger update
                                                        if (e.key === 'Enter') {
                                                            const newStock = e.target.value;
                                                            if (parseInt(newStock, 10) !== (product.stock_quantity ?? 100)) {
                                                                handleStockUpdate(product.id, newStock);
                                                            }
                                                            e.target.blur(); // Blur the input after pressing Enter
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">אין מוצרים לניהול מלאי.</p>
                )
            )}
          </TabsContent>

          {/* Orders Section */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-main">ניהול הזמנות</h2>
              <div className="flex gap-2">
                <select 
                  value={ordersFilter} 
                  onChange={(e) => setOrdersFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="all">כל ההזמנות</option>
                  <option value="pending">ממתינות לתשלום</option>
                  <option value="paid">שולמו</option>
                  <option value="processing">בהכנה</option>
                  <option value="shipped">נשלחו</option>
                  <option value="delivered">נמסרו</option>
                  <option value="cancelled">בוטלו</option>
                </select>
                <Button onClick={refreshOrders} variant="outline">
                  <RefreshCw className="w-4 h-4 ml-2" />
                  רענן
                </Button>
              </div>
            </div>

            {ordersError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{ordersError}</p>
              </div>
            )}

            {isLoadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">מספר הזמנה</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">שם הלקוחה</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">אימייל</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">טלפון</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פריטים</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">כתובת משלוח</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סכום כולל</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">סטטוס</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">תאריך</th>
                        <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">פעולות</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{order.order_number}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer_name}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.user_email}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer_phone}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 max-w-xs">
                            <div className="space-y-1">
                              {order.items?.map((item, index) => (
                                <div key={index} className="text-xs border-b border-gray-100 pb-1 last:border-b-0">
                                  <div className="font-medium">{item.product_name}</div>
                                  <div className="text-gray-600">
                                    כמות: {item.quantity}
                                    {item.size && ` | מידה: ${item.size}`}
                                    {item.gold_plating && (
                                      <span className="text-amber-600 font-medium"> | ציפוי זהב</span>
                                    )}
                                  </div>
                                  <div className="text-gray-800 font-medium">₪{(item.price * item.quantity).toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 max-w-xs">
                            {order.shipping_method === 'pickup' ? (
                              <span className="text-green-600 font-medium">איסוף עצמי</span>
                            ) : order.shipping_address ? (
                              <div className="text-xs">
                                <div>{order.shipping_address.street}</div>
                                <div>{order.shipping_address.city} {order.shipping_address.postal_code}</div>
                                <div>{order.shipping_address.country}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">לא צוין</span>
                            )}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₪{order.total_amount?.toLocaleString()}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                              className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(order.status)}`}
                            >
                              <SelectTrigger className="w-32">
                                  <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="pending">ממתין לתשלום</SelectItem>
                                  <SelectItem value="paid">שולם</SelectItem>
                                  <SelectItem value="processing">בהכנה</SelectItem>
                                  <SelectItem value="shipped">נשלח</SelectItem>
                                  <SelectItem value="delivered">נמסר</SelectItem>
                                  <SelectItem value="cancelled">בוטל</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(order.created_date).toLocaleDateString('he-IL')}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewingOrder(order)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm('האם אתה בטוח שברצונך למחוק הזמנה זו?')) {
                                    deleteOrder(order.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    אין הזמנות להצגה
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* מוצרים */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-main">ניהול מוצרים</h2>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setShowProductForm(true);
                }}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                הוסף מוצר חדש
              </Button>
            </div>

            {showProductForm && (
              <ProductForm
                product={editingProduct}
                onSubmit={handleProductSubmit}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
              />
            )}

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-main">{product.name}</h3>
                          <p className="text-sm text-subtle">₪{product.price?.toLocaleString()}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{product.category}</Badge>
                            {product.is_featured && (
                              <Badge className="bg-primary text-white">מומלץ</Badge>
                            )}
                             {(product.stock_quantity ?? 100) <= 0 && (
                              <Badge variant="destructive">אזל מהמלאי</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowProductForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* קופונים - NEW TAB CONTENT */}
          <TabsContent value="coupons" >
            <CouponsManager />
          </TabsContent>

          {/* קטגוריות */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-main">ניהול קטגוריות</h2>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(true);
                }}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                הוסף קטגוריה חדשה
              </Button>
            </div>

            {showCategoryForm && (
              <CategoryForm
                category={editingCategory}
                onSubmit={handleCategorySubmit}
                onCancel={() => {
                  setShowCategoryForm(false);
                  setEditingCategory(null);
                }}
              />
            )}

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-16 h-16 object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-accent/50 flex items-center justify-center rounded">
                            <FileText className="w-8 h-8 text-subtle" /> {/* Replaced Image with FileText for consistency/simplicity if no image */}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-main">{category.name}</h3>
                          <p className="text-sm text-subtle">Slug: {category.slug}</p>
                          <p className="text-sm text-subtle">סדר: {category.order || 0}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Workshops Section */}
          <TabsContent value="workshop">
            <WorkshopSettings 
              settings={siteSettings} 
              onUpdate={setSiteSettings}
            />
          </TabsContent>

          {/* Sales Section */}
          <TabsContent value="sales">
            <SaleManager products={products} />
          </TabsContent>
        </Tabs>
      </div>

      {/* כפתור שמירה - outside the conditional rendering blocks, but within the main div */}
      <div className="sticky bottom-2 md:bottom-4 flex justify-center mt-4 md:mt-8 px-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2 md:py-3 text-base md:text-lg font-semibold rounded-full shadow-lg w-full md:w-auto"
          >
            <Save className="w-4 h-4 md:w-5 md:h-5 ml-2" />
            {isSaving ? 'שומר...' : 'שמור שינויים'}
          </Button>
        </div>
    </div>
  );
}

// ProductForm and CategoryForm extracted to components/admin/ProductForm.jsx and components/admin/CategoryForm.jsx