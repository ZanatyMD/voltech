import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
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

  const deleteCategory = async (name) => {
    try {
      await deleteDoc(doc(db, 'categories', name));
    } catch (error) {
      console.error("Error deleting category: ", error);
      throw error;
    }
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, deleteCategory, loading }}>
      {children}
    </CategoryContext.Provider>
  );
}

export const useCategories = () => useContext(CategoryContext);
