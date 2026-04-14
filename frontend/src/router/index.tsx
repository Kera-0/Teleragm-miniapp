import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/Home';
import CartPage from '@/pages/Cart';
import OrdersPage from '@/pages/Orders';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/orders',
    element: <OrdersPage />,
  },
]);
