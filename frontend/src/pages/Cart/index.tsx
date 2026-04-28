import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '@/api/marketplace';
import { useCart } from '@/store/cart';
import { formatMoney } from '@/utils/format';
import { getTelegramUserId } from '@/utils/telegram';

export default function CartPage() {
  const {
    items,
    totalItems,
    totalPrice,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await createOrder({
        telegramUserId: getTelegramUserId(),
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
      clearCart();
      navigate('/orders');
    } catch {
      setError('Could not create the order. Check stock and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Your cart is empty</h2>
        <p>Pick a few items from the catalog and they will appear here.</p>
        <Link className="button button--primary" to="/">
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">checkout</p>
          <h2>Your cart</h2>
        </div>
        <span>{totalItems} items</span>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map(item => (
            <article className="cart-item" key={item.product.id}>
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="cart-item__image"
                />
              ) : (
                <div className="cart-item__placeholder" aria-hidden="true" />
              )}
              <div className="cart-item__body">
                <h3>{item.product.name}</h3>
                <p>{formatMoney(item.product.price)}</p>
                <div className="quantity-control">
                  <button type="button" onClick={() => decrementItem(item.product.id)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => incrementItem(item.product.id)}
                    disabled={item.quantity >= item.product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item__aside">
                <strong>{formatMoney(item.product.price * item.quantity)}</strong>
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-panel">
          <div>
            <p className="eyebrow">total</p>
            <strong>{formatMoney(totalPrice)}</strong>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="button button--primary button--wide"
            type="button"
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create order'}
          </button>
        </aside>
      </div>
    </>
  );
}
