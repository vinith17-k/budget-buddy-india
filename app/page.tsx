"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [testAmount, setTestAmount] = useState("12000");
  const [testItem, setTestItem] = useState("AirPods Pro");
  const [testSalary, setTestSalary] = useState("45000");
  const [theme, setTheme] = useState("light");
  const [calculated, setCalculated] = useState<{
    verdict: string;
    stampClass: string;
    runwayDays: number;
    impactPct: number;
    explanation: string;
  } | null>(null);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const runAffordabilityTest = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(testAmount) || 0;
    const sal = Number(testSalary) || 30000;
    const impact = Math.round((amt / sal) * 100);
    const safeLeft = Math.max(0, sal - amt);
    const runway = Math.max(0, Math.round(safeLeft / (sal / 30)));

    if (amt > sal * 0.4) {
      setCalculated({
        verdict: "FINANCIALLY RISKY",
        stampClass: "stamp hot",
        runwayDays: runway,
        impactPct: impact,
        explanation: `Consumes ${impact}% of your monthly in-hand income. Your daily cash runway drops sharply to ${runway} days. Wait 48 hours or check your emergency fund first.`,
      });
    } else if (amt > sal * 0.15) {
      setCalculated({
        verdict: "CAUTION / TIGHT",
        stampClass: "stamp",
        runwayDays: runway,
        impactPct: impact,
        explanation: `Takes up ${impact}% of your income. You can afford it if you compress 'Fun' and dining expenses for the next 2 weeks.`,
      });
    } else {
      setCalculated({
        verdict: "SAFE TO BUY",
        stampClass: "stamp",
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
    <>
      {/* SVG Rough Filter for signature brutalist edges */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="3" />
        </filter>
      </svg>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* ── Top Header / Navbar matching app style ── */}
        <header
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            width: "100%",
            padding: "16px 20px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <h1 aria-label="Budget Coach" style={{ fontSize: "clamp(26px, 4vw, 42px)", margin: 0 }}>
              BUDGET C<span className="dot" />ACH
            </h1>
            <span className="hand" style={{ fontSize: 18 }}>india&apos;s ai expense auditor</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={handleLaunchVinit}
              className="btn go"
              style={{
                minHeight: 40,
                padding: "0 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              Demo as Vinit ⚡
            </button>

            <Link
              href="/login"
              className="btn"
              style={{
                minHeight: 40,
                padding: "0 14px",
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 12,
                color: "var(--ink)",
              }}
            >
              Sign In →
            </Link>

            <button
              className="tog"
              role="switch"
              aria-checked={theme === "dark"}
              aria-label="Toggle theme"
              onClick={toggleTheme}
            >
              <span className="knob" />
              <span>{theme === "dark" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </header>

        {/* ── Hero Section ── */}
        <section
          style={{
            maxWidth: 1080,
            margin: "20px auto 40px",
            width: "100%",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <span className="tag" style={{ fontSize: 12, padding: "2px 8px" }}>
              ZERO HALLUCINATIONS · DETERMINISTIC FINANCIAL MATH
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 6vw, 68px)",
              lineHeight: 1.05,
              textTransform: "uppercase",
              margin: "0 auto 18px",
              maxWidth: 900,
            }}
          >
            JUST TELL ME <br />
            WHAT YOU <span style={{ color: "var(--acc)" }}>SPENT</span>.
          </h1>

          <p
            style={{
              fontSize: "clamp(14px, 2vw, 17px)",
              color: "var(--mute)",
              maxWidth: 640,
              margin: "0 auto 28px",
              lineHeight: 1.6,
            }}
          >
            Built for Indian UPI habits, salary cycles, and impulse purchases.
            Paste raw bank SMS alerts, simulate what-if scenarios, and get stamped verdicts before you swipe.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={handleLaunchVinit}
              className="btn go"
              style={{ minHeight: 48, padding: "0 24px", fontSize: 15 }}
            >
              Launch Live App as Vinit →
            </button>
            <Link
              href="/login"
              className="btn"
              style={{
                minHeight: 48,
                padding: "0 24px",
                fontSize: 15,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                color: "var(--ink)",
              }}
            >
              New User Sign In 🔒
            </Link>
          </div>
        </section>

        {/* ── Main Content Area: Interactive Sandbox & Notes ── */}
        <main
          style={{
            maxWidth: 1080,
            margin: "0 auto 60px",
            width: "100%",
            padding: "0 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 26,
            alignItems: "start",
          }}
        >
          {/* Left Column: Interactive Affordability Calculator */}
          <div className="pass" style={{ padding: 22 }}>
            <span className="tag" style={{ position: "absolute", top: -10, right: 14 }}>
              Interactive Sandbox
            </span>
            <h2 style={{ fontSize: 22, marginBottom: 4 }}>Can I Afford This?</h2>
            <div className="hand" style={{ fontSize: 20, marginBottom: 16 }}>
              test any purchase against your cash runway
            </div>

            <form onSubmit={runAffordabilityTest} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-row">
                <label>Monthly In-Hand Salary (₹)</label>
                <input
                  type="number"
                  value={testSalary}
                  onChange={(e) => setTestSalary(e.target.value)}
                  style={{ background: "var(--paper)" }}
                />
              </div>

              <div className="form-row">
                <label>Item / Expense Name</label>
                <input
                  type="text"
                  value={testItem}
                  onChange={(e) => setTestItem(e.target.value)}
                  style={{ background: "var(--paper)" }}
                />
              </div>

              <div className="form-row">
                <label>Price in INR (₹)</label>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  style={{ background: "var(--paper)" }}
                />
              </div>

              <button type="submit" className="btn go" style={{ marginTop: 6, minHeight: 44, width: "100%" }}>
                Calculate Financial Impact →
              </button>
            </form>

            {calculated && (
              <div className="card" style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className={calculated.stampClass}>{calculated.verdict}</div>
                  <span className="tag">{calculated.runwayDays} Days Runway</span>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <span>Income consumed</span>
                  <b>{calculated.impactPct}%</b>
                </div>
                <div style={{ fontSize: 12, marginTop: 8, color: "var(--ink)", lineHeight: 1.4 }}>
                  {calculated.explanation}
                </div>
                <div className="hatched" aria-hidden />
              </div>
            )}
          </div>

          {/* Right Column: Sticky Notes & Feature Showcase */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Yellow Sticky Note: Bank SMS Parser */}
            <div className="note y">
              <span className="pin" />
              <div className="hand">SMS & UPI Auto-Parse</div>
              <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
                Paste raw SMS alerts directly into the chat:
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.06)",
                  border: "1.5px dashed #161616",
                  padding: "8px 10px",
                  fontSize: 11,
                  fontFamily: "'Space Mono', monospace",
                  marginTop: 8,
                }}
              >
                &ldquo;Sent Rs.450 from HDFC Bank to SWIGGY on 18-OCT-26 UPI:9421&rdquo;
              </div>
              <div style={{ fontSize: 12, marginTop: 8, fontWeight: 700 }}>
                ⚡ Auto-resolves amount, vendor & category with 100+ merchant keywords.
              </div>
            </div>

            {/* Blue Sticky Note: Zero Hallucination Guarantee */}
            <div className="note u">
              <span className="pin" />
              <div className="hand">Zero Financial Hallucination</div>
              <div style={{ fontSize: 13, marginTop: 6, lineHeight: 1.4 }}>
                Most AI coaches guess math. Budget Coach uses pure TypeScript logic for 50/30/20 budgets, daily burn rate, and savings runway.
              </div>
              <div className="band" style={{ marginTop: 10 }}>
                Hard math verified · Groq LPU Explains
              </div>
            </div>
          </div>
        </main>

        {/* ── Brutalist Footer ── */}
        <footer
          style={{
            borderTop: "2px solid var(--ink)",
            background: "var(--paper)",
            padding: "16px 20px",
            marginTop: "auto",
          }}
        >
          <div
            style={{
              maxWidth: 1080,
              margin: "0 auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
              fontSize: 12,
              color: "var(--mute)",
            }}
          >
            <div>BUDGET COACH · PERSONAL EXPENSE AUDITOR 🇮🇳</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span className="tag">Level 4 Safe</span>
              <span>Groq Llama 3.3 Active</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
