import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from './Toast';
import { X, Minus, Plus, Trash2, Send, Loader, CheckCircle } from 'lucide-react';
import AuthModal from './AuthModal';
import './CartDrawer.css';

function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, updateCustomSpecification, cartTotal, clearCart } = useCart();
  const { addOrder, damiettaShippingFee } = useOrders();
  const { user } = useAuth();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryType, setDeliveryType] = useState('damietta'); // 'damietta' or 'outside'
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      setCustomerName('');
      setCustomerPhone(user.username);
    }
  }, [user]);

  // Name filter: only letters, spaces, and Arabic characters
  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '');
    setCustomerName(value);
  };

  // Phone filter: only digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 12) {
      setCustomerPhone(value);
    }
  };

  if (!isCartOpen && !showThankYou && !isAuthModalOpen) return null;

  const safeDamiettaFee = typeof damiettaShippingFee === 'number' && !isNaN(damiettaShippingFee) 
    ? damiettaShippingFee 
    : 40;

  const currentDeliveryFee = isDelivery 
    ? (deliveryType === 'damietta' ? safeDamiettaFee : 0) 
    : 0;
  
  const finalOrderTotal = (Number(cartTotal) || 0) + currentDeliveryFee;

  const handleCheckout = async () => {
    if (!user || user.role === 'admin') {
      setPendingCheckout(true);
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName.trim()) {
      showToast('Please enter your name to continue.', 'error');
      return;
    }
    if (!customerPhone.trim()) {
      showToast('Please enter your phone number.', 'error');
      return;
    }
    if (customerPhone.length < 11 || customerPhone.length > 12) {
      showToast('Phone number must be exactly 11 or 12 digits.', 'error');
      return;
    }
    if (isDelivery && !deliveryLocation.trim()) {
      showToast(deliveryType === 'damietta' 
        ? 'Please enter your detailed address in New Damietta.' 
        : 'Please enter your city & detailed address.', 'error');
      return;
    }

    // Validate custom specification for items that require it (e.g. resistors, capacitors)
    const missingSpecItem = cartItems.find(
      item => item.requiresSpecification && (!item.customSpecification || !item.customSpecification.trim())
    );
    if (missingSpecItem) {
      showToast(`Please specify the value/number (e.g. resistor or capacitor rating) for "${missingSpecItem.name}" before checking out.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const isOutside = isDelivery && deliveryType === 'outside';

      const orderData = {
        userId: user ? user.id : 'guest',
        customerName,
        customerPhone,
        isDelivery,
        deliveryZone: isDelivery ? (deliveryType === 'damietta' ? 'New Damietta' : 'Outside New Damietta') : 'Store Pickup',
        deliveryLocation: isDelivery ? deliveryLocation : 'Store Pickup',
        deliveryFee: currentDeliveryFee,
        shippingPending: isOutside,
        items: cartItems.map(item => ({
          id: item.id,
          sku: item.sku || 'N/A',
          name: item.selectedVariant ? `${item.name} (${item.selectedVariant})` : item.name,
          customSpecification: item.customSpecification ? item.customSpecification.trim() : null,
          price: item.currentPrice,
          quantity: item.quantity
        })),
        total: finalOrderTotal
      };
      
      await addOrder(orderData);

      if (isOutside) {
        setThankYouMessage("Your order has been placed! Since your location is outside New Damietta, our team will calculate the shipping fee for your city and contact you directly on your phone to confirm delivery.");
      } else {
        setThankYouMessage("Your order has been placed successfully! Our team will review your order from the dashboard and contact you on your phone to confirm delivery.");
      }

      setShowThankYou(true);
      setIsCartOpen(false);
      
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryLocation('');
      setIsDelivery(false);

    } catch (error) {
      console.error("Failed to submit order:", error);
      showToast('Failed to submit order. Please check your connection.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
  };

  return (
    <>
      {/* Auth Modal for Guests */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCheckout(false);
        }}
        onLoginSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingCheckout) {
            setIsCartOpen(true);
            setPendingCheckout(false);
          }
        }}
      />

      {/* Thank You Modal */}
      {showThankYou && (
        <div className="thankyou-overlay" onClick={handleCloseThankYou}>
          <div className="thankyou-modal" onClick={e => e.stopPropagation()}>
            <div className="thankyou-icon">
              <CheckCircle size={40} />
            </div>
            <h2 className="thankyou-title">Thank You!</h2>
            <p className="thankyou-message">
              {thankYouMessage || "Your order has been placed successfully! Our team will review your order from the dashboard and contact you soon."}
            </p>
            <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={handleCloseThankYou}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>
          <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button className="btn-icon close-cart" onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-items">
              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty.</p>
                  <button className="btn btn-secondary mt-4" onClick={() => setIsCartOpen(false)}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cartItems.map(item => {
                  const itemIdKey = item.cartItemId || item.id;
                  return (
                    <div key={itemIdKey} className="cart-item">
                      <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        {item.selectedVariant && (
                          <span className="cart-item-variant" style={{
                            fontSize: '0.75rem',
                            color: 'var(--volt-green)',
                            background: 'rgba(126, 200, 67, 0.1)',
                            border: '1px solid rgba(126, 200, 67, 0.2)',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            display: 'inline-block',
                            marginTop: '2px',
                            marginBottom: '4px'
                          }}>
                            Option: {item.selectedVariant}
                          </span>
                        )}
                        {item.requiresSpecification && (
                          <div className="cart-item-spec-box" style={{ marginTop: '4px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--volt-yellow)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                              Required Value / Spec: *
                            </span>
                            <input
                              type="text"
                              placeholder="e.g. 10kΩ, 100uF..."
                              value={item.customSpecification || ''}
                              onChange={(e) => updateCustomSpecification(itemIdKey, e.target.value)}
                              style={{
                                width: '100%',
                                fontSize: '0.78rem',
                                padding: '4px 8px',
                                background: 'rgba(0,0,0,0.4)',
                                border: !item.customSpecification ? '1px solid rgba(245, 200, 66, 0.6)' : '1px solid rgba(126, 200, 67, 0.3)',
                                borderRadius: '6px',
                                color: '#fff',
                                outline: 'none'
                              }}
                            />
                          </div>
                        )}
                        {!item.requiresSpecification && item.customSpecification && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--volt-green)', display: 'block', marginBottom: '4px' }}>
                            Spec: {item.customSpecification}
                          </span>
                        )}
                        <p className="cart-item-price">EGP {item.currentPrice.toFixed(2)}</p>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button onClick={() => updateQuantity(itemIdKey, -1)} disabled={item.quantity <= 1}>
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => {
                              if (item.quantity >= item.stock) {
                                showToast(`Sorry, maximum available quantity reached for this item.`, 'error');
                                return;
                              }
                              updateQuantity(itemIdKey, 1);
                            }}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <button className="remove-btn" onClick={() => removeFromCart(itemIdKey)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total-summary">
                  <div className="summary-row">
                    <span>Items Subtotal:</span>
                    <span>EGP {Number(cartTotal || 0).toFixed(2)}</span>
                  </div>
                  {isDelivery && (
                    <div className="summary-row shipping-row">
                      <span>Shipping Fee:</span>
                      {deliveryType === 'damietta' ? (
                        <span className="shipping-badge">EGP {safeDamiettaFee.toFixed(2)}</span>
                      ) : (
                        <span className="shipping-pending-badge">To be calculated</span>
                      )}
                    </div>
                  )}
                  <div className="summary-row total-row">
                    <span>Total:</span>
                    <span className="total-amount">
                      EGP {finalOrderTotal.toFixed(2)}
                      {isDelivery && deliveryType === 'outside' && <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--volt-yellow)', fontWeight: 'normal' }}>+ Shipping to be confirmed</small>}
                    </span>
                  </div>
                </div>
                
                {(!user || user.role === 'admin') ? (
                  <button 
                    className="btn btn-primary checkout-btn mt-4" 
                    onClick={() => {
                      setPendingCheckout(true);
                      setIsAuthModalOpen(true);
                      setIsCartOpen(false);
                    }}
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    Log in to Checkout
                  </button>
                ) : (
                  <>
                    <div className="checkout-form">
                      <input 
                        type="text" 
                        placeholder="Your Full Name" 
                        className="form-input" 
                        value={customerName}
                        onChange={handleNameChange}
                        required
                      />
                      <input 
                        type="tel" 
                        placeholder="Phone Number (11-12 digits)" 
                        className="form-input" 
                        value={customerPhone}
                        onChange={handlePhoneChange}
                        maxLength={12}
                        required
                      />

                      <div className="delivery-toggle">
                        <label className="delivery-option">
                          <input 
                            type="radio" 
                            name="deliveryOption" 
                            checked={!isDelivery} 
                            onChange={() => setIsDelivery(false)} 
                          />
                          Store Pickup
                        </label>
                        <label className="delivery-option">
                          <input 
                            type="radio" 
                            name="deliveryOption" 
                            checked={isDelivery} 
                            onChange={() => setIsDelivery(true)} 
                          />
                          Home Delivery
                        </label>
                      </div>

                      {isDelivery && (
                        <div className="delivery-zone-box animate-fade-in-up">
                          <label className="delivery-zone-label">Select Delivery Location:</label>
                          <div className="delivery-zone-options">
                            <label className={`delivery-zone-card ${deliveryType === 'damietta' ? 'active' : ''}`}>
                              <input 
                                type="radio" 
                                name="deliveryZone" 
                                checked={deliveryType === 'damietta'} 
                                onChange={() => setDeliveryType('damietta')} 
                              />
                              <div className="zone-info">
                                <strong>📍 New Damietta</strong>
                                <span>Shipping: EGP {safeDamiettaFee}</span>
                              </div>
                            </label>

                            <label className={`delivery-zone-card ${deliveryType === 'outside' ? 'active' : ''}`}>
                              <input 
                                type="radio" 
                                name="deliveryZone" 
                                checked={deliveryType === 'outside'} 
                                onChange={() => setDeliveryType('outside')} 
                              />
                              <div className="zone-info">
                                <strong>🚚 Outside New Damietta / Cities</strong>
                                <span>Shipping fee determined soon</span>
                              </div>
                            </label>
                          </div>

                          <div className="form-group" style={{ marginTop: '12px' }}>
                            <input 
                              type="text" 
                              placeholder={deliveryType === 'damietta' ? "Detailed address in New Damietta" : "City & Detailed Address"} 
                              className="form-input" 
                              value={deliveryLocation}
                              onChange={(e) => setDeliveryLocation(e.target.value)}
                              required={isDelivery}
                            />
                            {deliveryType === 'outside' && (
                              <small className="delivery-note" style={{ color: 'var(--volt-yellow)', display: 'block', marginTop: '6px' }}>
                                * Upon placing order, we will calculate the shipping amount for your city and contact you to confirm!
                              </small>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      className="btn btn-primary checkout-btn" 
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader size={18} className="spin" /> : <Send size={18} />}
                      {isSubmitting ? 'Processing...' : 'Confirm & Place Order'}
                    </button>
                    <p className="checkout-hint">
                      Your order will be submitted directly and our team will contact you to confirm.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default CartDrawer;
