interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  return (
    <div className="product-card">
      {product.imageUrl && (
        <img src={product.imageUrl} alt={product.name} className="product-card__image" />
      )}
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          <button className="product-card__btn">Add to cart</button>
        </div>
      </div>
    </div>
  );
}
