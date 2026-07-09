import { useEffect } from "react";
import { BRAND_GRADIENT } from "../theme";

export default function Welcome({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(40,30,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "360px",
          background: "#fffdf9",
          color: "#3a352e",
          borderRadius: "16px",
          padding: "26px 24px 22px",
          boxShadow: "0 18px 48px rgba(40,30,20,0.25)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <h2
          id="welcome-title"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "25px",
            fontWeight: 600,
            margin: "0 0 12px",
            color: "#3a352e",
          }}
        >
          Welcome to Homebody<span style={{ color: "#b1794a" }}>.</span>
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: "14px", lineHeight: 1.55, color: "#5a5248" }}>
          A visual cheat sheet for the Reddit Recommended Routine — train it at home, no gym required.
        </p>
        <ul style={{ margin: "0 0 22px", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Item color="#54749e">Swipe each row to pick the variation you're working on.</Item>
          <Item color="#6f9161">Tap <strong style={{ fontWeight: 600 }}>?</strong> on a tile for step-by-step instructions.</Item>
          <Item color="#b1794a">Have gear at home? Tap <strong style={{ fontWeight: 600 }}>+</strong> on a grayed move (or open <strong style={{ fontWeight: 600 }}>My Gym</strong>) to unlock more.</Item>
          <Item color="#8f7391">Hit <strong style={{ fontWeight: 600 }}>Start workout</strong> for a guided session with timed rests.</Item>
        </ul>
        <button
          type="button"
          onClick={onClose}
          className="press"
          style={{
            display: "block",
            width: "100%",
            padding: "12px 16px",
            border: "none",
            borderRadius: "10px",
            background: BRAND_GRADIENT,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.3px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(111,145,97,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          Get started
        </button>
      </div>
    </div>
  );
}

function Item({ color, children }) {
  return (
    <li style={{ display: "flex", gap: "11px", fontSize: "14px", lineHeight: 1.45, color: "#5a5248" }}>
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: color,
          marginTop: "7px",
        }}
      />
      <span>{children}</span>
    </li>
  );
}
