import { useEffect, useState } from 'react';
import { ProductCard } from './components/ProductCard';
import { api } from '@/api/client';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Product[]>('/products')
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="product-grid">
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
