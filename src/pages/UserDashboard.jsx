import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import './UserDashboard.css';

export default function UserDashboard() {
  const { user } = useAuth();
  const { orders, updateOrderStatus, updateOrder } = useOrders();
  const navigate = useNavigate();
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleCancelClick = (orderId) => {
    setCancellingOrderId(orderId);
    setCancelStep(1);
    setCancelReason('');
  };

  const submitCancel = async () => {
    if (!cancellingOrderId) return;
    await updateOrder(cancellingOrderId, { 
      status: 'Cancelled', 
      cancelReason: cancelReason.trim() || 'No reason provided' 
    });
    setCancellingOrderId(null);
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
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                    display: 'inline-block',
                    width: 'fit-content'
                  }}>
                    Payment: {order.paymentMethod === 'vodafone_cash' ? '📱 Vodafone Cash' : order.paymentMethod === 'instapay' ? '💳 InstaPay' : '💵 Cash'}
                  </span>
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
                      {item.customSpecification && (
                        <span style={{ color: 'var(--volt-green)', fontSize: '0.8rem', marginLeft: '6px' }}>
                          [{item.customSpecification}]
                        </span>
                      )}
                    </div>
                    <span className="item-price">EGP {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="user-order-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => handleCancelClick(order.id)}
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

      {cancellingOrderId && (
        <div className="modal-overlay">
          <div className="modal-content cancel-modal">
            {cancelStep === 1 ? (
              <>
                <h3>Cancel Order</h3>
                <p>Are you sure you want to cancel this order?</p>
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setCancellingOrderId(null)}>No, Keep it</button>
                  <button className="btn btn-danger" onClick={() => setCancelStep(2)} style={{ background: '#ff3b30', color: 'white', border: 'none' }}>Yes, Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h3>Why are you cancelling?</h3>
                <p>Please tell us the reason for your cancellation:</p>
                <textarea 
                  rows="3" 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason here..."
                  autoFocus
                />
                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setCancellingOrderId(null)}>Nevermind</button>
                  <button className="btn btn-danger" onClick={submitCancel} style={{ background: '#ff3b30', color: 'white', border: 'none' }}>Submit & Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
