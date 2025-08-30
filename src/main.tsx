import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CartProvider } from './contexts/cart-context';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Make sure you have a div with id="root" in your HTML.');
}

createRoot(container).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>
);
