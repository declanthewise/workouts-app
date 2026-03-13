import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SkillTree from "../skill-tree.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SkillTree />
  </StrictMode>
);
