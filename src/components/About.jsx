export default function About() {
  return (
    <div style={{
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "18px 22px 12px",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "14px",
      lineHeight: 1.55,
      color: "#3a352e",
    }}>
      <p style={{ margin: "0 0 16px", color: "#5a5248" }}>
        Homebody is a visual cheat sheet for the{" "}
        <a
          href="https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#6a85a0", textDecoration: "underline" }}
        >
          r/bodyweightfitness Recommended Routine
        </a>
        {" "}— a beginner-friendly calisthenics program you can run at home with minimal equipment.
      </p>

      <Section title="The routine">
        Three days per week, about 60 minutes per session. After a 5–10 minute warm-up, you alternate through three strength pairs and finish with a core triplet.
      </Section>

      <Section title="Strength pairs">
        <ul style={listStyle}>
          <li>Pull-up &amp; Squat</li>
          <li>Dip &amp; Hinge</li>
          <li>Row &amp; Push-up</li>
        </ul>
        Alternate the two exercises in a pair so one muscle group rests while the other works.
      </Section>

      <Section title="Core triplet">
        <ul style={listStyle}>
          <li>Anti-extension (e.g. plank, ab rollouts)</li>
          <li>Anti-rotation (e.g. Pallof press)</li>
          <li>Extension (e.g. reverse hyperextension)</li>
        </ul>
      </Section>

      <Section title="Reps, tempo, rest">
        3 sets of 5–8 reps per exercise. Stop one rep before failure. Control the descent (~1 second) and drive up explosively. Rest 90 seconds between strength exercises, 60 between core.
      </Section>

      <Section title="Progression">
        When you can comfortably hit the top of the rep range with good form across all sets, move to the next tile in the row. Progress is earned by graduating to a harder variation, not by adding weight.
      </Section>
    </div>
  );
}

const listStyle = {
  margin: "6px 0 10px",
  paddingLeft: "20px",
  color: "#5a5248",
};

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: "18px" }}>
      <h3 style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10.5px",
        fontWeight: 700,
        letterSpacing: "1.2px",
        textTransform: "uppercase",
        color: "#a09888",
        margin: "0 0 6px",
      }}>
        {title}
      </h3>
      <div style={{ color: "#5a5248" }}>{children}</div>
    </section>
  );
}
