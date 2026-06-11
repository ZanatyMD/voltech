import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import './UserDashboard.css';

export default function UserDashboard() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, updateOrder } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Are you sure you want to cancel this order?\nPlease provide a reason for cancellation:');
    if (reason !== null) {
      await updateOrder(orderId, { status: 'Cancelled', cancelReason: reason || 'No reason provided' });
    }
  };

  const getStepStatus = (status, stepIndex) => {
    const effectiveStatus = status === 'Completed' ? 'Delivered' : status === 'With Delivery Guy' ? 'Shipped' : status;
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    
    if (effectiveStatus === 'Cancelled') return 'cancelled';
    if (effectiveStatus === 'Returned') return 'returned';
    
    const checkStatus = effectiveStatus === 'Delayed' ? 'Pending' : effectiveStatus;
    const currentStatusIndex = statuses.indexOf(checkStatus);
    
    if (currentStatusIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  const getProgressWidth = (status) => {
    const effectiveStatus = status === 'Completed' ? 'Delivered' : status === 'With Delivery Guy' ? 'Shipped' : status;
    if (effectiveStatus === 'Pending' || effectiveStatus === 'Delayed') return '0%';
    if (effectiveStatus === 'Processing') return '33%';
    if (effectiveStatus === 'Shipped') return '66%';
    if (effectiveStatus === 'Delivered') return '100%';
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
                  {order.status === 'Delayed' && (
                    <div style={{ marginBottom: '20px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', width: '100%' }}>
                      <Clock size={20} />
                      <strong>Order is going to be a little late, please wait!</strong>
                    </div>
                  )}
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
                  disabled={order.status !== 'Pending' && order.status !== 'Delayed' && order.status !== 'Processing'}
                  title={order.status !== 'Pending' && order.status !== 'Delayed' && order.status !== 'Processing' ? 'Cannot cancel shipped orders' : ''}
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
