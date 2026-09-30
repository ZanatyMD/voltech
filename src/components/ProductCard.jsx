import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { showToast } from './Toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ProductCard.css';

function ProductCard({ product, index = 0 }) {
  const { addToCart, cartItems } = useCart();
  
  if (!product) return null;
  
  const { name = '', originalPrice = 0, currentPrice = 0, stock = 0, imageUrl = '', category = '' } = product;
  
  const discountPercent = (originalPrice && originalPrice > currentPrice)
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
    : 0;
  const isInStock = (Number(stock) || 0) > 0;

  const handleAddToCart = () => {
    const existingItem = (cartItems || []).find(item => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty >= stock) {
      showToast(`Sorry, maximum available quantity reached for this item.`, 'error');
      return;
    }
    addToCart(product);
    showToast(`${name} added to cart!`, 'success', 2000);
  };

  return (
    <motion.div
      className={`product-card-container ${!isInStock ? 'out-of-stock' : ''}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.6,
        delay: (index % 4) * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <Link to={`/product/${product.id}`} className="hologram-image-wrapper">
        <img src={imageUrl} alt={name} className="hologram-image" loading="lazy" />
        {!isInStock && (
          <div className="hologram-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="product-card">
        {discountPercent > 0 && (
          <div className="cyber-discount">
            -{discountPercent}%
          </div>
        )}

        <div className="cyber-info">
          <span className="cyber-category">{category}</span>
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <h3 className="cyber-name">{name}</h3>
          </Link>
          
          <div className="cyber-pricing">
            <span className="cyber-price">EGP {Number(currentPrice || 0).toFixed(0)}</span>
            {discountPercent > 0 && (
              <span className="cyber-price-original">EGP {Number(originalPrice || 0).toFixed(0)}</span>
            )}
          </div>

          <button 
            className="cyber-add-btn" 
            disabled={!isInStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={16} />
            {isInStock ? 'Add to Cart' : 'Sold Out'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProductCard;
