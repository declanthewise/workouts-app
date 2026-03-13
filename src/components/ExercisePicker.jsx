import { ALL_MUSCLES } from "../data/muscles";

const diffColors = ["", "#4caf50", "#a0b830", "#f5c242", "#f57c42", "#e04040"];
const diffBg = ["", "#4caf5015", "#a0b83015", "#f5c24215", "#f57c4215", "#e0404015"];

export default function CategoryRow({
  tree: t,
  index: ti,
  activeTab,
  activeLevels,
  onToggle,
  onLevelChange,
  expandedRef,
  categoryRef,
  sortMuscles,
}) {
  const node = t.nodes[activeLevels[t.id]];
  const isOpen = activeTab === ti;

  return (
    <div ref={categoryRef} style={{ borderBottom: "1px solid #ece6dc" }}>
      {/* Header row — only when collapsed */}
      {!isOpen && (
        <button
          onClick={() => onToggle(ti)}
          style={{
            width: "100%", display: "block",
            padding: "10px 0", background: "none", border: "none",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#5a554e", fontWeight: 400 }}>
                {node.name}
              </span>
              <div style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: diffColors[node.diff],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "9px", fontWeight: 700, flexShrink: 0, color: "#fff",
              }}>
                {node.diff}
              </div>
              <span style={{
                marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px",
                flexShrink: 0,
              }}>
                <span style={{ fontSize: "11px", color: t.color, fontWeight: 700, letterSpacing: "0.5px" }}>
                  {t.name}
                </span>
                <span style={{ fontSize: "14px", color: "#c5beb4" }}>▾</span>
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {sortMuscles(node.muscles).map((m) => (
                <span key={m} style={{
                  fontSize: "9px", padding: "1px 6px", borderRadius: "8px",
                  background: t.colorLight, color: t.color, fontWeight: 500,
                  whiteSpace: "nowrap",
                }}>
                  {ALL_MUSCLES.find((am) => am.id === m)?.label}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            fontSize: "12px", color: "#b0a898", lineHeight: 1.5,
            fontWeight: 300, marginTop: "5px",
          }}>
            {node.desc}
          </div>
        </button>
      )}

      {/* Expanded — exercise picker */}
      {isOpen && (
        <div ref={expandedRef} style={{ overflow: "hidden" }}>
          {t.nodes.map((ex, ni) => {
            const isSelected = ni === activeLevels[t.id];

            return (
              <button
                key={ni}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSelected) {
                    onToggle(ti);
                  } else {
                    onLevelChange(t.id, ni);
                  }
                }}
                style={{
                  width: "100%", display: "block",
                  padding: "10px 0", background: "none", border: "none",
                  borderBottom: ni < t.nodes.length - 1 ? "1px solid #f3f0eb" : "none",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      fontSize: "13px",
                      color: isSelected ? "#5a554e" : "#a09888",
                      fontWeight: isSelected ? 400 : 300,
                    }}>
                      {ex.name}
                    </span>
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      background: isSelected ? diffColors[ex.diff] : diffBg[ex.diff],
                      border: `1px solid ${isSelected ? diffColors[ex.diff] : diffColors[ex.diff] + "40"}`,
                      boxSizing: "border-box",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "9px", fontWeight: 700, flexShrink: 0,
                      color: isSelected ? "#fff" : diffColors[ex.diff],
                    }}>
                      {ex.diff}
                    </div>
                    {isSelected && (
                      <span
                        onClick={(e) => { e.stopPropagation(); onToggle(ti); }}
                        style={{
                          marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px",
                          cursor: "pointer", flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: "11px", color: t.color, fontWeight: 700, letterSpacing: "0.5px" }}>
                          {t.name}
                        </span>
                        <span style={{ fontSize: "14px", color: "#c5beb4", transform: "rotate(180deg)" }}>▾</span>
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {sortMuscles(ex.muscles).map((m) => (
                      <span key={m} style={{
                        fontSize: "9px", padding: "1px 6px", borderRadius: "8px",
                        background: t.colorLight,
                        color: isSelected ? t.color : "#b0a898",
                        fontWeight: 500, whiteSpace: "nowrap",
                      }}>
                        {ALL_MUSCLES.find((am) => am.id === m)?.label}
                      </span>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    fontSize: "12px", color: "#b0a898", lineHeight: 1.5,
                    fontWeight: 300, marginTop: "5px",
                  }}>
                    {ex.desc}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
