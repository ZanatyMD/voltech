import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Lock, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const { login, register, loading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLoginView && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Force username to lowercase for consistency
    const cleanUsername = username.trim().toLowerCase();

    const result = isLoginView 
      ? await login(cleanUsername, password)
      : await register(cleanUsername, password);

    if (result.success) {
      setUsername('');
      setPassword('');
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        onClose();
      }
    } else {
      setError(result.error);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setUsername('');
    setPassword('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="auth-modal-overlay" onClick={onClose}>
          <div className="auth-modal" onClick={e => e.stopPropagation()}>
            <button className="auth-modal-close" onClick={onClose}>
              <X size={20} />
            </button>

            <h2>{isLoginView ? 'Welcome Back' : 'Create Account'}</h2>
            <p>
              {isLoginView 
                ? 'Login to view your orders and fast checkout.' 
                : 'Join Voltech for a seamless shopping experience.'}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <User size={18} className="auth-input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  className="auth-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ''))} // only alphanumeric
                />
              </div>

              <div className="auth-input-group">
                <Lock size={18} className="auth-input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary auth-btn"
                disabled={loading}
              >
                {loading ? <Loader size={18} className="spin" /> : (isLoginView ? 'Login' : 'Register')}
              </button>
            </form>

            <div className="auth-toggle">
              {isLoginView ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="auth-toggle-btn" onClick={toggleView}>
                {isLoginView ? 'Register' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
