import { useState, useRef, useEffect, useCallback } from "react";
import { FRONT_PATHS, BACK_PATHS } from "../data/svgPaths";
import { TREES } from "../data/trees";

const FRONT_ANNOTATIONS = [
  { id: "sideDelt",  label: "Side Delts",   tx: 225, ty: 320, ly: 200 },
  { id: "frontDelt", label: "Front Delts",  tx: 255, ty: 355, ly: 295 },
  { id: "chest",     label: "Chest",        tx: 320, ty: 395, ly: 390 },
  { id: "bicep",     label: "Biceps",       tx: 195, ty: 460, ly: 480 },
  { id: "abs",       label: "Abs",          tx: 345, ty: 530, ly: 565 },
  { id: "oblique",   label: "Obliques",     tx: 285, ty: 545, ly: 650 },
  { id: "hipFlexor", label: "Hip Flexors",  tx: 340, ty: 700, ly: 735 },
  { id: "adductor",  label: "Adductors",    tx: 320, ty: 770, ly: 820 },
  { id: "quad",      label: "Quads",        tx: 290, ty: 870, ly: 910 },
  { id: "tibialis",  label: "Tibialis",     tx: 275, ty: 1060, ly: 1050 },
];

// Back body annotations — target x mirrored to left side of figure
const BACK_ANNOTATIONS = [
  { id: "rearDelt",  label: "Rear Delts",   tx: 230, ty: 340, ly: 240 },
  { id: "upperBack", label: "Upper Back",   tx: 300, ty: 375, ly: 350 },
  { id: "tricep",    label: "Triceps",      tx: 210, ty: 470, ly: 460 },
  { id: "lat",       label: "Lats",         tx: 285, ty: 500, ly: 560 },
  { id: "forearm",   label: "Forearms",     tx: 150, ty: 600, ly: 655 },
  { id: "lowerBack", label: "Lower Back",   tx: 350, ty: 610, ly: 745 },
  { id: "glute",     label: "Glutes",       tx: 310, ty: 730, ly: 835 },
  { id: "hamstring", label: "Hamstrings",   tx: 275, ty: 870, ly: 935 },
  { id: "calf",      label: "Calves",       tx: 275, ty: 1110, ly: 1080 },
];

const ELBOW_X = 50;
const LABEL_X = -30;
const LINE_X  = -15;
const FONT = "'DM Sans', sans-serif";
const PAD = 20;

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

function Annotations({ annotations, allActiveMuscles, muscleColors }) {
  return annotations.map(({ id, label, tx, ty, ly }) => {
    const isActive = allActiveMuscles.has(id);
    const color = isActive ? (muscleColors[id] || "#d97856") : "#d8d2c8";
    const textFill = isActive ? (muscleColors[id] || "#d97856") : "#c5beb4";
    const lineOpacity = isActive ? 0.5 : 0.5;
    const dotOpacity = isActive ? 0.7 : 0.7;

    return (
      <g key={id}>
        <polyline
          points={`${LINE_X},${ly} ${ELBOW_X},${ly} ${tx},${ty}`}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={lineOpacity}
        />
        <circle cx={tx} cy={ty} r={5} fill={color} opacity={dotOpacity} />
        <text
          x={LABEL_X}
          y={ly + 13}
          textAnchor="end"
          fontSize={36}
          fontFamily={FONT}
          fill={textFill}
          fontWeight={isActive ? 600 : 400}
        >
          {label}
        </text>
      </g>
    );
  });
}

function AutoSVG({ children, align, style }) {
  const gRef = useRef(null);
  const [vb, setVb] = useState(null);

  const measure = useCallback(() => {
    if (!gRef.current) return;
    const { x, y, width, height } = gRef.current.getBBox();
    setVb(`${x - PAD} ${y - PAD} ${width + PAD * 2} ${height + PAD * 2}`);
  }, []);

  useEffect(() => {
    measure();
  }, [measure]);

  return (
    <svg
      viewBox={vb || "0 0 1 1"}
      style={{ ...style, visibility: vb ? "visible" : "hidden" }}
      preserveAspectRatio={`xMidY${align} meet`}
    >
      <g ref={gRef}>{children}</g>
    </svg>
  );
}

export default function CoverageSection({ allActiveMuscles, muscleColors }) {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
      overflow: "hidden",
      background: "#f7f4ef",
    }}>
      {/* Front body — floats to top */}
      <AutoSVG align="Min" style={{ width: "100%", flex: 1, minHeight: 0 }}>
        <BodyPaths paths={FRONT_PATHS} litMuscles={allActiveMuscles} muscleColors={muscleColors} />
        <Annotations annotations={FRONT_ANNOTATIONS} allActiveMuscles={allActiveMuscles} muscleColors={muscleColors} />
      </AutoSVG>

      {/* Back body — floats to bottom */}
      <AutoSVG align="Max" style={{ width: "100%", flex: 1, minHeight: 0 }}>
        <g transform="translate(-730, 0)">
          <BodyPaths paths={BACK_PATHS} litMuscles={allActiveMuscles} muscleColors={muscleColors} />
        </g>
        <Annotations annotations={BACK_ANNOTATIONS} allActiveMuscles={allActiveMuscles} muscleColors={muscleColors} />
      </AutoSVG>

      {/* Category labels — overlaid */}
      <div style={{
        position: "absolute",
        right: 24,
        top: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "10px",
        pointerEvents: "none",
      }}>
        {TREES.map((t) => (
          <span key={t.id} style={{
            fontSize: "11px",
            fontWeight: 600,
            color: t.color,
            letterSpacing: "0.5px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {t.name}
          </span>
        ))}
      </div>
    </div>
  );
}
