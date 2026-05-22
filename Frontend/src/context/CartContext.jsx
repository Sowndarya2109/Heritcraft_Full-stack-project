import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();

  const [cart, setCart] = useState({ items: [] });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const calculate = (items) => {
    const count = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const price = items.reduce(
      (sum, item) =>
        sum +
        Number(item.product?.price || 0) *
          Number(item.quantity || 0),
      0
    );

    setTotalItems(count);
    setTotalPrice(price);
  };

  const saveCart = (items) => {
    localStorage.setItem("heritcraft_cart", JSON.stringify(items));
    setCart({ items });
    calculate(items);
  };

  const fetchCart = async () => {
    const saved = localStorage.getItem("heritcraft_cart");
    const items = saved ? JSON.parse(saved) : [];

    setCart({ items });
    calculate(items);
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (
    productId,
    quantity = 1,
    productData = null,
    selectedSize = null,
    selectedWeight = null
  ) => {
    if (!productData) return;

    const existing = cart.items.find(
      (item) =>
        item.product._id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedWeight === selectedWeight
    );

    let updated;

    if (existing) {
      updated = cart.items.map((item) =>
        item.product._id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedWeight === selectedWeight
          ? {
              ...item,
              quantity:
                Number(item.quantity || 0) + Number(quantity || 1),
            }
          : item
      );
    } else {
      updated = [
        ...cart.items,
        {
          product: productData,
          quantity: Number(quantity || 1),
          selectedSize,
          selectedWeight,
        },
      ];
    }

    saveCart(updated);

    return { success: true };
  };

  const updateItem = async (productId, quantity, selectedSize = null, selectedWeight = null) => {
    const safeQuantity = Math.max(1, Number(quantity || 1));

    const updated = cart.items.map((item) =>
      item.product._id === productId &&
      item.selectedSize === selectedSize &&
      item.selectedWeight === selectedWeight
        ? { ...item, quantity: safeQuantity }
        : item
    );

    saveCart(updated);
  };

  const increaseQuantity = (productId, selectedSize = null, selectedWeight = null) => {
    const updated = cart.items.map((item) =>
      item.product._id === productId &&
      item.selectedSize === selectedSize &&
      item.selectedWeight === selectedWeight
        ? {
            ...item,
            quantity: Number(item.quantity || 1) + 1,
          }
        : item
    );

    saveCart(updated);
  };

  const decreaseQuantity = (productId, selectedSize = null, selectedWeight = null) => {
    const updated = cart.items.map((item) =>
      item.product._id === productId &&
      item.selectedSize === selectedSize &&
      item.selectedWeight === selectedWeight
        ? {
            ...item,
            quantity: Math.max(1, Number(item.quantity || 1) - 1),
          }
        : item
    );

    saveCart(updated);
  };

  const removeItem = async (productId, selectedSize = null, selectedWeight = null) => {
    const updated = cart.items.filter(
      (item) =>
        !(
          item.product._id === productId &&
          item.selectedSize === selectedSize &&
          item.selectedWeight === selectedWeight
        )
    );

    saveCart(updated);
  };

  const clearCart = async () => {
    saveCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalPrice,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        increaseQuantity,
        decreaseQuantity,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};