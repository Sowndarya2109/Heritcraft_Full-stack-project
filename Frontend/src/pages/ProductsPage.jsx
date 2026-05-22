import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { demoProducts, getAllProducts } from "../utils/productHelper";

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const loadAllProducts = () => {
    setAllProducts(getAllProducts());
  };

  useEffect(() => {
    loadAllProducts();

    const handleStorageUpdate = () => {
      loadAllProducts();
    };

    window.addEventListener("storage", handleStorageUpdate);
    window.addEventListener("sellerProductsUpdated", handleStorageUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
      window.removeEventListener("sellerProductsUpdated", handleStorageUpdate);
    };
  }, []);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: "newest",
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
    }));
  }, [searchParams]);

  const allCategories = useMemo(() => {
    const defaultCats = [
      "Handmade Clothes",
      "Accessories",
      "Pots",
      "Home Decor",
      "Handmade Snacks",
      "Textiles",
      "Jewelry",
    ];
    const productCats = allProducts.map((p) => p.category).filter(Boolean);
    const seen = new Set();
    const uniqueCats = [];
    [...defaultCats, ...productCats].forEach((cat) => {
      const lower = cat.toLowerCase().trim();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueCats.push(cat);
      }
    });
    return uniqueCats;
  }, [allProducts]);

  const filteredProducts = allProducts
    .filter((product) => {
      const searchText = filters.search.toLowerCase().trim();

      const productName = product.name?.toLowerCase() || "";
      const productCategory = product.category?.toLowerCase() || "";
      const sellerName =
        product.seller?.shopName?.toLowerCase() ||
        product.seller?.name?.toLowerCase() ||
        "";

      const matchesSearch =
        !searchText ||
        productName.includes(searchText) ||
        productCategory.includes(searchText) ||
        sellerName.includes(searchText);

      const matchesCategory =
        !filters.category ||
        product.category?.toLowerCase() === filters.category.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (filters.sort === "price_asc") return Number(a.price || 0) - Number(b.price || 0);
      if (filters.sort === "price_desc") return Number(b.price || 0) - Number(a.price || 0);
      if (filters.sort === "rating")
        return (b.averageRating || 0) - (a.averageRating || 0);
      return 0;
    });

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      sort: "newest",
    });

    setSearchParams({});
  };

  return (
    <div className="page-wrap animate-fadeIn">
      <div className="section-header">
      <h1 className="section-title">
  {filters.category
    ? filters.category
    : filters.search
    ? `Search Results for "${filters.search}"`
    : "Products"}
</h1>
        <p className="section-subtitle">
          Explore {filteredProducts.length} handcrafted heritage items
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="input-gold flex items-center gap-3">
          <FiSearch color="var(--gold)" />

          <input
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
            placeholder="Search handmade products..."
            className="bg-transparent outline-none flex-1"
          />
        </div>

        <select
          value={filters.sort}
          onChange={(e) =>
            setFilters({
              ...filters,
              sort: e.target.value,
            })
          }
          className="input-gold md:w-64"
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center gap-2"
        >
          <FiFilter /> Filter
        </button>
      </div>

      {showFilters && (
        <div className="panel mb-10 animate-fadeIn">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-2xl text-[var(--gold)] font-bold">
              Filters
            </h3>

            <button
              onClick={clearFilters}
              className="text-gray-400 flex items-center gap-1"
            >
              <FiX /> Clear All
            </button>
          </div>

          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({
                ...filters,
                category: e.target.value,
              })
            }
            className="input-gold"
          >
            <option value="">All Categories</option>

            {allCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="panel text-center py-16">
          <h2 className="text-3xl text-[var(--gold)] font-bold mb-3">
            No products found
          </h2>
          <p className="text-gray-400">
            Try searching another keyword or product name.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;