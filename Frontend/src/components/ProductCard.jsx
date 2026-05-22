import { Link } from "react-router-dom";
import { FiStar, FiShoppingCart } from "react-icons/fi";
import { formatCurrency } from "../utils/helpers";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const imgSrc =
    product.images?.[0] ||
    product.media?.find((item) => item.type?.startsWith("image"))?.url ||
    product.image ||
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600";

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!user || !["buyer", "seller","admin"].includes(user.role)) {
      toast.warning("Please login to add items");
      return;
    }

    await addToCart(product._id, 1, product);
    toast.success("Added to cart");
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-img-box">
        <img src={imgSrc} alt={product.name} />

        {product.offer && (
          <span className="product-offer">
            {product.offer}% OFF
          </span>
        )}
      </div>

      <div className="product-card-body">
        <h3>{product.name}</h3>

        <p className="product-seller">
          {product.seller?.shopName || "HeritCraft Seller"}
        </p>

        <div className="product-rating">
          <FiStar />
          <strong>
            {product.averageRating?.toFixed?.(1) || "4.5"}
          </strong>
          <span>({product.numReviews || 24})</span>
        </div>

        <div className="product-bottom">
          <div>
            <span className="product-price">
              {formatCurrency(product.price)}
            </span>

            {product.oldPrice && (
              <span className="product-old-price">
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>

          <button onClick={handleAdd} className="product-add-btn">
            <FiShoppingCart />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;