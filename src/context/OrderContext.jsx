import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [damiettaShippingFee, setDamiettaShippingFee] = useState(() => {
    const saved = localStorage.getItem('voltech-damietta-shipping');
    return saved !== null ? parseFloat(saved) : 40;
  });

  const updateDamiettaShippingFee = (newFee) => {
    const val = parseFloat(newFee) >= 0 ? parseFloat(newFee) : 40;
    setDamiettaShippingFee(val);
    localStorage.setItem('voltech-damietta-shipping', val.toString());
  };

  useEffect(() => {
    let q;
    const ordersRef = collection(db, 'orders');

    if (user && user.role === 'admin') {
      q = ordersRef; // Admin sees all
    } else if (user) {
      q = query(ordersRef, where('userId', '==', user.id)); // User sees their own
    } else {
      setOrders([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
  }, [user]);

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

  const updateOrder = async (id, updates) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating order: ", error);
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
    <OrderContext.Provider value={{ 
      orders, addOrder, updateOrderStatus, updateOrder, deleteOrder, deleteAllOrders, loading,
      damiettaShippingFee, updateDamiettaShippingFee
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => useContext(OrderContext);
