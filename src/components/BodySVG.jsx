import { FRONT_PATHS, BACK_PATHS } from "../data/svgPaths";

export default function BodySVG({ side, litMuscles, muscleColors, size = 120 }) {
  const paths = side === "front" ? FRONT_PATHS : BACK_PATHS;
  const vb = side === "front" ? "0 0 724 1448" : "724 0 724 1448";
  const h = size * 2;

  const bodyColor = "#ebe6dd";
  const bodyStroke = "#ddd6cc";
  const inactiveColor = "#e0dbd3";

  return (
    <svg width={size} height={h} viewBox={vb} preserveAspectRatio="xMidYMin meet" style={{ display: "block" }}>
      {Object.entries(paths).map(([muscleId, pathList]) => {
        const isBody = muscleId.startsWith("_");
        const isLit = !isBody && litMuscles.has(muscleId);
        const fill = isBody ? bodyColor : isLit ? (muscleColors[muscleId] || "#d97856") : inactiveColor;
        const opacity = isBody ? 1 : isLit ? 0.85 : 0.35;
        const stroke = isBody ? bodyStroke : isLit ? (muscleColors[muscleId] || "#d97856") : "#d5cfc5";

        return pathList.map((d, i) => (
          <path
            key={`${muscleId}-${i}`}
            d={d}
            fill={fill}
            opacity={opacity}
            stroke={stroke}
            strokeWidth="0.5"
          />
        ));
      })}
    </svg>
  );
}
