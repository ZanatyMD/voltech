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

  const addToCart = (product, selectedVariant = null, customSpecification = '') => {
    const variantName = selectedVariant ? selectedVariant.name : (product.selectedVariant || null);
    const itemPrice = selectedVariant ? selectedVariant.currentPrice : product.currentPrice;
    const itemStock = selectedVariant && selectedVariant.stock !== undefined ? selectedVariant.stock : product.stock;
    const specText = customSpecification ? customSpecification.trim() : (product.customSpecification || '');
    
    let cartItemId = product.id;
    if (variantName) cartItemId += `-${variantName}`;
    if (specText) cartItemId += `-${specText}`;

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
        customSpecification: specText,
        requiresSpecification: Boolean(product.requiresSpecification),
        currentPrice: itemPrice,
        stock: itemStock,
        quantity: 1 
      }];
    });
    setIsCartOpen(true);
  };

  const updateCustomSpecification = (id, specification) => {
    setCartItems(prev => prev.map(item => {
      if ((item.cartItemId || item.id) === id) {
        return { ...item, customSpecification: specification };
      }
      return item;
    }));
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
      cartItems, addToCart, removeFromCart, updateQuantity, updateCustomSpecification, clearCart, 
      cartTotal, cartCount, isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
