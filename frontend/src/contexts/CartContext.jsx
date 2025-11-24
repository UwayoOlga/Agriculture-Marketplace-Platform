import { CartProvider, useCart } from '../context/CartContext';

// Re-export CartProvider and useCart from the singular `context` implementation
export { CartProvider, useCart };

// Default export for compatibility
export { default } from '../context/CartContext';
