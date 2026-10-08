import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import { useNavigate } from "react-router-dom";

function Recommendations() {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const toggleProductSelection = (productId) => {
    setSelectedProducts((current) => {
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }

      if (current.length >= 3) {
        alert("You can compare a maximum of 3 products.");
        return current;
      }

      return [...current, productId];
    });
  };

  const handleCompare = () => {
    if (selectedProducts.length < 2) {
      alert("Please select at least 2 products to compare.");
      return;
    }

    navigate("/compare", {
      state: {
        selectedProductIds: selectedProducts,
      },
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading ShopCircle products...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>{error}</h2>
        <p>Make sure the FastAPI backend is running.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "40px",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "34px",
              }}
            >
              🛍️ ShopCircle Recommendations
            </h1>

            <p
              style={{
                marginTop: "10px",
                color: "#666",
                fontSize: "16px",
              }}
            >
              Discover products that match your requirements.
            </p>
          </div>

          {/* Compare button */}
          <button
            onClick={handleCompare}
            disabled={selectedProducts.length < 2}
            style={{
              padding: "13px 22px",
              border: "none",
              borderRadius: "10px",
              background:
                selectedProducts.length >= 2 ? "#111827" : "#cbd5e1",
              color: "#fff",
              cursor:
                selectedProducts.length >= 2
                  ? "pointer"
                  : "not-allowed",
              fontWeight: "600",
              fontSize: "15px",
            }}
          >
            ⚖️ Compare Selected ({selectedProducts.length}/3)
          </button>
        </div>

        {/* Selection information */}
        <div
          style={{
            marginTop: "25px",
            padding: "15px 18px",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
          }}
        >
          {selectedProducts.length === 0 && (
            <span style={{ color: "#666" }}>
              Select 2–3 products to compare them using your personal
              priorities.
            </span>
          )}

          {selectedProducts.length === 1 && (
            <span style={{ color: "#666" }}>
              1 product selected. Select at least one more product.
            </span>
          )}

          {selectedProducts.length >= 2 && (
            <span style={{ color: "#166534", fontWeight: "600" }}>
              ✓ {selectedProducts.length} products selected. Ready to
              compare!
            </span>
          )}
        </div>

        {/* Product cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginTop: "30px",
          }}
        >
          {products.map((product) => {
            const isSelected = selectedProducts.includes(product.id);

            return (
              <div
                key={product.id}
                style={{
                  border: isSelected
                    ? "2px solid #111827"
                    : "1px solid #ddd",
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: isSelected
                    ? "0 6px 20px rgba(0,0,0,0.12)"
                    : "0 4px 12px rgba(0,0,0,0.08)",
                  background: "#fff",
                  position: "relative",
                  transition: "0.2s",
                }}
              >
                {/* Selected badge */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      background: "#111827",
                      color: "#fff",
                      padding: "5px 9px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Selected
                  </div>
                )}

                <h2
                  style={{
                    marginTop: 0,
                    paddingRight: "70px",
                  }}
                >
                  {product.name}
                </h2>

                <p>
                  <strong>Brand:</strong> {product.brand}
                </p>

                <p>
                  <strong>Price:</strong>{" "}
                  ₹{product.price.toLocaleString("en-IN")}
                </p>

                <p>
                  <strong>Processor:</strong> {product.processor}
                </p>

                <p>
                  <strong>RAM:</strong> {product.ram} GB
                </p>

                <p>
                  <strong>Storage:</strong> {product.storage} GB SSD
                </p>

                <p>
                  <strong>Gaming:</strong> {product.gaming}/10
                </p>

                <p>
                  <strong>Coding:</strong> {product.coding}/10
                </p>

                <p>
                  <strong>Battery:</strong> {product.battery}/10
                </p>

                {/* Compare checkbox */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "18px",
                    padding: "12px",
                    borderRadius: "9px",
                    background: isSelected
                      ? "#f0f0f0"
                      : "#f8fafc",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      toggleProductSelection(product.id)
                    }
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: "pointer",
                    }}
                  />

                  Select for Comparison
                </label>

                {/* View details */}
                <button
                  onClick={() =>
                    navigate(`/product/${product.id}`)
                  }
                  style={{
                    marginTop: "12px",
                    width: "100%",
                    padding: "11px 18px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;