import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by orderDate descending (newest first)
      fetchedOrders.sort((a, b) => {
        if(!a.orderDate) return 1;
        if(!b.orderDate) return -1;
        return new Date(b.orderDate) - new Date(a.orderDate);
      });

      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addOrder = async (orderData) => {
    try {
      const orderNumber = 'VT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const newOrder = {
        ...orderData,
        orderNumber,
        orderDate: new Date().toISOString(),
        status: 'Pending' // default status
      };
      const docRef = await addDoc(collection(db, 'orders'), newOrder);
      return { id: docRef.id, ...newOrder };
    } catch (error) {
      console.error("Error adding order: ", error);
      throw error;
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating order status: ", error);
      throw error;
    }
  };

  const deleteOrder = async (id) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      console.error("Error deleting order: ", error);
      throw error;
    }
  };

  const deleteAllOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'orders', d.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting all orders: ", error);
      throw error;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder, deleteAllOrders, loading }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
