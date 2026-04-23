import { useEffect } from "react";

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
          background: "#fff",
          color: "#3a352e",
          borderRadius: "14px",
          padding: "22px 24px 20px",
          boxShadow: "0 12px 32px rgba(40,30,20,0.18)",
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
            fontSize: "20px",
            fontWeight: 500,
            margin: "0 28px 12px 0",
            color: "#3a352e",
          }}
        >
          {exercise.name}
        </h2>
        <ol
          style={{
            margin: 0,
            paddingLeft: "20px",
            fontSize: "14px",
            lineHeight: 1.55,
            color: "#5a5248",
          }}
        >
          {exercise.steps.map((step, i) => (
            <li key={i} style={{ marginBottom: i < exercise.steps.length - 1 ? "8px" : 0 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
