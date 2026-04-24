import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Admin credentials (hardcoded - only visible in source code)
const ADMIN_USERNAME = 'voltech.da';
const ADMIN_PASSWORD = 'VoltechMK26$';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('voltech-admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const adminUser = { username, role: 'admin', name: 'Admin' };
      setUser(adminUser);
      sessionStorage.setItem('voltech-admin', JSON.stringify(adminUser));
      setLoading(false);
      return { success: true };
    }
    
    setLoading(false);
    return { success: false, error: 'Invalid username or password' };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('voltech-admin');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
