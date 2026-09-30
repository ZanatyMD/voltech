import ProductGrid from '../components/ProductGrid';
import VoltechChat from '../components/VoltechChat';
import { useEffect } from 'react';

function Shop() {
  useEffect(() => {
    document.title = 'Shop | Voltech Electronics Store';
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <ProductGrid />
      <VoltechChat />
    </>
  );
}

export default Shop;
