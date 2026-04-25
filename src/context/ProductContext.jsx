import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import demoProducts from '../data/demoProducts';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty && !hasSeeded) {
        // Seed the database with demo products if it's completely empty on first load
        console.log("Seeding database with demo products...");
        setHasSeeded(true);
        demoProducts.forEach(async (p) => {
          try {
            await setDoc(doc(db, 'products', String(p.id)), {
              ...p,
              createdAt: new Date().toISOString()
            });
          } catch (e) {
            console.error("Error seeding product: ", e);
          }
        });
      } else {
        const fetchedProducts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by createdAt descending (newest first)
        fetchedProducts.sort((a, b) => {
          if(!a.createdAt) return 1;
          if(!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        setProducts(fetchedProducts);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hasSeeded]);

  const addProduct = async (product) => {
    try {
      const newProductData = {
        ...product,
        sku: product.sku || Math.floor(10000000 + Math.random() * 90000000).toString(),
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'products'), newProductData);
      return { id: docRef.id, ...newProductData };
    } catch (error) {
      console.error("Error adding product: ", error);
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const productRef = doc(db, 'products', id);
      await updateDoc(productRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating product: ", error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error("Error deleting product: ", error);
      throw error;
    }
  };

  const getProduct = (id) => products.find(p => p.id === id);

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    categories: [...new Set(products.map(p => p.category))],
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProduct, stats, loading }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
