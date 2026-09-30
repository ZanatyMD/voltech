import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CategoryProvider } from './context/CategoryContext.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { OrderProvider } from './context/OrderContext.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('voltech-cart');
      localStorage.removeItem('voltech-damietta-shipping');
    } catch(e) {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          color: '#fff',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2 style={{ color: '#7EC843', marginBottom: '10px' }}>Voltech Electronics</h2>
          <p style={{ color: '#aaa', marginBottom: '16px' }}>Something went wrong while loading the page.</p>
          {this.state.error && (
            <div style={{
              background: 'rgba(255, 77, 77, 0.1)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              color: '#ff6b6b',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              maxWidth: '600px',
              marginBottom: '20px',
              wordBreak: 'break-word'
            }}>
              {this.state.error.message || this.state.error.toString()}
            </div>
          )}
          <button 
            onClick={this.handleReset}
            style={{
              padding: '12px 28px',
              backgroundColor: '#7EC843',
              color: '#000',
              border: 'none',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: '0 0 20px rgba(126, 200, 67, 0.4)'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CategoryProvider>
              <ProductProvider>
                <CartProvider>
                  <OrderProvider>
                    <App />
                  </OrderProvider>
                </CartProvider>
              </ProductProvider>
            </CategoryProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
