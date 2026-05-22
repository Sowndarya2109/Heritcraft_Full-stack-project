import { useState } from "react";
import jsPDF from "jspdf";
import {
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiCheck,
  FiTrash2,
  FiActivity,
  FiDownload,
} from "react-icons/fi";

const AdminDashboard = () => {
  const [tab, setTab] = useState("overview");
  const [reportType, setReportType] = useState("monthly");
  const [popup, setPopup] = useState("");

  const showPopup = (message) => {
    setPopup(message);
    setTimeout(() => setPopup(""), 2500);
  };

  const [users, setUsers] = useState([
    { name: "sowndarya", email: "sownd2109@gmail.com", role: "Buyer", status: "Active", joined: "18 May 2026" },
    { name: "sellersk", email: "seller@gmail.com", role: "Seller", status: "Active", joined: "18 May 2026" },
    { name: "ahisha", email: "ahishaturik06@gmail.com", role: "Buyer", status: "Active", joined: "18 May 2026" },
    { name: "Rajesh Buyer", email: "buyer@heritcraft.com", role: "Buyer", status: "Active", joined: "4 May 2026" },
    { name: "Admin HeritCraft", email: "admin@heritcraft.com", role: "Admin", status: "Active", joined: "4 May 2026" },
  ]);

  const toggleUserStatus = (email) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.email === email
          ? { ...user, status: user.status === "Active" ? "Disabled" : "Active" }
          : user
      )
    );
  };

  const [sellers, setSellers] = useState([
    { id: 1, name: "sellersk", shop: "sowndkiru", email: "seller@gmail.com", status: "Pending" },
    { id: 2, name: "Craftswoman Priya", shop: "Priya Art Studio", email: "seller2@heritcraft.com", status: "Approved" },
    { id: 3, name: "Artisan Kumar", shop: "Kumar Heritage Crafts", email: "seller1@heritcraft.com", status: "Approved" },
  ]);

  const approveSeller = (id) => {
    setSellers((prev) =>
      prev.map((seller) =>
        seller.id === id ? { ...seller, status: "Approved" } : seller
      )
    );
  };

  const products = [
    ["Handcrafted Bronze Nataraja", "Sculptures", "Kumar Heritage Crafts", "₹4,500", 15],
    ["Kalamkari Hand-painted Saree", "Textiles", "Priya Art Studio", "₹3,200", 18],
    ["Terracotta Horse", "Pottery", "Kumar Heritage Crafts", "₹1,800", 30],
    ["Kundan Necklace Set", "Jewelry", "Priya Art Studio", "₹8,500", 10],
    ["Blue Pottery Plate Set", "Pottery", "Priya Art Studio", "₹2,400", 16],
    ["Ceramic Plate", "Pottery", "sowndkiru", "₹200", 4],
  ];

  const logs = [
    ["USER_LOGIN", "admin logged in: admin@heritcraft.com", "Admin HeritCraft", "19 May 2026"],
    ["ORDER_CREATED", "Order #6a0aaadc placed - Total: ₹286", "sowndarya", "18 May 2026"],
    ["USER_REGISTERED", "New buyer registered: sownd2109@gmail.com", "sowndarya", "18 May 2026"],
    ["PRODUCT_CREATED", "Product ceramic plate created by seller sellersk", "sellersk", "18 May 2026"],
    ["USER_REGISTERED", "New seller registered: seller@gmail.com", "sellersk", "18 May 2026"],
  ];

  const reportData = {
    weekly: [
      { label: "Week 1", sales: 5200 },
      { label: "Week 2", sales: 7800 },
      { label: "Week 3", sales: 6400 },
      { label: "Week 4", sales: 6964 },
    ],
    monthly: [
      { label: "Jan", sales: 12000 },
      { label: "Feb", sales: 18000 },
      { label: "Mar", sales: 14500 },
      { label: "Apr", sales: 22000 },
      { label: "May", sales: 26364 },
    ],
    yearly: [
      { label: "2022", sales: 145000 },
      { label: "2023", sales: 218000 },
      { label: "2024", sales: 276000 },
      { label: "2025", sales: 324000 },
      { label: "2026", sales: 263640 },
    ],
  };

  const currentReport = reportData[reportType];
  const totalSales = currentReport.reduce((sum, item) => sum + item.sales, 0);
  const avgSales = Math.round(totalSales / currentReport.length);
  const maxSales = Math.max(...currentReport.map((item) => item.sales));

  const reportRows = currentReport.map((item) => ({
    Period: item.label,
    Sales: item.sales,
    Variance: item.sales - avgSales,
  }));

  const downloadCSV = () => {
    const headers = ["Period", "Sales", "Variance"];
    const csv = [
      [`HeritCraft ${reportType} Report`],
      [],
      headers,
      ...reportRows.map((row) => [row.Period, row.Sales, row.Variance]),
      [],
      ["Total Sales", totalSales],
      ["Average Sales", avgSales],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `admin-${reportType}-report.csv`;
    a.click();

    URL.revokeObjectURL(url);
    showPopup("CSV report downloaded successfully!");
  };

  const downloadExcel = () => {
    const rows = reportRows
      .map(
        (row) => `
          <tr>
            <td>${row.Period}</td>
            <td>${row.Sales}</td>
            <td>${row.Variance}</td>
          </tr>
        `
      )
      .join("");

    const excelContent = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <h2>HeritCraft ${reportType} Report</h2>

          <table border="1">
            <thead>
              <tr>
                <th>Period</th>
                <th>Sales</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <br />

          <table border="1">
            <tr><td>Total Sales</td><td>${totalSales}</td></tr>
            <tr><td>Average Sales</td><td>${avgSales}</td></tr>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelContent], {
      type: "application/vnd.ms-excel",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `admin-${reportType}-report.xls`;
    a.click();

    URL.revokeObjectURL(url);
    showPopup("Excel report downloaded successfully!");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(212, 175, 55);
    doc.text("HeritCraft Admin Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(`Report Type: ${reportType}`, 14, 32);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 40);

    doc.setFontSize(13);
    doc.setTextColor(0);
    doc.text("Summary", 14, 55);
    doc.text(`Total Sales: Rs. ${totalSales.toLocaleString("en-IN")}`, 14, 66);
    doc.text(`Average Sales: Rs. ${avgSales.toLocaleString("en-IN")}`, 14, 74);

    let y = 92;

    doc.setTextColor(212, 175, 55);
    doc.text("Period", 14, y);
    doc.text("Sales", 70, y);
    doc.text("Variance", 125, y);

    y += 8;
    doc.setTextColor(0);

    reportRows.forEach((row) => {
      doc.text(String(row.Period), 14, y);
      doc.text(`Rs. ${row.Sales.toLocaleString("en-IN")}`, 70, y);
      doc.text(`Rs. ${row.Variance.toLocaleString("en-IN")}`, 125, y);
      y += 8;
    });

    doc.save(`admin-${reportType}-report.pdf`);
    showPopup("PDF report downloaded successfully!");
  };

  const tabs = [
    ["overview", "📊 Overview"],
    ["users", "👥 Users"],
    ["sellers", "🏪 Sellers"],
    ["products", "🎨 Products"],
    ["reports", "📈 Reports"],
    ["logs", "📋 Logs"],
  ];

  return (
    <div className="admin-page animate-fadeIn">
      {popup && <div className="report-popup">{popup}</div>}

      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Platform management & analytics</p>
      </div>

      <div className="admin-tabs">
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
        <div className="admin-stats">
          {[
            [<FiUsers />, users.filter((u) => u.role === "Buyer").length, "Buyers"],
            [<FiShoppingBag />, sellers.length, "Sellers"],
            [<FiPackage />, "13", "Products"],
            [<FiActivity />, "6", "Orders"],
            [<FiDollarSign />, "₹26,364", "Revenue"],
          ].map((item) => (
            <div className="admin-stat-card" key={item[2]}>
              <span>{item[0]}</span>
              <h2>{item[1]}</h2>
              <p>{item[2]}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className={`role ${u.role.toLowerCase()}`}>{u.role}</td>
                  <td className={u.status === "Active" ? "active-status" : "disabled-status"}>
                    {u.status}
                  </td>
                  <td>{u.joined}</td>
                  <td>
                    <button
                      onClick={() => toggleUserStatus(u.email)}
                      className={u.status === "Active" ? "danger-action" : "enable-action"}
                    >
                      {u.status === "Active" ? "Disable" : "Enable"} <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "sellers" && (
        <div className="admin-panel">
          <h2 className="text-3xl text-[var(--gold)] font-bold mb-8">
            ⏳ Pending Approval
          </h2>

          {sellers.map((seller) => (
            <div className="seller-card" key={seller.id}>
              <div>
                <h3>
                  {seller.name} — <span className="text-[var(--gold)]">{seller.shop}</span>
                </h3>
                <p>{seller.email}</p>
              </div>

              {seller.status === "Pending" ? (
                <button onClick={() => approveSeller(seller.id)} className="approve-btn">
                  <FiCheck /> Approve
                </button>
              ) : (
                <span className="approved-text">Approved</span>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p[0]}>
                  <td>{p[0]}</td>
                  <td>{p[1]}</td>
                  <td>{p[2]}</td>
                  <td className="gold-text">{p[3]}</td>
                  <td>{p[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "reports" && (
        <div className="admin-panel">
          <div className="report-filter">
            {["weekly", "monthly", "yearly"].map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={reportType === type ? "active" : ""}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="report-download-col">
            <button onClick={downloadPDF} className="seller-download-btn">
              <FiDownload /> PDF
            </button>

            <button onClick={downloadExcel} className="seller-download-btn">
              <FiDownload /> Excel
            </button>

            <button onClick={downloadCSV} className="seller-download-btn">
              <FiDownload /> CSV
            </button>
          </div>

          <h2>Revenue Overview ({reportType})</h2>

          <div className="bar-chart-box">
            {currentReport.map((item) => {
              const height = (item.sales / maxSales) * 100;
              const variance = item.sales - avgSales;

              return (
                <div className="bar-item" key={item.label}>
                  <div className="bar-value">
                    ₹{item.sales.toLocaleString("en-IN")}
                  </div>

                  <div className="bar-bg">
                    <div className="bar-fill" style={{ height: `${height}%` }} />
                  </div>

                  <p>{item.label}</p>

                  <span className={variance >= 0 ? "variance-up" : "variance-down"}>
                    {variance >= 0 ? "+" : ""}₹{variance.toLocaleString("en-IN")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "logs" && (
        <div className="admin-panel">
          {logs.map((log) => (
            <div className="log-line" key={log[0] + log[1]}>
              <div>
                <h3>{log[0]}</h3>
                <p>{log[1]}</p>
              </div>

              <div>
                <p>{log[2]}</p>
                <small>{log[3]}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;