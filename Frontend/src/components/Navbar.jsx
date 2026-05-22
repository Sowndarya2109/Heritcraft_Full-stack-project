import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiSearch,
} from "react-icons/fi";

import AuthModal from "./AuthModal";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [authModal, setAuthModal] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dashboardPath =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "seller"
      ? "/seller"
      : "/buyer";

  const closeMenus = () => {
    setShowUserMenu(false);
    setMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    closeMenus();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    closeMenus();
  };

  return (
    <>
      <nav className="navbar">
        {/* LOGO */}
        <Link to="/" className="logo-wrapper" onClick={closeMenus}>
          <h1 className="logo-main">HERITCRAFT</h1>
          <p className="logo-sub">Where Heritage Meets Creativity</p>
        </Link>

        {/* SEARCH */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for handmade products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button type="submit" className="search-btn">
            <FiSearch size={28} />
          </button>
        </form>

        {/* DESKTOP NAV */}
        <div className="nav-links hidden lg:flex">
          <Link to="/" onClick={closeMenus}>
            Home
          </Link>

          <Link to="/products" onClick={closeMenus}>
            Products
          </Link>

          {!user ? (
            <div className="auth-buttons">
              <button
                onClick={() => {
                  setAuthModal("login");
                  closeMenus();
                }}
                className="buyer-btn"
              >
                Login
              </button>

              <button
                onClick={() => {
                  setAuthModal("signup");
                  closeMenus();
                }}
                className="seller-btn"
              >
                Signup
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="flex items-center gap-2"
              >
                <FiUser size={26} />
                {user.name}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-14 panel w-52 z-50">
                  <Link
                    to={dashboardPath}
                    onClick={closeMenus}
                    className="block py-2 hover:text-[var(--gold)]"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block py-2 text-red-400"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {["buyer", "seller"].includes(user?.role) && (
            <Link to="/cart" onClick={closeMenus} className="cart-icon-btn">
              <FiShoppingCart size={34} />

              {totalItems > 0 && (
                <span className="cart-count">{totalItems}</span>
              )}
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FiX size={32} /> : <FiMenu size={32} />}
        </button>
      </nav>

      {/* MOBILE DROPDOWN */}
      {menuOpen && (
        <div className="lg:hidden panel mx-5 mt-3 space-y-4">
          <Link to="/" onClick={closeMenus} className="block">
            Home
          </Link>

          <Link to="/#categories" onClick={closeMenus} className="block">
            Categories
          </Link>

          <Link to="/products" onClick={closeMenus} className="block">
            Products
          </Link>

          {!user ? (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setAuthModal("login");
                  closeMenus();
                }}
                className="buyer-btn w-full"
              >
                Login
              </button>

              <button
                onClick={() => {
                  setAuthModal("signup");
                  closeMenus();
                }}
                className="seller-btn w-full"
              >
                Signup
              </button>
            </div>
          ) : (
            <>
              <Link
                to={dashboardPath}
                onClick={closeMenus}
                className="block py-2 hover:text-[var(--gold)]"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="block py-2 text-red-400"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* AUTH MODAL */}
      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />
      )}
    </>
  );
};

export default Navbar;