import { ALL_MUSCLES } from "../data/muscles";
import BodySVG from "./BodySVG";

export default function CoverageSection({ allActiveMuscles, muscleColors, muscleCount }) {
  return (
    <div style={{
      padding: "20px 12px 16px",
      borderBottom: "1px solid #e8e2d8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f4ef",
    }}>
      <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", justifyContent: "center", width: "100%" }}>
        <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <BodySVG side="front" litMuscles={allActiveMuscles} muscleColors={muscleColors} size={200} />
          <div style={{ fontSize: "9px", color: "#b0a898", letterSpacing: "2px", marginTop: "4px", fontWeight: 500 }}>FRONT</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <BodySVG side="back" litMuscles={allActiveMuscles} muscleColors={muscleColors} size={200} />
          <div style={{ fontSize: "9px", color: "#b0a898", letterSpacing: "2px", marginTop: "4px", fontWeight: 500 }}>BACK</div>
        </div>
      </div>

      <div style={{
        fontSize: "11px", color: "#a09888", marginTop: "10px",
        lineHeight: 1.5, textAlign: "center",
      }}>
        <span style={{
          fontWeight: 600, fontFamily: "'Fraunces', serif",
          fontSize: "14px", color: muscleCount === ALL_MUSCLES.length ? "#a0b830" : "#b07040",
        }}>
          {muscleCount}/{ALL_MUSCLES.length}
        </span>
        <span style={{ fontWeight: 500, color: "#8a847a" }}> Muscles</span>
        {muscleCount < ALL_MUSCLES.length && (
          <span>
            {" "}(Missing: <span style={{ color: "#b07040", fontWeight: 500 }}>
              {ALL_MUSCLES.filter((m) => !allActiveMuscles.has(m.id)).map((m) => m.label).join(", ")}
            </span>)
          </span>
        )}
        {muscleCount === ALL_MUSCLES.length && (
          <span style={{ color: "#a0b830", fontWeight: 500 }}> — Full coverage</span>
        )}
      </div>
    </div>
  );
}
