import { useState, useRef, useCallback } from "react";
import { ALL_MUSCLES } from "./data/muscles";
import { TREES } from "./data/trees";
import CoverageSection from "./components/CoverageSection";
import CategoryRow from "./components/CategoryRow";

export default function SkillTree() {
  const [activeTab, setActiveTab] = useState(null);
  const [activeLevels, setActiveLevels] = useState(
    Object.fromEntries(TREES.map((t) => [t.id, 0]))
  );

  const expandedRefs = useRef({});
  const categoryRefs = useRef({});

  const handleToggle = useCallback((ti) => {
    if (activeTab === ti) {
      // CLOSE — wait for React to re-render (list collapses), then scroll to top
      setActiveTab(null);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
    } else {
      // OPEN — scroll down just enough to show the full expanded list
      setActiveTab(ti);
      setTimeout(() => {
        const expandedEl = expandedRefs.current[ti];
        if (expandedEl) {
          const rect = expandedEl.getBoundingClientRect();
          // If the bottom of the list is below the viewport, scroll down by the overflow amount
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

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700&family=Fraunces:wght@300;500;700&display=swap" rel="stylesheet" />
      <style dangerouslySetInnerHTML={{ __html: "body { margin: 0; background: #faf8f4; } #root { padding-bottom: env(safe-area-inset-bottom, 0px); }" }} />
      <div style={{
        minHeight: "100vh",
        background: "#faf8f4",
        color: "#3a352e",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{
          maxWidth: "480px",
          margin: "0 auto",
        }}>
          {/* ── COVERAGE ── */}
          <CoverageSection
            allActiveMuscles={allActiveMuscles}
            muscleColors={muscleColors}
          />

          {/* ── CATEGORIES ── */}
          <div style={{
            padding: "12px 18px 24px",
            background: "#faf8f4",
          }}>
            {TREES.map((t, ti) => (
              <CategoryRow
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
        </div>
      </div>
    </>
  );
}
