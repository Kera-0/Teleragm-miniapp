import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AccessProvider } from './store/access';
import { CartProvider } from './store/cart';

export default function App() {
  return (
    <AccessProvider>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </AccessProvider>
  );
}
