import { NavLink, Outlet } from 'react-router-dom';
import { useCart } from '@/store/cart';

const navItems = [
  { to: '/', label: 'Shop' },
  { to: '/cart', label: 'Cart' },
  { to: '/orders', label: 'Orders' },
];

export function AppShell() {
  const { totalItems } = useCart();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">mini marketplace</p>
          <h1>Thing Shop</h1>
        </div>
        <nav className="nav" aria-label="Main navigation">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav__link nav__link--active' : 'nav__link')}
            >
              {item.label}
              {item.to === '/cart' && totalItems > 0 ? (
                <span className="nav__badge">{totalItems}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
