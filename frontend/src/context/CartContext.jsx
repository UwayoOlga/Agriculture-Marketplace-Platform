import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage if available
    const savedCart = typeof window !== 'undefined' ? localStorage.getItem('cart') : null;
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const { enqueueSnackbar } = useSnackbar();

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = async (product, quantity = 1) => {
    // Update local cart first for immediate UI feedback
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItem = prevCart.find(item => item.id === product.id);

      if (existingItem) {
        // Update quantity if product exists
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      // Add new product to cart
      return [...prevCart, { ...product, quantity }];
    });

    // Also send to backend to create CartRequest for farmer approval
    try {
      const apiClient = (await import('../api/apiClient')).default;
      await apiClient.post('/cart/items/', {
        product: product.id,
        quantity: quantity
      });
    } catch (error) {
      console.error('Failed to create cart request:', error);
      // Still show success to user since local cart was updated
    }

    enqueueSnackbar(`${product.name} added to cart`, { variant: 'success' });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    enqueueSnackbar('Item removed from cart', { variant: 'info' });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculate total items in cart
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price
  const total = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) * item.quantity),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
