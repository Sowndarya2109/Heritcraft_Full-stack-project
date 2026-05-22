import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [trackingOrder, setTrackingOrder] = useState(null);

  const [orders, setOrders] = useState([
    {
      id: 1000,
      product: "Handwoven Silk Saree",
      status: "Shipped",
      quantity: 1,
      amount: "₹3,200",
      payment: "Card",
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600",
    },
    {
      id: 1001,
      product: "Terracotta Pot Set",
      status: "Delivered",
      quantity: 2,
      amount: "₹1,800",
      payment: "UPI",
      image:
        "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?q=80&w=600",
    },
    {
      id: 1002,
      product: "Traditional Jhumka",
      status: "Delivered",
      quantity: 1,
      amount: "₹4,851",
      payment: "COD",
      image:
        "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600",
    },
  ]);

  const cancelOrder = (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status: "Cancelled" } : order
      )
    );
  };

  const totalOrders = orders.length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;
  const inTransit = orders.filter((o) => o.status === "Shipped").length;
  const processing = orders.filter((o) =>
    ["Placed", "Processing"].includes(o.status)
  ).length;

  const trackingSteps = [
    "Order Placed",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const getActiveStep = (status) => {
    if (status === "Placed") return 0;
    if (status === "Processing") return 1;
    if (status === "Shipped") return 2;
    if (status === "Delivered") return 4;
    return 0;
  };

  return (
    <div className="page-wrap animate-fadeIn">
      <h1 className="section-title">
        Welcome back, {user?.name || "Demo Buyer"}
      </h1>

      <p className="section-subtitle mb-10">
        Track your heritage treasures
      </p>

      <div className="buyer-stats">
        <div>
          <span>📦</span>
          <h2>{totalOrders}</h2>
          <p>Total Orders</p>
        </div>

        <div>
          <span>✅</span>
          <h2>{delivered}</h2>
          <p>Delivered</p>
        </div>

        <div>
          <span>🚚</span>
          <h2>{inTransit}</h2>
          <p>In Transit</p>
        </div>

        <div>
          <span>⏳</span>
          <h2>{processing}</h2>
          <p>Processing</p>
        </div>
      </div>

      <div className="panel mt-10">
        <h2 className="text-3xl font-bold mb-8">My Orders</h2>

        {orders.map((order) => (
          <div key={order.id} className="buyer-order-row">
            <div>
              <h3>Order #{order.id}</h3>
              <p>{order.product}</p>
            </div>

            <div className="buyer-order-actions">
              <span
                className={
                  order.status === "Cancelled"
                    ? "status-cancelled"
                    : order.status === "Delivered"
                    ? "status-delivered"
                    : "status-shipped"
                }
              >
                {order.status}
              </span>

              {order.status !== "Cancelled" && (
                <button
                  className="track-order-btn"
                  onClick={() => setTrackingOrder(order)}
                >
                  Track Order
                </button>
              )}

              {order.status !== "Delivered" &&
                order.status !== "Cancelled" && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="cancel-order-btn"
                  >
                    Cancel Order
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {trackingOrder && (
        <div className="tracking-overlay">
          <div className="tracking-modal">
            <button
              className="tracking-close"
              onClick={() => setTrackingOrder(null)}
            >
              ✕
            </button>

            <h1 className="tracking-title">Track Your Order</h1>

            <p className="tracking-id">
              Order ID: HC{trackingOrder.id}2566
            </p>

            <div className="tracking-top-grid">
              <div>
                <p>Order Date</p>
                <h3>5/20/2026</h3>
              </div>

              <div>
                <p>Total Amount</p>
                <h3>{trackingOrder.amount}</h3>
              </div>

              <div>
                <p>Payment Method</p>
                <h3>{trackingOrder.payment}</h3>
              </div>
            </div>

            <div className="tracking-section">
              <h2>Order Status</h2>

              <div className="tracking-steps">
                {trackingSteps.map((step, index) => {
                  const activeStep = getActiveStep(trackingOrder.status);
                  const isActive = index <= activeStep;

                  return (
                    <div key={step}>
                      <div
                        className={`tracking-step ${
                          isActive ? "active" : ""
                        }`}
                      >
                        <div className="tracking-icon">
                          {index === 0
                            ? "✓"
                            : index === 1
                            ? "📦"
                            : index === 2
                            ? "🚚"
                            : index === 3
                            ? "📍"
                            : "✔"}
                        </div>

                        <div>
                          <h3>{step}</h3>
                          {index === activeStep && (
                            <p>
                              {trackingOrder.status === "Delivered"
                                ? "Completed"
                                : "In Progress"}
                            </p>
                          )}
                        </div>

                        {index === activeStep && (
                          <span>5/20/2026</span>
                        )}
                      </div>

                      {index !== trackingSteps.length - 1 && (
                        <div
                          className={`tracking-line ${
                            index < activeStep ? "active" : ""
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="tracking-section">
              <h2>Order Items</h2>

              <div className="tracking-product">
                <img src={trackingOrder.image} alt={trackingOrder.product} />

                <div>
                  <h3>{trackingOrder.product}</h3>
                  <p>Quantity: {trackingOrder.quantity}</p>
                  <span>{trackingOrder.amount}</span>
                </div>
              </div>
            </div>

            <div className="tracking-section">
              <h2>Shipping Address</h2>

              <div className="tracking-address">
                <h3>Sowndarya J</h3>
                <p>Kattur, Trichy, Tamil Nadu</p>
                <p>India - 620019</p>
                <p>Phone: +91 9876543210</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;