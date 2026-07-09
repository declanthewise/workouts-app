import { useEffect, useRef, useState } from "react";
import { EQUIPMENT_NAME, EQUIPMENT_ARTICLE, unmetGroups } from "../data/equipment";

// Delay between the final answer and closing, so the chosen button's color change
// is perceptible before the popup dismisses.
const RESOLVE_DELAY = 420;

export default function EquipmentPrompt({ prompt, owned, onConfirm, onClose }) {
  // Per-piece answers (id -> true/false). Applied only once every piece is answered.
  const [answers, setAnswers] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    setAnswers({});
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [prompt]);

  useEffect(() => {
    if (!prompt) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prompt, onClose]);

  if (!prompt) return null;

  const { node } = prompt;
  const groups = unmetGroups(node, owned);
  const options = [...new Set(groups.flat())];

  // Tail of "…do you have access to{tail}". "both/either" take no article; a lone
  // piece takes its own ("a:", "an:", or just ":" for plurals like rings).
  const tail = groups.length > 1
    ? (groups.length === 2 ? " both:" : " all of these:")
    : options.length > 1
      ? " either:"
      : EQUIPMENT_ARTICLE[options[0]] ? ` ${EQUIPMENT_ARTICLE[options[0]]}:` : ":";

  const answer = (id, has) => {
    if (timerRef.current) return; // already resolving — ignore further taps
    const next = { ...answers, [id]: has };
    setAnswers(next);
    // Resolve only once every piece has been answered, so "either" lets the user
    // confirm both. Pause briefly first so the button's color change registers.
    if (options.every((o) => o in next)) {
      const yesIds = options.filter((o) => next[o] === true);
      timerRef.current = setTimeout(() => onConfirm(yesIds), RESOLVE_DELAY);
    }
  };

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
        aria-labelledby="equip-title"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "340px",
          background: "#fffdf9",
          color: "#3a352e",
          borderRadius: "16px",
          padding: "24px 24px 22px",
          boxShadow: "0 18px 48px rgba(40,30,20,0.25)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <p
          id="equip-title"
          style={{ margin: "0 0 16px", fontSize: "15px", lineHeight: 1.5, color: "#3a352e" }}
        >
          For <strong style={{ fontWeight: 600 }}>{node.name}</strong>, do you have access{" "}
          <span style={{ whiteSpace: "nowrap" }}>to{tail}</span>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {options.map((id) => {
            const a = answers[id];
            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "1px solid #e8e2d8",
                  background: "#fff",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#3a352e", minWidth: 0 }}>
                  {EQUIPMENT_NAME[id]}
                </span>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button type="button" className="press" onClick={() => answer(id, true)} style={pill("yes", a === true)}>
                    Yes
                  </button>
                  <button type="button" className="press" onClick={() => answer(id, false)} style={pill("no", a === false)}>
                    Not yet
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function pill(kind, active) {
  const base = {
    padding: "6px 12px",
    borderRadius: "8px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  };
  if (kind === "yes") {
    return active
      ? { ...base, border: "1px solid #6f9161", background: "#6f9161", color: "#fff" }
      : { ...base, border: "1px solid #c9d6bf", background: "#fff", color: "#5d7550" };
  }
  return active
    ? { ...base, border: "1px solid #d8d1c5", background: "#ece8e1", color: "#5a5248" }
    : { ...base, border: "1px solid #e0dacf", background: "#fff", color: "#8a8276" };
}
