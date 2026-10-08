import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import Recommendations from "./pages/Recommendations";
import Recommend from "./pages/Recommend";
import DecisionRoom from "./pages/DecisionRoom";
import ProductDetails from "./pages/ProductDetails";
import Compare from "./pages/Compare";

function Home() {
  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🛍️</span>
          <span>ShopCircle</span>
        </div>

        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>
            Home
          </Link>

          <Link to="/recommend" style={styles.navLink}>
            Recommendations
          </Link>

          <Link to="/compare" style={styles.navLink}>
            Compare
          </Link>

          <Link to="/decision-room" style={styles.navLink}>
            Decision Room
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>
            ✨ AI-Powered Community Shopping
          </div>

          <h1 style={styles.heroTitle}>
            Shop Together.
            <br />
            <span style={styles.gradientText}>
              Decide Smarter.
            </span>
          </h1>

          <p style={styles.heroDescription}>
            Stop scrolling through endless products.
            Tell ShopCircle what you actually need,
            compare your best matches, and let your
            friends help you make the final decision.
          </p>

          <div style={styles.heroButtons}>
            <Link
              to="/recommend"
              style={styles.primaryButton}
            >
              🤖 Find My Perfect Product
            </Link>

            <Link
              to="/compare"
              style={styles.secondaryButton}
            >
              ⚖️ Compare Products
            </Link>
          </div>

          <div style={styles.heroStats}>
            <div>
              <strong style={styles.statNumber}>
                AI
              </strong>
              <span style={styles.statLabel}>
                Smart Matching
              </span>
            </div>

            <div style={styles.statDivider} />

            <div>
              <strong style={styles.statNumber}>
                1–3
              </strong>
              <span style={styles.statLabel}>
                Products to Compare
              </span>
            </div>

            <div style={styles.statDivider} />

            <div>
              <strong style={styles.statNumber}>
                👥
              </strong>
              <span style={styles.statLabel}>
                Decide Together
              </span>
            </div>
          </div>
        </div>

        {/* HERO VISUAL */}
        <div style={styles.heroVisual}>
          <div style={styles.floatingCard}>
            <div style={styles.cardHeader}>
              <span>🧠</span>
              <span>Personal Match</span>
            </div>

            <div style={styles.matchScore}>
              92%
            </div>

            <div style={styles.matchText}>
              Perfect match for your needs
            </div>

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: "92%",
                }}
              />
            </div>
          </div>

          <div
            style={{
              ...styles.floatingCard,
              ...styles.floatingCardTwo,
            }}
          >
            <div style={styles.cardHeader}>
              <span>👥</span>
              <span>Decision Room</span>
            </div>

            <div style={styles.votes}>
              <span>💻 Lenovo LOQ</span>
              <strong>2 votes</strong>
            </div>

            <div style={styles.votes}>
              <span>💻 ASUS Vivobook</span>
              <strong>1 vote</strong>
            </div>

            <div style={styles.winner}>
              🏆 Group favorite
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionBadge}>
            HOW IT WORKS
          </div>

          <h2 style={styles.sectionTitle}>
            From “What should I buy?”
            <br />
            to “This is the one.”
          </h2>

          <p style={styles.sectionDescription}>
            ShopCircle turns product hunting into
            a simple decision-making experience.
          </p>
        </div>

        <div style={styles.steps}>
          <Step
            number="01"
            icon="🎯"
            title="Tell Us What You Need"
            text="Set your budget and priorities like coding, gaming, and battery life."
          />

          <Step
            number="02"
            icon="🤖"
            title="Get Smart Matches"
            text="ShopCircle scores products based on how well they fit your needs."
          />

          <Step
            number="03"
            icon="⚖️"
            title="Compare Your Options"
            text="Compare your shortlisted products using personalized priorities."
          />

          <Step
            number="04"
            icon="👥"
            title="Decide Together"
            text="Create a Decision Room and let your friends vote on the final choice."
          />
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.featureSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionBadge}>
            WHY SHOPCIRCLE?
          </div>

          <h2 style={styles.sectionTitle}>
            Shopping shouldn't feel like research.
          </h2>

          <p style={styles.sectionDescription}>
            ShopCircle combines AI recommendations
            with human opinions to help you decide
            with confidence.
          </p>
        </div>

        <div style={styles.featureGrid}>
          <FeatureCard
            icon="🤖"
            title="Smart Recommendations"
            text="Get products ranked according to your budget and personal priorities."
          />

          <FeatureCard
            icon="🧠"
            title="Product Intelligence"
            text="Understand why a product fits your needs instead of seeing only specifications."
          />

          <FeatureCard
            icon="⚖️"
            title="Smart Comparison"
            text="Compare up to three products using personalized coding, gaming, and battery priorities."
          />

          <FeatureCard
            icon="👥"
            title="Decision Rooms"
            text="Invite friends, add products, vote together, and find the group's favorite."
          />

          <FeatureCard
            icon="🏆"
            title="Group Decision"
            text="See vote breakdowns, winners, ties, and clear explanations of the final result."
          />

          <FeatureCard
            icon="💡"
            title="Explainable Choices"
            text="ShopCircle doesn't just recommend a product — it explains why."
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <div style={styles.ctaIcon}>
            🛍️
          </div>

          <h2 style={styles.ctaTitle}>
            Ready to shop smarter?
          </h2>

          <p style={styles.ctaText}>
            Find your best match. Compare your
            options. Bring your friends. Decide
            together.
          </p>

          <Link
            to="/recommend"
            style={styles.ctaButton}
          >
            Start Shopping Smarter →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          🛍️ ShopCircle
        </div>

        <p style={styles.footerText}>
          Don't just find products.
          Find the product that fits YOUR life.
        </p>

        <p style={styles.copyright}>
          © 2026 ShopCircle • Shop Together.
          Decide Smarter.
        </p>
      </footer>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div style={styles.step}>
      <div style={styles.stepNumber}>
        {number}
      </div>

      <div style={styles.stepIcon}>
        {icon}
      </div>

      <h3 style={styles.stepTitle}>
        {title}
      </h3>

      <p style={styles.stepText}>
        {text}
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}) {
  return (
    <div style={styles.featureCard}>
      <div style={styles.featureIcon}>
        {icon}
      </div>

      <h3 style={styles.featureTitle}>
        {title}
      </h3>

      <p style={styles.featureText}>
        {text}
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/recommendations"
          element={<Recommendations />}
        />

        <Route
          path="/recommend"
          element={<Recommend />}
        />

        <Route
          path="/compare"
          element={<Compare />}
        />

        <Route
          path="/product/:productId"
          element={<ProductDetails />}
        />

        <Route
          path="/decision-room"
          element={<DecisionRoom />}
        />

        <Route
          path="/decision-room/:roomId"
          element={<DecisionRoom />}
        />
      </Routes>
    </BrowserRouter>
  );
}

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
    height: "72px",
    padding: "0 7%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.9)",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "21px",
    fontWeight: 800,
    color: "#111827",
  },

  logoIcon: {
    fontSize: "25px",
  },

  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },

  navLink: {
    textDecoration: "none",
    color: "#475569",
    fontSize: "14px",
    fontWeight: 600,
  },

  hero: {
    minHeight: "650px",
    padding: "75px 7% 80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "60px",
    maxWidth: "1400px",
    margin: "0 auto",
    boxSizing: "border-box",
  },

  heroContent: {
    flex: 1,
    maxWidth: "650px",
  },

  badge: {
    display: "inline-flex",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#2563eb",
    border: "1px solid #dbeafe",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "22px",
  },

  heroTitle: {
    fontSize: "clamp(42px, 6vw, 72px)",
    lineHeight: 1.03,
    letterSpacing: "-3px",
    margin: 0,
    fontWeight: 850,
  },

  gradientText: {
    color: "#2563eb",
  },

  heroDescription: {
    marginTop: "25px",
    fontSize: "18px",
    lineHeight: 1.7,
    color: "#64748b",
    maxWidth: "590px",
  },

  heroButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "13px",
    marginTop: "30px",
  },

  primaryButton: {
    textDecoration: "none",
    padding: "14px 21px",
    borderRadius: "11px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "14px",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.22)",
  },

  secondaryButton: {
    textDecoration: "none",
    padding: "14px 21px",
    borderRadius: "11px",
    background: "#ffffff",
    color: "#1e293b",
    fontWeight: 700,
    fontSize: "14px",
    border: "1px solid #cbd5e1",
  },

  heroStats: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginTop: "42px",
  },

  statNumber: {
    display: "block",
    fontSize: "20px",
    fontWeight: 800,
  },

  statLabel: {
    display: "block",
    marginTop: "3px",
    fontSize: "11px",
    color: "#64748b",
  },

  statDivider: {
    width: "1px",
    height: "35px",
    background: "#e2e8f0",
  },

  heroVisual: {
    width: "420px",
    minHeight: "430px",
    position: "relative",
    borderRadius: "35px",
    background:
      "linear-gradient(145deg, #eff6ff, #f8fafc)",
    border: "1px solid #dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  floatingCard: {
    width: "270px",
    padding: "20px",
    borderRadius: "17px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.12)",
    position: "absolute",
    top: "75px",
    left: "35px",
  },

  floatingCardTwo: {
    top: "225px",
    left: "115px",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#475569",
  },

  matchScore: {
    marginTop: "17px",
    fontSize: "42px",
    fontWeight: 850,
    color: "#2563eb",
  },

  matchText: {
    fontSize: "12px",
    color: "#64748b",
  },

  progressBar: {
    marginTop: "14px",
    height: "7px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "999px",
  },

  votes: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px",
    padding: "9px",
    borderRadius: "9px",
    background: "#f8fafc",
    fontSize: "10px",
    color: "#475569",
  },

  winner: {
    marginTop: "12px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#16a34a",
  },

  section: {
    padding: "90px 7%",
    maxWidth: "1400px",
    margin: "0 auto",
  },

  sectionHeader: {
    textAlign: "center",
    maxWidth: "700px",
    margin: "0 auto 50px",
  },

  sectionBadge: {
    fontSize: "11px",
    letterSpacing: "1.5px",
    fontWeight: 800,
    color: "#2563eb",
    marginBottom: "12px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "clamp(30px, 4vw, 45px)",
    lineHeight: 1.15,
    letterSpacing: "-1.5px",
  },

  sectionDescription: {
    marginTop: "15px",
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "15px",
  },

  steps: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "25px",
  },

  step: {
    position: "relative",
    padding: "28px 22px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  },

  stepNumber: {
    position: "absolute",
    right: "17px",
    top: "15px",
    fontSize: "11px",
    fontWeight: 800,
    color: "#cbd5e1",
  },

  stepIcon: {
    fontSize: "31px",
    marginBottom: "18px",
  },

  stepTitle: {
    margin: 0,
    fontSize: "17px",
  },

  stepText: {
    fontSize: "13px",
    lineHeight: 1.6,
    color: "#64748b",
    marginBottom: 0,
  },

  featureSection: {
    padding: "90px 7%",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },

  featureGrid: {
    maxWidth: "1150px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },

  featureCard: {
    padding: "25px",
    borderRadius: "17px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  },

  featureIcon: {
    fontSize: "28px",
    marginBottom: "15px",
  },

  featureTitle: {
    margin: 0,
    fontSize: "16px",
  },

  featureText: {
    marginBottom: 0,
    fontSize: "12px",
    lineHeight: 1.65,
    color: "#64748b",
  },

  ctaSection: {
    padding: "95px 7%",
    textAlign: "center",
  },

  ctaContent: {
    maxWidth: "700px",
    margin: "0 auto",
  },

  ctaIcon: {
    fontSize: "45px",
  },

  ctaTitle: {
    margin: "15px 0 0",
    fontSize: "clamp(30px, 4vw, 45px)",
    letterSpacing: "-1.5px",
  },

  ctaText: {
    color: "#64748b",
    lineHeight: 1.7,
    fontSize: "15px",
  },

  ctaButton: {
    display: "inline-block",
    marginTop: "20px",
    padding: "15px 25px",
    borderRadius: "11px",
    background: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "14px",
  },

  footer: {
    padding: "35px 7%",
    textAlign: "center",
    borderTop: "1px solid #e2e8f0",
    background: "#ffffff",
  },

  footerLogo: {
    fontWeight: 800,
    fontSize: "17px",
  },

  footerText: {
    color: "#64748b",
    fontSize: "12px",
    margin: "9px 0",
  },

  copyright: {
    color: "#94a3b8",
    fontSize: "10px",
  },
};

export default App;