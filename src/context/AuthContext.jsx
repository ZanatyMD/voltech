import { createContext, useContext, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';

const AuthContext = createContext();

// Admin credentials (hardcoded - only visible in source code)
const ADMIN_USERNAME = 'voltech.da';
const ADMIN_PASSWORD = 'VoltechMK26$';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('voltech-user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    
    // Admin override
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminUser = { username, role: 'admin', name: 'Admin' };
      setUser(adminUser);
      sessionStorage.setItem('voltech-user', JSON.stringify(adminUser));
      setLoading(false);
      return { success: true };
    }
    
    try {
      // Check Firestore for user
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setLoading(false);
        return { success: false, error: 'User not found' };
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
      if (isPasswordValid) {
        const loggedInUser = { id: userDoc.id, username, role: userData.role || 'user' };
        setUser(loggedInUser);
        sessionStorage.setItem('voltech-user', JSON.stringify(loggedInUser));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Invalid password' };
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return { success: false, error: 'Login failed due to network error' };
    }
  };

  const register = async (username, password) => {
    setLoading(true);
    try {
      // Check if username already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setLoading(false);
        return { success: false, error: 'Username already taken' };
      }
      
      // Hash password and save
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      const newUserRef = await addDoc(collection(db, 'users'), {
        username,
        passwordHash,
        role: 'user',
        createdAt: new Date().toISOString()
      });
      
      const newUser = { id: newUserRef.id, username, role: 'user' };
      setUser(newUser);
      sessionStorage.setItem('voltech-user', JSON.stringify(newUser));
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      setLoading(false);
      return { success: false, error: 'Registration failed due to network error' };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('voltech-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
