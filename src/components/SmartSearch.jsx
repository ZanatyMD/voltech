import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Search, X } from 'lucide-react';
import { smartSearch } from '../utils/search';
import { AnimatePresence, motion } from 'framer-motion';
import './SmartSearch.css';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const { products } = useProducts();
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  // Handle search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    // Use the existing smartSearch utility
    const filtered = products.filter(p => smartSearch(p.name, query));
    setResults(filtered.slice(0, 5)); // Limit to 5 results
  }, [query, products]);

  const handleSelectProduct = (productId) => {
    navigate(`/product/${productId}`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="smart-search-container" ref={wrapperRef}>
      <div className="smart-search-wrapper">
        <input
          type="text"
          className="smart-search-input"
          placeholder="Search products..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
              setIsOpen(false);
              setQuery('');
            }
          }}
        />
        <Search size={18} className="smart-search-icon" />
        
        {query && (
          <button className="smart-search-clear" onClick={() => {
            setQuery('');
            setIsOpen(false);
          }}>
            <X size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div 
            className="smart-search-results"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {results.length > 0 ? (
              results.map(product => (
                <div 
                  key={product.id} 
                  className="search-result-item"
                  onClick={() => handleSelectProduct(product.id)}
                >
                  <img src={product.imageUrl} alt={product.name} className="search-result-img" />
                  <div className="search-result-info">
                    <span className="search-result-name">{product.name}</span>
                    <span className="search-result-price">EGP {product.currentPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="search-no-results">
                <p className="no-res-query">No results found for "{query}"?</p>
                <a 
                  href={`https://wa.me/201503476600?text=${encodeURIComponent(`مرحباً فولتك! أبحث عن القطعة التالية ولم أجدها في المتجر: ${query.trim()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="search-whatsapp-order-link"
                >
                  Click here to order it via WhatsApp!
                </a>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
