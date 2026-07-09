import { useEffect } from "react";
import { fade, STOP, STOP_GRADIENT } from "../theme";

// Guard against a stray tap on Stop workout mid-session. Dismissing
// (overlay/Escape/Keep going) leaves the session running.
export default function StopConfirm({ open, onKeep, onStop }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onKeep();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onKeep]);

  if (!open) return null;

  return (
    <div
      onClick={onKeep}
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
        aria-labelledby="stop-title"
        style={{
          width: "100%",
          maxWidth: "320px",
          background: "#fffdf9",
          color: "#3a352e",
          borderRadius: "16px",
          padding: "24px 24px 20px",
          boxShadow: "0 18px 48px rgba(40,30,20,0.25)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <h2
          id="stop-title"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "20px",
            fontWeight: 600,
            margin: "0 0 8px",
            color: "#3a352e",
          }}
        >
          Stop this workout<span style={{ color: "#b1794a" }}>?</span>
        </h2>
        <p style={{ margin: "0 0 18px", fontSize: "14px", lineHeight: 1.5, color: "#5a5248" }}>
          Your progress in this session won't be saved.
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={onKeep}
            className="press"
            style={{
              flex: 1,
              padding: "11px 12px",
              borderRadius: "10px",
              border: "1px solid #e0dacf",
              background: "#fff",
              color: "#5a5248",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Keep going
          </button>
          <button
            type="button"
            onClick={onStop}
            className="press"
            style={{
              flex: 1,
              padding: "11px 12px",
              borderRadius: "10px",
              border: "none",
              background: STOP_GRADIENT,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.3px",
              cursor: "pointer",
              boxShadow: `0 2px 8px ${fade(STOP, 0.35)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
            }}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
}
