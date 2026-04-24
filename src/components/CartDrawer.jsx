import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { X, Minus, Plus, Trash2, Send, Loader } from 'lucide-react';
import './CartDrawer.css';

function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please enter your name and phone number to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save order to Firebase
      const orderData = {
        customerName,
        customerPhone,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.currentPrice,
          quantity: item.quantity
        })),
        total: cartTotal
      };
      
      await addOrder(orderData);

      // Prepare WhatsApp Message
      const phoneNumber = '201503476600'; // WhatsApp number
      let message = `مرحباً فولتك! أود طلب العناصر التالية:\nالاسم: ${customerName}\nرقم الهاتف: ${customerPhone}\n\n`;
      
      cartItems.forEach((item) => {
        message += `${item.quantity}x ${item.name} - EGP ${(item.currentPrice * item.quantity).toFixed(2)}\n`;
      });

      message += `\n*إجمالي الطلب: EGP ${cartTotal.toFixed(2)}*\n`;

      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp and Clear Cart
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setIsCartOpen(false);

    } catch (error) {
      console.error("Failed to submit order:", error);
      alert("Failed to submit order. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                      <button onClick={() => updateQuantity(item.id, 1)} disabled={item.quantity >= item.stock}>
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
            
            <div className="checkout-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
              <input 
                type="text" 
                placeholder="Your Full Name" 
                className="form-input" 
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
              <input 
                type="tel" 
                placeholder="Phone Number (e.g. 01012345678)" 
                className="form-input" 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
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
              Your order will be saved and you will be redirected to WhatsApp to arrange delivery.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
