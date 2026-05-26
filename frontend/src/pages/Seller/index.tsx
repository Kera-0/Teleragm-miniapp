import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  createProduct,
  deleteProduct,
  getAllOrders,
  getProducts,
  updateOrderStatus,
  updateProduct,
} from '@/api/marketplace';
import { useAccess } from '@/store/access';
import type { Order, Product } from '@/types';
import { formatDate, formatMoney } from '@/utils/format';

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stock: string;
};

const emptyProductForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  stock: '',
};

const orderStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

function productToForm(product: Product): ProductFormState {
  return {
    name: product.name,
    description: product.description ?? '',
    price: String(product.price),
    imageUrl: product.imageUrl ?? '',
    stock: String(product.stock),
  };
}

function trimOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function SellerPage() {
  const { level, loading: accessLoading, hasSellerAccess, hasAdminAccess } = useAccess();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const loadSellerData = useCallback(async () => {
    if (!hasSellerAccess) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [loadedProducts, loadedOrders] = await Promise.all([
        getProducts(false),
        getAllOrders(),
      ]);
      setProducts(loadedProducts);
      setOrders(loadedOrders);
    } catch {
      setError('Seller data is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [hasSellerAccess]);

  useEffect(() => {
    if (!accessLoading) {
      void loadSellerData();
    }
  }, [accessLoading, loadSellerData]);

  const stats = useMemo(() => {
    const inventoryUnits = products.reduce((sum, product) => sum + product.stock, 0);
    const openOrders = orders.filter(order => order.status !== 'DELIVERED' && order.status !== 'CANCELLED').length;
    const revenue = orders
      .filter(order => order.status !== 'CANCELLED')
      .reduce((sum, order) => sum + order.totalPrice, 0);

    return { inventoryUnits, openOrders, revenue };
  }, [orders, products]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        description: trimOrNull(form.description),
        price: Number(form.price),
        imageUrl: trimOrNull(form.imageUrl),
        stock: Number(form.stock),
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
      } else {
        await createProduct(payload);
      }

      setForm(emptyProductForm);
      setEditingProductId(null);
      await loadSellerData();
    } catch {
      setError('Could not save the product. Check the fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setForm(productToForm(product));
  };

  const handleDelete = async (productId: number) => {
    setDeletingProductId(productId);
    setError(null);
    try {
      await deleteProduct(productId);
      await loadSellerData();
    } catch {
      setError('Only admins can delete products, and products with order history may be protected.');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingOrderId(orderId);
    setError(null);
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders(current => current.map(order => (order.id === orderId ? updatedOrder : order)));
    } catch {
      setError('Could not update the order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (accessLoading || loading) {
    return <div className="state">Loading seller workspace...</div>;
  }

  if (!hasSellerAccess) {
    return (
      <div className="empty-state">
        <h2>Seller access required</h2>
        <p>Your current level is {level}. Ask the administrator to add your Telegram id to seller access.</p>
      </div>
    );
  }

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="eyebrow">seller admin</p>
          <h2>Products and orders</h2>
        </div>
        <button className="button button--ghost" type="button" onClick={loadSellerData}>
          Refresh
        </button>
      </div>

      {error ? <div className="state state--error seller-error">{error}</div> : null}

      <section className="seller-stats" aria-label="Seller dashboard summary">
        <div className="seller-stat">
          <span>Access level</span>
          <strong>{level}</strong>
        </div>
        <div className="seller-stat">
          <span>Inventory</span>
          <strong>{stats.inventoryUnits}</strong>
        </div>
        <div className="seller-stat">
          <span>Open orders</span>
          <strong>{stats.openOrders}</strong>
        </div>
        <div className="seller-stat">
          <span>Revenue</span>
          <strong>{formatMoney(stats.revenue)}</strong>
        </div>
      </section>

      <div className="seller-layout">
        <section className="seller-panel" aria-labelledby="product-form-title">
          <div className="seller-panel__header">
            <div>
              <p className="eyebrow">inventory</p>
              <h3 id="product-form-title">{editingProductId ? 'Edit product' : 'New product'}</h3>
            </div>
            {editingProductId ? (
              <button
                className="button button--ghost"
                type="button"
                onClick={() => {
                  setEditingProductId(null);
                  setForm(emptyProductForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>

          <form className="seller-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                required
                maxLength={255}
                value={form.name}
                onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              Description
              <textarea
                rows={4}
                value={form.description}
                onChange={event => setForm(current => ({ ...current, description: event.target.value }))}
              />
            </label>
            <div className="seller-form__row">
              <label>
                Price
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={form.price}
                  onChange={event => setForm(current => ({ ...current, price: event.target.value }))}
                />
              </label>
              <label>
                Stock
                <input
                  required
                  min="0"
                  step="1"
                  type="number"
                  value={form.stock}
                  onChange={event => setForm(current => ({ ...current, stock: event.target.value }))}
                />
              </label>
            </div>
            <label>
              Image URL
              <input
                maxLength={512}
                value={form.imageUrl}
                onChange={event => setForm(current => ({ ...current, imageUrl: event.target.value }))}
              />
            </label>
            <button className="button button--primary button--wide" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingProductId ? 'Save product' : 'Create product'}
            </button>
          </form>
        </section>

        <section className="seller-panel seller-panel--wide" aria-labelledby="products-title">
          <div className="seller-panel__header">
            <div>
              <p className="eyebrow">catalog</p>
              <h3 id="products-title">All products</h3>
            </div>
            <span>{products.length} items</span>
          </div>

          <div className="seller-product-list">
            {products.map(product => (
              <article className="seller-product" key={product.id}>
                <div className="seller-product__media">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : null}
                </div>
                <div>
                  <h4>{product.name}</h4>
                  <p>{product.description}</p>
                </div>
                <div className="seller-product__numbers">
                  <strong>{formatMoney(product.price)}</strong>
                  <span>{product.stock} left</span>
                </div>
                <div className="seller-product__actions">
                  <button className="button button--ghost" type="button" onClick={() => handleEdit(product)}>
                    Edit
                  </button>
                  {hasAdminAccess ? (
                    <button
                      className="button button--danger"
                      type="button"
                      disabled={deletingProductId === product.id}
                      onClick={() => handleDelete(product.id)}
                    >
                      {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="seller-panel seller-panel--orders" aria-labelledby="orders-title">
        <div className="seller-panel__header">
          <div>
            <p className="eyebrow">fulfillment</p>
            <h3 id="orders-title">All orders</h3>
          </div>
          <span>{orders.length} orders</span>
        </div>

        <div className="seller-orders">
          {orders.map(order => (
            <article className="seller-order" key={order.id}>
              <div className="seller-order__header">
                <div>
                  <h4>Order #{order.id}</h4>
                  <p>User {order.telegramUserId} · {formatDate(order.createdAt)}</p>
                </div>
                <select
                  value={order.status}
                  disabled={updatingOrderId === order.id}
                  onChange={event => handleStatusChange(order.id, event.target.value)}
                >
                  {orderStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
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
      </section>
    </>
  );
}
