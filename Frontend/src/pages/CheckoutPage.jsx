import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import { FiCheck } from 'react-icons/fi';

const CheckoutPage = () => {
  const {
    cart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    zip: '',
    address: '',
    city: '',
    state: '',
    payment: 'UPI',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // CALCULATIONS
  const subtotal = cart.items.reduce(
    (acc, item) =>
      acc + item.product.price * item.quantity,
    0
  );

  const totalQuantity = cart.items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // SHIPPING BASED ON QUANTITY
  const shipping = totalQuantity >= 3 ? 0 : 50;

  // GST
  const tax = Math.round(subtotal * 0.02);

  // FINAL TOTAL
  const grandTotal = subtotal + shipping + tax;

  // PLACE ORDER
  const placeOrder = async () => {
    const {
      fullName,
      phone,
      zip,
      address,
      city,
      state,
      payment,
    } = formData;

    // VALIDATION
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !zip.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !payment.trim()
    ) {
      alert('Please fill all mandatory fields');
      return;
    }

    // PHONE VALIDATION
    if (phone.length < 10) {
      alert('Enter valid phone number');
      return;
    }

    await clearCart();
    setSuccess(true);
  };

  // SUCCESS PAGE
  if (success) {
    return (
      <div className="page-wrap text-center">
        <div className="w-28 h-28 rounded-full bg-[var(--gold)] text-black flex items-center justify-center mx-auto mb-8">
          <FiCheck size={60} />
        </div>

        <h1 className="section-title">
          Order Placed Successfully!
        </h1>

        <p className="section-subtitle mb-8">
          Your heritage treasure is on the way.
        </p>

        <button
          onClick={() => navigate('/buyer')}
          className="btn-gold text-xl"
        >
          View Orders
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrap animate-fadeIn">
      <h1 className="section-title mb-10">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 panel">

          {/* SHIPPING */}
          <h2 className="text-3xl text-[var(--gold)] font-bold mb-6">
            Shipping Address
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <input
              className="input-gold md:col-span-2"
              placeholder="Full Name *"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <input
              className="input-gold"
              placeholder="Phone Number *"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />

            <input
              className="input-gold"
              placeholder="Zip Code *"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              required
            />

            <input
              className="input-gold md:col-span-2"
              placeholder="Street Address *"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />

            <input
              className="input-gold"
              placeholder="City *"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <input
              className="input-gold"
              placeholder="State *"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />

          </div>

          {/* PAYMENT */}
          <h2 className="text-3xl text-[var(--gold)] font-bold mt-10 mb-6">
            Payment Method
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {[
              'UPI',
              'Credit / Debit Card',
              'Net Banking',
              'Cash on Delivery',
            ].map((method) => (

              <label
                key={method}
                className="panel flex items-center gap-3 cursor-pointer"
              >

                <input
                  type="radio"
                  name="payment"
                  value={method}
                  checked={formData.payment === method}
                  onChange={handleChange}
                />

                {method}

              </label>
            ))}

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="panel h-fit sticky top-36">

          <h2 className="text-3xl text-[var(--gold)] font-bold mb-6">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">

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
                  className="flex gap-4 border-b border-[var(--border)] pb-4"
                >
                  <img
                    src={itemImgSrc}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />

                  <div className="flex-1">
                    <p className="font-semibold text-white">
                      {item.product.name}
                    </p>

                    {item.selectedSize && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        Size: <span className="text-[var(--gold)]">{item.selectedSize}</span>
                      </p>
                    )}

                    {item.selectedWeight && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        Weight: <span className="text-[var(--gold)]">{item.selectedWeight}</span>
                      </p>
                    )}

                    <p className="text-[var(--gold)] font-bold mt-1">
                      {formatCurrency(item.product.price)}
                    </p>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        className="qty-btn"
                        onClick={() =>
                          decreaseQuantity(
                            item.product._id,
                            item.selectedSize,
                            item.selectedWeight
                          )
                        }
                      >
                        -
                      </button>

                      <span className="font-bold text-lg">
                        {item.quantity}
                      </span>

                      <button
                        className="qty-btn"
                        onClick={() =>
                          increaseQuantity(
                            item.product._id,
                            item.selectedSize,
                            item.selectedWeight
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      Total
                    </p>

                    <p className="text-[var(--gold)] font-bold text-lg">
                      {formatCurrency(
                        item.product.price * item.quantity
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TOTALS */}
          <div className="border-t border-[var(--border)] pt-5 space-y-3">

            <div className="flex justify-between">
              <span>Subtotal</span>

              <span>
                {formatCurrency(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>

              <span>
                {shipping === 0
                  ? 'FREE'
                  : formatCurrency(shipping)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>GST</span>

              <span>
                {formatCurrency(tax)}
              </span>
            </div>

            <div className="flex justify-between text-2xl font-black">

              <span>Total</span>

              <span className="text-[var(--gold)]">
                {formatCurrency(grandTotal)}
              </span>

            </div>
          </div>

          {/* PLACE ORDER */}
          <button
            onClick={placeOrder}
            className="btn-gold w-full mt-8 text-xl"
          >
            Place Order
          </button>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;