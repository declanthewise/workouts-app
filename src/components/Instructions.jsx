import { useEffect } from "react";
import { fade } from "../theme";

export default function Instructions({ exercise, onClose }) {
  useEffect(() => {
    if (!exercise) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exercise, onClose]);

  if (!exercise) return null;

  // Accent rides along with the exercise from its progression row; the fallback
  // covers any caller that doesn't pass one.
  const accent = exercise.color || "#6f9161";

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
        zIndex: 10,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructions-title"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "360px",
          maxHeight: "calc(100dvh - 48px)",
          overflowY: "auto",
          background: "#fffdf9",
          color: "#3a352e",
          borderRadius: "16px",
          padding: "22px 24px 20px",
          boxShadow: "0 18px 48px rgba(40,30,20,0.25)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close instructions"
          style={{
            position: "absolute",
            top: "8px",
            right: "10px",
            width: "32px",
            height: "32px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "22px",
            lineHeight: 1,
            color: "#a09888",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ×
        </button>
        <h2
          id="instructions-title"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "21px",
            fontWeight: 600,
            margin: "0 28px 12px 0",
            color: "#3a352e",
          }}
        >
          {exercise.name}
        </h2>
        <div aria-hidden style={{
          width: "30px",
          height: "3px",
          borderRadius: "2px",
          background: fade(accent, 0.65),
          margin: "-4px 0 14px",
        }} />
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "14px",
            lineHeight: 1.55,
            color: "#5a5248",
          }}
        >
          {exercise.steps.map((step, i) => (
            <li key={i} style={{ display: "flex", gap: "12px" }}>
              <span aria-hidden style={{
                flexShrink: 0,
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: fade(accent, 0.14),
                color: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Fraunces', serif",
                fontSize: "12.5px",
                fontWeight: 600,
                marginTop: "1px",
              }}>
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
