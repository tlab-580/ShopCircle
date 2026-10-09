import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

function Recommend() {
  const navigate = useNavigate();

  const [budget, setBudget] = useState(70000);
  const [coding, setCoding] = useState(10);
  const [gaming, setGaming] = useState(5);
  const [battery, setBattery] = useState(8);

  const [recommendations, setRecommendations] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD WISHLIST
  // =====================================================

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(
        "shopcircle_wishlist"
      );

      if (savedWishlist) {
        const parsedWishlist = JSON.parse(savedWishlist);

        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        }
      }
    } catch (err) {
      console.error("Unable to load wishlist:", err);
      setWishlist([]);
    }
  }, []);

  // =====================================================
  // SAVE WISHLIST
  // =====================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "shopcircle_wishlist",
        JSON.stringify(wishlist)
      );
    } catch (err) {
      console.error("Unable to save wishlist:", err);
    }
  }, [wishlist]);

  // =====================================================
  // GET RECOMMENDATIONS
  // =====================================================

  const getRecommendations = async () => {
    setLoading(true);
    setError("");
    setComparison(null);
    setSelectedProducts([]);

    try {
      localStorage.setItem(
        "shopcircle_preferences",
        JSON.stringify({
          budget: Number(budget),
          coding: Number(coding),
          gaming: Number(gaming),
          battery: Number(battery),
        })
      );

      const response = await axios.post(
        `${API_URL}/recommend`,
        {
          budget: Number(budget),
          coding_priority: Number(coding),
          gaming_priority: Number(gaming),
          battery_priority: Number(battery),
        }
      );

      console.log(
        "Recommendation API response:",
        response.data
      );

      const receivedRecommendations =
        Array.isArray(response.data?.recommendations)
          ? response.data.recommendations
          : [];

      if (receivedRecommendations.length === 0) {
        setRecommendations([]);
        setError(
          "No recommendations were returned by the backend."
        );
        return;
      }

      const safeRecommendations =
        receivedRecommendations
          .filter(
            (item) => item && item.product
          )
          .map((item) => ({
            ...item,
            reasons: Array.isArray(item.reasons)
              ? item.reasons
              : [],
            match_score:
              typeof item.match_score === "number"
                ? item.match_score
                : Number(item.match_score) || 0,
          }));

      setRecommendations(safeRecommendations);

      if (safeRecommendations.length === 0) {
        setError(
          "Recommendations were received, but no valid products were found."
        );
      }
    } catch (err) {
      console.error(
        "Recommendation error:",
        err
      );

      setRecommendations([]);

      if (err.response) {
        setError(
          `Recommendation failed: ${
            err.response.data?.message ||
            "Backend returned an error."
          }`
        );
      } else {
        setError(
          "Unable to get recommendations. Make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // OPEN PRODUCT DETAILS
  // =====================================================

  const openProductDetails = (product) => {
    if (!product || !product.id) {
      setError(
        "Unable to open product details."
      );
      return;
    }

    navigate(`/product/${product.id}`, {
      state: {
        product,
      },
    });
  };

  // =====================================================
  // ADD TO DECISION ROOM
  // =====================================================

  const addToDecisionRoom = (product) => {
    if (!product || !product.id) {
      setError(
        "Unable to add this product to a Decision Room."
      );
      return;
    }

    navigate("/decision-room", {
      state: {
        selectedProductId: product.id,
        selectedProduct: product,
      },
    });
  };

  // =====================================================
  // MATCH LABEL
  // =====================================================

  const getMatchLabel = (score) => {
    const numericScore = Number(score) || 0;

    if (numericScore >= 90) {
      return "Excellent Match";
    }

    if (numericScore >= 80) {
      return "Great Match";
    }

    if (numericScore >= 70) {
      return "Good Match";
    }

    if (numericScore >= 60) {
      return "Fair Match";
    }

    return "Low Match";
  };

  // =====================================================
  // SCORE COLOR
  // =====================================================

  const getScoreColor = (score) => {
    const numericScore = Number(score) || 0;

    if (numericScore >= 90) {
      return "#16a34a";
    }

    if (numericScore >= 75) {
      return "#2563eb";
    }

    if (numericScore >= 60) {
      return "#f59e0b";
    }

    return "#dc2626";
  };

  // =====================================================
  // MATCH BREAKDOWN
  // =====================================================

  const calculateMatchBreakdown = (product) => {
    if (!product) {
      return {
        budget: 0,
        coding: 0,
        gaming: 0,
        battery: 0,
      };
    }

    const userBudget =
      Number(budget) || 1;

    const userCoding =
      Number(coding) || 1;

    const userGaming =
      Number(gaming) || 1;

    const userBattery =
      Number(battery) || 1;

    let budgetScore = 0;

    if (product.price <= userBudget) {
      budgetScore = 100;
    } else if (
      product.price <=
      userBudget + 10000
    ) {
      budgetScore = 75;
    } else if (
      product.price <=
      userBudget + 20000
    ) {
      budgetScore = 50;
    } else {
      budgetScore = 25;
    }

    const codingScore = Math.min(
      ((Number(product.coding) || 0) /
        userCoding) *
        100,
      100
    );

    const gamingScore = Math.min(
      ((Number(product.gaming) || 0) /
        userGaming) *
        100,
      100
    );

    const batteryScore = Math.min(
      ((Number(product.battery) || 0) /
        userBattery) *
        100,
      100
    );

    return {
      budget: Math.round(budgetScore),
      coding: Math.round(codingScore),
      gaming: Math.round(gamingScore),
      battery: Math.round(batteryScore),
    };
  };

  // =====================================================
  // PRODUCT SELECTION
  // =====================================================

  const toggleProductSelection = (productId) => {
    setSelectedProducts((previous) => {
      if (previous.includes(productId)) {
        return previous.filter(
          (id) => id !== productId
        );
      }

      if (previous.length >= 3) {
        setError(
          "You can compare up to 3 products at a time."
        );

        return previous;
      }

      setError("");

      return [...previous, productId];
    });
  };

  // =====================================================
  // COMPARISON
  // =====================================================

  const compareSelectedProducts = async () => {
    if (selectedProducts.length < 2) {
      setError(
        "Please select at least 2 products to compare."
      );
      return;
    }

    setCompareLoading(true);
    setError("");
    setComparison(null);

    try {
      const response = await axios.post(
        `${API_URL}/compare`,
        {
          product_ids: selectedProducts,
          coding_priority: Number(coding),
          gaming_priority: Number(gaming),
          battery_priority: Number(battery),
        }
      );

      if (
        !response.data ||
        !Array.isArray(
          response.data.comparison
        )
      ) {
        setError(
          "The comparison response is invalid."
        );
        return;
      }

      setComparison({
        ...response.data,
        comparison:
          response.data.comparison.filter(
            (item) =>
              item && item.product
          ),
      });
    } catch (err) {
      console.error(
        "Comparison error:",
        err
      );

      setError(
        "Unable to compare products. Make sure the backend is running."
      );
    } finally {
      setCompareLoading(false);
    }
  };

  // =====================================================
  // WISHLIST
  // =====================================================

  const toggleWishlist = (product) => {
    if (!product || !product.id) {
      return;
    }

    setWishlist((previous) => {
      const safeWishlist = Array.isArray(
        previous
      )
        ? previous
        : [];

      const exists = safeWishlist.some(
        (item) =>
          item.id === product.id
      );

      if (exists) {
        return safeWishlist.filter(
          (item) =>
            item.id !== product.id
        );
      }

      return [
        ...safeWishlist,
        product,
      ];
    });
  };

  const isInWishlist = (productId) => {
    return Array.isArray(wishlist)
      ? wishlist.some(
          (product) =>
            product.id === productId
        )
      : false;
  };

  // =====================================================
  // SEND WISHLIST TO DECISION ROOM
  // =====================================================

  const sendWishlistToDecisionRoom = () => {
    if (!wishlist.length) {
      setError(
        "Your wishlist is empty."
      );
      return;
    }

    localStorage.setItem(
      "shopcircle_room_products",
      JSON.stringify(wishlist)
    );

    navigate("/decision-room");
  };

  const safeRecommendations =
    Array.isArray(recommendations)
      ? recommendations
      : [];

  // =====================================================
  // PRIORITY CARD
  // =====================================================

  const PriorityCard = ({
    icon,
    title,
    value,
    setValue,
    min = 1,
    max = 10,
    suffix = "/10",
  }) => {
    return (
      <div style={styles.priorityCard}>
        <div style={styles.priorityTop}>
          <div>
            <span
              style={styles.priorityIcon}
            >
              {icon}
            </span>

            <strong>{title}</strong>
          </div>

          <span
            style={styles.priorityValue}
          >
            {value}
            {suffix}
          </span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(event) =>
            setValue(
              Number(event.target.value)
            )
          }
          style={styles.range}
        />

        <div style={styles.rangeLabels}>
          <span>Low priority</span>
          <span>High priority</span>
        </div>
      </div>
    );
  };

  // =====================================================
  // MATCH BAR
  // =====================================================

  const MatchBar = ({
    label,
    score,
  }) => {
    const safeScore = Math.min(
      Math.max(Number(score) || 0, 0),
      100
    );

    return (
      <div style={styles.matchMetric}>
        <div style={styles.metricHeader}>
          <span>{label}</span>
          <strong>{safeScore}%</strong>
        </div>

        <div style={styles.metricTrack}>
          <div
            style={{
              ...styles.metricFill,
              width: `${safeScore}%`,
              background:
                getScoreColor(safeScore),
            }}
          />
        </div>
      </div>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div style={styles.page}>
      {/* NAVBAR */}

      <nav style={styles.navbar}>
        <Link
          to="/"
          style={styles.logo}
        >
          <span>🛍️</span>
          <strong>ShopCircle</strong>
        </Link>

        <div style={styles.navLinks}>
          <Link
            to="/"
            style={styles.navLink}
          >
            Home
          </Link>

          <Link
            to="/recommend"
            style={{
              ...styles.navLink,
              ...styles.activeNavLink,
            }}
          >
            Recommendations
          </Link>

          <Link
            to="/compare"
            style={styles.navLink}
          >
            Compare
          </Link>

          <Link
            to="/decision-room"
            style={styles.navLink}
          >
            Decision Room
          </Link>
        </div>
      </nav>

      <main style={styles.container}>
        {/* HERO */}

        <section style={styles.hero}>
          <div style={styles.heroBadge}>
            ✨ AI-POWERED SHOPPING
          </div>

          <h1 style={styles.heroTitle}>
            Find products that fit
            <br />
            <span style={styles.blueText}>
              YOUR life.
            </span>
          </h1>

          <p style={styles.heroDescription}>
            Tell ShopCircle what matters
            to you. We'll rank the products
            that best match your budget
            and priorities.
          </p>
        </section>

        {/* REQUIREMENTS */}

        <section
          style={styles.requirementCard}
        >
          <div style={styles.cardHeading}>
            <div style={styles.headingIcon}>
              🎯
            </div>

            <div>
              <h2
                style={styles.cardTitle}
              >
                Build your shopping profile
              </h2>

              <p
                style={styles.cardSubtitle}
              >
                Adjust your priorities and
                let AI find your best matches.
              </p>
            </div>
          </div>

          {/* BUDGET */}

          <div style={styles.budgetBox}>
            <div
              style={styles.budgetHeader}
            >
              <div>
                <span
                  style={styles.smallLabel}
                >
                  MAXIMUM BUDGET
                </span>

                <div
                  style={styles.budgetValue}
                >
                  ₹
                  {Number(
                    budget
                  ).toLocaleString("en-IN")}
                </div>
              </div>

              <div style={styles.budgetIcon}>
                💰
              </div>
            </div>

            <input
              type="range"
              min="30000"
              max="120000"
              step="1000"
              value={budget}
              onChange={(event) =>
                setBudget(
                  Number(event.target.value)
                )
              }
              style={styles.budgetRange}
            />

            <div style={styles.rangeLabels}>
              <span>₹30K</span>
              <span>₹1.2L</span>
            </div>
          </div>

          {/* PRIORITIES */}

          <div
            style={styles.priorityHeading}
          >
            <h3
              style={
                styles.priorityHeadingTitle
              }
            >
              Your priorities
            </h3>

            <span
              style={
                styles.priorityHeadingHint
              }
            >
              Higher score = more important
              to you
            </span>
          </div>

          <div
            style={styles.priorityGrid}
          >
            <PriorityCard
              icon="💻"
              title="Coding"
              value={coding}
              setValue={setCoding}
            />

            <PriorityCard
              icon="🎮"
              title="Gaming"
              value={gaming}
              setValue={setGaming}
            />

            <PriorityCard
              icon="🔋"
              title="Battery"
              value={battery}
              setValue={setBattery}
            />
          </div>

          <button
            onClick={getRecommendations}
            disabled={loading}
            style={{
              ...styles.findButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "🤖 Finding your best matches..."
              : "✨ Find My Best Matches"}
          </button>
        </section>

        {/* ERROR */}

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* WISHLIST */}

        {wishlist.length > 0 && (
          <section
            style={
              styles.wishlistSection
            }
          >
            <div style={styles.sectionTop}>
              <div>
                <div
                  style={
                    styles.sectionEyebrow
                  }
                >
                  SAVED FOR LATER
                </div>

                <h2
                  style={styles.sectionTitle}
                >
                  ❤️ My Wishlist
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Your shortlisted products.
                </p>
              </div>

              <div
                style={styles.savedBadge}
              >
                {wishlist.length} saved
              </div>
            </div>

            <div
              style={styles.wishlistGrid}
            >
              {wishlist.map((product) => (
                <div
                  key={product.id}
                  style={
                    styles.wishlistCard
                  }
                >
                  <div
                    style={
                      styles.wishlistProductIcon
                    }
                  >
                    💻
                  </div>

                  <div
                    style={{ flex: 1 }}
                  >
                    <h3
                      style={
                        styles.productName
                      }
                    >
                      {product.name}
                    </h3>

                    <p
                      style={
                        styles.productMeta
                      }
                    >
                      {product.brand} •{" "}
                      {product.processor}
                    </p>

                    <strong
                      style={
                        styles.productPrice
                      }
                    >
                      ₹
                      {Number(
                        product.price
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <button
                    onClick={() =>
                      toggleWishlist(product)
                    }
                    style={
                      styles.removeButton
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={
                sendWishlistToDecisionRoom
              }
              style={styles.roomButton}
            >
              👥 Send Wishlist to Decision
              Room →
            </button>
          </section>
        )}

        {/* RESULTS */}

        {safeRecommendations.length >
          0 && (
          <section
            style={styles.resultsSection}
          >
            <div
              style={styles.resultsHeader}
            >
              <div>
                <div
                  style={
                    styles.sectionEyebrow
                  }
                >
                  AI ANALYSIS COMPLETE
                </div>

                <h2
                  style={styles.sectionTitle}
                >
                  🏆 Your Personalized Matches
                </h2>

                <p
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Ranked using your budget
                  and personal priorities.
                </p>
              </div>

              <div
                style={styles.resultCount}
              >
                {safeRecommendations.length}{" "}
                matches
              </div>
            </div>

            {/* COMPARISON INFO */}

            <div
              style={styles.compareInfo}
            >
              <div
                style={
                  styles.compareInfoIcon
                }
              >
                ⚖️
              </div>

              <div style={{ flex: 1 }}>
                <strong>
                  Build your shortlist
                </strong>

                <p
                  style={
                    styles.compareInfoText
                  }
                >
                  Select up to 3 products to
                  compare them using your
                  personal priorities.
                </p>
              </div>

              <div
                style={styles.selectionCount}
              >
                {selectedProducts.length}/3
              </div>
            </div>

            {/* RECOMMENDATION CARDS */}

            <div
              style={
                styles.recommendationList
              }
            >
              {safeRecommendations.map(
                (item, index) => {
                  if (
                    !item ||
                    !item.product
                  ) {
                    return null;
                  }

                  const product =
                    item.product;

                  const isSelected =
                    selectedProducts.includes(
                      product.id
                    );

                  const saved =
                    isInWishlist(
                      product.id
                    );

                  const matchBreakdown =
                    calculateMatchBreakdown(
                      product
                    );

                  const reasons =
                    Array.isArray(
                      item.reasons
                    )
                      ? item.reasons
                      : [];

                  const matchScore =
                    Number(
                      item.match_score
                    ) || 0;

                  return (
                    <article
                      key={
                        product.id || index
                      }
                      style={{
                        ...styles.productCard,
                        ...(isSelected
                          ? styles.selectedProductCard
                          : {}),
                      }}
                    >
                      {/* TOP ROW */}

                      <div
                        style={
                          styles.productTop
                        }
                      >
                        <div
                          style={
                            styles.rankBadge
                          }
                        >
                          #{index + 1}
                        </div>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          <div
                            style={
                              styles.productTitleRow
                            }
                          >
                            <div>
                              <h2
                                style={
                                  styles.productNameLarge
                                }
                              >
                                {product.name}
                              </h2>

                              <p
                                style={
                                  styles.productMeta
                                }
                              >
                                {product.brand}{" "}
                                •{" "}
                                {
                                  product.processor
                                }
                              </p>
                            </div>

                            {index === 0 && (
                              <span
                                style={
                                  styles.topPickBadge
                                }
                              >
                                🏆 TOP PICK
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* MAIN PRODUCT CONTENT */}

                      <div
                        style={
                          styles.productContent
                        }
                      >
                        <div
                          style={
                            styles.productMain
                          }
                        >
                          {/* PRICE */}

                          <div
                            style={
                              styles.priceRow
                            }
                          >
                            <div>
                              <span
                                style={
                                  styles.priceLabel
                                }
                              >
                                PRICE
                              </span>

                              <div
                                style={
                                  styles.productPriceLarge
                                }
                              >
                                ₹
                                {Number(
                                  product.price
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </div>
                            </div>

                            <label
                              style={
                                styles.compareCheckbox
                              }
                            >
                              <input
                                type="checkbox"
                                checked={
                                  isSelected
                                }
                                onChange={() =>
                                  toggleProductSelection(
                                    product.id
                                  )
                                }
                              />

                              <span>
                                Compare
                              </span>
                            </label>
                          </div>

                          {/* SPECS */}

                          <div
                            style={
                              styles.specGrid
                            }
                          >
                            <div
                              style={
                                styles.specItem
                              }
                            >
                              <span>💻</span>

                              <div>
                                <small
                                  style={
                                    styles.specLabel
                                  }
                                >
                                  Coding
                                </small>

                                <strong
                                  style={
                                    styles.specValue
                                  }
                                >
                                  {product.coding}
                                  /10
                                </strong>
                              </div>
                            </div>

                            <div
                              style={
                                styles.specItem
                              }
                            >
                              <span>🎮</span>

                              <div>
                                <small
                                  style={
                                    styles.specLabel
                                  }
                                >
                                  Gaming
                                </small>

                                <strong
                                  style={
                                    styles.specValue
                                  }
                                >
                                  {product.gaming}
                                  /10
                                </strong>
                              </div>
                            </div>

                            <div
                              style={
                                styles.specItem
                              }
                            >
                              <span>🔋</span>

                              <div>
                                <small
                                  style={
                                    styles.specLabel
                                  }
                                >
                                  Battery
                                </small>

                                <strong
                                  style={
                                    styles.specValue
                                  }
                                >
                                  {product.battery}
                                  /10
                                </strong>
                              </div>
                            </div>

                            <div
                              style={
                                styles.specItem
                              }
                            >
                              <span>💾</span>

                              <div>
                                <small
                                  style={
                                    styles.specLabel
                                  }
                                >
                                  Storage
                                </small>

                                <strong
                                  style={
                                    styles.specValue
                                  }
                                >
                                  {product.storage}{" "}
                                  GB
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* WHY THIS PRODUCT */}

                          <div
                            style={
                              styles.whyBox
                            }
                          >
                            <div
                              style={
                                styles.whyHeader
                              }
                            >
                              <span>💡</span>

                              <strong>
                                Why this product?
                              </strong>
                            </div>

                            {reasons.length >
                            0 ? (
                              <ul
                                style={
                                  styles.reasonList
                                }
                              >
                                {reasons.map(
                                  (
                                    reason,
                                    reasonIndex
                                  ) => (
                                    <li
                                      key={
                                        reasonIndex
                                      }
                                    >
                                      <span>
                                        ✓
                                      </span>{" "}
                                      {reason}
                                    </li>
                                  )
                                )}
                              </ul>
                            ) : (
                              <p
                                style={
                                  styles.noReason
                                }
                              >
                                This product was
                                selected based
                                on your
                                requirements.
                              </p>
                            )}
                          </div>

                          {/* PERSONAL MATCH */}

                          <div
                            style={
                              styles.personalBox
                            }
                          >
                            <div
                              style={
                                styles.personalHeader
                              }
                            >
                              <div
                                style={
                                  styles.personalHeaderRow
                                }
                              >
                                <strong>
                                  🎯 Why this
                                  matches YOU
                                </strong>

                                <span
                                  style={
                                    styles.personalHeaderTag
                                  }
                                >
                                  Personal Fit
                                </span>
                              </div>
                            </div>

                            <MatchBar
                              label="💰 Budget"
                              score={
                                matchBreakdown.budget
                              }
                            />

                            <MatchBar
                              label="💻 Coding"
                              score={
                                matchBreakdown.coding
                              }
                            />

                            <MatchBar
                              label="🎮 Gaming"
                              score={
                                matchBreakdown.gaming
                              }
                            />

                            <MatchBar
                              label="🔋 Battery"
                              score={
                                matchBreakdown.battery
                              }
                            />
                          </div>
                        </div>

                        {/* SCORE PANEL */}

                        <aside
                          style={
                            styles.scorePanel
                          }
                        >
                          <div
                            style={
                              styles.scoreLabel
                            }
                          >
                            PERSONAL MATCH
                          </div>

                          <div
                            style={{
                              ...styles.scoreCircle,
                              borderColor:
                                getScoreColor(
                                  matchScore
                                ),
                            }}
                          >
                            <strong
                              style={{
                                ...styles.scoreCircleValue,
                                color:
                                  getScoreColor(
                                    matchScore
                                  ),
                              }}
                            >
                              {matchScore}%
                            </strong>
                          </div>

                          <div
                            style={{
                              ...styles.matchPill,
                              color:
                                getScoreColor(
                                  matchScore
                                ),
                            }}
                          >
                            {getMatchLabel(
                              matchScore
                            )}
                          </div>

                          <p
                            style={
                              styles.scoreDescription
                            }
                          >
                            Based on your budget
                            and priorities.
                          </p>

                          <button
                            onClick={() =>
                              openProductDetails(
                                product
                              )
                            }
                            style={
                              styles.detailsButton
                            }
                          >
                            🔎 View Details
                          </button>

                          <button
                            onClick={() =>
                              toggleWishlist(
                                product
                              )
                            }
                            style={{
                              ...styles.wishlistButton,
                              ...(saved
                                ? styles.savedButton
                                : {}),
                            }}
                          >
                            {saved
                              ? "❤️ Saved"
                              : "🤍 Save to Wishlist"}
                          </button>

                          <button
                            onClick={() =>
                              addToDecisionRoom(
                                product
                              )
                            }
                            style={
                              styles.decisionButton
                            }
                          >
                            👥 Add to Decision Room
                          </button>
                        </aside>
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            {/* COMPARE ACTION */}

            <div
              style={
                styles.compareAction
              }
            >
              <div>
                <div
                  style={
                    styles.compareActionIcon
                  }
                >
                  ⚖️
                </div>

                <h3
                  style={
                    styles.compareActionTitle
                  }
                >
                  Compare your shortlisted
                  products
                </h3>

                <p
                  style={
                    styles.compareActionText
                  }
                >
                  {selectedProducts.length ===
                  0
                    ? "Select 2 or 3 products above to compare."
                    : `${selectedProducts.length} product${
                        selectedProducts.length >
                        1
                          ? "s"
                          : ""
                      } selected.`}
                </p>
              </div>

              <button
                onClick={
                  compareSelectedProducts
                }
                disabled={
                  compareLoading ||
                  selectedProducts.length <
                    2
                }
                style={{
                  ...styles.compareButton,
                  opacity:
                    selectedProducts.length >=
                    2
                      ? 1
                      : 0.5,
                }}
              >
                {compareLoading
                  ? "🤖 Comparing..."
                  : `Compare Selected (${selectedProducts.length}) →`}
              </button>
            </div>
          </section>
        )}

        {/* =====================================================
            COMPARISON RESULT
        ===================================================== */}

        {comparison &&
          Array.isArray(
            comparison.comparison
          ) &&
          comparison.comparison.length > 0 && (
            <section
              style={
                styles.comparisonSection
              }
            >
              <div
                style={
                  styles.resultsHeader
                }
              >
                <div>
                  <div
                    style={
                      styles.sectionEyebrow
                    }
                  >
                    PERSONALIZED ANALYSIS
                  </div>

                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    🏆 Smart Comparison Result
                  </h2>

                  <p
                    style={
                      styles.sectionSubtitle
                    }
                  >
                    Your selected products ranked
                    according to your priorities.
                  </p>
                </div>
              </div>

              {/* BEST MATCH */}

              {comparison.best_match && (
                <div
                  style={styles.bestMatch}
                >
                  <div
                    style={
                      styles.bestMatchIcon
                    }
                  >
                    🏆
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <span
                      style={
                        styles.bestMatchLabel
                      }
                    >
                      BEST MATCH FOR YOU
                    </span>

                    <h2
                      style={
                        styles.bestMatchTitle
                      }
                    >
                      {
                        comparison.best_match
                          .name
                      }
                    </h2>

                    <p
                      style={
                        styles.bestMatchText
                      }
                    >
                      This product scored
                      highest based on your
                      selected priorities.
                    </p>
                  </div>

                  <div
                    style={
                      styles.bestMatchScore
                    }
                  >
                    <strong
                      style={
                        styles.bestMatchScoreValue
                      }
                    >
                      {
                        comparison.best_match_score
                      }
                      %
                    </strong>

                    <span
                      style={
                        styles.bestMatchScoreLabel
                      }
                    >
                      {getMatchLabel(
                        comparison.best_match_score
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      openProductDetails(
                        comparison.best_match
                      )
                    }
                    style={
                      styles.bestMatchButton
                    }
                  >
                    View Details →
                  </button>
                </div>
              )}

              {/* COMPARISON GRID */}

              <div
                style={
                  styles.comparisonGrid
                }
              >
                {comparison.comparison.map(
                  (item, index) => {
                    if (
                      !item ||
                      !item.product
                    ) {
                      return null;
                    }

                    const product =
                      item.product;

                    const breakdown =
                      calculateMatchBreakdown(
                        product
                      );

                    const reasons =
                      Array.isArray(
                        item.reasons
                      )
                        ? item.reasons
                        : [];

                    return (
                      <div
                        key={
                          product.id || index
                        }
                        style={
                          styles.comparisonCard
                        }
                      >
                        {index === 0 && (
                          <div
                            style={
                              styles.bestBadge
                            }
                          >
                            🥇 BEST
                          </div>
                        )}

                        <h3
                          style={
                            styles.comparisonProductTitle
                          }
                        >
                          {product.name}
                        </h3>

                        <p
                          style={
                            styles.productMeta
                          }
                        >
                          {product.brand}
                        </p>

                        <strong
                          style={
                            styles.comparisonPrice
                          }
                        >
                          ₹
                          {Number(
                            product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <div
                          style={
                            styles.comparisonScore
                          }
                        >
                          <strong
                            style={{
                              ...styles.comparisonScoreValue,
                              color:
                                getScoreColor(
                                  item.personal_score
                                ),
                            }}
                          >
                            {
                              item.personal_score
                            }
                            %
                          </strong>

                          <span
                            style={
                              styles.comparisonScoreLabel
                            }
                          >
                            Personal Match
                          </span>
                        </div>

                        <div
                          style={
                            styles.comparisonBreakdown
                          }
                        >
                          <MatchBar
                            label="💰 Budget"
                            score={
                              breakdown.budget
                            }
                          />

                          <MatchBar
                            label="💻 Coding"
                            score={
                              breakdown.coding
                            }
                          />

                          <MatchBar
                            label="🎮 Gaming"
                            score={
                              breakdown.gaming
                            }
                          />

                          <MatchBar
                            label="🔋 Battery"
                            score={
                              breakdown.battery
                            }
                          />
                        </div>

                        {reasons.length >
                          0 && (
                          <div
                            style={
                              styles.comparisonReasons
                            }
                          >
                            <strong>
                              💡 Why?
                            </strong>

                            {reasons.map(
                              (
                                reason,
                                reasonIndex
                              ) => (
                                <div
                                  key={
                                    reasonIndex
                                  }
                                >
                                  ✓ {reason}
                                </div>
                              )
                            )}
                          </div>
                        )}

                        <button
                          onClick={() =>
                            openProductDetails(
                              product
                            )
                          }
                          style={
                            styles.cardDetailsButton
                          }
                        >
                          🔎 Product Details →
                        </button>

                        <button
                          onClick={() =>
                            addToDecisionRoom(
                              product
                            )
                          }
                          style={
                            styles.cardRoomButton
                          }
                        >
                          👥 Add to Decision Room
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )}
      </main>

      {/* FOOTER */}

      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          🛍️ ShopCircle
        </div>

        <p style={styles.footerText}>
          Don't just find products. Find the
          product that fits YOUR life.
        </p>

        <span
          style={styles.footerCopyright}
        >
          © 2026 ShopCircle • Shop Together.
          Decide Smarter.
        </span>
      </footer>
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #ffffff 55%, #f8fafc 100%)",
    color: "#0f172a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  navbar: {
    minHeight: "70px",
    padding: "0 7%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.94)",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
    flexWrap: "wrap",
    gap: "15px",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    color: "#111827",
    fontSize: "20px",
  },

  navLinks: {
    display: "flex",
    gap: "25px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  navLink: {
    textDecoration: "none",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
  },

  activeNavLink: {
    color: "#2563eb",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 25px 80px",
  },

  hero: {
    textAlign: "center",
    padding: "70px 20px 50px",
  },

  heroBadge: {
    display: "inline-block",
    padding: "7px 13px",
    borderRadius: "999px",
    background: "#eff6ff",
    border: "1px solid #dbeafe",
    color: "#2563eb",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: "1.2px",
  },

  heroTitle: {
    margin: "20px 0 15px",
    fontSize: "clamp(38px, 6vw, 62px)",
    lineHeight: 1.04,
    letterSpacing: "-2.5px",
  },

  blueText: {
    color: "#2563eb",
  },

  heroDescription: {
    maxWidth: "650px",
    margin: "0 auto",
    color: "#64748b",
    fontSize: "16px",
    lineHeight: 1.7,
  },

  requirementCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "35px",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.08)",
  },

  cardHeading: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "30px",
  },

  headingIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eff6ff",
    fontSize: "24px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "22px",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  budgetBox: {
    padding: "22px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #eff6ff, #f8fafc)",
    border: "1px solid #dbeafe",
  },

  budgetHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  smallLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  budgetValue: {
    fontSize: "27px",
    fontWeight: 800,
    marginTop: "4px",
  },

  budgetIcon: {
    fontSize: "32px",
  },

  budgetRange: {
    width: "100%",
    marginTop: "18px",
    accentColor: "#2563eb",
  },

  rangeLabels: {
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: "10px",
    marginTop: "5px",
  },

  priorityHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "30px",
    marginBottom: "15px",
    gap: "10px",
    flexWrap: "wrap",
  },

  priorityHeadingTitle: {
    margin: 0,
  },

  priorityHeadingHint: {
    color: "#94a3b8",
    fontSize: "11px",
  },

  priorityGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  priorityCard: {
    padding: "18px",
    borderRadius: "15px",
    border: "1px solid #e2e8f0",
    background: "#ffffff",
  },

  priorityTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  priorityIcon: {
    marginRight: "7px",
  },

  priorityValue: {
    color: "#2563eb",
    fontWeight: 800,
    fontSize: "13px",
  },

  range: {
    width: "100%",
    marginTop: "15px",
    accentColor: "#2563eb",
  },

  findButton: {
    width: "100%",
    marginTop: "25px",
    padding: "16px",
    border: "none",
    borderRadius: "12px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
  },

  error: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginTop: "20px",
    padding: "14px 17px",
    borderRadius: "12px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
  },

  wishlistSection: {
    marginTop: "50px",
    padding: "28px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  },

  sectionTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    flexWrap: "wrap",
  },

  sectionEyebrow: {
    color: "#2563eb",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1.4px",
  },

  sectionTitle: {
    margin: "5px 0 0",
    fontSize: "27px",
    letterSpacing: "-0.8px",
  },

  sectionSubtitle: {
    color: "#64748b",
    fontSize: "13px",
    margin: "5px 0 0",
  },

  savedBadge: {
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "11px",
    fontWeight: 700,
  },

  wishlistGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "12px",
    marginTop: "22px",
  },

  wishlistCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px",
    border: "1px solid #e2e8f0",
    borderRadius: "13px",
  },

  wishlistProductIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  productName: {
    margin: 0,
    fontSize: "14px",
  },

  productMeta: {
    color: "#64748b",
    fontSize: "11px",
    margin: "5px 0",
  },

  productPrice: {
    fontSize: "14px",
  },

  removeButton: {
    border: "none",
    background: "#fef2f2",
    color: "#dc2626",
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "17px",
  },

  roomButton: {
    width: "100%",
    marginTop: "18px",
    padding: "12px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },

  resultsSection: {
    marginTop: "55px",
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "25px",
  },

  resultCount: {
    padding: "8px 13px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 800,
  },

  compareInfo: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "15px 18px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
  },

  compareInfoIcon: {
    fontSize: "24px",
  },

  compareInfoText: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "11px",
  },

  selectionCount: {
    marginLeft: "auto",
    minWidth: "34px",
    height: "34px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 800,
  },

  recommendationList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  productCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "24px",
    boxShadow:
      "0 8px 25px rgba(15,23,42,0.05)",
  },

  selectedProductCard: {
    border: "2px solid #2563eb",
    boxShadow:
      "0 10px 30px rgba(37,99,235,0.12)",
  },

  productTop: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },

  rankBadge: {
    width: "43px",
    height: "43px",
    borderRadius: "12px",
    background: "#111827",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
  },

  productTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  productNameLarge: {
    margin: 0,
    fontSize: "21px",
  },

  topPickBadge: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#fef3c7",
    color: "#92400e",
    fontSize: "9px",
    fontWeight: 800,
  },

  productContent: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 210px",
    gap: "25px",
  },

  productMain: {
    minWidth: 0,
  },

  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
  },

  priceLabel: {
    display: "block",
    fontSize: "9px",
    color: "#94a3b8",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  productPriceLarge: {
    fontSize: "25px",
    fontWeight: 800,
    marginTop: "3px",
  },

  compareCheckbox: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "8px 11px",
    borderRadius: "9px",
    background: "#f8fafc",
    fontSize: "11px",
    fontWeight: 700,
    cursor: "pointer",
  },

  specGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "9px",
    marginTop: "18px",
  },

  specItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px",
    borderRadius: "11px",
    background: "#f8fafc",
  },

  specLabel: {
    display: "block",
    color: "#94a3b8",
    fontSize: "9px",
  },

  specValue: {
    display: "block",
    fontSize: "12px",
  },

  whyBox: {
    marginTop: "18px",
    padding: "16px",
    borderRadius: "13px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  whyHeader: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "13px",
  },

  reasonList: {
    paddingLeft: "20px",
    marginBottom: 0,
    color: "#475569",
    fontSize: "12px",
    lineHeight: 1.7,
  },

  noReason: {
    color: "#64748b",
    fontSize: "11px",
    marginBottom: 0,
  },

  personalBox: {
    marginTop: "18px",
    padding: "17px",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #f8fafc, #eff6ff)",
    border: "1px solid #dbeafe",
  },

  personalHeader: {
    marginBottom: "15px",
  },

  personalHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },

  personalHeaderTag: {
    color: "#2563eb",
    fontSize: "10px",
    fontWeight: 700,
  },

  matchMetric: {
    marginBottom: "11px",
  },

  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    marginBottom: "5px",
  },

  metricTrack: {
    height: "6px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },

  metricFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.4s ease",
  },

  scorePanel: {
    padding: "20px",
    borderRadius: "17px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    textAlign: "center",
    alignSelf: "start",
  },

  scoreLabel: {
    fontSize: "9px",
    color: "#94a3b8",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  scoreCircle: {
    width: "125px",
    height: "125px",
    borderRadius: "50%",
    border: "7px solid",
    margin: "18px auto 10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
  },

  scoreCircleValue: {
    fontSize: "28px",
  },

  matchPill: {
    fontSize: "11px",
    fontWeight: 800,
  },

  scoreDescription: {
    color: "#64748b",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  detailsButton: {
    width: "100%",
    padding: "10px",
    borderRadius: "9px",
    border: "none",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "11px",
    cursor: "pointer",
  },

  wishlistButton: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "9px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    fontWeight: 700,
    fontSize: "11px",
    cursor: "pointer",
  },

  savedButton: {
    background: "#111827",
    color: "#ffffff",
    border: "none",
  },

  decisionButton: {
    width: "100%",
    padding: "10px",
    marginTop: "8px",
    borderRadius: "9px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "11px",
    cursor: "pointer",
  },

  compareAction: {
    marginTop: "20px",
    padding: "23px",
    borderRadius: "17px",
    background: "#111827",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  compareActionIcon: {
    fontSize: "28px",
  },

  compareActionTitle: {
    margin: 0,
    fontSize: "16px",
  },

  compareActionText: {
    margin: "4px 0 0",
    color: "#cbd5e1",
    fontSize: "11px",
  },

  compareButton: {
    marginLeft: "auto",
    padding: "12px 18px",
    border: "none",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#111827",
    fontWeight: 800,
    cursor: "pointer",
  },

  comparisonSection: {
    marginTop: "60px",
    padding: "28px",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  },

  bestMatch: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    padding: "23px",
    borderRadius: "17px",
    background:
      "linear-gradient(135deg, #eff6ff, #f8fafc)",
    border: "1px solid #dbeafe",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  bestMatchIcon: {
    fontSize: "40px",
  },

  bestMatchLabel: {
    color: "#2563eb",
    fontSize: "9px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  bestMatchTitle: {
    margin: "5px 0",
  },

  bestMatchText: {
    margin: 0,
    color: "#64748b",
    fontSize: "12px",
  },

  bestMatchScore: {
    textAlign: "center",
    marginLeft: "auto",
  },

  bestMatchScoreValue: {
    display: "block",
    fontSize: "30px",
    color: "#2563eb",
  },

  bestMatchScoreLabel: {
    color: "#64748b",
    fontSize: "10px",
  },

  bestMatchButton: {
    padding: "11px 15px",
    border: "none",
    borderRadius: "9px",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },

  comparisonGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "17px",
  },

  comparisonCard: {
    position: "relative",
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid #e2e8f0",
  },

  bestBadge: {
    position: "absolute",
    top: "12px",
    right: "12px",
    padding: "5px 8px",
    borderRadius: "999px",
    background: "#111827",
    color: "#ffffff",
    fontSize: "8px",
    fontWeight: 800,
  },

  comparisonProductTitle: {
    marginTop: 0,
    paddingRight: "60px",
  },

  comparisonPrice: {
    fontSize: "18px",
  },

  comparisonScore: {
    textAlign: "center",
    padding: "17px",
    marginTop: "15px",
    borderRadius: "11px",
    background: "#f8fafc",
  },

  comparisonScoreValue: {
    display: "block",
    fontSize: "30px",
  },

  comparisonScoreLabel: {
    color: "#64748b",
    fontSize: "10px",
  },

  comparisonBreakdown: {
    marginTop: "18px",
  },

  comparisonReasons: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#475569",
    fontSize: "11px",
    lineHeight: 1.8,
  },

  cardDetailsButton: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },

  cardRoomButton: {
    width: "100%",
    marginTop: "8px",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },

  footer: {
    borderTop: "1px solid #e2e8f0",
    padding: "35px 20px",
    textAlign: "center",
    background: "#ffffff",
  },

  footerLogo: {
    fontWeight: 800,
    fontSize: "17px",
  },

  footerText: {
    color: "#64748b",
    fontSize: "12px",
  },

  footerCopyright: {
    color: "#94a3b8",
    fontSize: "10px",
  },
};

export default Recommend;