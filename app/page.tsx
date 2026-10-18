"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [testAmount, setTestAmount] = useState("12000");
  const [testItem, setTestItem] = useState("AirPods Pro");
  const [testSalary, setTestSalary] = useState("45000");
  const [calculated, setCalculated] = useState<{
    verdict: string;
    stampClass: string;
    runwayDays: number;
    impactPct: number;
    explanation: string;
  } | null>(null);

  const runAffordabilityTest = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(testAmount) || 0;
    const sal = Number(testSalary) || 30000;
    const impact = Math.round((amt / sal) * 100);
    const safeLeft = Math.max(0, sal - amt);
    const runway = Math.max(0, Math.round((safeLeft / (sal / 30))));

    if (amt > sal * 0.4) {
      setCalculated({
        verdict: "FINANCIALLY RISKY",
        stampClass: "stamp-risky",
        runwayDays: runway,
        impactPct: impact,
        explanation: `Consumes ${impact}% of your monthly in-hand income. Your daily cash runway drops sharply to ${runway} days. Wait 48 hours or check your emergency fund first.`,
      });
    } else if (amt > sal * 0.15) {
      setCalculated({
        verdict: "CAUTION / TIGHT",
        stampClass: "stamp-caution",
        runwayDays: runway,
        impactPct: impact,
        explanation: `Takes up ${impact}% of your income. You can afford it if you compress 'Fun' and dining expenses for the next 2 weeks.`,
      });
    } else {
      setCalculated({
        verdict: "SAFE TO BUY",
        stampClass: "stamp-safe",
        runwayDays: runway,
        impactPct: impact,
        explanation: `Only ${impact}% of monthly budget. Your remaining runway of ${runway} days is healthy and well within safe limits.`,
      });
    }
  };

  const handleLaunchVinit = () => {
    localStorage.setItem("budget_user_id", "default");
    localStorage.setItem("budget_user_name", "Vinit");
    router.push("/app");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Top Navigation Bar ── */}
      <nav
        style={{
          borderBottom: "3px solid var(--ink)",
          background: "var(--paper)",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: 20,
              letterSpacing: -0.5,
              textTransform: "uppercase",
            }}
          >
            BUDGET BUDDY 🇮🇳
          </span>
          <span
            style={{
              fontSize: 10,
              background: "var(--acc)",
              color: "#fff",
              padding: "2px 6px",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            GROQ LPU INSIDE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={handleLaunchVinit}
            style={{
              background: "#ffe27a",
              color: "#161616",
              border: "2px solid var(--ink)",
              padding: "6px 14px",
              fontWeight: 700,
              fontSize: 12,
              fontFamily: "'Space Mono', monospace",
              cursor: "pointer",
              boxShadow: "2px 2px 0 var(--ink)",
            }}
          >
            Demo as Vinit ⚡
          </button>
          <Link
            href="/login"
            style={{
              background: "var(--ink)",
              color: "#fff",
              border: "2px solid var(--ink)",
              padding: "6px 14px",
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
              fontFamily: "'Space Mono', monospace",
              boxShadow: "2px 2px 0 var(--ink)",
            }}
          >
            Sign In / Sign Up →
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header
        style={{
          padding: "70px 24px 50px",
          maxWidth: 1040,
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            background: "#ffe27a",
            border: "2px solid var(--ink)",
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: 20,
            boxShadow: "3px 3px 0 var(--ink)",
          }}
        >
          Zero Financial Hallucination · Pure Mathematical Certainty
        </div>

        <h1
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "clamp(34px, 6vw, 68px)",
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: -1,
            marginBottom: 20,
          }}
        >
          YOUR BRUTALLY HONEST <br />
          <span style={{ color: "var(--acc)", textDecoration: "underline" }}>AI BUDGET COACH</span>.
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 2vw, 19px)",
            color: "var(--mute)",
            maxWidth: 720,
            margin: "0 auto 36px",
            lineHeight: 1.5,
          }}
        >
          Built specifically for Indian salaries, credit card EMIs, and midnight Swiggy orders.
          Ask if you can afford it <i>before</i> swiping your card.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
          <button
            onClick={handleLaunchVinit}
            style={{
              background: "var(--acc)",
              color: "#fff",
              border: "3px solid var(--ink)",
              padding: "16px 28px",
              fontWeight: 700,
              fontSize: 16,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              boxShadow: "6px 6px 0 var(--ink)",
              cursor: "pointer",
            }}
          >
            Launch Live Demo (Vinit) →
          </button>
          <Link
            href="/login"
            style={{
              background: "var(--paper)",
              color: "var(--ink)",
              border: "3px solid var(--ink)",
              padding: "16px 28px",
              fontWeight: 700,
              fontSize: 16,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              boxShadow: "6px 6px 0 var(--ink)",
              textDecoration: "none",
            }}
          >
            Create My Own Vault 🔒
          </Link>
        </div>

        <div style={{ marginTop: 20, color: "var(--mute)", fontFamily: "'Caveat', cursive", fontSize: 20 }}>
          ⚡ Powered by Groq LPU (Llama 3.3 70B) + Offline Fallback Engine
        </div>
      </header>

      {/* ── Interactive Affordability Calculator Teaser ── */}
      <section style={{ maxWidth: 900, margin: "20px auto 70px", width: "100%", padding: "0 20px" }}>
        <div
          style={{
            background: "var(--paper)",
            border: "3px solid var(--ink)",
            boxShadow: "8px 8px 0 var(--ink)",
            padding: "32px 28px",
            position: "relative",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: -14,
              left: 20,
              background: "var(--ink)",
              color: "#fff",
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Interactive Sandbox · Try It Live
          </span>

          <h2
            style={{
              fontFamily: "'Archivo Black', sans-serif",
              fontSize: 22,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            &quot;Can I Afford This Right Now?&quot;
          </h2>
          <p style={{ color: "var(--mute)", fontSize: 13, marginBottom: 20 }}>
            Simulate a real-time impulse buy against your monthly in-hand salary:
          </p>

          <form
            onSubmit={runAffordabilityTest}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                MONTHLY SALARY (₹)
              </label>
              <input
                type="number"
                value={testSalary}
                onChange={(e) => setTestSalary(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid var(--ink)",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 14,
                  background: "#fff",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                ITEM DESCRIPTION
              </label>
              <input
                type="text"
                value={testItem}
                onChange={(e) => setTestItem(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid var(--ink)",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 14,
                  background: "#fff",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                ITEM PRICE (₹)
              </label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "2px solid var(--ink)",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 14,
                  background: "#fff",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                type="submit"
                style={{
                  width: "100%",
                  background: "var(--ink)",
                  color: "#fff",
                  border: "2px solid var(--ink)",
                  padding: "12px",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "'Space Mono', monospace",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                Audit Impact →
              </button>
            </div>
          </form>

          {calculated && (
            <div
              style={{
                border: "2px solid var(--ink)",
                background: calculated.stampClass === "stamp-risky" ? "#ffb4a2" : "#d8f3dc",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  VERDICT: {calculated.verdict}
                </span>
                <span
                  style={{
                    background: "var(--ink)",
                    color: "#fff",
                    padding: "4px 8px",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {calculated.runwayDays} DAYS CASH RUNWAY
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.4, color: "#161616" }}>
                <b>Coach Breakdown:</b> {calculated.explanation}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section style={{ maxWidth: 1040, margin: "0 auto 80px", width: "100%", padding: "0 20px" }}>
        <h2
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 28,
            textTransform: "uppercase",
            textAlign: "center",
            marginBottom: 36,
          }}
        >
          BUILT FOR REAL-WORLD INDIAN FINANCES
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {/* Card 1 */}
          <div
            style={{
              background: "var(--paper)",
              border: "3px solid var(--ink)",
              boxShadow: "5px 5px 0 var(--ink)",
              padding: 24,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
            <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 16, marginBottom: 8 }}>
              Bank SMS & UPI Auto-Parsing
            </h3>
            <p style={{ color: "var(--mute)", fontSize: 13, lineHeight: 1.5 }}>
              Copy-paste raw SMS alerts from HDFC, SBI, ICICI, Axis, Paytm, or PhonePe. The AI instantly extracts the
              exact amount, merchant, and category.
            </p>
          </div>

          {/* Card 2 */}
          <div
            style={{
              background: "var(--paper)",
              border: "3px solid var(--ink)",
              boxShadow: "5px 5px 0 var(--ink)",
              padding: 24,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚖️</div>
            <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 16, marginBottom: 8 }}>
              50/30/20 & Burn Rate Audits
            </h3>
            <p style={{ color: "var(--mute)", fontSize: 13, lineHeight: 1.5 }}>
              Tracks your monthly Burn Rate against your next salary date. Alerts you before you cross into dangerous
              territory with your Needs, Wants, and Savings buckets.
            </p>
          </div>

          {/* Card 3 */}
          <div
            style={{
              background: "var(--paper)",
              border: "3px solid var(--ink)",
              boxShadow: "5px 5px 0 var(--ink)",
              padding: 24,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🛡️</div>
            <h3 style={{ fontFamily: "'Archivo Black', sans-serif", fontSize: 16, marginBottom: 8 }}>
              Zero Math Hallucination
            </h3>
            <p style={{ color: "var(--mute)", fontSize: 13, lineHeight: 1.5 }}>
              AI models are notoriously bad at math. We use pure deterministic TypeScript algorithms for balances and
              limits; Groq only explains and coaches.
            </p>
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner ── */}
      <section
        style={{
          background: "var(--ink)",
          color: "#fff",
          padding: "60px 24px",
          textAlign: "center",
          borderTop: "4px solid var(--acc)",
          marginTop: "auto",
        }}
      >
        <h2
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: "clamp(24px, 4vw, 42px)",
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          STOP GUESSING YOUR BANK BALANCE.
        </h2>
        <p style={{ color: "#aaa", fontSize: 15, maxWidth: 600, margin: "0 auto 28px" }}>
          Join thousands of young professionals who audit their expenses with an AI that doesn&apos;t hold back.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
          <button
            onClick={handleLaunchVinit}
            style={{
              background: "#ffe27a",
              color: "#161616",
              border: "none",
              padding: "14px 24px",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Instant Demo (Vinit) ⚡
          </button>
          <Link
            href="/login"
            style={{
              background: "var(--acc)",
              color: "#fff",
              border: "none",
              padding: "14px 24px",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* ── Brutalist Footer ── */}
      <footer
        style={{
          background: "var(--paper)",
          borderTop: "3px solid var(--ink)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "var(--mute)",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>© {new Date().getFullYear()} BUDGET BUDDY INDIA · CRAFTED WITH INK & CODE 🇮🇳</div>
        <div style={{ display: "flex", gap: 16 }}>
          <a
            href="https://github.com/vinith17-k/budget-buddy-india"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--ink)", fontWeight: 700, textDecoration: "none" }}
          >
            GitHub Repo ↗
          </a>
          <span style={{ color: "var(--acc)", fontWeight: 700 }}>Groq llama-3.3-70b-versatile Active</span>
        </div>
      </footer>
    </div>
  );
}
