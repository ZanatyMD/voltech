import { createContext, useContext, useState } from 'react';
import demoProducts from '../data/demoProducts';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(demoProducts);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id, updates) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    );
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProduct = (id) => products.find(p => p.id === id);

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    categories: [...new Set(products.map(p => p.category))],
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProduct, stats }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
