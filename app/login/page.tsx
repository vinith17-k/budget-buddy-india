"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [income, setIncome] = useState("35000");
  const [fixedExpenses, setFixedExpenses] = useState("10000");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1-Click Demo Login as Vinit
  const handleDemoLogin = () => {
    localStorage.setItem("budget_user_id", "default");
    localStorage.setItem("budget_user_name", "Vinit");
    router.push("/app");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (pin.length < 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setLoading(true);
    const userId = "usr_" + name.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + pin;

    try {
      if (tab === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            displayName: name.trim(),
            monthlyIncome: Number(income) || 30000,
            fixedExpenses: Number(fixedExpenses) || 0,
          }),
        });
        const data = await res.json();
        if (data.store) {
          localStorage.setItem("budget_coach_store", JSON.stringify(data.store));
        }
      }

      localStorage.setItem("budget_user_id", userId);
      localStorage.setItem("budget_user_name", name.trim());
      router.push("/app");
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="3" />
        </filter>
      </svg>

      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div
          className="pass"
          style={{
            width: "100%",
            maxWidth: 440,
            padding: "28px 24px",
          }}
        >
          {/* Header Tag */}
          <span className="tag" style={{ position: "absolute", top: -10, right: 14 }}>
            Zero Friction Vault
          </span>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <Link
              href="/"
              style={{
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                color: "var(--ink)",
                border: "1.5px solid var(--ink)",
                padding: "3px 8px",
                background: "var(--paper)",
              }}
            >
              ← Back
            </Link>
            <span className="hand" style={{ fontSize: 20 }}>
              instant budget access
            </span>
          </div>

          <h2 style={{ fontSize: 24, marginBottom: 4 }}>
            {tab === "login" ? "Enter Vault" : "Create Budget"}
          </h2>
          <div style={{ color: "var(--mute)", fontSize: 12, marginBottom: 18 }}>
            {tab === "login"
              ? "Access your personal budget or test drive the instant demo."
              : "Set your monthly income and get an instant custom 50/30/20 envelope."}
          </div>

          {/* 1-Click Demo Banner styled as yellow sticky note */}
          <div className="note y" style={{ marginBottom: 20, transform: "none" }}>
            <span className="pin" />
            <div className="hand">Quick Demo Access</div>
            <div style={{ fontSize: 12, marginTop: 4, marginBottom: 10, lineHeight: 1.4 }}>
              Jump straight into the active coach as <b>Vinit</b> (₹25k income, UPI transactions, live Groq AI).
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="btn go"
              style={{ width: "100%", minHeight: 38, fontSize: 12 }}
            >
              Launch Demo as Vinit →
            </button>
          </div>

          {/* Tab Selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`chip ${tab === "login" ? "go" : ""}`}
              style={{ flex: 1, minHeight: 38, fontSize: 12 }}
            >
              Existing User
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError("");
              }}
              className={`chip ${tab === "signup" ? "go" : ""}`}
              style={{ flex: 1, minHeight: 38, fontSize: 12 }}
            >
              New Profile
            </button>
          </div>

          {error && (
            <div
              style={{
                background: "#ffb4a2",
                border: "2px solid var(--acc)",
                padding: "6px 10px",
                fontSize: 12,
                fontWeight: 700,
                color: "#6b1400",
                marginBottom: 14,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-row">
              <label>Your Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul, Priya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ background: "var(--paper)" }}
              />
            </div>

            <div className="form-row">
              <label>4-Digit PIN</label>
              <input
                type="password"
                maxLength={6}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                style={{ background: "var(--paper)", letterSpacing: 4 }}
              />
            </div>

            {tab === "signup" && (
              <>
                <div className="form-row">
                  <label>Monthly In-Hand Income (₹)</label>
                  <input
                    type="number"
                    placeholder="35000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    style={{ background: "var(--paper)" }}
                  />
                </div>

                <div className="form-row">
                  <label>Fixed Commitments (Rent + EMIs in ₹)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={fixedExpenses}
                    onChange={(e) => setFixedExpenses(e.target.value)}
                    style={{ background: "var(--paper)" }}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn go" style={{ marginTop: 8, minHeight: 46 }}>
              {loading ? "Verifying..." : tab === "login" ? "Open Dashboard →" : "Create My Budget →"}
            </button>
          </form>

          <div className="hatched" aria-hidden style={{ marginTop: 18 }} />
        </div>
      </div>
    </>
  );
}
