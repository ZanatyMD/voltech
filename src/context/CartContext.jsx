import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('voltech-cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('voltech-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedVariant = null) => {
    const variantName = selectedVariant ? selectedVariant.name : (product.selectedVariant || null);
    const itemPrice = selectedVariant ? selectedVariant.currentPrice : product.currentPrice;
    const itemStock = selectedVariant && selectedVariant.stock !== undefined ? selectedVariant.stock : product.stock;
    const cartItemId = variantName ? `${product.id}-${variantName}` : product.id;

    setCartItems(prev => {
      const existing = prev.find(item => (item.cartItemId || item.id) === cartItemId);
      if (existing) {
        if (existing.quantity >= itemStock) return prev;
        return prev.map(item => 
          (item.cartItemId || item.id) === cartItemId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        ...product, 
        cartItemId,
        selectedVariant: variantName,
        currentPrice: itemPrice,
        stock: itemStock,
        quantity: 1 
      }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => (item.cartItemId || item.id) !== id));
  };

  const updateQuantity = (id, amount) => {
    setCartItems(prev => prev.map(item => {
      if ((item.cartItemId || item.id) === id) {
        const newQuantity = Math.max(1, Math.min(item.quantity + amount, item.stock));
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.currentPrice * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      cartTotal, cartCount, isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
