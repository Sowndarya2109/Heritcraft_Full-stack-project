import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const BuyerDashboard = lazy(() => import("./dashboards/BuyerDashboard"));
const SellerDashboard = lazy(() => import("./dashboards/SellerDashboard"));
const AdminDashboard = lazy(() => import("./dashboards/AdminDashboard"));

const PageLoader = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--black)] text-white">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/products" element={<ProductsPage />} />

            <Route path="/products/:id" element={<ProductDetailPage />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/buyer/*"
              element={
                <ProtectedRoute roles={["buyer"]}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/seller/*"
              element={
                <ProtectedRoute roles={["seller"]}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;