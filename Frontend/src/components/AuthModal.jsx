import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiEye, FiEyeOff, FiLoader } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const AuthModal = ({ mode = "login", onClose }) => {
  const [currentMode, setCurrentMode] = useState(mode);
  const isSignup = currentMode === "signup";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    shopName: "",
    shopDescription: "",
  });

  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    if (role === "admin") return "/admin";
    if (role === "seller") return "/seller";
    return "/";
  };

  const detectRoleFromEmail = (email) => {
    const lowerEmail = email.toLowerCase();

    if (lowerEmail.includes("admin")) return "admin";
    if (lowerEmail.includes("seller")) return "seller";
    return "buyer";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let result;

      if (isSignup) {
        result = await register(form);
      } else {
        const detectedRole = detectRoleFromEmail(form.email);

        result = await login(form.email, form.password, detectedRole);
      }

      const loggedUser = result?.user || JSON.parse(localStorage.getItem("heritcraft_user"));
      const userRole = loggedUser?.role || detectRoleFromEmail(form.email);

      toast.success(`${userRole} login successful`);
      onClose();
      navigate(getRedirectPath(userRole));
    } catch (err) {
      setError(err.message || "Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-box animate-slideUp" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="auth-close">
          <FiX size={26} />
        </button>

        <h2 className="auth-title">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <p className="auth-subtitle">
          {isSignup
            ? "Create your HeritCraft account"
            : "Login with your registered email"}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-box">{error}</div>}

          {isSignup && (
            <>
              <div className="field">
                <label>Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-gold"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="field">
                <label>Register As</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input-gold"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </>
          )}

          <div className="field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-gold"
              placeholder="buyer@gmail.com / seller@gmail.com / admin@gmail.com"
              required
            />
          </div>

          <div className="field relative">
            <label>Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="input-gold pr-12"
              placeholder="Enter your password"
              required
              minLength={6}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 bottom-5 text-gray-400"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {isSignup && form.role === "seller" && (
            <>
              <div className="field">
                <label>Shop Name</label>
                <input
                  name="shopName"
                  value={form.shopName}
                  onChange={handleChange}
                  className="input-gold"
                  placeholder="Enter your shop name"
                />
              </div>

              <div className="field">
                <label>Shop Description</label>
                <textarea
                  name="shopDescription"
                  value={form.shopDescription}
                  onChange={handleChange}
                  className="input-gold"
                  rows="3"
                  placeholder="Describe your craft"
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="btn-gold w-full mt-2 text-xl">
            {loading ? (
              <FiLoader className="animate-spin mx-auto" />
            ) : isSignup ? (
              "Signup"
            ) : (
              "Login"
            )}
          </button>

          <div className="auth-switch-text">
  {isSignup ? (
    <>
      Already have an account?{" "}
      <span onClick={() => setCurrentMode("login")}>
        Login
      </span>
    </>
  ) : (
    <>
      New to HeritCraft?{" "}
      <span onClick={() => setCurrentMode("signup")}>
        Signup
      </span>
    </>
  )}
</div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;