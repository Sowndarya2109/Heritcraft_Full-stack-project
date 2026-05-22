
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import {
  FiTrash2,
  FiMinus,
  FiPlus,
  FiShoppingBag,
} from "react-icons/fi";

const CartPage = () => {
  const {
    cart,
    totalItems,
    totalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const shipping = totalPrice > 500 ? 0 : 50;

  const tax = Math.round(totalPrice * 0.18);

  const grandTotal = totalPrice + shipping + tax;

  if (!cart.items.length) {
    return (
      <div className="page-wrap text-center">
        <FiShoppingBag
          size={90}
          className="mx-auto text-gray-500 mb-8"
        />

        <h1 className="section-title">
          Your cart is empty
        </h1>

        <p className="section-subtitle mb-8">
          Discover beautiful handcrafted heritage items
        </p>

        <Link
          to="/products"
          className="btn-gold text-xl"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrap animate-fadeIn">
      <h1 className="section-title mb-10">
        Shopping Cart ({totalItems} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-5">
          {cart.items.map((item) => {
            const itemKey = `${item.product._id}-${item.selectedSize || ""}-${item.selectedWeight || ""}`;
            const itemImgSrc =
              item.product.images?.[0] ||
              item.product.media?.find((m) => m.type?.startsWith("image"))?.url ||
              item.product.image ||
              "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600";

            return (
              <div
                key={itemKey}
                className="panel flex gap-5 items-center"
              >
                <img
                  src={itemImgSrc}
                  alt={item.product.name}
                  className="w-36 h-36 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-1">
                    {item.product.name}
                  </h3>

                  {item.selectedSize && (
                    <p className="text-gray-400 text-sm mb-1">
                      Size: <span className="text-[var(--gold)] font-medium">{item.selectedSize}</span>
                    </p>
                  )}

                  {item.selectedWeight && (
                    <p className="text-gray-400 text-sm mb-1">
                      Weight: <span className="text-[var(--gold)] font-medium">{item.selectedWeight}</span>
                    </p>
                  )}

                  <p className="text-[var(--gold)] text-2xl font-black mb-4">
                    {formatCurrency(item.product.price)}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 border border-[var(--border)] rounded-full px-4 py-2">
                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.product._id,
                            item.selectedSize,
                            item.selectedWeight
                          )
                        }
                        className="text-lg"
                      >
                        <FiMinus />
                      </button>

                      <span className="font-bold text-xl min-w-[30px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.product._id,
                            item.selectedSize,
                            item.selectedWeight
                          )
                        }
                        className="text-lg"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() =>
                        removeItem(
                          item.product._id,
                          item.selectedSize,
                          item.selectedWeight
                        )
                      }
                      className="text-red-400 hover:text-red-500 transition"
                    >
                      <FiTrash2 size={24} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={clearCart}
            className="btn-outline"
          >
            Clear Cart
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="panel h-fit sticky top-36">
          <h2 className="text-3xl text-[var(--gold)] font-bold mb-8">
            Order Summary
          </h2>

          <div className="space-y-4 text-xl">
            <div className="flex justify-between">
              <span>Subtotal</span>

              <span>
                {formatCurrency(totalPrice)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>

              <span>
                {shipping === 0
                  ? "FREE"
                  : formatCurrency(shipping)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>

              <span>{formatCurrency(tax)}</span>
            </div>

            <div className="border-t border-[var(--border)] pt-4 flex justify-between font-black text-2xl">
              <span>Total</span>

              <span className="text-[var(--gold)]">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="btn-gold w-full mt-8 text-xl"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

