import { useMemo, useState } from "react";
import Navigation from "../components/Navigation";

// Images
import explanation1 from "../assets/explanation 1.png";
import explanation2 from "../assets/explanation 2.png";
import explanation4 from "../assets/explanation 4.png";
import explanation8 from "../assets/explanation 8.png";

export default function LearningHub() {
  const cards = useMemo(
    () => [
      {
        title: "After Glycolysis",
        hint: "What happens next?",
        back: `Cells use aerobic respiration (with oxygen) to get MORE energy, mainly in mitochondria.`,
      },
      {
        title: "Pyruvate Prep",
        hint: "Bridge step",
        back: `Pyruvate (from glycolysis) is converted to acetyl-CoA to enter the next stage.`,
      },
      {
        title: "Pyruvate Breakdown",
        hint: "3 steps • happens twice per glucose",
        back: `1) Decarboxylation: Remove a carbon as CO₂
2) Oxidation: Remove electrons to form NADH
3) Acetyl-CoA Formation: Attach Coenzyme A

✅ This happens TWICE per glucose molecule.`,
      },
      {
        title: "Krebs Cycle Location",
        hint: "Where does it occur?",
        back: `Krebs Cycle (Citric Acid Cycle) occurs in the mitochondrial matrix.`,
      },
      {
        title: "Main Goal",
        hint: "Why it exists",
        back: `Extract high-energy electrons and release CO₂ (waste).`,
      },
      {
        title: "Step 1: Citrate Formation",
        hint: "2C + 4C → 6C",
        back: `Acetyl-CoA (2C) + Oxaloacetate (4C) → Citrate (6C).
This is a key regulated step.`,
      },
      {
        title: "Step 2: Isomerization",
        hint: "Rearrangement step",
        back: `Citrate is rearranged into a different form (isocitrate).`,
      },
      {
        title: "Step 3: Oxidation/Decarboxylation",
        hint: "CO₂ + NADH produced",
        back: `Citrate → α-ketoglutarate (5C), releasing CO₂, and making NADH.`,
      },
      {
        title: "Step 4: Oxidation/Decarboxylation",
        hint: "CO₂ + NADH produced again",
        back: `α-ketoglutarate → Succinyl-CoA (4C), releasing CO₂, and making NADH.`,
      },
      {
        title: "Key Outputs (Per Turn)",
        hint: "Main results",
        back: `Per turn of the cycle:
• 3 NADH
• 1 FADH₂
• 1 ATP (or GTP)
• 2 CO₂`,
      },
      {
        title: "Overall Yield (Per Glucose)",
        hint: "Double because 2 acetyl-CoA",
        back: `Per glucose molecule:
• 6 NADH
• 2 FADH₂
• 2 ATP
• 4 CO₂`,
      },
      {
        title: "Why It Matters",
        hint: "Fuel for ETC",
        back: `Krebs Cycle produces NADH & FADH₂ which power the Electron Transport Chain (ETC).
It doesn’t directly use oxygen, but it depends on oxygen overall to keep the system running.`,
      },
    ],
    []
  );

  const teacherLessons = useMemo(
    () => [
      {
        id: "t1",
        title: "Krebs Cycle Overview (PDF)",
        teacher: "Teacher Ladielyn",
        type: "pdf",
        url: "#",
      },
      {
        id: "t2",
        title: "Step-by-Step Notes (Text Document)",
        teacher: "Teacher Name (Sample)",
        type: "text",
        url: "#",
      },
    ],
    []
  );

  const discussion = useMemo(
    () => [
      {
        title: "KREBS CYCLE",
        body: `The Krebs cycle, also called the citric acid cycle, is an important stage of cellular respiration that produces energy for the cell.
It takes place in the mitochondrial matrix and occurs in the presence of oxygen.`,
        img: explanation1,
      },
      {
        title: "DISCOVERY",
        body: `This cycle was discovered by Hans Krebs, a German-British biochemist.`,
        img: explanation2,
      },
      {
        title: "PURPOSE",
        body: `The main purpose of the Krebs cycle is to produce ATP and high-energy electron carriers (NADH and FADH₂) that will be used later in the electron transport chain to make more ATP.`,
      },
      {
        title: "PREPARATORY STEP",
        body: `When oxygen is available, cells continue aerobic respiration after glycolysis. Before entering the Krebs cycle, pyruvate must first be converted into acetyl-CoA.`,
        img: explanation4,
      },
      {
        title: "BREAKDOWN OF PYRUVATE",
        body: `1. Decarboxylation – CO₂ released
2. Oxidation – NADH formed
3. Acetyl-CoA Formation – enters Krebs cycle`,
      },
      {
        title: "IMPORTANCE OF THE KREBS CYCLE",
        body: `• Produces electron carriers (NADH and FADH₂)
• Releases CO₂ as waste
• Central to energy production
• Depends on oxygen indirectly`,
        img: explanation8,
      },
    ],
    []
  );

  const [flippedIndex, setFlippedIndex] = useState(null);

  return (
    <div className="container">
      <Navigation />

      {/* ================= DISCUSSION (TOP) ================= */}
      <div className="card">
        <h1>Learning Hub</h1>
        <p className="small">
          Study the discussion first, then use the interactive cards below to review.
        </p>
      </div>

      <div className="card discussion-section">
        <div className="row">
          <h2>Discussion</h2>
          <span className="badge">Krebs Cycle</span>
        </div>

        <div className="discussion-block">
          {discussion.map((d, i) => (
            <div key={i} className="card discussion-card">
              {d.title && <h3>{d.title}</h3>}

              {d.img && (
                <img
                  src={d.img}
                  alt={d.title}
                  className="discussion-img"
                />
              )}

              <pre className="discussion-text">{d.body}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* ================= TEACHER LESSONS ================= */}
      <div className="card">
        <h2>Teacher Added Lessons</h2>
        <div className="lesson-list">
          {teacherLessons.map((l) => (
            <div key={l.id} className="lesson-item">
              <div>
                <div className="lesson-title">{l.title}</div>
                <div className="lesson-sub small">
                  By {l.teacher} • {l.type.toUpperCase()}
                </div>
              </div>
              <a className="btn" href={l.url}>Open</a>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
}
