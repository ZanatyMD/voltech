import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { showToast } from './Toast';
import { X, Minus, Plus, Trash2, Send, Loader, CheckCircle } from 'lucide-react';
import './CartDrawer.css';

function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pendingWhatsAppUrl, setPendingWhatsAppUrl] = useState('');

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

  // Countdown timer for thank-you modal
  useEffect(() => {
    if (!showThankYou) return;
    if (countdown <= 0) {
      window.location.href = pendingWhatsAppUrl;
      setShowThankYou(false);
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showThankYou, countdown, pendingWhatsAppUrl]);

  if (!isCartOpen && !showThankYou) return null;

  const handleCheckout = async () => {
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
      showToast('Please enter your delivery address in New Damietta.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName,
        customerPhone,
        isDelivery,
        deliveryLocation: isDelivery ? deliveryLocation : 'Store Pickup',
        items: cartItems.map(item => ({
          id: item.id,
          sku: item.sku || 'N/A',
          name: item.name,
          price: item.currentPrice,
          quantity: item.quantity
        })),
        total: cartTotal
      };
      
      await addOrder(orderData);

      // Build WhatsApp URL
      const phoneNumber = '201031643665';
      let message = `مرحباً فولتك! أود طلب العناصر التالية:\nالاسم: ${customerName}\nرقم الهاتف: ${customerPhone}\n`;
      
      if (isDelivery) {
        message += `طريقة الاستلام: توصيل (دمياط الجديدة)\nالعنوان: ${deliveryLocation}\n\n`;
      } else {
        message += `طريقة الاستلام: استلام من الفرع\n\n`;
      }
      
      cartItems.forEach((item) => {
        message += `${item.quantity}x ${item.name} - EGP ${(item.currentPrice * item.quantity).toFixed(2)}\n`;
      });

      message += `\n*إجمالي الطلب: EGP ${cartTotal.toFixed(2)}*\n`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      // Show thank you modal, then redirect
      setPendingWhatsAppUrl(whatsappUrl);
      setShowThankYou(true);
      setCountdown(3);
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
    window.location.href = pendingWhatsAppUrl;
    setShowThankYou(false);
  };

  return (
    <>
      {/* Thank You Modal */}
      {showThankYou && (
        <div className="thankyou-overlay" onClick={handleCloseThankYou}>
          <div className="thankyou-modal" onClick={e => e.stopPropagation()}>
            <div className="thankyou-icon">
              <CheckCircle size={40} />
            </div>
            <h2 className="thankyou-title">Thank You!</h2>
            <p className="thankyou-message">
              Your order has been placed successfully! You'll be redirected to WhatsApp to confirm your order details.
            </p>
            <div className="thankyou-redirect">
              <span>Redirecting in</span>
              <span className="countdown">{countdown}</span>
              <span>seconds...</span>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={handleCloseThankYou}>
              Go to WhatsApp Now
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
                cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">EGP {item.currentPrice.toFixed(2)}</p>
                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1}>
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => {
                            if (item.quantity >= item.stock) {
                              showToast(`Sorry, only ${item.stock} item${item.stock > 1 ? 's' : ''} remaining in stock.`, 'error');
                              return;
                            }
                            updateQuantity(item.id, 1);
                          }}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">EGP {cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="checkout-form">
                  <input 
                    type="text" 
                    placeholder="Your Full Name (letters only)" 
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
                      Delivery
                    </label>
                  </div>

                  {isDelivery && (
                    <div className="form-group animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                      <input 
                        type="text" 
                        placeholder="Detailed address in New Damietta" 
                        className="form-input" 
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        required={isDelivery}
                      />
                      <small className="delivery-note">* Delivery available only in New Damietta</small>
                    </div>
                  )}
                </div>

                <button 
                  className="btn btn-primary checkout-btn" 
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader size={18} className="spin" /> : <Send size={18} />}
                  {isSubmitting ? 'Processing...' : 'Checkout via WhatsApp'}
                </button>
                <p className="checkout-hint">
                  Your order will be saved and you will be redirected to WhatsApp.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default CartDrawer;
