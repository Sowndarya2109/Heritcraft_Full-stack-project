import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiStar, FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import { getAllProducts } from "../utils/productHelper";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency } from "../utils/helpers";

const sizePriceMap = {
  XS: 0.9,
  S: 1,
  M: 1.1,
  L: 1.2,
  XL: 1.35,
  XXL: 1.5,
  "Free Size": 1.15,
};

const weightPriceMap = {
  "100 g": 1,
  "250 g": 2.2,
  "500 g": 4,
  "1 kg": 7,
  "2 kg": 13,
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [allProducts, setAllProducts] = useState(getAllProducts());
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    const handleUpdate = () => {
      setAllProducts(getAllProducts());
    };

    window.addEventListener("storage", handleUpdate);
    window.addEventListener("sellerProductsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("storage", handleUpdate);
      window.removeEventListener("sellerProductsUpdated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [id]);

  const product = useMemo(() => {
    return (
      allProducts.find(
        (p) =>
          String(p._id) === String(id) ||
          String(p.id) === String(id)
      ) || allProducts[0]
    );
  }, [allProducts, id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return allProducts
      .filter(
        (p) =>
          p.category === product.category &&
          String(p._id) !== String(product._id)
      )
      .slice(0, 4);
  }, [allProducts, product]);

  useEffect(() => {
    setActiveMediaIndex(0);
    setSelectedSize("");
    setSelectedWeight("");
    setQuantity(1);
  }, [product]);

  const galleryItems = useMemo(() => {
    if (!product) return [];

    const items = [];

    if (product.media && product.media.length > 0) {
      product.media.forEach((m) => {
        items.push({
          url: m.url,
          type: m.type?.startsWith("video") ? "video" : "image",
        });
      });
    }

    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const alreadyExists = items.some((item) => item.url === img);

        if (!alreadyExists) {
          items.push({
            url: img,
            type: "image",
          });
        }
      });
    }

    if (product.videos && product.videos.length > 0) {
      product.videos.forEach((vid) => {
        const alreadyExists = items.some((item) => item.url === vid);

        if (!alreadyExists) {
          items.push({
            url: vid,
            type: "video",
          });
        }
      });
    }

    if (items.length === 0) {
      items.push({
        url:
          product.image ||
          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
        type: "image",
      });
    }

    return items;
  }, [product]);

  const activeMedia = galleryItems[activeMediaIndex] || galleryItems[0];

  const categoryName = product?.category?.toLowerCase()?.trim();

  const hasSizes =
    (product?.sizes && product.sizes.length > 0) ||
    ["handmade clothes", "textiles"].includes(categoryName);

  const hasWeights =
    (product?.weights && product.weights.length > 0) ||
    categoryName === "handmade snacks";

  const selectedSizeMultiplier = selectedSize
    ? sizePriceMap[selectedSize] || 1
    : 1;

  const selectedWeightMultiplier = selectedWeight
    ? weightPriceMap[selectedWeight] || 1
    : 1;

  const displayPrice = hasWeights
    ? Math.round(Number(product?.price || 0) * selectedWeightMultiplier)
    : hasSizes
    ? Math.round(Number(product?.price || 0) * selectedSizeMultiplier)
    : Number(product?.price || 0);

  const displayOldPrice = hasWeights
    ? Math.round(Number(product?.oldPrice || 0) * selectedWeightMultiplier)
    : hasSizes
    ? Math.round(Number(product?.oldPrice || 0) * selectedSizeMultiplier)
    : Number(product?.oldPrice || 0);

  const discount =
    displayOldPrice && displayPrice
      ? Math.round(((displayOldPrice - displayPrice) / displayOldPrice) * 100)
      : product?.offer || 0;

  const validateSelection = () => {
    if (!user || !["buyer", "seller", "admin"].includes(user.role)) {
      toast.warning("Please login to continue");
      return false;
    }

    if (hasSizes && !selectedSize) {
      toast.warning("Please select a size");
      return false;
    }

    if (hasWeights && !selectedWeight) {
      toast.warning("Please select a weight");
      return false;
    }

    return true;
  };

  const selectedProductForCart = {
    ...product,
    price: displayPrice,
    oldPrice: displayOldPrice || product?.oldPrice,
    selectedSize,
    selectedWeight,
  };

  const handleAddToCart = async () => {
    if (!validateSelection()) return;

    await addToCart(
      product._id,
      quantity,
      selectedProductForCart,
      selectedSize,
      selectedWeight
    );

    toast.success("Added to cart");
  };

  const handleBuyNow = async () => {
    if (!validateSelection()) return;

    await addToCart(
      product._id,
      quantity,
      selectedProductForCart,
      selectedSize,
      selectedWeight
    );

    navigate("/checkout");
  };

  const submitReview = () => {
    if (!reviewText.trim()) {
      toast.warning("Please write your feedback");
      return;
    }

    toast.success("Feedback submitted");
    setReviewText("");
  };

  if (!product) {
    return (
      <div className="page-wrap text-center">
        <h1 className="section-title">Product not found</h1>
        <Link to="/products" className="btn-gold">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page animate-fadeIn">
      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${encodeURIComponent(product.category)}`}>
          {product.category}
        </Link>
        <span>/</span>
        <b>{product.name}</b>
      </div>

      <div className="product-detail-main">
        <div className="product-detail-gallery">
          <div className="product-gallery-thumbnails">
            {galleryItems.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                onClick={() => setActiveMediaIndex(index)}
                className={`gallery-thumb-btn ${
                  activeMediaIndex === index ? "active-thumb" : ""
                }`}
              >
                {item.type === "video" ? (
                  <div className="video-thumb-container">
                    <video
                      src={item.url}
                      muted
                      className="gallery-thumb-video"
                    />
                    <span className="play-icon-overlay">▶</span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="gallery-thumb-img"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="product-gallery-main">
            {activeMedia?.type === "video" ? (
              <video
                src={activeMedia.url}
                controls
                className="gallery-main-video"
              />
            ) : (
              <img
                src={activeMedia?.url}
                alt={product.name}
                className="gallery-main-img"
              />
            )}
          </div>
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>

          <p className="seller-line">
            by <span>{product.seller?.shopName || "HeritCraft Seller"}</span>
          </p>

          <div className="detail-rating-row">
            <span>
              <FiStar /> {product.averageRating?.toFixed?.(1) || "4.8"}
            </span>

            <p>{product.numReviews || 234} reviews</p>
          </div>

          <div className="detail-price-row">
            <h2>{formatCurrency(displayPrice)}</h2>

            {displayOldPrice > 0 && (
              <p className="detail-old-price">
                {formatCurrency(displayOldPrice)}
              </p>
            )}

            {discount > 0 && <span>{discount}% off</span>}
          </div>

          <p className="tax-text">Inclusive of all taxes</p>

          <p className="stock-text">
            ✓ In Stock ({product.stock || 12} available)
          </p>

          {hasSizes && (
            <div className="size-selector-box mb-6">
              <p className="font-bold text-white mb-2">Select Size *</p>

              <div className="flex gap-2 flex-wrap">
                {(product.sizes?.length
                  ? product.sizes
                  : ["XS", "S", "M", "L", "XL", "XXL", "Free Size"]
                ).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg text-sm font-semibold transition ${
                      selectedSize === size
                        ? "border-[var(--gold)] text-[var(--gold)] bg-[rgba(212,175,55,0.1)]"
                        : "border-gray-600 text-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasWeights && (
            <div className="weight-selector-box mb-6">
              <p className="font-bold text-white mb-2">
                Select Weight/Unit *
              </p>

              <div className="flex gap-2 flex-wrap">
                {(product.weights?.length
                  ? product.weights
                  : ["100 g", "250 g", "500 g", "1 kg", "2 kg"]
                ).map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setSelectedWeight(weight)}
                    className={`px-4 py-2 border rounded-lg text-sm font-semibold transition ${
                      selectedWeight === weight
                        ? "border-[var(--gold)] text-[var(--gold)] bg-[rgba(212,175,55,0.1)]"
                        : "border-gray-600 text-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="quantity-box">
            <p>Quantity</p>

            <div>
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                <FiMinus />
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock || 20, q + 1))
                }
              >
                <FiPlus />
              </button>
            </div>
          </div>

          <div className="detail-action-row">
            <button onClick={handleAddToCart} className="detail-outline-btn">
              <FiShoppingCart /> Add to Cart
            </button>

            <button onClick={handleBuyNow} className="detail-buy-btn">
              Buy Now
            </button>
          </div>

          <div className="detail-description">
            <h3>Product Description</h3>

            <p>
              {product.description ||
                "Premium handmade product crafted by skilled artisans using traditional techniques. Made with care, quality materials, and beautiful detailing."}
            </p>
          </div>
        </div>
      </div>

      <section className="customer-review-section">
        <h2>Customer Reviews</h2>

        <div className="review-form-box">
          <h3>Write a Review</h3>
          <p>Your Rating</p>

          <div className="review-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FiStar key={star} />
            ))}
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this product..."
          />

          <button onClick={submitReview}>Submit Review</button>
        </div>

        {[
          [
            "Anjali Sharma",
            "Absolutely beautiful! The craftsmanship is outstanding. Worth every penny.",
          ],
          [
            "Rajesh Kumar",
            "Good quality product. Delivery was on time. Packaging could be better.",
          ],
          [
            "Sneha Patel",
            "Exceeded my expectations! The detailing is exquisite. Highly recommended!",
          ],
        ].map((review) => (
          <div className="review-card" key={review[0]}>
            <div>
              <h4>{review[0]}</h4>
              <span>Verified Purchase</span>
            </div>

            <p className="review-date">20/05/2026</p>

            <div className="review-stars small">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar key={star} />
              ))}
            </div>

            <p>{review[1]}</p>
          </div>
        ))}
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <h2>Related Products</h2>

          <div className="product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;