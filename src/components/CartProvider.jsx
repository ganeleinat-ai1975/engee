
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/entities/User';
import { CartItem } from '@/entities/CartItem';
import { Product } from '@/entities/Product';
import { toast } from 'sonner';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const getGuestId = () => {
    let guestId = sessionStorage.getItem('guestId');
    if (!guestId) {
        guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('guestId', guestId);
    }
    return guestId;
};

const getGuestCart = () => {
    try {
        const cart = sessionStorage.getItem('guestCart');
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error("Failed to parse guest cart", error);
        return [];
    }
};

const setGuestCart = (cart) => {
    try {
        sessionStorage.setItem('guestCart', JSON.stringify(cart));
    } catch (error) {
        console.error("Failed to set guest cart", error);
    }
};

export const CartProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [guestId, setGuestId] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchProductsForCart = useCallback(async (items) => {
        if (!items || items.length === 0) {
            setProducts({});
            return;
        }
        const productIds = [...new Set(items.map(item => item.product_id))];
        if (productIds.length === 0) return;

        const fetchedProducts = await Promise.all(
            productIds.map(id => Product.get(id).catch(() => null))
        );
        const productsMap = fetchedProducts
            .filter(p => p)
            .reduce((acc, product) => {
                acc[product.id] = product;
                return acc;
            }, {});
        setProducts(prev => ({...prev, ...productsMap}));
    }, []);

    const fetchDbCart = useCallback(async (userEmail) => {
        const dbItems = await CartItem.filter({ user_email: userEmail });
        await fetchProductsForCart(dbItems);
        setCartItems(dbItems);
    }, [fetchProductsForCart]);

    const mergeGuestCartToDb = useCallback(async (guestCart, userEmail) => {
        const dbItems = await CartItem.filter({ user_email: userEmail });
        
        for (const guestItem of guestCart) {
            const existingDbItem = dbItems.find(dbItem => 
                dbItem.product_id === guestItem.product_id &&
                dbItem.size === guestItem.size &&
                dbItem.gold_plating === guestItem.gold_plating
            );
            if (existingDbItem) {
                await CartItem.update(existingDbItem.id, { quantity: existingDbItem.quantity + guestItem.quantity });
            } else {
                // Ensure to not pass the guest cart item's temporary 'id' to the DB create operation
                const { id, ...itemToCreate } = guestItem; 
                await CartItem.create({ ...itemToCreate, user_email: userEmail });
            }
        }
    }, []);

    const initializeCart = useCallback(async () => {
        setIsLoading(true);
        try {
            const currentUser = await User.me();
            setUser(currentUser);
            const guestCart = getGuestCart();
            if (guestCart.length > 0 && currentUser) {
                await mergeGuestCartToDb(guestCart, currentUser.email);
                sessionStorage.removeItem('guestCart');
                sessionStorage.removeItem('guestId');
            }
            // After merging or if no guest cart, fetch the user's DB cart
            if (currentUser) {
                await fetchDbCart(currentUser.email);
            } else {
                // If not logged in, but there was no guest cart to merge, clear cart
                setCartItems([]);
                setProducts({});
            }
        } catch (e) {
            // User not logged in, or error fetching user/cart
            setUser(null);
            setGuestId(getGuestId()); // Ensure guestId is set if not logged in
            const guestCart = getGuestCart();
            await fetchProductsForCart(guestCart);
            setCartItems(guestCart);
        } finally {
            setIsLoading(false);
        }
    }, [mergeGuestCartToDb, fetchDbCart, fetchProductsForCart]);

    useEffect(() => {
        initializeCart();
        window.addEventListener('userLoggedIn', initializeCart);
        // Clean up the event listener when the component unmounts
        return () => window.removeEventListener('userLoggedIn', initializeCart);
    }, [initializeCart]);
    
    const addToCart = useCallback(async (itemDetails) => {
        if (user) {
            // It's better to fetch cartItems fresh from DB to avoid race conditions
            const currentDbCart = await CartItem.filter({ user_email: user.email });
            const existingItem = currentDbCart.find(item =>
                item.product_id === itemDetails.product_id &&
                item.size === itemDetails.size &&
                item.gold_plating === itemDetails.gold_plating
            );
            if (existingItem) {
                await CartItem.update(existingItem.id, { quantity: existingItem.quantity + itemDetails.quantity });
            } else {
                await CartItem.create({ ...itemDetails, user_email: user.email });
            }
            await fetchDbCart(user.email);
        } else {
            const currentGuestCart = getGuestCart();
            const existingItemIndex = currentGuestCart.findIndex(item =>
                item.product_id === itemDetails.product_id &&
                item.size === itemDetails.size &&
                item.gold_plating === itemDetails.gold_plating
            );
            if (existingItemIndex > -1) {
                currentGuestCart[existingItemIndex].quantity += itemDetails.quantity;
            } else {
                // Assign a unique temporary ID for guest cart items
                currentGuestCart.push({ ...itemDetails, id: `guest_item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` });
            }
            setGuestCart(currentGuestCart);
            await fetchProductsForCart(currentGuestCart);
            setCartItems(currentGuestCart);
        }
        toast.success("נוסף לסל הקניות!");
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }, [user, fetchDbCart, fetchProductsForCart]);

    const removeFromCart = useCallback(async (itemId) => {
        if (user) {
            await CartItem.delete(itemId);
            await fetchDbCart(user.email);
        } else {
            let guestCart = getGuestCart();
            guestCart = guestCart.filter(item => item.id !== itemId);
            setGuestCart(guestCart);
            await fetchProductsForCart(guestCart);
            setCartItems(guestCart);
        }
        toast.info("הפריט הוסר מהסל");
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }, [user, fetchDbCart, fetchProductsForCart]);

    const updateQuantity = useCallback(async (itemId, quantity) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        if (user) {
            await CartItem.update(itemId, { quantity });
            await fetchDbCart(user.email);
        } else {
            let guestCart = getGuestCart();
            const itemIndex = guestCart.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                guestCart[itemIndex].quantity = quantity;
                setGuestCart(guestCart);
                setCartItems([...guestCart]);
            }
        }
        toast.info("כמות עודכנה");
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }, [user, fetchDbCart, removeFromCart]);
    
    const clearCart = useCallback(async () => {
         if (user) {
            const itemsToDelete = await CartItem.filter({ user_email: user.email });
            if (itemsToDelete.length > 0) {
                const deletePromises = itemsToDelete.map(item => CartItem.delete(item.id));
                await Promise.all(deletePromises);
            }
            setCartItems([]);
            setProducts({});
        } else {
            setGuestCart([]);
            setCartItems([]);
            setProducts({});
        }
        window.dispatchEvent(new CustomEvent('cartUpdated'));
    }, [user]);

    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const value = {
        cartItems,
        products,
        cartCount,
        isLoading,
        user,
        guestId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        initializeCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
