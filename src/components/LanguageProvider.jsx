
import React, { createContext, useContext, useState, useEffect } from 'react';

// Language Context
const LanguageContext = createContext();

// Language Provider
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('he'); // Default to Hebrew

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
      document.documentElement.dir = savedLanguage === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
    } else {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'he';
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // Update document direction
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation object
export const translations = {
  he: {
    // Navigation
    home: "בית",
    products: "כל המוצרים",
    rings: "טבעות",
    necklaces: "שרשראות",
    earrings: "עגילים",
    bracelets: "צמידים",
    workshops: "סדנאות",
    wishlist: "רשימת משאלות",
    about: "אודותינו",
    contact: "צור קשר",
    cart: "סל קניות",
    login: "התחברות",
    logout: "התנתקות",
    admin: "מרכז בקרה",
    profile: "הפרופיל שלי",
    orders: "ההזמנות שלי",

    // General
    loading: "טוען...",
    search: "חיפוש מוצרים...",
    category: "קטגוריה",
    allCategories: "כל הקטגוריות",
    price: "מחיר",
    size: "מידה",
    quantity: "כמות",
    addToCart: "הוספה לסל",
    addingToCart: "מוסיף לסל...",
    addToWishlist: "הוספה לרשימת המשאלות",
    removeFromWishlist: "הסרה מרשימת המשאלות",
    viewProduct: "צפייה במוצר",
    backToCollection: "חזרה לקולקציה",
    noProductsFound: "לא נמצאו מוצרים",
    tryDifferentFilters: "נסו לשנות את קריטריוני החיפוש או הפילטרים",
    resetFilters: "איפוס פילטרים",
    productsFound: "נמצאו {count} מוצרים",

    // Cart
    yourCart: "הסל שלך",
    emptyCart: "הסל ריק",
    startShopping: "התחילו לקנות",
    removeFromCart: "הסרה מהסל",
    updateQuantity: "עדכון כמות",
    subtotal: "סכום ביניים",
    total: "סה\"כ לתשלום",
    checkout: "המשך לתשלום",
    continueShopping: "המשיכו לקנות",
    quantityUpdated: "כמות עודכנה",
    quantityUpdateError: "שגיאה בעדכון הכמות",
    itemRemoved: "פריט הוסר מהסל",
    itemRemoveError: "שגיאה בהסרת הפריט",

    // Wishlist
    yourWishlist: "רשימת המשאלות שלך",
    emptyWishlist: "רשימת המשאלות ריקה",
    discoverProducts: "גלו מוצרים",
    moveToCart: "העברה לסל",

    // Contact
    contactUs: "צרו איתנו קשר",
    sendMessage: "שלחו לנו הודעה",
    contactDetails: "פרטי התקשרות",
    openingHours: "שעות פתיחה",
    fullName: "שם מלא",
    email: "אימייל",
    phone: "טלפון",
    message: "הודעה",
    send: "שליחה",
    address: "כתובת",
    thankYou: "תודה על פנייתך! ניצור קשר בהקדם.",

    // Footer
    quickLinks: "קישורים מהירים",
    categories: "קטגוריות",
    followUs: "עקבו אחרינו",
    allRightsReserved: "כל הזכויות שמורות",

    // Messages
    loginRequired: "יש להתחבר כדי לנהל את רשימת המשאלות",
    loginRequiredCart: "יש להתחבר כדי להוסיף פריטים לסל",
    addedToWishlist: "נוסף לרשימת המשאלות!",
    removedFromWishlist: "הוסר מרשימת המשאלות",
    addedToCart: "נוסף לסל הקניות!",
    error: "אירעה שגיאה",
    selectSize: "יש לבחור מידה",
    productNotFound: "מוצר לא נמצא",
    errorLoadingProducts: "שגיאה בטעינת המוצרים",
    errorLoadingProduct: "שגיאה בטעינת המוצר",
  },
  en: {
    // Navigation
    home: "Home",
    products: "All Products",
    rings: "Rings",
    necklaces: "Necklaces",
    earrings: "Earrings",
    bracelets: "Bracelets",
    workshops: "Workshops",
    wishlist: "Wishlist",
    about: "About Us",
    contact: "Contact",
    cart: "Shopping Cart",
    login: "Login",
    logout: "Logout",
    admin: "Admin Panel",
    profile: "My Profile",
    orders: "My Orders",

    // General
    loading: "Loading...",
    search: "Search products...",
    category: "Category",
    allCategories: "All Categories",
    price: "Price",
    size: "Size",
    quantity: "Quantity",
    addToCart: "Add to Cart",
    addingToCart: "Adding to Cart...",
    addToWishlist: "Add to Wishlist",
    removeFromWishlist: "Remove from Wishlist",
    viewProduct: "View Product",
    backToCollection: "Back to Collection",
    noProductsFound: "No products found",
    tryDifferentFilters: "Try changing your search criteria or filters",
    resetFilters: "Reset Filters",
    productsFound: "{count} products found",

    // Cart
    yourCart: "Your Cart",
    emptyCart: "Your cart is empty",
    startShopping: "Start Shopping",
    removeFromCart: "Remove from Cart",
    updateQuantity: "Update Quantity",
    subtotal: "Subtotal",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    quantityUpdated: "Quantity updated",
    quantityUpdateError: "Error updating quantity",
    itemRemoved: "Item removed from cart",
    itemRemoveError: "Error removing item",

    // Wishlist
    yourWishlist: "Your Wishlist",
    emptyWishlist: "Your wishlist is empty",
    discoverProducts: "Discover Products",
    moveToCart: "Move to Cart",

    // Contact
    contactUs: "Contact Us",
    sendMessage: "Send us a Message",
    contactDetails: "Contact Details",
    openingHours: "Opening Hours",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    send: "Send",
    address: "Address",
    thankYou: "Thank you for reaching out! We'll get back to you soon.",

    // Footer
    quickLinks: "Quick Links",
    categories: "Categories",
    followUs: "Follow Us",
    allRightsReserved: "All rights reserved",

    // Messages
    loginRequired: "Please login to manage your wishlist",
    loginRequiredCart: "Please login to add items to cart",
    addedToWishlist: "Added to wishlist!",
    removedFromWishlist: "Removed from wishlist",
    addedToCart: "Added to cart!",
    error: "An error occurred",
    selectSize: "Please select a size",
    productNotFound: "Product not found",
    errorLoadingProducts: "Error loading products",
    errorLoadingProduct: "Error loading product",
  }
};

// Translation function
export const t = (key, language = 'he', replacements = {}) => {
  let translation = translations[language]?.[key] || translations['he'][key] || key;
  
  // Replace placeholders like {count}
  Object.keys(replacements).forEach(placeholder => {
    translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
  });
  
  return translation;
};
