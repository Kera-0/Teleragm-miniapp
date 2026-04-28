import type { Product } from '@/types';

interface Props {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: Props) {
  const isSoldOut = product.stock <= 0;

  return (
    <div className="product-card">
      <div className="product-card__media">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="product-card__body">
        <div>
          <h2 className="product-card__name">{product.name}</h2>
          <p className="product-card__description">{product.description}</p>
        </div>
        <div className="product-card__footer">
          <div>
            <span className="product-card__price">${product.price.toFixed(2)}</span>
            <span className="product-card__stock">{product.stock} left</span>
          </div>
          <button
            className="button button--primary"
            disabled={isSoldOut}
            type="button"
            onClick={() => onAddToCart(product)}
          >
            {isSoldOut ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
