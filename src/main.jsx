import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import SkillTree from "./App";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SkillTree />
  </StrictMode>
);
