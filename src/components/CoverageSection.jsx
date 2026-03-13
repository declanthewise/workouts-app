import { FRONT_PATHS, BACK_PATHS } from "../data/svgPaths";

// Each muscle is labeled once, on the view where it's most visible.
// Labels on the left point to the front body; labels on the right point to the back body.
// Ordered top-to-bottom by target y so leader lines never cross.
const ANNOTATIONS = [
  // Front body — left-side labels
  { id: "sideDelt",  label: "Side Delts",   side: "left",  tx: 225, ty: 320, ly: 200 },
  { id: "frontDelt", label: "Front Delts",  side: "left",  tx: 255, ty: 355, ly: 295 },
  { id: "chest",     label: "Chest",        side: "left",  tx: 320, ty: 395, ly: 390 },
  { id: "bicep",     label: "Biceps",       side: "left",  tx: 195, ty: 460, ly: 480 },
  { id: "abs",       label: "Abs",          side: "left",  tx: 345, ty: 530, ly: 565 },
  { id: "oblique",   label: "Obliques",     side: "left",  tx: 285, ty: 545, ly: 650 },
  { id: "hipFlexor", label: "Hip Flexors",  side: "left",  tx: 340, ty: 700, ly: 735 },
  { id: "adductor",  label: "Adductors",    side: "left",  tx: 320, ty: 770, ly: 820 },
  { id: "quad",      label: "Quads",        side: "left",  tx: 290, ty: 870, ly: 910 },
  { id: "tibialis",  label: "Tibialis",     side: "left",  tx: 275, ty: 1060, ly: 1050 },
  // Back body — right-side labels
  { id: "rearDelt",  label: "Rear Delts",   side: "right", tx: 1220, ty: 340, ly: 240 },
  { id: "upperBack", label: "Upper Back",   side: "right", tx: 1150, ty: 375, ly: 350 },
  { id: "tricep",    label: "Triceps",      side: "right", tx: 1240, ty: 470, ly: 460 },
  { id: "lat",       label: "Lats",         side: "right", tx: 1165, ty: 500, ly: 560 },
  { id: "forearm",   label: "Forearms",     side: "right", tx: 1300, ty: 600, ly: 655 },
  { id: "lowerBack", label: "Lower Back",   side: "right", tx: 1100, ty: 610, ly: 745 },
  { id: "glute",     label: "Glutes",       side: "right", tx: 1140, ty: 730, ly: 835 },
  { id: "hamstring", label: "Hamstrings",   side: "right", tx: 1175, ty: 870, ly: 935 },
  { id: "calf",      label: "Calves",       side: "right", tx: 1175, ty: 1110, ly: 1080 },
];

const ELBOW_X = { left: 50, right: 1400 };
const LABEL_X = { left: -30, right: 1478 };
const LINE_X  = { left: -15, right: 1463 };
const ANCHOR  = { left: "end", right: "start" };
const FONT = "'DM Sans', sans-serif";

function BodyPaths({ paths, litMuscles, muscleColors }) {
  const bodyColor = "#ebe6dd";
  const bodyStroke = "#ddd6cc";
  const inactive = "#e0dbd3";

  return Object.entries(paths).map(([muscleId, pathList]) => {
    const isBody = muscleId.startsWith("_");
    const isLit = !isBody && litMuscles.has(muscleId);
    const fill = isBody ? bodyColor : isLit ? (muscleColors[muscleId] || "#d97856") : inactive;
    const opacity = isBody ? 1 : isLit ? 0.85 : 0.35;
    const stroke = isBody ? bodyStroke : isLit ? (muscleColors[muscleId] || "#d97856") : "#d5cfc5";

    return (
      <g key={muscleId}>
        {pathList.map((d, i) => (
          <path key={i} d={d} fill={fill} opacity={opacity} stroke={stroke} strokeWidth="0.5" />
        ))}
      </g>
    );
  });
}

export default function CoverageSection({ allActiveMuscles, muscleColors }) {
  return (
    <div style={{
      padding: "8px 0",
      borderBottom: "1px solid #e8e2d8",
      background: "#f7f4ef",
    }}>
      <svg
        viewBox="-300 80 2048 1320"
        style={{ width: "100%", height: "auto", display: "block" }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Body silhouettes */}
        <BodyPaths paths={FRONT_PATHS} litMuscles={allActiveMuscles} muscleColors={muscleColors} />
        <BodyPaths paths={BACK_PATHS} litMuscles={allActiveMuscles} muscleColors={muscleColors} />

        {/* Muscle annotations */}
        {ANNOTATIONS.map(({ id, label, side, tx, ty, ly }) => {
          const isActive = allActiveMuscles.has(id);
          const color = isActive ? (muscleColors[id] || "#d97856") : "#d8d2c8";
          const textFill = isActive ? (muscleColors[id] || "#d97856") : "#c5beb4";
          const lineOpacity = isActive ? 0.5 : 0.2;
          const dotOpacity = isActive ? 0.7 : 0.25;

          return (
            <g key={id}>
              {/* Elbow leader line: horizontal from label, then diagonal to target */}
              <polyline
                points={`${LINE_X[side]},${ly} ${ELBOW_X[side]},${ly} ${tx},${ty}`}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                opacity={lineOpacity}
              />
              {/* Dot on muscle */}
              <circle cx={tx} cy={ty} r={5} fill={color} opacity={dotOpacity} />
              {/* Label */}
              <text
                x={LABEL_X[side]}
                y={ly + 13}
                textAnchor={ANCHOR[side]}
                fontSize={36}
                fontFamily={FONT}
                fill={textFill}
                fontWeight={isActive ? 600 : 400}
              >
                {label}
              </text>
            </g>
          );
        })}

      </svg>
    </div>
  );
}
