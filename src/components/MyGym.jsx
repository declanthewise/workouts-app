import { EQUIPMENT } from "../data/equipment";

export default function MyGym({ owned, onToggle }) {
  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "18px 18px 16px",
      fontFamily: "'DM Sans', sans-serif",
      color: "#3a352e",
    }}>
      <p style={{ margin: "0 0 18px", fontSize: "14px", lineHeight: 1.55, color: "#5a5248" }}>
        Tell Homebody what you own and it unlocks the movements that gear makes possible.
        Everything else stays bodyweight-only.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {EQUIPMENT.map((e) => {
          const on = owned.has(e.id);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onToggle(e.id)}
              aria-pressed={on}
              className="press"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                width: "100%",
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: "12px",
                border: `1px solid ${on ? "#6f9161" : "#ece5d8"}`,
                background: on ? "#f3f6ef" : "#fffdf9",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: on ? "0 2px 10px rgba(111,145,97,0.18)" : "0 1px 2px rgba(40,30,20,0.04)",
                transition: "border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: "block",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#3a352e",
                  marginBottom: "3px",
                }}>
                  {e.name}
                </span>
                <span style={{
                  display: "block",
                  fontSize: "12.5px",
                  lineHeight: 1.45,
                  color: "#7a7264",
                }}>
                  {e.blurb}
                </span>
              </span>
              <Switch on={on} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Switch({ on }) {
  return (
    <span
      aria-hidden
      style={{
        flexShrink: 0,
        marginTop: "2px",
        width: "42px",
        height: "24px",
        borderRadius: "999px",
        background: on ? "#6f9161" : "#d6cfc1",
        position: "relative",
        transition: "background 0.15s ease",
      }}
    >
      <span style={{
        position: "absolute",
        top: "2px",
        left: on ? "20px" : "2px",
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(40,30,20,0.25)",
        transition: "left 0.15s ease",
      }} />
    </span>
  );
}
