import { useState, useEffect, Fragment } from "react";
import { TREES } from "./data/trees";
import ProgressionRow from "./components/ProgressionRow";
import About from "./components/About";

const STORAGE_KEY = "homebody.activeLevels.v1";

function loadActiveLevels() {
  const defaults = Object.fromEntries(TREES.map((t) => [t.id, 0]));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw);
    // Overlay saved values onto defaults so new/removed trees don't break the shape,
    // and clamp in case a progression got shorter.
    return Object.fromEntries(
      TREES.map((t) => {
        const v = saved?.[t.id];
        const maxIdx = t.nodes.length - 1;
        const level = Number.isInteger(v) && v >= 0 && v <= maxIdx ? v : 0;
        return [t.id, level];
      })
    );
  } catch {
    return defaults;
  }
}

export default function App() {
  const [activeLevels, setActiveLevels] = useState(loadActiveLevels);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeLevels));
    } catch {
      // Quota exceeded or storage disabled — nothing to do.
    }
  }, [activeLevels]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700&family=Fraunces:wght@300;500;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { height: 100%; }
        body { margin: 0; overflow: hidden; background: #faf8f4; }
        #root { height: 100dvh; }
        * { -webkit-tap-highlight-color: transparent; }
        .rows-scroller::-webkit-scrollbar { display: none; }
      ` }} />
      <div style={{
        background: "#faf8f4",
        color: "#3a352e",
        fontFamily: "'DM Sans', sans-serif",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}>
          <div style={{
            padding: "14px 18px 12px",
            background: "#f7f4ef",
            borderBottom: "1px solid #e8e2d8",
            flexShrink: 0,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}>
            <span style={{
              fontSize: "18px",
              fontWeight: showAbout ? 500 : 600,
              fontFamily: "'Fraunces', serif",
              color: "#3a352e",
            }}>
              {showAbout ? "About" : "Homebody"}
            </span>
            <button
              type="button"
              onClick={() => setShowAbout((v) => !v)}
              style={{
                background: "none",
                border: "none",
                padding: "4px 0",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#6a85a0",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              {showAbout ? "Back" : "About"}
            </button>
          </div>

          {showAbout ? <About /> : (
          <div className="rows-scroller" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "6px 0 10px",
            minHeight: 0,
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}>
            {TREES.map((t, idx) => {
              const caption = { 0: "First Pair", 2: "Second Pair", 4: "Third Pair", 6: "Core Triplet" }[idx];
              return (
                <Fragment key={t.id}>
                  {caption && idx !== 0 && (
                    <div style={{
                      height: "1px",
                      margin: "2px 18px 0",
                      background: "#dfd8cc",
                      flexShrink: 0,
                    }} />
                  )}
                  {caption && (
                    <div style={{
                      padding: idx === 0 ? "4px 18px 2px" : "10px 18px 2px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "#a09888",
                      flexShrink: 0,
                    }}>
                      {caption}
                    </div>
                  )}
                  <ProgressionRow
                    tree={t}
                    activeLevel={activeLevels[t.id]}
                    onLevelChange={(treeId, level) =>
                      setActiveLevels((prev) =>
                        prev[treeId] === level ? prev : { ...prev, [treeId]: level }
                      )
                    }
                  />
                </Fragment>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </>
  );
}
