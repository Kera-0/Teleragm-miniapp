import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '@/api/marketplace';
import type { Order } from '@/types';
import { formatDate, formatMoney } from '@/utils/format';
import { getTelegramUserId } from '@/utils/telegram';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrders(getTelegramUserId())
      .then(setOrders)
      .catch(() => setError('Orders are temporarily unavailable.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="state">Loading orders...</div>;
  }

  if (error) {
    return <div className="state state--error">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <h2>No orders yet</h2>
        <p>Created orders will show up here with their items and status.</p>
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
          <p className="eyebrow">history</p>
          <h2>My orders</h2>
        </div>
        <span>{orders.length} orders</span>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <article className="order-card" key={order.id}>
            <div className="order-card__header">
              <div>
                <h3>Order #{order.id}</h3>
                <p>{formatDate(order.createdAt)}</p>
              </div>
              <span className="status-pill">{order.status}</span>
            </div>

            <div className="order-card__items">
              {order.items.map(item => (
                <div className="order-line" key={item.id}>
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <strong>{formatMoney(item.totalPrice)}</strong>
                </div>
              ))}
            </div>

            <div className="order-card__footer">
              <span>Total</span>
              <strong>{formatMoney(order.totalPrice)}</strong>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
