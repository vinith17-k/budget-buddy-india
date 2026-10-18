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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      {/* Brutalist SVG filter for rough card edges */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="rough">
          <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3" result="t" />
          <feDisplacementMap in="SourceGraphic" in2="t" scale="3" />
        </filter>
      </svg>

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--paper)",
          border: "3px solid var(--ink)",
          boxShadow: "8px 8px 0 var(--ink)",
          padding: "32px 28px",
          position: "relative",
        }}
      >
        {/* Header Ribbon */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Link
            href="/"
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--ink)",
              border: "1.5px solid var(--ink)",
              padding: "4px 8px",
              background: "#fff",
            }}
          >
            ← Back to Home
          </Link>
          <span
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 20,
              color: "var(--acc)",
              fontWeight: 700,
            }}
          >
            Zero friction access
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 26,
            lineHeight: 1.1,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {tab === "login" ? "Enter Budget Vault" : "Create Clean Slate"}
        </h1>
        <p style={{ color: "var(--mute)", fontSize: 13, marginBottom: 24 }}>
          {tab === "login"
            ? "Sign in with your name & PIN or jump straight in with demo credentials."
            : "Set up your in-hand salary and get a custom 50/30/20 budget in 30 seconds."}
        </p>

        {/* 1-Click Demo User Banner */}
        <div
          style={{
            background: "#ffe27a",
            border: "2px solid var(--ink)",
            padding: 14,
            marginBottom: 24,
            boxShadow: "3px 3px 0 var(--ink)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13, textTransform: "uppercase" }}>⚡ Instant Demo Access</span>
            <span
              style={{
                fontSize: 10,
                background: "var(--ink)",
                color: "#ffe27a",
                padding: "2px 6px",
                fontWeight: 700,
              }}
            >
              PRE-CONFIGURED
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#161616", marginBottom: 10 }}>
            Experience the full app as <b>Vinit</b> (₹25,000 salary, pre-seeded Indian UPI transactions, live Groq AI).
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            style={{
              width: "100%",
              background: "var(--ink)",
              color: "#fff",
              border: "none",
              padding: "10px 14px",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            Launch as Vinit →
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 2, background: "var(--ink)" }} />
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--mute)" }}>
            OR USE YOUR PROFILE
          </span>
          <div style={{ flex: 1, height: 2, background: "var(--ink)" }} />
        </div>

        {/* Tab Toggle */}
        <div style={{ display: "flex", border: "2px solid var(--ink)", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "8px 0",
              fontWeight: 700,
              fontSize: 12,
              border: "none",
              borderRight: "2px solid var(--ink)",
              background: tab === "login" ? "var(--ink)" : "var(--paper)",
              color: tab === "login" ? "#fff" : "var(--ink)",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            Existing Profile
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError("");
            }}
            style={{
              flex: 1,
              padding: "8px 0",
              fontWeight: 700,
              fontSize: 12,
              border: "none",
              background: tab === "signup" ? "var(--ink)" : "var(--paper)",
              color: tab === "signup" ? "#fff" : "var(--ink)",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            New User Setup
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#ffb4a2",
              border: "2px solid var(--acc)",
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: "#6b1400",
              marginBottom: 16,
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul, Priya, Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid var(--ink)",
                background: "#fff",
                fontFamily: "'Space Mono', monospace",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
              4-Digit Passcode / PIN
            </label>
            <input
              type="password"
              maxLength={6}
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "2px solid var(--ink)",
                background: "#fff",
                fontFamily: "'Space Mono', monospace",
                fontSize: 14,
                letterSpacing: 4,
                outline: "none",
              }}
            />
          </div>

          {tab === "signup" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                  Monthly In-Hand Income (₹)
                </label>
                <input
                  type="number"
                  placeholder="35000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid var(--ink)",
                    background: "#fff",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                  Fixed Commitments (Rent + EMIs in ₹)
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={fixedExpenses}
                  onChange={(e) => setFixedExpenses(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "2px solid var(--ink)",
                    background: "#fff",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--acc)",
              color: "#fff",
              border: "2px solid var(--ink)",
              boxShadow: "4px 4px 0 var(--ink)",
              padding: "12px 16px",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "'Space Mono', monospace",
              textTransform: "uppercase",
              cursor: "pointer",
              marginTop: 10,
              transition: "transform 0.1s",
            }}
          >
            {loading ? "Verifying..." : tab === "login" ? "Open Dashboard →" : "Generate Custom Budget →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 11, color: "var(--mute)" }}>
            🔒 Local storage + isolated user vaults. Zero tracking.
          </span>
        </div>
      </div>
    </div>
  );
}
