// Simple, apartment-friendly equipment that gates certain progression tiles.
// Order roughly by value: rings are the single highest-leverage buy.
// `article` is the grammatical article for use mid-sentence ("" for plurals).
export const EQUIPMENT = [
  { id: "bar", name: "Pull-up bar", article: "a", blurb: "A doorway or wall-mounted bar." },
  { id: "rings", name: "Gymnastic rings", article: "", blurb: "Adjustable straps you can hang high or set low." },
  { id: "parallettes", name: "Parallettes", article: "", blurb: "Low push-up bars for dips and support holds." },
  { id: "band", name: "Resistance band", article: "a", blurb: "A long loop band for assisted pull-ups and presses." },
  { id: "abwheel", name: "Ab wheel", article: "an", blurb: "A wheel with handles for rollouts." },
  { id: "weight", name: "Dumbbell or kettlebell", article: "a", blurb: "Any single free weight." },
];

export const EQUIPMENT_NAME = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e.name]));
export const EQUIPMENT_ARTICLE = Object.fromEntries(EQUIPMENT.map((e) => [e.id, e.article]));
export const EQUIPMENT_IDS = new Set(EQUIPMENT.map((e) => e.id));

// A node's `equipment` is in conjunctive normal form: an array of groups. Each
// group is satisfied when the user owns at least one item in it, and the node is
// unlocked only when EVERY group is satisfied. So [["bar","rings"]] means "bar or
// rings", while [["bar"],["band"]] means "bar and band". Absent/empty = bodyweight.
export function nodeUnlocked(node, owned) {
  const req = node.equipment;
  if (!req || req.length === 0) return true;
  return req.every((group) => group.some((id) => owned.has(id)));
}

// Distinct equipment ids referenced anywhere in a node's requirement.
export function nodeEquipmentIds(node) {
  if (!node.equipment) return [];
  return [...new Set(node.equipment.flat())];
}

// The requirement groups a node still doesn't satisfy for the given equipment —
// what the user actually needs to confirm to unlock it.
export function unmetGroups(node, owned) {
  const req = node.equipment;
  if (!req) return [];
  return req.filter((group) => !group.some((id) => owned.has(id)));
}
