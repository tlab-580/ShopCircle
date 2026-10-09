import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

const reviewInsights = {
  1: {
    summary:
      "A balanced everyday laptop that is especially suitable for coding and regular student workloads.",
    pros: [
      "Strong coding performance",
      "16GB RAM is suitable for multitasking",
      "Good everyday productivity",
    ],
    cons: [
      "Integrated graphics are not ideal for demanding gaming",
      "Gaming performance is limited compared with dedicated-GPU laptops",
    ],
  },

  2: {
    summary:
      "A student-friendly laptop with a good balance of coding performance, battery life, and everyday usability.",
    pros: [
      "Good battery score",
      "Strong coding performance",
      "16GB RAM for multitasking",
    ],
    cons: [
      "Integrated graphics limit demanding gaming",
      "Higher price than some alternatives",
    ],
  },

  3: {
    summary:
      "A performance-focused laptop that is particularly attractive for users who want both coding and gaming capability.",
    pros: [
      "Dedicated RTX 4050 graphics",
      "Strong coding performance",
      "Strong gaming performance",
    ],
    cons: [
      "Battery score is lower than productivity-focused laptops",
      "Heavier performance hardware may reduce portability",
    ],
  },

  4: {
    summary:
      "A value-oriented performance laptop offering dedicated graphics at a comparatively lower price.",
    pros: [
      "Good gaming capability",
      "Dedicated RTX 3050 graphics",
      "Competitive price",
    ],
    cons: [
      "Battery score is moderate",
      "Coding score is slightly lower than the strongest options",
    ],
  },

  5: {
    summary:
      "A premium productivity laptop with excellent battery performance and strong coding capability.",
    pros: [
      "Excellent battery score",
      "Strong coding performance",
      "Efficient Apple M3 processor",
    ],
    cons: [
      "Higher price",
      "Not designed primarily for demanding gaming",
    ],
  },
};

