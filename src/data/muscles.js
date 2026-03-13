// 18 visible muscles (have SVG paths) + hidden muscles (tracked but not shown on diagram)
export const ALL_MUSCLES = [
  // Visible
  { id: "abs", label: "Abs" },
  { id: "adductor", label: "Adductors" },
  { id: "bicep", label: "Biceps" },
  { id: "calf", label: "Calves" },
  { id: "chest", label: "Chest" },
  { id: "forearm", label: "Forearms" },
  { id: "frontDelt", label: "Front Delts" },
  { id: "glute", label: "Glutes" },
  { id: "hamstring", label: "Hamstrings" },
  { id: "lat", label: "Lats" },
  { id: "lowerBack", label: "Lower Back" },
  { id: "oblique", label: "Obliques" },
  { id: "quad", label: "Quads" },
  { id: "rearDelt", label: "Rear Delts" },
  { id: "tibialis", label: "Tibialis" },
  { id: "tricep", label: "Triceps" },
  { id: "upperBack", label: "Upper Back" },
  // Hidden (no SVG paths — deep/internal muscles)
  { id: "hipFlexor", label: "Hip Flexors", hidden: true },
  { id: "sideDelt", label: "Side Delts", hidden: true },
];
