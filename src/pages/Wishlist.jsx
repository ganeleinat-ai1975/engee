import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLanguage, t } from "@/components/LanguageProvider";
import { WishlistItem } from "@/entities/WishlistItem";
import { Product } from "@/entities/Product";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { language } = useLanguage();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const items = await WishlistItem.filter({ user_email: currentUser.email });
      setWishlistItems(items);
      
      if (items.length > 0) {
        const productIds = [...new Set(items.map(item => item.product_id))];
        const productData = await Promise.all(
          productIds.map(id => Product.get(id).catch(e => null))
        );
        const productsMap = productData.filter(Boolean).reduce((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});
        setProducts(productsMap);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
    }
    setIsLoading(false);
  };

  const removeFromWishlist = async (productId) => {
    const itemToRemove = wishlistItems.find(item => item.product_id === productId);
    if (!itemToRemove) return;

    try {
      await WishlistItem.delete(itemToRemove.id);
      toast.success(t('removedFromWishlist', language));
      loadWishlist();
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      toast.error(t('error', language));
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
             <div key={i}><Skeleton className="aspect-[4/5] w-full" /></div>
          ))}
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-main mb-4">{t('wishlist', language)}</h2>
            <p className="text-subtle mb-6">{t('loginRequired', language)}</p>
            <Button onClick={() => User.login()} className="btn-primary">{t('login', language)}</Button>
        </div>
    )
  }

  const validWishlistProducts = wishlistItems.map(item => products[item.product_id]).filter(Boolean);

  if (validWishlistProducts.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-main mb-4">{t('emptyWishlist', language)}</h2>
        <p className="text-subtle mb-6">{t('discoverProducts', language)}</p>
        <Button asChild className="btn-primary">
          <Link to={createPageUrl("Products")}>
            <ArrowLeft className="w-4 h-4 ml-2" />
            {t('backToCollection', language)}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-main mb-8">{t('yourWishlist', language)}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {validWishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              wishlist={wishlistItems}
              onToggleWishlist={removeFromWishlist}
            />
          ))}
        </div>
      </div>
    </div>
  );
}