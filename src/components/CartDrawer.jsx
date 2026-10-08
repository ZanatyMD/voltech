import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { showToast } from './Toast';
import { X, Minus, Plus, Trash2, Send, Loader, CheckCircle } from 'lucide-react';
import AuthModal from './AuthModal';
import vodafoneLogo from '../assets/vodafone-cash-logo.png';
import instapayLogo from '../assets/instapay-logo.png';
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
  const [paymentMethod, setPaymentMethod] = useState('cash');
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
        paymentMethod,
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

      if (paymentMethod === 'vodafone_cash') {
        setThankYouMessage("vcash");
      } else if (paymentMethod === 'instapay') {
        setThankYouMessage("instapay");
      } else {
        if (isOutside) {
          setThankYouMessage("Your order has been placed! Since your location is outside New Damietta, our team will calculate the shipping fee for your city and contact you directly on your phone to confirm delivery.");
        } else {
          setThankYouMessage("Your order has been placed successfully! Our team will review your order and contact you on your phone to confirm. Payment will be collected on delivery.");
        }
      }

      setShowThankYou(true);
      setIsCartOpen(false);
      
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setDeliveryLocation('');
      setIsDelivery(false);
      setPaymentMethod('cash');

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
          <div className="thankyou-modal thankyou-modal-payment" onClick={e => e.stopPropagation()}>
            <div className="thankyou-icon">
              <CheckCircle size={40} />
            </div>
            <h2 className="thankyou-title">Thank You!</h2>

            {thankYouMessage === 'vcash' ? (
              <div className="payment-instructions-box">
                <img src={vodafoneLogo} alt="Vodafone Cash" className="payment-logo" />
                <p className="payment-inst-title">Please send <strong>EGP {finalOrderTotal.toFixed(2)}</strong> via Vodafone Cash to:</p>
                <div 
                  className="payment-number-box" 
                  onClick={() => {
                    navigator.clipboard?.writeText('01041703311');
                    showToast('Vodafone Cash number copied: 01041703311', 'success');
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Click to copy"
                >
                  <span className="payment-number">01041703311</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>📋 Click to copy number</span>
                </div>
                <div className="payment-steps">
                  <p>1. Open your Vodafone Cash app:</p>
                  <div className="payment-app-links">
                    <a href="https://play.google.com/store/apps/details?id=com.emeint.android.myservices&hl=en" target="_blank" rel="noopener noreferrer" className="app-link-btn android">
                      📱 Android
                    </a>
                    <a href="https://apps.apple.com/eg/app/ana-vodafone/id437564823" target="_blank" rel="noopener noreferrer" className="app-link-btn ios">
                      🍎 iPhone
                    </a>
                  </div>
                  <p>2. Send the total amount to the number above</p>
                  <p>3. <strong>Take a screenshot</strong> of the successful transfer</p>
                  <p>4. Send the screenshot to our WhatsApp to confirm:</p>
                  <a
                    href={`https://wa.me/201503476600?text=${encodeURIComponent('مرحباً فولتك! تم إرسال المبلغ عبر فودافون كاش، وأرفق لكم صورة التحويل لتأكيد الطلب.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp-confirm"
                  >
                    📩 Send Screenshot via WhatsApp
                  </a>
                </div>
              </div>
            ) : thankYouMessage === 'instapay' ? (
              <div className="payment-instructions-box">
                <img src={instapayLogo} alt="InstaPay" className="payment-logo" />
                <p className="payment-inst-title">Please send <strong>EGP {finalOrderTotal.toFixed(2)}</strong> via InstaPay:</p>
                <div 
                  className="payment-number-box"
                  onClick={() => {
                    navigator.clipboard?.writeText('kamar.elkhouli@instapay');
                    showToast('InstaPay username copied!', 'success');
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Click to copy"
                >
                  <span className="payment-number instapay-id">kamar.elkhouli@instapay</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>📋 Click to copy address</span>
                </div>
                <div className="payment-steps">
                  <p>1. Click the link below to send money:</p>
                  <a
                    href="https://ipn.eg/S/kamar.elkhouli/instapay/83ROzy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-instapay-link"
                  >
                    💳 Open InstaPay Link
                  </a>
                  <p style={{ marginTop: '12px' }}>2. After sending, <strong>take a screenshot</strong></p>
                  <p>3. Send the screenshot to our WhatsApp to confirm:</p>
                  <a
                    href={`https://wa.me/201503476600?text=${encodeURIComponent('مرحباً فولتك! تم إرسال المبلغ عبر InstaPay، وأرفق لكم صورة التحويل لتأكيد الطلب.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp-confirm"
                  >
                    📩 Send Screenshot via WhatsApp
                  </a>
                </div>
              </div>
            ) : (
              <p className="thankyou-message">
                {thankYouMessage || "Your order has been placed successfully! Our team will review your order and contact you soon."}
              </p>
            )}

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

                    {/* Payment Method Selection */}
                    <div className="payment-method-section">
                      <label className="payment-method-label">Payment Method</label>
                      <div className="payment-method-options">
                        <label className={`payment-method-card ${paymentMethod === 'cash' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'cash'} 
                            onChange={() => setPaymentMethod('cash')} 
                          />
                          <div className="pm-content">
                            <span className="pm-emoji">💵</span>
                            <span className="pm-name">Cash</span>
                          </div>
                        </label>

                        <label className={`payment-method-card ${paymentMethod === 'vodafone_cash' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'vodafone_cash'} 
                            onChange={() => setPaymentMethod('vodafone_cash')} 
                          />
                          <div className="pm-content">
                            <img src={vodafoneLogo} alt="Vodafone Cash" className="pm-logo" />
                            <span className="pm-name">Vodafone Cash</span>
                          </div>
                        </label>

                        <label className={`payment-method-card ${paymentMethod === 'instapay' ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="paymentMethod" 
                            checked={paymentMethod === 'instapay'} 
                            onChange={() => setPaymentMethod('instapay')} 
                          />
                          <div className="pm-content">
                            <img src={instapayLogo} alt="InstaPay" className="pm-logo" />
                            <span className="pm-name">InstaPay</span>
                          </div>
                        </label>
                      </div>
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
