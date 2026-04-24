import { useCart } from '../context/CartContext';
import { X, Minus, Plus, Trash2, Send } from 'lucide-react';
import './CartDrawer.css';

function CartDrawer() {
  const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    const phoneNumber = '201503476600'; // WhatsApp number
    let message = 'مرحباً فولتك! أود طلب العناصر التالية:\n\n';
    
    cartItems.forEach((item, index) => {
      message += `${item.quantity}x ${item.name} - EGP ${(item.currentPrice * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*إجمالي الطلب: EGP ${cartTotal.toFixed(2)}*\n`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
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
            <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
              <Send size={18} />
              Checkout via WhatsApp
            </button>
            <p className="checkout-hint">
              You will be redirected to WhatsApp to arrange delivery and payment directly with our store.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default CartDrawer;
