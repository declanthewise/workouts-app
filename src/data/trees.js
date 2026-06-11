// Progressions from the r/bodyweightfitness Recommended Routine.
// Order: 6 strength pairs (Pull-up/Squat, Dip/Hinge, Row/Push-up) then 3 core.
// `equipment` (CNF — see data/equipment.js) gates a node until the user confirms
// they own the gear; nodes without it are bodyweight and always available.
export const TREES = [
  {
    id: "pullup",
    name: "Pull-up",
    color: "#6a85a0",
    nodes: [
      { name: "Scapular Pulls", equipment: [["bar"]], steps: [
        "Hang from the bar with straight arms.",
        "Without bending your elbows, pull your shoulder blades down and together.",
        "Release slowly back to a dead hang.",
      ] },
      { name: "Arch Hangs", equipment: [["bar"]], steps: [
        "Hang from the bar, shoulders active.",
        "Pull your chest toward the bar without bending your elbows.",
        "Hold the arched position, then lower under control.",
      ] },
      { name: "Negative Pull-ups", equipment: [["bar"]], steps: [
        "Jump or step up so your chin is over the bar.",
        "Lower yourself as slowly as possible — aim for 5+ seconds.",
        "Reset and repeat.",
      ] },
      { name: "Band-assisted Pull-ups", equipment: [["bar"], ["band"]], steps: [
        "Loop a resistance band over the bar and step (or kneel) into it.",
        "Pull until your chin clears the bar, letting the band help at the bottom.",
        "Lower under control. Use a thinner band as you get stronger.",
      ] },
      { name: "Pull-ups", equipment: [["bar"]], steps: [
        "Hang from the bar, hands just wider than shoulders.",
        "Pull until your chin clears the bar.",
        "Lower under control to a full dead hang.",
      ] },
      { name: "Weighted Pull-ups", equipment: [["bar"]], steps: [
        "Add load via a dip belt or dumbbell held between the feet.",
        "Pull until your chin clears the bar.",
        "Lower under control to a full dead hang.",
      ] },
    ],
  },
  {
    id: "squat",
    name: "Squat",
    color: "#6a85a0",
    nodes: [
      { name: "Assisted Squat", steps: [
        "Hold a doorframe or sturdy post for light support.",
        "Sit back and down until hips drop below knees.",
        "Stand up using as little assistance as possible.",
      ] },
      { name: "Squat", steps: [
        "Stand with feet roughly shoulder-width, toes slightly out.",
        "Sit back and down until hips drop below knees, chest up.",
        "Drive through mid-foot to stand.",
      ] },
      { name: "Split Squat", steps: [
        "Step one foot forward, the other back; rear heel lifted.",
        "Lower straight down until the rear knee grazes the floor.",
        "Drive up through the front heel. Switch legs.",
      ] },
      { name: "Bulgarian Split Squat", steps: [
        "Place the top of your rear foot on a bench behind you.",
        "Lower until the front thigh is parallel to the floor.",
        "Push through the front heel to stand. Switch legs.",
      ] },
      { name: "Beginner Shrimp Squat", steps: [
        "Grab one foot behind you with the same-side hand.",
        "Squat down on the standing leg, tapping the rear knee to the floor.",
        "Stand back up under control. Switch sides.",
      ] },
      { name: "Intermediate Shrimp Squat", steps: [
        "Grab the rear foot with the opposite hand behind your back.",
        "Squat down, tapping the rear knee lightly to the floor.",
        "Return to standing. Switch sides.",
      ] },
      { name: "Advanced Shrimp Squat", steps: [
        "Hold the rear foot with both hands at the small of your back.",
        "Squat down until the rear knee taps the floor.",
        "Stand back up. Switch sides.",
      ] },
    ],
  },
  {
    id: "dip",
    name: "Dip",
    color: "#7f9870",
    nodes: [
      { name: "Parallel Bar Support Hold", equipment: [["parallettes", "rings"]], steps: [
        "Grip parallel bars, press up to fully straight arms.",
        "Pack shoulders down, brace core, point toes.",
        "Hold for time.",
      ] },
      { name: "Negative Dips", equipment: [["parallettes", "rings"]], steps: [
        "Start at the top with straight arms.",
        "Lower slowly until shoulders dip below elbows — aim for 3–5 seconds.",
        "Use legs to return to the top and repeat.",
      ] },
      { name: "Parallel Bar Dips", equipment: [["parallettes", "rings"]], steps: [
        "Support yourself on parallel bars, arms straight.",
        "Lower until shoulders drop below elbows.",
        "Press back up to fully straight arms.",
      ] },
      { name: "Ring Dips", equipment: [["rings"]], steps: [
        "Support on rings with arms straight, rings turned slightly out.",
        "Lower until shoulders drop below elbows, keeping rings close.",
        "Press up and turn the rings outward at the top.",
      ] },
    ],
  },
  {
    id: "hinge",
    name: "Hinge",
    color: "#7f9870",
    nodes: [
      { name: "Romanian Deadlift", equipment: [["weight"]], steps: [
        "Stand holding a weight, feet hip-width, slight knee bend.",
        "Hinge at the hips, pushing them back, keeping the back flat.",
        "Drive hips forward to stand, squeezing glutes at the top.",
      ] },
      { name: "Single-Leg Deadlift", steps: [
        "Stand on one leg with a slight knee bend.",
        "Hinge forward, extending the free leg straight behind for counterbalance.",
        "Return to standing. Switch legs.",
      ] },
      { name: "Banded Nordic Curl", equipment: [["band"]], steps: [
        "Kneel with ankles anchored; loop a band across your chest, anchored in front.",
        "Keeping hips extended, lower torso toward the floor.",
        "Pull with your hamstrings to return upright.",
      ] },
      { name: "Nordic Curl", steps: [
        "Kneel with ankles anchored, body straight from knees up.",
        "Lower slowly toward the floor, resisting with your hamstrings.",
        "Catch with your hands and push back up to start.",
      ] },
    ],
  },
  {
    id: "row",
    name: "Row",
    color: "#b08a68",
    nodes: [
      { name: "Vertical Rows", equipment: [["bar", "rings"]], steps: [
        "Grip a bar at chest height, lean back slightly with feet close.",
        "Keeping body rigid, pull chest toward your hands.",
        "Lower under control, arms fully straight.",
      ] },
      { name: "Incline Rows", equipment: [["bar", "rings"]], steps: [
        "Grip a bar or rings at about hip height, body inclined.",
        "Pull chest to the bar, squeezing shoulder blades together.",
        "Lower slowly, arms fully extended.",
      ] },
      { name: "Horizontal Rows", equipment: [["bar", "rings"]], steps: [
        "Set bar or rings so your body is parallel to the floor when hanging.",
        "Pull chest to your hands while keeping the body rigid.",
        "Lower under control to straight arms.",
      ] },
      { name: "Wide Rows", equipment: [["bar", "rings"]], steps: [
        "Grip the bar or rings wider than shoulder-width, body horizontal.",
        "Pull with elbows flared out to around 90°.",
        "Lower slowly, arms fully extended.",
      ] },
      { name: "Archer Rows", equipment: [["rings"]], steps: [
        "Hang from rings with body horizontal.",
        "Pull toward one ring while the other arm straightens out to the side.",
        "Lower with control, then repeat to the opposite side.",
      ] },
    ],
  },
  {
    id: "pushup",
    name: "Push-up",
    color: "#b08a68",
    nodes: [
      { name: "Wall Push-ups", steps: [
        "Stand facing a wall, hands on the wall at shoulder height.",
        "Bend your elbows to bring your chest to the wall.",
        "Press back to straight arms.",
      ] },
      { name: "Incline Push-ups", steps: [
        "Place hands on a raised surface (bench, counter), body straight.",
        "Lower chest to the surface, elbows at roughly 45°.",
        "Press back up to straight arms.",
      ] },
      { name: "Full Push-ups", steps: [
        "Hands shoulder-width on the floor, body rigid from head to heels.",
        "Lower until chest is just off the floor, elbows at ~45°.",
        "Press back up to straight arms.",
      ] },
      { name: "Diamond Push-ups", steps: [
        "Place hands close together under the chest, thumbs and index fingers touching.",
        "Lower chest toward your hands, elbows tracking along your sides.",
        "Press back up to straight arms.",
      ] },
      { name: "Pseudo Planche Push-ups", steps: [
        "Hands at hip level with fingers pointing back, shoulders leaned forward over your hands.",
        "Lower while maintaining the forward lean.",
        "Press up, keeping the lean throughout.",
      ] },
    ],
  },
  {
    id: "antiExtension",
    name: "Anti-Extension",
    color: "#9b8d7a",
    nodes: [
      { name: "Plank", steps: [
        "Forearms on the floor, elbows under shoulders, body straight.",
        "Squeeze glutes and brace abs so your hips don't sag or pike.",
        "Hold for time, breathing normally.",
      ] },
      { name: "Ring Ab Rollouts", equipment: [["rings"]], steps: [
        "Kneel holding rings at shoulder height, arms straight.",
        "Roll the rings forward overhead, body straight.",
        "Pull the rings back in with your abs.",
      ] },
      { name: "Ab Wheel Rollouts", equipment: [["abwheel"]], steps: [
        "Kneel holding an ab wheel, arms straight.",
        "Roll forward as far as you can keep a flat back.",
        "Contract your abs to roll back to the start.",
      ] },
    ],
  },
  {
    id: "antiRotation",
    name: "Anti-Rotation",
    color: "#9b8d7a",
    nodes: [
      { name: "Banded Pallof Press", equipment: [["band"]], steps: [
        "Stand side-on to an anchored band, holding it at your chest with both hands.",
        "Press the band straight out, resisting the twist toward the anchor.",
        "Return slowly to your chest. Switch sides.",
      ] },
      { name: "Ring Pallof Press", equipment: [["rings"]], steps: [
        "Kneel or stand perpendicular to a ring anchor, holding one ring at chest.",
        "Press the ring straight out, resisting body rotation.",
        "Return under control. Switch sides.",
      ] },
    ],
  },
  {
    id: "extension",
    name: "Extension",
    color: "#9b8d7a",
    nodes: [
      { name: "Reverse Hyperextension", steps: [
        "Lie face-down on a bench with hips at the edge, legs hanging.",
        "Raise legs to slightly above parallel, squeezing the glutes.",
        "Lower under control.",
      ] },
      { name: "Glute-Ham Raise", steps: [
        "Kneel with ankles anchored, thighs supported on a pad.",
        "Lower your upper body toward the floor, hinging at the knees with hips extended.",
        "Contract hamstrings and glutes to return upright.",
      ] },
    ],
  },
];
