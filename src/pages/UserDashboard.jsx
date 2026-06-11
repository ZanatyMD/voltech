import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import './UserDashboard.css';

export default function UserDashboard() {
  const { user } = useAuth();
  const { orders, updateOrderStatus } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await updateOrderStatus(orderId, 'Cancelled');
    }
  };

  const getStepStatus = (status, stepIndex) => {
    const statuses = ['Pending', 'Processing', 'With Delivery Guy', 'Completed'];
    if (status === 'Cancelled') return 'cancelled';
    if (status === 'Returned') return 'returned';
    
    const currentStatusIndex = statuses.indexOf(status);
    if (currentStatusIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  const getProgressWidth = (status) => {
    if (status === 'Pending') return '0%';
    if (status === 'Processing') return '33%';
    if (status === 'With Delivery Guy') return '66%';
    if (status === 'Completed') return '100%';
    return '0%'; // for cancelled/returned
  };

  return (
    <div className="container user-dashboard animate-fade-in-up">
      <div className="dashboard-header">
        <h1>My Orders</h1>
        <p>Track your order status and history.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <ShoppingBag size={48} color="var(--text-muted)" />
          <h2>No orders yet</h2>
          <p>Looks like you haven't placed any orders.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div className="user-order-card" key={order.id}>
              <div className="user-order-header">
                <div className="order-id-date">
                  <span className="order-id">Order #{order.orderNumber || order.id.slice(-6).toUpperCase()}</span>
                  <span className="order-date">{new Date(order.orderDate).toLocaleString()}</span>
                </div>
                <div className="order-total-price">
                  EGP {order.total.toFixed(2)}
                </div>
              </div>

              {order.status !== 'Cancelled' && order.status !== 'Returned' ? (
                <div className="order-stepper">
                  <div className="stepper-progress" style={{ width: getProgressWidth(order.status) }}></div>
                  
                  <div className={`stepper-step ${getStepStatus(order.status, 0)}`}>
                    <div className="step-icon"><Clock size={16} /></div>
                    <span className="step-label">Placed</span>
                  </div>
                  
                  <div className={`stepper-step ${getStepStatus(order.status, 1)}`}>
                    <div className="step-icon"><Package size={16} /></div>
                    <span className="step-label">Processing</span>
                  </div>
                  
                  <div className={`stepper-step ${getStepStatus(order.status, 2)}`}>
                    <div className="step-icon"><Truck size={16} /></div>
                    <span className="step-label">Shipped</span>
                  </div>
                  
                  <div className={`stepper-step ${getStepStatus(order.status, 3)}`}>
                    <div className="step-icon"><CheckCircle size={16} /></div>
                    <span className="step-label">Delivered</span>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '24px', color: order.status === 'Cancelled' ? '#ff3b30' : '#f97316', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <XCircle size={20} />
                  <strong>Order {order.status}</strong>
                </div>
              )}

              <div className="user-order-items">
                {order.items.map((item, idx) => (
                  <div className="user-order-item" key={idx}>
                    <div className="item-qty-name">
                      <span className="item-qty">{item.quantity}x</span>
                      <span>{item.name}</span>
                    </div>
                    <span className="item-price">EGP {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="user-order-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => handleCancelOrder(order.id)}
                  disabled={order.status !== 'Pending' && order.status !== 'Processing'}
                  title={order.status !== 'Pending' && order.status !== 'Processing' ? 'Cannot cancel shipped orders' : ''}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