function ProductDetails() {
  const { productId } = useParams();

  // ============================================================
  // NAVIGATION
  // ============================================================

  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlist, setWishlist] = useState([]);

  // ============================================================
  // LOAD PRODUCT + WISHLIST
  // ============================================================

  useEffect(() => {
    loadProduct();
    loadWishlist();
  }, [productId]);

  // ============================================================
  // LOAD PRODUCT
  // ============================================================

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/products`
      );

      const foundProduct = response.data.find(
        (item) =>
          String(item.id) === String(productId)
      );

      if (!foundProduct) {
        setError("Product not found.");
        return;
      }

      setProduct(foundProduct);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load product details. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD WISHLIST
  // ============================================================

  const loadWishlist = () => {
    const savedWishlist =
      localStorage.getItem(
        "shopcircle_wishlist"
      );

    if (savedWishlist) {
      try {
        const parsedWishlist =
          JSON.parse(savedWishlist);

        setWishlist(
          Array.isArray(parsedWishlist)
            ? parsedWishlist
            : []
        );
      } catch {
        setWishlist([]);
      }
    }
  };

  // ============================================================
  // TOGGLE WISHLIST
  // ============================================================

  const toggleWishlist = () => {
    if (!product) return;

    const exists = wishlist.some(
      (item) => item.id === product.id
    );

    let updatedWishlist;

    if (exists) {
      updatedWishlist = wishlist.filter(
        (item) => item.id !== product.id
      );
    } else {
      updatedWishlist = [
        ...wishlist,
        product,
      ];
    }

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "shopcircle_wishlist",
      JSON.stringify(updatedWishlist)
    );
  };

  // ============================================================
  // WISHLIST STATUS
  // ============================================================

  const isInWishlist = product
    ? wishlist.some(
        (item) => item.id === product.id
      )
    : false;

  // ============================================================
  // ADD PRODUCT TO DECISION ROOM
  // ============================================================

  const handleDecisionRoom = () => {
    if (!product) return;

    navigate("/decision-room", {
      state: {
        selectedProductId: product.id,
        selectedProduct: product,
      },
    });
  };

  // ============================================================
  // COMPARE PRODUCT
  // ============================================================

  const handleCompare = () => {
    if (!product) return;

    navigate("/compare", {
      state: {
        selectedProductIds: [product.id],
      },
    });
  };

  // ============================================================
  // MATCH SCORE
  // ============================================================

  const getMatchScore = () => {
    if (!product) return 0;

    const budget = 70000;
    const codingPriority = 10;
    const gamingPriority = 5;
    const batteryPriority = 8;

    let budgetScore = 0;

    if (product.price <= budget) {
      budgetScore = 100;
    } else if (
      product.price <= budget + 10000
    ) {
      budgetScore = 75;
    } else if (
      product.price <= budget + 20000
    ) {
      budgetScore = 50;
    } else {
      budgetScore = 25;
    }

    const codingScore = Math.min(
      (product.coding / codingPriority) *
        100,
      100
    );

    const gamingScore = Math.min(
      (product.gaming / gamingPriority) *
        100,
      100
    );

    const batteryScore = Math.min(
      (product.battery / batteryPriority) *
        100,
      100
    );

    const performanceScore =
      (codingScore * codingPriority +
        gamingScore * gamingPriority +
        batteryScore * batteryPriority) /
      (codingPriority +
        gamingPriority +
        batteryPriority);

    const finalScore =
      budgetScore * 0.3 +
      performanceScore * 0.7;

    return Number(
      finalScore.toFixed(1)
    );
  };

  // ============================================================
  // SCORE COLOR
  // ============================================================

  const getScoreColor = (score) => {
    if (score >= 90) return "#16a34a";
    if (score >= 75) return "#2563eb";
    if (score >= 60) return "#f59e0b";
    return "#dc2626";
  };

  // ============================================================
  // MATCH LABEL
  // ============================================================

  const getMatchLabel = (score) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 75) return "Great Match";
    if (score >= 60) return "Good Match";
    return "Partial Match";
  };

  // ============================================================
  // MATCH BREAKDOWN
  // ============================================================

  const getBreakdown = () => {
    if (!product) return null;

    const budget = 70000;
    const codingPriority = 10;
    const gamingPriority = 5;
    const batteryPriority = 8;

    let budgetScore = 0;

    if (product.price <= budget) {
      budgetScore = 100;
    } else if (
      product.price <= budget + 10000
    ) {
      budgetScore = 75;
    } else if (
      product.price <= budget + 20000
    ) {
      budgetScore = 50;
    } else {
      budgetScore = 25;
    }

    return {
      budget: Math.round(budgetScore),

      coding: Math.round(
        Math.min(
          (product.coding /
            codingPriority) *
            100,
          100
        )
      ),

      gaming: Math.round(
        Math.min(
          (product.gaming /
            gamingPriority) *
            100,
          100
        )
      ),

      battery: Math.round(
        Math.min(
          (product.battery /
            batteryPriority) *
            100,
          100
        )
      ),
    };
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>
          Loading product details...
        </h2>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "40px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2>
          {error || "Product not found."}
        </h2>

        <Link to="/recommend">
          <button
            style={{
              marginTop: "20px",
              padding: "12px 22px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Back to Recommendations
          </button>
        </Link>
      </div>
    );
  }

  // ============================================================
  // CALCULATED DATA
  // ============================================================

  const matchScore = getMatchScore();
  const breakdown = getBreakdown();

  const insights =
    reviewInsights[product.id] || {
      summary:
        "Review insights are not available for this product yet.",
      pros: [],
      cons: [],
    };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Navigation */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Link
            to="/recommend"
            style={{
              textDecoration: "none",
              color: "#2563eb",
              fontWeight: "600",
            }}
          >
            ← Back to Recommendations
          </Link>

          <Link
            to="/decision-room"
            style={{
              textDecoration: "none",
              color: "#7c3aed",
              fontWeight: "600",
            }}
          >
            👥 Decision Room
          </Link>
        </div>

        {/* ======================================================
            MAIN PRODUCT CARD
        ====================================================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "30px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.08)",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1.4fr 1fr",
              gap: "30px",
            }}
          >
            {/* Product Information */}

            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "15px",
                }}
              >
                {product.brand}
              </div>

              <h1
                style={{
                  margin: "0 0 10px",
                  fontSize: "36px",
                  color: "#111827",
                }}
              >
                {product.name}
              </h1>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "17px",
                  marginBottom: "25px",
                }}
              >
                {product.processor}
              </p>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "800",
                  color: "#111827",
                  marginBottom: "25px",
                }}
              >
                ₹
                {product.price.toLocaleString(
                  "en-IN"
                )}
              </div>

              {/* ACTION BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {/* Wishlist */}

                <button
                  onClick={toggleWishlist}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    background: isInWishlist
                      ? "#fee2e2"
                      : "#111827",
                    color: isInWishlist
                      ? "#dc2626"
                      : "white",
                    fontWeight: "700",
                  }}
                >
                  {isInWishlist
                    ? "❤️ In Wishlist"
                    : "♡ Add to Wishlist"}
                </button>

                {/* Compare */}

                <button
                  onClick={handleCompare}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    background: "#2563eb",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  ⚖️ Compare This Product
                </button>

                {/* Decision Room */}

                <button
                  onClick={handleDecisionRoom}
                  style={{
                    padding: "12px 20px",
                    borderRadius: "9px",
                    border: "none",
                    cursor: "pointer",
                    background: "#7c3aed",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  👥 Add to Decision Room
                </button>
              </div>
            </div>

            {/* Match Score */}

            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "25px",
                textAlign: "center",
                alignSelf: "start",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  color: "#6b7280",
                  fontWeight: "600",
                }}
              >
                🎯 Your Personal Match
              </p>

              <div
                style={{
                  fontSize: "58px",
                  fontWeight: "900",
                  color:
                    getScoreColor(matchScore),
                }}
              >
                {matchScore}%
              </div>

              <div
                style={{
                  display: "inline-block",
                  marginTop: "5px",
                  padding: "7px 14px",
                  borderRadius: "20px",
                  background: `${getScoreColor(
                    matchScore
                  )}20`,
                  color:
                    getScoreColor(matchScore),
                  fontWeight: "700",
                }}
              >
                {getMatchLabel(matchScore)}
              </div>

              <p
                style={{
                  marginTop: "18px",
                  color: "#6b7280",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                Based on your budget, coding,
                gaming, and battery preferences.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            SPECIFICATIONS
        ====================================================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            marginBottom: "25px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h2>💻 Specifications</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            {[
              [
                "Processor",
                product.processor,
              ],
              [
                "RAM",
                `${product.ram} GB`,
              ],
              [
                "Storage",
                `${product.storage} GB SSD`,
              ],
              ["GPU", product.gpu],
              [
                "Battery Score",
                `${product.battery}/10`,
              ],
              [
                "Coding Score",
                `${product.coding}/10`,
              ],
              [
                "Gaming Score",
                `${product.gaming}/10`,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: "18px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    color: "#6b7280",
                    fontSize: "13px",
                    marginBottom: "7px",
                  }}
                >
                  {label}
                </div>

                <strong
                  style={{
                    color: "#111827",
                  }}
                >
                  {value}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================
            MATCH BREAKDOWN
        ====================================================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            marginBottom: "25px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h2>🎯 Why This Matches You</h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "25px",
            }}
          >
            Your current preferences:
            ₹70,000 budget, strong coding
            priority, moderate gaming priority,
            and strong battery priority.
          </p>

          {[
            ["Budget", breakdown.budget],
            ["Coding", breakdown.coding],
            ["Gaming", breakdown.gaming],
            ["Battery", breakdown.battery],
          ].map(([label, score]) => (
            <div
              key={label}
              style={{
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "7px",
                  fontWeight: "600",
                }}
              >
                <span>{label}</span>
                <span>{score}%</span>
              </div>

              <div
                style={{
                  height: "10px",
                  background: "#e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${score}%`,
                    height: "100%",
                    background:
                      getScoreColor(score),
                    borderRadius: "10px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ======================================================
            REVIEW INSIGHTS
        ====================================================== */}

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "25px",
            marginBottom: "25px",
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.05)",
          }}
        >
          <h2>🧠 Review Insights</h2>

          <p
            style={{
              color: "#4b5563",
              lineHeight: "1.6",
              marginTop: "15px",
            }}
          >
            {insights.summary}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                padding: "20px",
                background: "#f0fdf4",
                borderRadius: "12px",
              }}
            >
              <h3
                style={{
                  color: "#15803d",
                }}
              >
                👍 Common Positives
              </h3>

              {insights.pros.map(
                (item) => (
                  <p
                    key={item}
                    style={{
                      color: "#166534",
                      margin: "10px 0",
                    }}
                  >
                    ✓ {item}
                  </p>
                )
              )}
            </div>

            <div
              style={{
                padding: "20px",
                background: "#fef2f2",
                borderRadius: "12px",
              }}
            >
              <h3
                style={{
                  color: "#b91c1c",
                }}
              >
                ⚠️ Things to Consider
              </h3>

              {insights.cons.map(
                (item) => (
                  <p
                    key={item}
                    style={{
                      color: "#991b1b",
                      margin: "10px 0",
                    }}
                  >
                    • {item}
                  </p>
                )
              )}
            </div>
          </div>

          <p
            style={{
              marginTop: "20px",
              fontSize: "13px",
              color: "#9ca3af",
            }}
          >
            Note: These are currently curated
            demo insights for the ShopCircle
            prototype. A future version can
            connect real review sources and
            perform automated sentiment analysis.
          </p>
        </div>

        {/* ======================================================
            FINAL ACTION
        ====================================================== */}

        <div
          style={{
            background: "#111827",
            color: "white",
            borderRadius: "18px",
            padding: "30px",
            textAlign: "center",
          }}
        >
          <h2>Ready to decide?</h2>

          <p
            style={{
              color: "#d1d5db",
              marginBottom: "20px",
            }}
          >
            Save this product or take it to a
            Decision Room and let your friends
            help you choose.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={toggleWishlist}
              style={{
                padding: "12px 22px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: "white",
                color: "#111827",
                fontWeight: "700",
              }}
            >
              {isInWishlist
                ? "❤️ Saved to Wishlist"
                : "♡ Save to Wishlist"}
            </button>

            <button
              onClick={handleDecisionRoom}
              style={{
                padding: "12px 22px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background: "#7c3aed",
                color: "white",
                fontWeight: "700",
              }}
            >
              👥 Open Decision Room
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          RESPONSIVE ADJUSTMENT
      ====================================================== */}

      <style>
        {`
          @media (max-width: 800px) {
            div[style*="grid-template-columns: 1.4fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default ProductDetails;