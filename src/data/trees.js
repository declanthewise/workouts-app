export const TREES = [
  {
    id: "push", name: "Push", color: "#7b6bbf", colorLight: "#7b6bbf12", colorMid: "#7b6bbf30",
    nodes: [
      { name: "Wall Push-ups", diff: 1, desc: "Face wall at arm's length, hands shoulder-width. Bend elbows to bring chest toward wall, push back. Keep body straight.", muscles: ["chest", "frontDelt", "tricep"] },
      { name: "Knee Push-ups", diff: 2, desc: "Knees on floor, hands shoulder-width. Lower chest to floor over 2 seconds, pause, press up. Straight line from knees to head.", muscles: ["chest", "frontDelt", "tricep"] },
      { name: "Push-ups", diff: 3, desc: "Hands shoulder-width, body rigid plank. Lower until chest nearly touches floor, elbows at 45°. Press up to full lockout.", muscles: ["abs", "chest", "frontDelt", "tricep"] },
      { name: "Diamond Push-ups", diff: 3, desc: "Hands together under chest forming a diamond. Lower slowly, elbows tracking close to body. Press up. Heavy on triceps.", muscles: ["chest", "frontDelt", "tricep"] },
      { name: "Pike Push-ups", diff: 4, desc: "Start in downward dog, hips high. Bend elbows to lower head toward floor between hands. Press up. Targets shoulders.", muscles: ["frontDelt", "sideDelt", "tricep"] },
      { name: "Archer Push-ups", diff: 5, desc: "Extra-wide hand placement. Shift bodyweight over one hand and lower toward it, other arm extends straight. Alternate sides.", muscles: ["abs", "chest", "frontDelt", "tricep"] },
    ],
  },
  {
    id: "pull", name: "Pull", color: "#4a9bba", colorLight: "#4a9bba12", colorMid: "#4a9bba30",
    nodes: [
      { name: "Towel Rows", diff: 1, desc: "Loop a towel around a door handle. Lean back holding both ends, arms extended. Pull chest to hands, squeeze shoulder blades.", muscles: ["bicep", "forearm", "rearDelt", "upperBack"] },
      { name: "Table Rows", diff: 2, desc: "Lie under a sturdy table, grip the edge. Body straight, heels on floor. Pull chest up to the table edge, lower controlled.", muscles: ["bicep", "forearm", "lat", "rearDelt", "upperBack"] },
      { name: "Inverted Rows", diff: 3, desc: "Same as table rows but with feet elevated on a chair. Increases load. Pull chest to edge, squeeze at top for one second.", muscles: ["bicep", "forearm", "lat", "rearDelt", "upperBack"] },
      { name: "Pull-up Negatives", diff: 4, desc: "Jump or step up so chin is over the bar. Lower yourself as slowly as possible to a dead hang. Reset and repeat. Needs bar.", muscles: ["bicep", "forearm", "lat", "rearDelt", "upperBack"] },
      { name: "Pull-ups", diff: 5, desc: "Dead hang, hands just outside shoulders. Pull until chin clears bar, lower fully. No kipping or swinging. Needs bar.", muscles: ["bicep", "forearm", "lat", "rearDelt", "upperBack"] },
    ],
  },
  {
    id: "squat", name: "Squat", color: "#cf7b5f", colorLight: "#cf7b5f12", colorMid: "#cf7b5f30",
    nodes: [
      { name: "BW Squats", diff: 1, desc: "Feet shoulder-width, toes slightly out. Sit hips back and down until thighs are parallel. Drive through heels to stand.", muscles: ["glute", "quad"] },
      { name: "Reverse Lunges", diff: 2, desc: "Step one foot back, lower until back knee nearly touches floor. Front shin stays vertical. Push through front heel to stand.", muscles: ["glute", "hamstring", "hipFlexor", "quad"] },
      { name: "Bulgarian Splits", diff: 3, desc: "Rear foot elevated on a chair behind you. Lower until front thigh is parallel. Keep torso upright. Drive up through front heel.", muscles: ["adductor", "calf", "glute", "hamstring", "quad"] },
      { name: "Squat Jumps", diff: 3, desc: "Squat to parallel, then explode upward as high as possible. Land softly with bent knees, immediately descend into next rep.", muscles: ["calf", "glute", "quad"] },
      { name: "Pistol Negatives", diff: 4, desc: "Stand on one leg, extend other leg forward. Lower yourself on the standing leg as slowly as possible. Use two legs to stand back up.", muscles: ["adductor", "calf", "glute", "hamstring", "quad"] },
      { name: "Pistol Squats", diff: 5, desc: "Full single-leg squat. Lower all the way down on one leg, other leg extended forward, then drive back up. Arms forward for balance.", muscles: ["abs", "adductor", "calf", "glute", "hamstring", "hipFlexor", "quad"] },
    ],
  },
  {
    id: "hinge", name: "Hinge", color: "#3d8a8a", colorLight: "#3d8a8a12", colorMid: "#3d8a8a30",
    nodes: [
      { name: "Glute Bridges", diff: 1, desc: "Lie face-up, knees bent, feet flat. Drive hips toward ceiling by squeezing glutes. Pause 2 seconds at top. Lower slowly.", muscles: ["glute", "hamstring", "lowerBack"] },
      { name: "Superman Hold", diff: 1, desc: "Lie face-down, arms extended overhead. Simultaneously lift arms, chest, and legs off floor. Hold. Breathe. Lower with control.", muscles: ["glute", "lowerBack", "rearDelt", "upperBack"] },
      { name: "1-Leg Bridge", diff: 2, desc: "Same as glute bridge but extend one leg straight. Drive through the planted heel. Pause at top. Keep hips level throughout.", muscles: ["glute", "hamstring", "lowerBack"] },
      { name: "Good Mornings", diff: 2, desc: "Stand with hands behind head. Hinge at hips, pushing them back, lowering torso until nearly parallel to floor. Squeeze back up.", muscles: ["glute", "hamstring", "lowerBack"] },
      { name: "Nordic Negatives", diff: 4, desc: "Kneel with feet anchored under something heavy. Slowly lower your torso toward the floor, resisting gravity as long as possible. Catch yourself, reset.", muscles: ["calf", "glute", "hamstring"] },
      { name: "Nordic Curls", diff: 5, desc: "Same start as negatives. Lower slowly, then pull yourself back up using hamstrings alone. The hardest bodyweight hamstring exercise.", muscles: ["calf", "glute", "hamstring"] },
    ],
  },
  {
    id: "core", name: "Core", color: "#b07399", colorLight: "#b0739912", colorMid: "#b0739930",
    nodes: [
      { name: "Plank", diff: 1, desc: "Forearms and toes on floor, body in a straight line. Squeeze glutes, brace abs, don't let hips sag or pike. Hold and breathe.", muscles: ["abs", "frontDelt", "oblique"] },
      { name: "Dead Bug", diff: 2, desc: "Lie face-up, arms extended to ceiling, knees at 90°. Slowly extend opposite arm and leg toward floor. Return. Alternate sides. Low back stays pinned.", muscles: ["abs", "hipFlexor", "oblique"] },
      { name: "Shoulder Taps", diff: 2, desc: "High plank position. Lift one hand and tap opposite shoulder. Replace. Alternate. Keep hips completely square — no rocking side to side.", muscles: ["abs", "frontDelt", "oblique"] },
      { name: "Bicycle Crunch", diff: 3, desc: "Lie face-up, hands behind head. Bring one knee to chest while rotating opposite elbow toward it. Slow and deliberate, no yanking neck.", muscles: ["abs", "hipFlexor", "oblique"] },
      { name: "Knee Raises", diff: 3, desc: "Hang from a bar or lie flat. Bring knees toward chest by curling pelvis up, not just swinging legs. Lower with control.", muscles: ["abs", "forearm", "hipFlexor", "oblique"] },
      { name: "L-Sit Hold", diff: 5, desc: "Palms on floor or parallel bars, lift body off ground with legs extended straight in front. Hold. Brutal on abs and quads.", muscles: ["abs", "hipFlexor", "oblique", "quad", "tricep"] },
    ],
  },
];
