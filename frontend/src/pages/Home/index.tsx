import { useEffect, useState } from 'react';
import { ProductCard } from './components/ProductCard';
import { getProducts } from '@/api/marketplace';
import { useCart } from '@/store/cart';
import type { Product } from '@/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Products are temporarily unavailable.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="state">Loading products...</div>;
  }

  if (error) {
    return <div className="state state--error">{error}</div>;
  }

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">catalog</p>
          <h2>Fresh picks</h2>
        </div>
        <span>{products.length} items</span>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={addItem} />
        ))}
      </div>
    </>
  );
}
