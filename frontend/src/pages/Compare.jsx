import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function Compare() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [codingPriority, setCodingPriority] = useState(5);
  const [gamingPriority, setGamingPriority] = useState(5);
  const [batteryPriority, setBatteryPriority] = useState(5);

  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await axios.get(`${API_URL}/products`);

        const receivedProducts = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.products)
            ? response.data.products
            : [];

        setProducts(receivedProducts);

        const incomingIds =
          location.state?.selectedProductIds;

        if (Array.isArray(incomingIds)) {
          const validIds = incomingIds
            .map(Number)
            .filter((id) =>
              receivedProducts.some(
                (product) => product.id === id
              )
            )
            .slice(0, 3);

          setSelectedIds(validIds);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [location.state]);

  const toggleProduct = (productId) => {
    setComparison(null);
    setError("");

    setSelectedIds((current) => {
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

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setError(
        "Please select at least 2 products to compare."
      );
      return;
    }

    try {
      setComparing(true);
      setError("");
      setComparison(null);

      const response = await axios.post(
        `${API_URL}/compare`,
        {
          product_ids: selectedIds,
          coding_priority: codingPriority,
          gaming_priority: gamingPriority,
          battery_priority: batteryPriority,
        }
      );

      setComparison(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to compare the selected products."
      );
    } finally {
      setComparing(false);
    }
  };

  const selectedProducts = products.filter((product) =>
    selectedIds.includes(product.id)
  );

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Great Match";
    if (score >= 70) return "Good Match";
    if (score >= 60) return "Decent Match";
    return "Lower Match";
  };

  const getPriorityLevel = (value) => {
    if (value >= 8) return "High";
    if (value >= 5) return "Medium";
    return "Low";
  };

  const getBestStrength = (product) => {
    const scores = [
      {
        label: "Coding",
        value: product.coding,
        icon: "💻",
      },
      {
        label: "Gaming",
        value: product.gaming,
        icon: "🎮",
      },
      {
        label: "Battery",
        value: product.battery,
        icon: "🔋",
      },
    ];

    return scores.sort(
      (a, b) => b.value - a.value
    )[0];
  };

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingIcon}>⚖️</div>

          <h2 style={styles.loadingTitle}>
            Loading Smart Comparison
          </h2>

          <p style={styles.loadingText}>
            Preparing your shopping comparison...
          </p>

          <div style={styles.loadingBar}>
            <div style={styles.loadingBarFill} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div
          style={styles.logo}
          onClick={() => navigate("/")}
        >
          <span style={styles.logoIcon}>🛍️</span>
          <span>ShopCircle</span>
        </div>

        <div style={styles.navLinks}>
          <button
            onClick={() => navigate("/")}
            style={styles.navLink}
          >
            Home
          </button>

          <button
            onClick={() => navigate("/recommend")}
            style={styles.navLink}
          >
            Recommendations
          </button>

          <button
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
          >
            Compare
          </button>

          <button
            onClick={() => navigate("/decision-room")}
            style={styles.navLink}
          >
            Decision Room
          </button>
        </div>
      </nav>

      <main style={styles.container}>
        {/* Hero */}
        <section style={styles.hero}>
          <div style={styles.heroBadge}>
            ⚖️ PERSONALIZED PRODUCT ANALYSIS
          </div>

          <h1 style={styles.heroTitle}>
            Compare smarter.
            <br />
            <span style={styles.gradientText}>
              Choose with confidence.
            </span>
          </h1>

          <p style={styles.heroDescription}>
            Compare up to three products based on the
            things that actually matter to you.
            ShopCircle turns specifications into a
            personalized decision.
          </p>

          <div style={styles.heroStats}>
            <div style={styles.heroStat}>
              <strong>1–3</strong>
              <span>Products</span>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroStat}>
              <strong>3</strong>
              <span>Personal Priorities</span>
            </div>

            <div style={styles.heroDivider} />

            <div style={styles.heroStat}>
              <strong>AI</strong>
              <span>Smart Matching</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>

            <button
              onClick={() => setError("")}
              style={styles.errorClose}
            >
              ×
            </button>
          </div>
        )}

        {/* Product Selection */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionBadge}>
                STEP 01
              </div>

              <h2 style={styles.sectionTitle}>
                Choose your products
              </h2>

              <p style={styles.sectionDescription}>
                Pick 2 or 3 products you want ShopCircle
                to analyze for you.
              </p>
            </div>

            <div
              style={{
                ...styles.selectionBadge,
                ...(selectedIds.length >= 2
                  ? styles.selectionBadgeReady
                  : {}),
              }}
            >
              {selectedIds.length}/3 selected
            </div>
          </div>

          <div style={styles.productGrid}>
            {products.map((product) => {
              const selected = selectedIds.includes(
                product.id
              );

              const strength =
                getBestStrength(product);

              return (
                <div
                  key={product.id}
                  onClick={() =>
                    toggleProduct(product.id)
                  }
                  style={{
                    ...styles.productCard,
                    ...(selected
                      ? styles.productCardSelected
                      : {}),
                  }}
                >
                  {selected && (
                    <div style={styles.selectedBadge}>
                      ✓ SELECTED
                    </div>
                  )}

                  <div style={styles.productTop}>
                    <div style={styles.productIcon}>
                      💻
                    </div>

                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        toggleProduct(product.id)
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      style={styles.checkbox}
                    />
                  </div>

                  <div style={styles.brandLabel}>
                    {product.brand}
                  </div>

                  <h3 style={styles.productName}>
                    {product.name}
                  </h3>

                  <div style={styles.price}>
                    ₹
                    {product.price.toLocaleString(
                      "en-IN"
                    )}
                  </div>

                  <div style={styles.specGrid}>
                    <div style={styles.specItem}>
                      <span>Processor</span>
                      <strong>
                        {product.processor}
                      </strong>
                    </div>

                    <div style={styles.specItem}>
                      <span>RAM</span>
                      <strong>
                        {product.ram} GB
                      </strong>
                    </div>

                    <div style={styles.specItem}>
                      <span>Storage</span>
                      <strong>
                        {product.storage} GB
                      </strong>
                    </div>

                    <div style={styles.specItem}>
                      <span>GPU</span>
                      <strong>{product.gpu}</strong>
                    </div>
                  </div>

                  <div style={styles.productScores}>
                    <div>
                      <span>💻</span>
                      <strong>
                        {product.coding}/10
                      </strong>
                    </div>

                    <div>
                      <span>🎮</span>
                      <strong>
                        {product.gaming}/10
                      </strong>
                    </div>

                    <div>
                      <span>🔋</span>
                      <strong>
                        {product.battery}/10
                      </strong>
                    </div>
                  </div>

                  <div style={styles.strengthBox}>
                    <span>
                      {strength.icon} Strongest
                    </span>

                    <strong>
                      {strength.label}{" "}
                      {strength.value}/10
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Priorities */}
        <section style={styles.prioritySection}>
          <div style={styles.sectionHeader}>
            <div>
              <div style={styles.sectionBadge}>
                STEP 02
              </div>

              <h2 style={styles.sectionTitle}>
                Tell us what matters
              </h2>

              <p style={styles.sectionDescription}>
                Your priorities change the personalized
                score for every product.
              </p>
            </div>
          </div>

          <div style={styles.priorityGrid}>
            {/* Coding */}
            <PriorityCard
              icon="💻"
              title="Coding"
              value={codingPriority}
              level={getPriorityLevel(
                codingPriority
              )}
              onChange={setCodingPriority}
            />

            {/* Gaming */}
            <PriorityCard
              icon="🎮"
              title="Gaming"
              value={gamingPriority}
              level={getPriorityLevel(
                gamingPriority
              )}
              onChange={setGamingPriority}
            />

            {/* Battery */}
            <PriorityCard
              icon="🔋"
              title="Battery"
              value={batteryPriority}
              level={getPriorityLevel(
                batteryPriority
              )}
              onChange={setBatteryPriority}
            />
          </div>

          <div style={styles.prioritySummary}>
            <div>
              <span>💻 Coding</span>
              <strong>
                {codingPriority}/10
              </strong>
            </div>

            <div>
              <span>🎮 Gaming</span>
              <strong>
                {gamingPriority}/10
              </strong>
            </div>

            <div>
              <span>🔋 Battery</span>
              <strong>
                {batteryPriority}/10
              </strong>
            </div>
          </div>

          <button
            onClick={handleCompare}
            disabled={
              selectedIds.length < 2 || comparing
            }
            style={{
              ...styles.compareButton,
              ...(selectedIds.length >= 2 &&
              !comparing
                ? styles.compareButtonActive
                : {}),
            }}
          >
            <span>
              {comparing
                ? "⏳"
                : "⚖️"}
            </span>

            {comparing
              ? "Analyzing Your Choices..."
              : "Compare My Products"}
          </button>

          {selectedIds.length < 2 && (
            <p style={styles.buttonHint}>
              Select at least 2 products to continue.
            </p>
          )}
        </section>

        {/* Selected summary */}
        {selectedProducts.length > 0 && (
          <section style={styles.selectedSection}>
            <div style={styles.selectedHeader}>
              <div>
                <div style={styles.sectionBadge}>
                  YOUR SHORTLIST
                </div>

                <h3 style={styles.selectedTitle}>
                  Ready for comparison
                </h3>
              </div>

              <span style={styles.selectedCount}>
                {selectedProducts.length} products
              </span>
            </div>

            <div style={styles.selectedList}>
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  style={styles.selectedChip}
                >
                  <span>💻</span>
                  <strong>{product.name}</strong>

                  <button
                    onClick={() =>
                      toggleProduct(product.id)
                    }
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results */}
        {comparison?.comparison && (
          <section style={styles.resultsSection}>
            <div style={styles.resultsHeader}>
              <div>
                <div style={styles.sectionBadge}>
                  STEP 03
                </div>

                <h2 style={styles.resultsTitle}>
                  Your personalized comparison
                </h2>

                <p style={styles.sectionDescription}>
                  ShopCircle ranked these products
                  according to your priorities.
                </p>
              </div>

              <div style={styles.aiBadge}>
                🧠 AI MATCH ANALYSIS
              </div>
            </div>

            {/* Best Match */}
            {comparison.best_match && (
              <div style={styles.bestMatch}>
                <div style={styles.bestMatchGlow} />

                <div style={styles.bestMatchContent}>
                  <div style={styles.bestMatchLabel}>
                    🏆 BEST MATCH FOR YOU
                  </div>

                  <div style={styles.bestMatchMain}>
                    <div>
                      <div style={styles.bestMatchProductIcon}>
                        💻
                      </div>

                      <div>
                        <h2 style={styles.bestMatchTitle}>
                          {comparison.best_match.name}
                        </h2>

                        <p style={styles.bestMatchText}>
                          {getScoreLabel(
                            comparison.best_match_score
                          )}
                          {" · "}
                          Best aligned with your
                          selected priorities.
                        </p>
                      </div>
                    </div>

                    <div style={styles.bestMatchScore}>
                      <strong>
                        {comparison.best_match_score}%
                      </strong>

                      <span>Personal Match</span>
                    </div>
                  </div>

                  <div style={styles.bestMatchBar}>
                    <div
                      style={{
                        ...styles.bestMatchBarFill,
                        width: `${Math.min(
                          comparison.best_match_score,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <div style={styles.bestMatchFooter}>
                    <span>
                      💡 Based on coding, gaming and
                      battery priorities
                    </span>

                    <button
                      onClick={() =>
                        navigate(
                          `/product/${comparison.best_match.id}`,
                          {
                            state: {
                              product:
                                comparison.best_match,
                            },
                          }
                        )
                      }
                      style={styles.viewProductButton}
                    >
                      View Product →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comparison Cards */}
            <div style={styles.resultGrid}>
              {comparison.comparison.map(
                (item, index) => {
                  const isBest =
                    item.product.id ===
                    comparison.best_match?.id;

                  const strength =
                    getBestStrength(item.product);

                  return (
                    <div
                      key={item.product.id}
                      style={{
                        ...styles.resultCard,
                        ...(isBest
                          ? styles.resultCardBest
                          : {}),
                      }}
                    >
                      {isBest && (
                        <div style={styles.winnerBadge}>
                          🏆 BEST MATCH
                        </div>
                      )}

                      <div style={styles.rankRow}>
                        <span style={styles.rankBadge}>
                          #{index + 1}
                        </span>

                        <span
                          style={{
                            ...styles.matchLabel,
                            ...(isBest
                              ? styles.matchLabelBest
                              : {}),
                          }}
                        >
                          {getScoreLabel(
                            item.personal_score
                          )}
                        </span>
                      </div>

                      <div style={styles.resultProductIcon}>
                        💻
                      </div>

                      <div style={styles.resultBrand}>
                        {item.product.brand}
                      </div>

                      <h3 style={styles.resultProductName}>
                        {item.product.name}
                      </h3>

                      <div style={styles.resultScore}>
                        {item.personal_score}%
                      </div>

                      <div style={styles.scoreLabel}>
                        Personal Match
                      </div>

                      <div style={styles.scoreBar}>
                        <div
                          style={{
                            ...styles.scoreBarFill,
                            width: `${Math.min(
                              item.personal_score,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <div style={styles.resultSpecs}>
                        <div>
                          <span>Price</span>
                          <strong>
                            ₹
                            {item.product.price.toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Processor</span>
                          <strong>
                            {item.product.processor}
                          </strong>
                        </div>

                        <div>
                          <span>RAM</span>
                          <strong>
                            {item.product.ram} GB
                          </strong>
                        </div>

                        <div>
                          <span>Storage</span>
                          <strong>
                            {item.product.storage} GB
                          </strong>
                        </div>
                      </div>

                      {/* Product Intelligence */}
                      <div style={styles.intelligence}>
                        <div style={styles.intelligenceHeader}>
                          <span>
                            🧠 Product Intelligence
                          </span>

                          <strong>
                            {strength.value}/10
                          </strong>
                        </div>

                        <div style={styles.intelligenceStats}>
                          <span>
                            💻 {item.product.coding}
                          </span>

                          <span>
                            🎮 {item.product.gaming}
                          </span>

                          <span>
                            🔋 {item.product.battery}
                          </span>
                        </div>

                        <div style={styles.strengthLine}>
                          Strongest in{" "}
                          <strong>
                            {strength.label}
                          </strong>
                        </div>
                      </div>

                      {/* Reasons */}
                      <div style={styles.reasonsSection}>
                        <h4>
                          Why this product?
                        </h4>

                        {Array.isArray(item.reasons) &&
                        item.reasons.length > 0 ? (
                          <div style={styles.reasonsList}>
                            {item.reasons.map(
                              (reason, reasonIndex) => (
                                <div
                                  key={reasonIndex}
                                  style={styles.reasonItem}
                                >
                                  <span>✓</span>
                                  <span>{reason}</span>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <p style={styles.noReason}>
                            Matches some of your selected
                            priorities.
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/product/${item.product.id}`,
                            {
                              state: {
                                product:
                                  item.product,
                              },
                            }
                          )
                        }
                        style={styles.detailsButton}
                      >
                        View Product Details →
                      </button>
                    </div>
                  );
                }
              )}
            </div>

            {/* Decision Room CTA */}
            {comparison.comparison.length >= 2 && (
              <div style={styles.decisionCTA}>
                <div style={styles.decisionCTAIcon}>
                  👥
                </div>

                <div style={styles.decisionCTAContent}>
                  <div style={styles.decisionCTABadge}>
                    CAN'T DECIDE ALONE?
                  </div>

                  <h3>
                    Let your friends decide with you.
                  </h3>

                  <p>
                    Add your shortlisted products to a
                    Decision Room and vote together.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const ids =
                      comparison.comparison
                        .map(
                          (item) =>
                            item.product.id
                        )
                        .slice(0, 3);

                    navigate("/decision-room", {
                      state: {
                        selectedProductIds: ids,
                      },
                    });
                  }}
                  style={styles.decisionCTAButton}
                >
                  Create Decision Room →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Bottom navigation */}
        <div style={styles.bottomActions}>
          <button
            onClick={() => navigate("/recommend")}
            style={styles.secondaryButton}
          >
            ← Back to Recommendations
          </button>

          <button
            onClick={() => navigate("/decision-room")}
            style={styles.primaryButton}
          >
            👥 Open Decision Room
          </button>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          🛍️ ShopCircle
        </div>

        <p style={styles.footerText}>
          Don't just find products. Find the product
          that fits YOUR life.
        </p>

        <p style={styles.footerCopyright}>
          © 2026 ShopCircle • Shop Together. Decide
          Smarter.
        </p>
      </footer>
    </div>
  );
}

function PriorityCard({
  icon,
  title,
  value,
  level,
  onChange,
}) {
  return (
    <div style={styles.priorityCard}>
      <div style={styles.priorityTop}>
        <div style={styles.priorityIcon}>
          {icon}
        </div>

        <div>
          <h3 style={styles.priorityTitle}>
            {title}
          </h3>

          <span style={styles.priorityLevel}>
            {level} priority
          </span>
        </div>

        <strong style={styles.priorityValue}>
          {value}/10
        </strong>
      </div>

      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        style={styles.rangeInput}
      />

      <div style={styles.rangeLabels}>
        <span>Less important</span>
        <span>Very important</span>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8faff 0%, #f4f6fb 100%)",
    color: "#111827",
  },

  navbar: {
    height: "72px",
    padding: "0 6%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    background: "rgba(255,255,255,0.92)",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(14px)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "21px",
    fontWeight: "800",
    cursor: "pointer",
    color: "#111827",
  },

  logoIcon: {
    fontSize: "25px",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

  navLink: {
    border: "none",
    background: "transparent",
    padding: "9px 13px",
    borderRadius: "9px",
    cursor: "pointer",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
  },

  activeNavLink: {
    background: "#eef2ff",
    color: "#4f46e5",
  },

  container: {
    width: "min(1180px, 92%)",
    margin: "0 auto",
    padding: "45px 0 70px",
  },

  hero: {
    textAlign: "center",
    padding: "25px 0 45px",
  },

  heroBadge: {
    display: "inline-flex",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "#eef2ff",
    border: "1px solid #e0e7ff",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  heroTitle: {
    margin: "18px 0 12px",
    fontSize: "clamp(36px, 5vw, 58px)",
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
  },

  gradientText: {
    background:
      "linear-gradient(90deg, #4f46e5, #7c3aed, #db2777)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  heroDescription: {
    maxWidth: "680px",
    margin: "0 auto",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  heroStats: {
    margin: "28px auto 0",
    display: "inline-flex",
    alignItems: "center",
    gap: "25px",
    padding: "14px 24px",
    borderRadius: "16px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 30px rgba(15,23,42,0.05)",
  },

  heroStat: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    minWidth: "90px",
  },

  heroStatStrong: {
    fontSize: "20px",
  },

  heroDivider: {
    width: "1px",
    height: "35px",
    background: "#e5e7eb",
  },

  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "15px 18px",
    marginBottom: "22px",
    borderRadius: "13px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
  },

  errorIcon: {
    fontSize: "19px",
  },

  errorBoxP: {
    margin: "4px 0 0",
  },

  errorClose: {
    marginLeft: "auto",
    border: "none",
    background: "transparent",
    fontSize: "20px",
    cursor: "pointer",
    color: "#9f1239",
  },

  section: {
    marginTop: "15px",
    padding: "28px",
    borderRadius: "22px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 35px rgba(15,23,42,0.05)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    flexWrap: "wrap",
  },

  sectionBadge: {
    color: "#6366f1",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    marginBottom: "7px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "27px",
    letterSpacing: "-0.025em",
  },

  sectionDescription: {
    margin: "7px 0 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  selectionBadge: {
    padding: "8px 13px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "800",
  },

  selectionBadgeReady: {
    background: "#ecfdf5",
    color: "#047857",
  },

  productGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
    marginTop: "25px",
  },

  productCard: {
    position: "relative",
    padding: "20px",
    borderRadius: "17px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
    transition:
      "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
  },

  productCardSelected: {
    border: "2px solid #6366f1",
    background: "#fafaff",
    boxShadow:
      "0 10px 30px rgba(99,102,241,0.13)",
  },

  selectedBadge: {
    position: "absolute",
    top: "13px",
    right: "13px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "9px",
    fontWeight: "800",
  },

  productTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  productIcon: {
    width: "46px",
    height: "46px",
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "#f1f5f9",
    fontSize: "22px",
  },

  checkbox: {
    width: "19px",
    height: "19px",
    accentColor: "#4f46e5",
    cursor: "pointer",
  },

  brandLabel: {
    marginTop: "17px",
    color: "#6366f1",
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  productName: {
    margin: "5px 0 0",
    fontSize: "19px",
  },

  price: {
    marginTop: "9px",
    fontSize: "21px",
    fontWeight: "800",
  },

  specGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginTop: "18px",
  },

  specItem: {
    padding: "9px",
    borderRadius: "9px",
    background: "#f8fafc",
    border: "1px solid #edf0f4",
    minWidth: 0,
  },

  productScores: {
    display: "flex",
    gap: "7px",
    marginTop: "13px",
  },

  strengthBox: {
    marginTop: "13px",
    padding: "9px 11px",
    borderRadius: "9px",
    background: "#f5f3ff",
    color: "#5b21b6",
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    fontSize: "11px",
  },

  prioritySection: {
    marginTop: "25px",
    padding: "28px",
    borderRadius: "22px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 35px rgba(15,23,42,0.05)",
  },

  priorityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "15px",
    marginTop: "24px",
  },

  priorityCard: {
    padding: "18px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },

  priorityTop: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
  },

  priorityIcon: {
    width: "40px",
    height: "40px",
    display: "grid",
    placeItems: "center",
    borderRadius: "11px",
    background: "#fff",
    fontSize: "19px",
  },

  priorityTitle: {
    margin: 0,
    fontSize: "14px",
  },

  priorityLevel: {
    display: "block",
    marginTop: "2px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  priorityValue: {
    marginLeft: "auto",
    fontSize: "17px",
  },

  rangeInput: {
    width: "100%",
    marginTop: "18px",
    accentColor: "#6366f1",
    cursor: "pointer",
  },

  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "5px",
    color: "#94a3b8",
    fontSize: "9px",
  },

  prioritySummary: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "22px",
  },

  prioritySummaryItem: {
    padding: "9px 13px",
  },

  compareButton: {
    marginTop: "25px",
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "13px",
    background: "#cbd5e1",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "800",
    cursor: "not-allowed",
    transition: "0.2s",
  },

  compareButtonActive: {
    background:
      "linear-gradient(135deg, #4f46e5, #7c3aed)",
    cursor: "pointer",
    boxShadow:
      "0 10px 25px rgba(79,70,229,0.25)",
  },

  buttonHint: {
    margin: "8px 0 0",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "11px",
  },

  selectedSection: {
    marginTop: "22px",
    padding: "20px 24px",
    borderRadius: "18px",
    background: "#fff",
    border: "1px solid #e5e7eb",
  },

  selectedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  selectedTitle: {
    margin: 0,
    fontSize: "17px",
  },

  selectedCount: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "800",
  },

  selectedList: {
    display: "flex",
    gap: "9px",
    flexWrap: "wrap",
    marginTop: "15px",
  },

  selectedChip: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "9px 10px 9px 12px",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: "11px",
  },

  removeButton: {
    width: "20px",
    height: "20px",
    border: "none",
    borderRadius: "50%",
    background: "#e2e8f0",
    color: "#475569",
    cursor: "pointer",
    fontWeight: "800",
  },

  resultsSection: {
    marginTop: "38px",
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "20px",
    flexWrap: "wrap",
  },

  resultsTitle: {
    margin: 0,
    fontSize: "30px",
    letterSpacing: "-0.025em",
  },

  aiBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "10px",
    fontWeight: "800",
  },

  bestMatch: {
    position: "relative",
    overflow: "hidden",
    marginTop: "22px",
    borderRadius: "22px",
    background:
      "linear-gradient(135deg, #111827 0%, #312e81 100%)",
    color: "#fff",
    boxShadow:
      "0 18px 45px rgba(49,46,129,0.22)",
  },

  bestMatchGlow: {
    position: "absolute",
    width: "250px",
    height: "250px",
    right: "-90px",
    top: "-120px",
    borderRadius: "50%",
    background: "rgba(129,140,248,0.22)",
    filter: "blur(15px)",
  },

  bestMatchContent: {
    position: "relative",
    padding: "28px",
  },

  bestMatchLabel: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "0.1em",
    color: "#c7d2fe",
  },

  bestMatchMain: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    flexWrap: "wrap",
  },

  bestMatchMainLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  bestMatchProductIcon: {
    width: "52px",
    height: "52px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.1)",
    fontSize: "24px",
  },

  bestMatchTitle: {
    margin: 0,
    fontSize: "28px",
  },

  bestMatchText: {
    margin: "5px 0 0",
    color: "#cbd5e1",
    fontSize: "13px",
  },

  bestMatchScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  bestMatchScoreStrong: {
    fontSize: "42px",
    lineHeight: 1,
    fontWeight: "900",
  },

  bestMatchScoreSpan: {
    marginTop: "4px",
    color: "#cbd5e1",
    fontSize: "10px",
  },

  bestMatchBar: {
    height: "8px",
    marginTop: "25px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.13)",
  },

  bestMatchBarFill: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #818cf8, #c4b5fd)",
    transition: "width 0.5s ease",
  },

  bestMatchFooter: {
    marginTop: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    color: "#cbd5e1",
    fontSize: "11px",
  },

  viewProductButton: {
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "9px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "700",
  },

  resultGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(290px, 1fr))",
    gap: "20px",
    marginTop: "22px",
  },

  resultCard: {
    position: "relative",
    padding: "23px",
    borderRadius: "19px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.05)",
  },

  resultCardBest: {
    border: "2px solid #6366f1",
    boxShadow:
      "0 12px 35px rgba(99,102,241,0.12)",
  },

  winnerBadge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#eef2ff",
    color: "#4f46e5",
    fontSize: "9px",
    fontWeight: "800",
  },

  rankRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  rankBadge: {
    width: "27px",
    height: "27px",
    display: "grid",
    placeItems: "center",
    borderRadius: "8px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontWeight: "800",
  },

  matchLabel: {
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "9px",
    fontWeight: "800",
  },

  matchLabelBest: {
    background: "#ecfdf5",
    color: "#047857",
  },

  resultProductIcon: {
    width: "48px",
    height: "48px",
    marginTop: "20px",
    display: "grid",
    placeItems: "center",
    borderRadius: "13px",
    background: "#f8fafc",
    fontSize: "23px",
  },

  resultBrand: {
    marginTop: "13px",
    color: "#6366f1",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },

  resultProductName: {
    margin: "4px 0 0",
    fontSize: "20px",
  },

  resultScore: {
    marginTop: "18px",
    fontSize: "36px",
    fontWeight: "900",
    letterSpacing: "-0.03em",
  },

  scoreLabel: {
    marginTop: "-3px",
    color: "#94a3b8",
    fontSize: "10px",
  },

  scoreBar: {
    height: "7px",
    marginTop: "10px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "#e2e8f0",
  },

  scoreBarFill: {
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #6366f1, #8b5cf6)",
    transition: "width 0.5s ease",
  },

  resultSpecs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "9px",
    marginTop: "19px",
  },

  intelligence: {
    marginTop: "17px",
    padding: "13px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },

  intelligenceHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    fontSize: "11px",
    fontWeight: "700",
  },

  intelligenceStats: {
    display: "flex",
    gap: "6px",
    marginTop: "9px",
  },

  intelligenceStat: {
    padding: "5px 7px",
    borderRadius: "7px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    fontSize: "10px",
    color: "#475569",
  },

  strengthLine: {
    marginTop: "9px",
    color: "#64748b",
    fontSize: "10px",
  },

  reasonsSection: {
    marginTop: "18px",
  },

  reasonsSectionH4: {
    margin: 0,
  },

  reasonsList: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginTop: "9px",
  },

  reasonItem: {
    display: "flex",
    gap: "7px",
    color: "#475569",
    fontSize: "11px",
    lineHeight: 1.4,
  },

  noReason: {
    color: "#94a3b8",
    fontSize: "11px",
  },

  detailsButton: {
    width: "100%",
    marginTop: "18px",
    padding: "11px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "11px",
  },

  decisionCTA: {
    marginTop: "25px",
    display: "flex",
    alignItems: "center",
    gap: "17px",
    padding: "22px",
    borderRadius: "19px",
    background:
      "linear-gradient(135deg, #f5f3ff, #eef2ff)",
    border: "1px solid #ddd6fe",
    flexWrap: "wrap",
  },

  decisionCTAIcon: {
    width: "50px",
    height: "50px",
    display: "grid",
    placeItems: "center",
    borderRadius: "14px",
    background: "#fff",
    fontSize: "24px",
  },

  decisionCTAContent: {
    flex: 1,
    minWidth: "220px",
  },

  decisionCTABadge: {
    color: "#6366f1",
    fontSize: "9px",
    fontWeight: "800",
    letterSpacing: "0.08em",
  },

  decisionCTAContentH3: {
    margin: "4px 0",
  },

  decisionCTAContentP: {
    margin: 0,
    color: "#64748b",
    fontSize: "11px",
  },

  decisionCTAButton: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "800",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginTop: "35px",
    flexWrap: "wrap",
  },

  secondaryButton: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "1px solid #dbe1ea",
    background: "#fff",
    color: "#334155",
    cursor: "pointer",
    fontWeight: "700",
  },

  primaryButton: {
    padding: "11px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "700",
  },

  loadingPage: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f8faff",
    padding: "20px",
  },

  loadingCard: {
    width: "min(400px, 90%)",
    padding: "35px",
    textAlign: "center",
    borderRadius: "20px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow:
      "0 15px 45px rgba(15,23,42,0.08)",
  },

  loadingIcon: {
    fontSize: "40px",
  },

  loadingTitle: {
    margin: "15px 0 5px",
  },

  loadingText: {
    color: "#64748b",
    fontSize: "13px",
  },

  loadingBar: {
    height: "5px",
    marginTop: "20px",
    overflow: "hidden",
    borderRadius: "999px",
    background: "#e2e8f0",
  },

  loadingBarFill: {
    width: "45%",
    height: "100%",
    borderRadius: "999px",
    background: "#6366f1",
  },

  footer: {
    marginTop: "20px",
    padding: "35px 20px",
    textAlign: "center",
    background: "#111827",
    color: "#fff",
  },

  footerLogo: {
    fontSize: "20px",
    fontWeight: "800",
  },

  footerText: {
    margin: "8px 0",
    color: "#cbd5e1",
    fontSize: "12px",
  },

  footerCopyright: {
    margin: 0,
    color: "#64748b",
    fontSize: "10px",
  },
};

export default Compare;