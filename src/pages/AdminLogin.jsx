import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(username, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container glass">
        <div className="login-header">
          <div className="login-icon">
            <Shield size={32} />
          </div>
          <h2>Admin Access</h2>
          <p>Secure login for Voltech staff</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleLogin} autoComplete="on">
          <div className="form-group">
            <label htmlFor="username">USERNAME</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            <Zap size={18} />
            {loading ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
