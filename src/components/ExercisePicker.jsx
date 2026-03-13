import { ALL_MUSCLES } from "../data/muscles";

const diffColors = ["", "#4caf50", "#a0b830", "#f5c242", "#f57c42", "#e04040"];

function DiffBadge({ diff, filled, color }) {
  const fg = filled ? "#fff" : color;
  const bg = filled ? color : (color + "15");
  const stroke = filled ? "none" : (color + "40");
  const sw = filled ? 0 : 1;

  const textProps = {
    textAnchor: "middle", dominantBaseline: "central",
    fontSize: 9, fontWeight: 700, fill: fg,
  };

  if (diff <= 2) {
    return (
      <svg width={18} height={18} viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
        <circle cx={9} cy={9} r={8} fill={bg} stroke={stroke} strokeWidth={sw} />
        <text x={9} y={9.5} {...textProps}>{diff}</text>
      </svg>
    );
  }

  if (diff <= 4) {
    return (
      <svg width={18} height={18} viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
        <polygon points="9,1 17,16 1,16" fill={bg} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <text x={9} y={11.5} {...textProps}>{diff}</text>
      </svg>
    );
  }

  return (
    <svg width={18} height={18} viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <polygon points="9,1 17,9 9,17 1,9" fill={bg} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <text x={9} y={9.5} {...textProps}>{diff}</text>
    </svg>
  );
}

export default function ExercisePicker({
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
              <DiffBadge diff={node.diff} filled color={diffColors[node.diff]} />
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
                    <DiffBadge diff={ex.diff} filled={isSelected} color={diffColors[ex.diff]} />
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
