import { useState, useRef, useCallback } from "react";
import { ALL_MUSCLES } from "./data/muscles";
import { TREES } from "./data/trees";
import CoverageSection from "./components/CoverageSection";
import ExercisePicker from "./components/ExercisePicker";

export default function SkillTree() {
  const [view, setView] = useState("exercises");
  const [activeTab, setActiveTab] = useState(null);
  const [activeLevels, setActiveLevels] = useState(
    Object.fromEntries(TREES.map((t) => [t.id, 0]))
  );

  const expandedRefs = useRef({});
  const categoryRefs = useRef({});

  const handleToggle = useCallback((ti) => {
    if (activeTab === ti) {
      if (window.scrollY === 0) {
        setActiveTab(null);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
        const onDone = () => {
          setActiveTab(null);
          window.removeEventListener("scrollend", onDone);
        };
        window.addEventListener("scrollend", onDone);
        setTimeout(onDone, 250);
      }
    } else {
      setActiveTab(ti);
      setTimeout(() => {
        const expandedEl = expandedRefs.current[ti];
        if (expandedEl) {
          const rect = expandedEl.getBoundingClientRect();
          const overflow = rect.bottom - window.innerHeight;
          if (overflow > 0) {
            window.scrollBy({ top: overflow + 60, behavior: "smooth" });
          }
        }
      }, 50);
    }
  }, [activeTab]);

  const allActiveMuscles = new Set();
  TREES.forEach((t) => {
    t.nodes[activeLevels[t.id]].muscles.forEach((m) => allActiveMuscles.add(m));
  });
  const muscleColors = {};
  TREES.forEach((t) => {
    const node = t.nodes[activeLevels[t.id]];
    node.muscles.forEach((m) => { if (!muscleColors[m]) muscleColors[m] = t.color; });
  });

  const sortMuscles = (ids) =>
    [...ids].sort((a, b) => {
      const la = ALL_MUSCLES.find((m) => m.id === a)?.label || a;
      const lb = ALL_MUSCLES.find((m) => m.id === b)?.label || b;
      return la.localeCompare(lb);
    });

  const isAnatomy = view === "anatomy";
  const iconColor = "#fff";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700&family=Fraunces:wght@300;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: `html, body { margin: 0; overflow-x: hidden; background: #faf8f4; } #root { padding-bottom: ${isAnatomy ? "0px" : "env(safe-area-inset-bottom, 0px)"}; } * { -webkit-tap-highlight-color: transparent; }` }} />
      <div style={{
        height: isAnatomy ? "100dvh" : undefined,
        minHeight: isAnatomy ? undefined : "100vh",
        display: isAnatomy ? "flex" : undefined,
        flexDirection: isAnatomy ? "column" : undefined,
        overflow: isAnatomy ? "hidden" : undefined,
        background: "#faf8f4",
        color: "#3a352e",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
          ...(isAnatomy ? { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } : {}),
        }}>
          {/* ── HEADER ── */}
          <div style={{
            position: "relative",
            padding: "14px 18px 10px",
            background: "#f7f4ef",
            borderBottom: "1px solid #e8e2d8",
          }}>
            <span style={{
              fontSize: "18px",
              fontWeight: 600,
              fontFamily: "'Fraunces', serif",
              color: "#3a352e",
            }}>
              Workouts
            </span>
            <svg
              width={48} height={48} viewBox="0 0 48 48"
              style={{
                position: "absolute",
                right: 18,
                bottom: -14,
                zIndex: 1,
                cursor: "pointer",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.15))",
                transition: "transform 0.1s ease",
              }}
              onPointerDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
              onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={() => setView(isAnatomy ? "exercises" : "anatomy")}
            >
              <circle cx={24} cy={24} r={22} fill="#6b645a" />
              <circle cx={24} cy={24} r={22.5} fill="none" stroke="#d5cfc5" strokeWidth={0.75} />

              {isAnatomy ? (
                /* List icon — shown when on anatomy tab, tapping goes to exercises */
                <>
                  <line x1={15} y1={16} x2={33} y2={16} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={15} y1={24} x2={33} y2={24} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={15} y1={32} x2={33} y2={32} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                </>
              ) : (
                /* Stick figure — shown when on exercises tab, tapping goes to anatomy */
                <>
                  <circle cx={24} cy={10} r={3} fill={iconColor} />
                  <line x1={24} y1={13.5} x2={24} y2={26} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={24} y1={17} x2={17} y2={24} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={24} y1={17} x2={31} y2={24} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={24} y1={26} x2={19.5} y2={38} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                  <line x1={24} y1={26} x2={28.5} y2={38} stroke={iconColor} strokeWidth={1.5} strokeLinecap="round" />
                </>
              )}
            </svg>
          </div>

          {/* ── CONTENT ── */}
          {isAnatomy ? (
            <CoverageSection
              allActiveMuscles={allActiveMuscles}
              muscleColors={muscleColors}
            />
          ) : (
            <div style={{
              padding: "12px 18px 24px",
              background: "#faf8f4",
            }}>
              {TREES.map((t, ti) => (
                <ExercisePicker
                  key={t.id}
                  tree={t}
                  index={ti}
                  activeTab={activeTab}
                  activeLevels={activeLevels}
                  onToggle={handleToggle}
                  onLevelChange={(treeId, level) =>
                    setActiveLevels((prev) => ({ ...prev, [treeId]: level }))
                  }
                  expandedRef={(el) => (expandedRefs.current[ti] = el)}
                  categoryRef={(el) => (categoryRefs.current[ti] = el)}
                  sortMuscles={sortMuscles}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
