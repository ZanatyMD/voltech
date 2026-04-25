import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, setDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const CategoryContext = createContext();

// Default categories to seed the database if it's completely empty
const defaultCategories = ['Laptops', 'Smartphones', 'Audio', 'Accessories', 'Gaming', 'Monitors'];

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasSeeded, setHasSeeded] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (snapshot.empty && !hasSeeded) {
        console.log("Seeding default categories...");
        setHasSeeded(true);
        defaultCategories.forEach(async (catName) => {
          try {
            await setDoc(doc(db, 'categories', catName), { name: catName });
          } catch (e) {
            console.error("Error seeding category: ", e);
          }
        });
      } else {
        const fetchedCategories = snapshot.docs.map(doc => doc.data().name);
        setCategories(fetchedCategories.sort());
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching categories:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hasSeeded]);

  const addCategory = async (name) => {
    if (!name.trim()) return;
    try {
      await setDoc(doc(db, 'categories', name.trim()), { name: name.trim() });
    } catch (error) {
      console.error("Error adding category: ", error);
      throw error;
    }
  };

  const updateCategory = async (oldName, newName) => {
    if (!newName.trim() || oldName === newName.trim()) return;
    const trimmed = newName.trim();
    try {
      // Create new category doc
      await setDoc(doc(db, 'categories', trimmed), { name: trimmed });
      // Delete old category doc
      await deleteDoc(doc(db, 'categories', oldName));
      // Update all products that had the old category
      const productsSnap = await getDocs(
        query(collection(db, 'products'), where('category', '==', oldName))
      );
      const updatePromises = productsSnap.docs.map(productDoc =>
        updateDoc(doc(db, 'products', productDoc.id), { category: trimmed })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error updating category: ", error);
      throw error;
    }
  };

  const deleteCategory = async (name) => {
    try {
      await deleteDoc(doc(db, 'categories', name));
    } catch (error) {
      console.error("Error deleting category: ", error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, loading }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => useContext(CategoryContext);

