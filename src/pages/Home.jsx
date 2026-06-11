import Hero from '../components/Hero';
import NewArrivalsCarousel from '../components/NewArrivalsCarousel';
import ProductGrid from '../components/ProductGrid';
import VoltechChat from '../components/VoltechChat';
import { useEffect } from 'react';

function Home() {
  useEffect(() => {
    document.title = 'Voltech Electronics Store | Power Your World';
  }, []);

  return (
    <>
      <Hero />
      <NewArrivalsCarousel />
      <ProductGrid />
      <VoltechChat />
    </>
  );
}

export default Home;
