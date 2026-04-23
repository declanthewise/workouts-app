import { useState } from "react";
import { TREES } from "./data/trees";
import ProgressionRow from "./components/ProgressionRow";

export default function App() {
  const [activeLevels, setActiveLevels] = useState(
    Object.fromEntries(TREES.map((t) => [t.id, 0]))
  );

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
          }}>
            <span style={{
              fontSize: "18px",
              fontWeight: 600,
              fontFamily: "'Fraunces', serif",
              color: "#3a352e",
            }}>
              Homebody
            </span>
            <span style={{
              fontSize: "11px",
              fontWeight: 400,
              color: "#a09888",
              marginLeft: "8px",
              letterSpacing: "0.3px",
            }}>
              Strength Training At Home
            </span>
          </div>

          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "6px 0 10px",
            minHeight: 0,
          }}>
            {TREES.map((t) => (
              <ProgressionRow
                key={t.id}
                tree={t}
                activeLevel={activeLevels[t.id]}
                onLevelChange={(treeId, level) =>
                  setActiveLevels((prev) =>
                    prev[treeId] === level ? prev : { ...prev, [treeId]: level }
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
