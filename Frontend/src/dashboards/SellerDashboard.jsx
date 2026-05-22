import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import {
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiAlertTriangle,
  FiPlus,
  FiDownload,
  FiX,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

const categoryOptions = [
  "Handmade Clothes",
  "Accessories",
  "Pots",
  "Home Decor",
  "Handmade Snacks",
  "Others"
];

const SellerDashboard = () => {
  const { user } = useAuth();

  const [tab, setTab] = useState("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");

  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("Daily");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    media: [],
    description: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("seller_products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const selectedCat = (productForm.category === "Others" ? productForm.newCategory : productForm.category)?.toLowerCase()?.trim();
    const isClothingOrTextile = ["handmade clothes", "textiles"].includes(selectedCat);
    const isSnacks = selectedCat === "handmade snacks";

    let needsUpdate = false;
    const update = {};

    if (!isClothingOrTextile && productForm.sizes && productForm.sizes.length > 0) {
      update.sizes = [];
      needsUpdate = true;
    }
    if (!isSnacks && productForm.weights && productForm.weights.length > 0) {
      update.weights = [];
      needsUpdate = true;
    }

    if (needsUpdate) {
      setProductForm((prev) => ({
        ...prev,
        ...update,
      }));
    }
  }, [productForm.category, productForm.newCategory]);

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(""), 2500);
  };

  const saveToLocalStorage = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem("seller_products", JSON.stringify(updatedProducts));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("sellerProductsUpdated"));
  };

  const tabs = [
    ["overview", "📊 Overview"],
    ["products", "🎨 Products"],
    ["orders", "📦 Orders"],
    ["inventory", "📋 Inventory"],
    ["reports", "📈 Reports"],
  ];

  const totalRevenue = products.reduce(
    (sum, p) => sum + Number(p.price || 0),
    0
  );

  const lowStock = products.filter(
    (p) => Number(p.stock) > 0 && Number(p.stock) < 10
  ).length;

  const outOfStock = products.filter((p) => Number(p.stock) === 0).length;

  const reportRows =
    products.length > 0
      ? products.map((p) => ({
          Product: p.name,
          Category: p.category,
          Price: Number(p.price || 0),
          Stock: Number(p.stock || 0),
          Status:
            Number(p.stock) === 0
              ? "Out of Stock"
              : Number(p.stock) < 10
              ? "Low Stock"
              : "Available",
        }))
      : [
          {
            Product: "No products added",
            Category: "-",
            Price: 0,
            Stock: 0,
            Status: "-",
          },
        ];

  const generateReport = () => {
    if (!fromDate || !toDate) {
      showPopup("Please select From and To dates");
      return false;
    }

    setReportGenerated(true);
    showPopup("Report Generated Successfully!");
    return true;
  };

  const downloadCSV = () => {
    if (!reportGenerated && !generateReport()) return;

    const headers = Object.keys(reportRows[0]);

    const csvData = [
      [`HeritCraft Seller ${reportPeriod} Report`],
      [`From: ${fromDate}`, `To: ${toDate}`],
      [],
      headers,
      ...reportRows.map((row) => headers.map((h) => row[h])),
      [],
      ["Total Revenue", totalRevenue],
      ["Total Products", products.length],
      ["Low Stock", lowStock],
      ["Out of Stock", outOfStock],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `seller-${reportPeriod.toLowerCase()}-report.csv`;
    link.click();

    URL.revokeObjectURL(url);
    showPopup("CSV Report Downloaded Successfully!");
  };

  const downloadExcel = () => {
    if (!reportGenerated && !generateReport()) return;

    const tableRows = reportRows
      .map(
        (row) => `
          <tr>
            <td>${row.Product}</td>
            <td>${row.Category}</td>
            <td>${row.Price}</td>
            <td>${row.Stock}</td>
            <td>${row.Status}</td>
          </tr>
        `
      )
      .join("");

    const excelContent = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <h2>HeritCraft Seller ${reportPeriod} Report</h2>
          <p>From: ${fromDate}</p>
          <p>To: ${toDate}</p>

          <table border="1">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>

          <br />

          <table border="1">
            <tr><td>Total Revenue</td><td>${totalRevenue}</td></tr>
            <tr><td>Total Products</td><td>${products.length}</td></tr>
            <tr><td>Low Stock</td><td>${lowStock}</td></tr>
            <tr><td>Out of Stock</td><td>${outOfStock}</td></tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelContent], {
      type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `seller-${reportPeriod.toLowerCase()}-report.xls`;
    link.click();

    URL.revokeObjectURL(url);
    showPopup("Excel Report Downloaded Successfully!");
  };

  const downloadPDF = () => {
    if (!reportGenerated && !generateReport()) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(212, 175, 55);
    doc.text("HeritCraft Seller Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Period: ${reportPeriod}`, 14, 30);
    doc.text(`From: ${fromDate}`, 14, 38);
    doc.text(`To: ${toDate}`, 14, 46);

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text("Summary", 14, 60);

    doc.setFontSize(11);
    doc.text(
      `Total Revenue: Rs. ${totalRevenue.toLocaleString("en-IN")}`,
      14,
      70
    );
    doc.text(`Total Products: ${products.length}`, 14, 78);
    doc.text(`Low Stock: ${lowStock}`, 14, 86);
    doc.text(`Out of Stock: ${outOfStock}`, 14, 94);

    let y = 110;

    doc.setTextColor(212, 175, 55);
    doc.text("Product", 14, y);
    doc.text("Category", 75, y);
    doc.text("Price", 125, y);
    doc.text("Stock", 155, y);

    y += 8;
    doc.setTextColor(0);

    reportRows.forEach((row) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      doc.text(String(row.Product).slice(0, 25), 14, y);
      doc.text(String(row.Category).slice(0, 18), 75, y);
      doc.text(`Rs. ${row.Price}`, 125, y);
      doc.text(String(row.Stock), 155, y);

      y += 8;
    });

    doc.save(`seller-${reportPeriod.toLowerCase()}-report.pdf`);
    showPopup("PDF Report Downloaded Successfully!");
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "",
      newCategory: "",
      price: "",
      stock: "",
      media: [],
      description: "",
      sizes: [],
      weights: [],
    });
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    const isDefault = categoryOptions.includes(product.category) && product.category !== "Others";

    setProductForm({
      name: product.name || "",
      category: isDefault ? product.category : "Others",
      newCategory: isDefault ? "" : product.category || "",
      price: product.price || "",
      stock: product.stock || "",
      media: product.media || [],
      description: product.description || "",
      sizes: product.sizes || [],
      weights: product.weights || [],
    });

    setShowAddModal(true);
  };

  const handleChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value,
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve({
          url: reader.result,
          type: file.type,
          name: file.name,
        });
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const uploadedMedia = await Promise.all(
      files.map((file) => fileToBase64(file))
    );

    setProductForm((prev) => ({
      ...prev,
      media: [...prev.media, ...uploadedMedia],
    }));
  };

  const removeMedia = (index) => {
    setProductForm((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const saveProduct = (e) => {
    e.preventDefault();

    const isOthers = productForm.category === "Others";
    const actualCategory = isOthers ? productForm.newCategory?.trim() : productForm.category;

    if (
      !productForm.name ||
      !productForm.category ||
      (isOthers && !productForm.newCategory?.trim()) ||
      !productForm.price ||
      !productForm.stock
    ) {
      showPopup("Please fill all required fields");
      return;
    }

    const imageFiles =
      productForm.media
        ?.filter((m) => m.type?.startsWith("image"))
        .map((m) => m.url) || [];

    const videoFiles =
      productForm.media
        ?.filter((m) => m.type?.startsWith("video"))
        .map((m) => m.url) || [];

    let updatedProducts;

    if (editingProduct) {
      updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: productForm.name,
              category: actualCategory,
              price: productForm.price,
              stock: productForm.stock,
              media: productForm.media || [],
              description: productForm.description || "",
              sizes: productForm.sizes || [],
              weights: productForm.weights || [],
              images: imageFiles,
              videos: videoFiles,
              id: p.id,
              _id: p._id,
              seller: p.seller || {
                shopName: user?.shopName || user?.name || "Seller",
              },
            }
          : p
      );

      showPopup("Product Updated Successfully!");
    } else {
      const productId = Date.now();

      updatedProducts = [
        ...products,
        {
          name: productForm.name,
          category: actualCategory,
          price: productForm.price,
          stock: productForm.stock,
          media: productForm.media || [],
          description: productForm.description || "",
          sizes: productForm.sizes || [],
          weights: productForm.weights || [],
          id: productId,
          _id: `seller-${productId}`,
          seller: {
            shopName: user?.shopName || user?.name || "Seller",
          },
          averageRating: 4.5,
          numReviews: 24,
          oldPrice: Number(productForm.price) + 200,
          offer: 10,
          images: imageFiles,
          videos: videoFiles,
        },
      ];

      showPopup("Product Added Successfully!");
    }

    saveToLocalStorage(updatedProducts);

    setShowAddModal(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id) => {
    if (!window.confirm("Delete this product?")) return;

    const updatedProducts = products.filter((p) => p.id !== id);

    saveToLocalStorage(updatedProducts);
    showPopup("Product Deleted Successfully!");
  };

  const getProductCover = (product) => {
    const firstImage = product.media?.find((m) => m.type?.startsWith("image"));

    if (firstImage) return firstImage.url;
    if (product.images?.length) return product.images[0];

    return "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?q=80&w=600";
  };

  return (
    <div className="seller-page animate-fadeIn">
      {popupMessage && <div className="seller-popup">{popupMessage}</div>}

      <div className="seller-header">
        <h1>Seller Dashboard</h1>
        <p>{user?.shopName || user?.name || "Golden Artisan Studio"}</p>
      </div>

      <div className="seller-tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={tab === id ? "active" : ""}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="seller-stats">
          {[
            [
              <FiDollarSign />,
              `₹${totalRevenue.toLocaleString("en-IN")}`,
              "Total Revenue",
              "gold",
            ],
            [<FiShoppingBag />, "0", "Total Orders", "blue"],
            [<FiPackage />, products.length, "Total Products", "purple"],
            [<FiAlertTriangle />, lowStock, "Low Stock", "yellow"],
            [<FiAlertTriangle />, outOfStock, "Out of Stock", "red"],
          ].map((item) => (
            <div className="seller-stat-card" key={item[2]}>
              <span className={item[3]}>{item[0]}</span>
              <h2>{item[1]}</h2>
              <p>{item[2]}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div>
          <div className="seller-action-row">
            <p>{products.length} products</p>

            <button onClick={openAddModal} className="seller-add-btn">
              <FiPlus /> Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="seller-empty-panel mt-8">
              <div className="seller-empty-icon">🎨</div>
              <h2>No products added yet</h2>
              <p className="text-gray-400 mt-2">
                Click Add Product to create your first item.
              </p>
            </div>
          ) : (
            <div className="seller-product-grid mt-8">
              {products.map((product) => (
                <div className="seller-product-card" key={product.id}>
                  <img src={getProductCover(product)} alt={product.name} />

                  <div className="seller-product-content">
                    <h3>{product.name}</h3>
                    <p>{product.category}</p>

                    <div className="seller-product-bottom">
                      <span>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>
                      <small>Stock: {product.stock}</small>
                    </div>

                    <div className="seller-product-actions">
                      <button onClick={() => openEditModal(product)}>
                        <FiEdit /> Edit
                      </button>

                      <button onClick={() => deleteProduct(product.id)}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="seller-empty-panel">
          <div className="seller-empty-icon">📦</div>
          <h2>No orders yet</h2>
        </div>
      )}

      {tab === "inventory" && (
        <div>
          <div className="inventory-stats">
            <div className="inventory-card">
              <h2>{products.length}</h2>
              <p>Total Products</p>
            </div>

            <div className="inventory-card warning">
              <h2>{lowStock}</h2>
              <p>Low Stock (&lt;10)</p>
            </div>

            <div className="inventory-card danger">
              <h2>{outOfStock}</h2>
              <p>Out of Stock</p>
            </div>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="seller-report-panel">
          <div className="seller-report-controls">
            <div>
              <label>Period</label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>

            <div>
              <label>From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <label>To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <button className="seller-generate-btn" onClick={generateReport}>
              Generate
            </button>

            <button className="seller-download-btn" onClick={downloadPDF}>
              <FiDownload /> PDF
            </button>

            <button className="seller-download-btn" onClick={downloadExcel}>
              <FiDownload /> Excel
            </button>

            <button className="seller-download-btn" onClick={downloadCSV}>
              <FiDownload /> CSV
            </button>
          </div>

          {reportGenerated && (
            <div className="seller-report-result">
              <h2>{reportPeriod} Sales Report</h2>
              <p>
                Report generated from <b>{fromDate}</b> to <b>{toDate}</b>
              </p>

              <div className="seller-report-summary">
                <div>
                  <h3>₹{totalRevenue.toLocaleString("en-IN")}</h3>
                  <p>Total Revenue</p>
                </div>

                <div>
                  <h3>0</h3>
                  <p>Total Orders</p>
                </div>

                <div>
                  <h3>{products.length}</h3>
                  <p>Total Products</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="modal-overlay">
          <div className="seller-product-modal">
            <button
              onClick={() => setShowAddModal(false)}
              className="modal-close-btn"
            >
              <FiX />
            </button>

            <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>

            <form onSubmit={saveProduct}>
              <input
                className="input-gold"
                name="name"
                placeholder="Product Name *"
                value={productForm.name}
                onChange={handleChange}
              />

              <select
                className="input-gold"
                name="category"
                value={productForm.category}
                onChange={handleChange}
              >
                <option value="">Select Category *</option>

                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {productForm.category === "Others" && (
                <input
                  className="input-gold"
                  name="newCategory"
                  placeholder="Enter New Category *"
                  value={productForm.newCategory || ""}
                  onChange={handleChange}
                  required
                />
              )}

              <input
                className="input-gold"
                name="price"
                type="number"
                placeholder="Price *"
                value={productForm.price}
                onChange={handleChange}
              />

              <input
                className="input-gold"
                name="stock"
                type="number"
                placeholder="Stock *"
                value={productForm.stock}
                onChange={handleChange}
              />

              {(() => {
                const selectedCat = (productForm.category === "Others" ? productForm.newCategory : productForm.category)?.toLowerCase()?.trim();
                const showSizes = ["handmade clothes", "textiles"].includes(selectedCat);
                const showWeights = selectedCat === "handmade snacks";

                return (
                  <>
                    {showSizes && (
                      <div className="mb-4">
                        <label className="block text-sm text-[var(--gold)] mb-2 font-bold">Available Sizes</label>
                        <div className="flex flex-wrap gap-4">
                          {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map((size) => {
                            const isChecked = productForm.sizes?.includes(size);
                            return (
                              <label key={size} className="flex items-center gap-2 cursor-pointer text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={isChecked || false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setProductForm(prev => {
                                      const currentSizes = prev.sizes || [];
                                      const newSizes = checked
                                        ? [...currentSizes, size]
                                        : currentSizes.filter(s => s !== size);
                                      return { ...prev, sizes: newSizes };
                                    });
                                  }}
                                  className="accent-[var(--gold)]"
                                />
                                {size}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {showWeights && (
                      <div className="mb-4">
                        <label className="block text-sm text-[var(--gold)] mb-2 font-bold">Available Weights</label>
                        <div className="flex flex-wrap gap-4">
                          {["100 g", "250 g", "500 g", "1 kg", "2 kg"].map((weight) => {
                            const isChecked = productForm.weights?.includes(weight);
                            return (
                              <label key={weight} className="flex items-center gap-2 cursor-pointer text-gray-300">
                                <input
                                  type="checkbox"
                                  checked={isChecked || false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setProductForm(prev => {
                                      const currentWeights = prev.weights || [];
                                      const newWeights = checked
                                        ? [...currentWeights, weight]
                                        : currentWeights.filter(w => w !== weight);
                                      return { ...prev, weights: newWeights };
                                    });
                                  }}
                                  className="accent-[var(--gold)]"
                                />
                                {weight}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="seller-file-upload">
                <label className="seller-upload-label">
                  Upload Images & Videos
                </label>

                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="seller-file-input"
                />

                {productForm.media.length > 0 && (
                  <div className="media-preview-grid">
                    {productForm.media.map((file, index) => (
                      <div key={index} className="media-preview-card">
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="media-remove-btn"
                        >
                          ×
                        </button>

                        {file.type?.startsWith("image") ? (
                          <img
                            src={file.url}
                            alt="preview"
                            className="media-preview-img"
                          />
                        ) : (
                          <video
                            src={file.url}
                            controls
                            className="media-preview-video"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                className="input-gold"
                name="description"
                placeholder="Product Description"
                value={productForm.description}
                onChange={handleChange}
                rows="3"
              />

              <button type="submit" className="seller-add-btn w-full">
                {editingProduct ? "Update Product" : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;