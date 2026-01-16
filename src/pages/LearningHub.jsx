import { useMemo, useState } from "react";
import Navigation from "../components/Navigation";

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
        url: "#", // replace with text page route or file later
      },
    ],
    []
  );

  const [flippedIndex, setFlippedIndex] = useState(null);
  const toggleFlip = (idx) => setFlippedIndex((prev) => (prev === idx ? null : idx));

  return (
    <div className="container">
      <Navigation />

      <div className="card">
        <h1>Learning Hub</h1>
        <p className="small">
          Tap a card to flip. Front = quick hint, Back = explanation. 
        </p>
      </div>

      
      <div className="flip-grid">
        {cards.map((c, idx) => (
          <button
            key={idx}
            type="button"
            className={`flip-card ${flippedIndex === idx ? "is-flipped" : ""}`}
            onClick={() => toggleFlip(idx)}
            aria-label={`Flip card: ${c.title}`}
          >
            <div className="flip-inner">
             
              <div className="flip-face flip-front">
                <div>
                  <h3 className="flip-title">{c.title}</h3>
                  <p className="small" style={{ margin: 0 }}>
                    {c.hint}
                  </p>
                </div>
                <div className="flip-bottom small">Tap to flip ↺</div>
              </div>

              
              <div className="flip-face flip-back">
                <div>
                  <h3 className="flip-title">{c.title}</h3>
                  <pre className="flip-text">{c.back}</pre>
                </div>
                <div className="flip-bottom small">Tap to go back ↩</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      
      <div className="card" style={{ marginTop: 18 }}>
        <div className="row">
          <h2 style={{ marginBottom: 0 }}>Teacher Added Lessons</h2>
          <span className="badge">Template</span>
        </div>

        <p className="small" style={{ marginTop: 8 }}>
          This area will show lessons uploaded by teachers (PDF or text documents).
        </p>

        <div className="lesson-list">
          {teacherLessons.map((l) => (
            <div key={l.id} className="lesson-item">
              <div className="lesson-meta">
                <div className="lesson-title">{l.title}</div>
                <div className="lesson-sub small">
                  {l.teacher ? `By: ${l.teacher}` : "By: (Teacher)"}
                  {" • "}
                  {l.type.toUpperCase()}
                </div>
              </div>

              <a className="btn lesson-btn" href={l.url} target="_blank" rel="noreferrer">
                Open {l.type === "pdf" ? "PDF" : "Lesson"}
              </a>
            </div>
          ))}
        </div>

        
      </div>

      
      <div className="reviewer-card">
        <div className="row">
          <h2 style={{ marginBottom: 0 }}>Quick Reviewer</h2>
          <span className="badge">Krebs Cycle</span>
        </div>

        <div className="reviewer-content">
          <ul className="reviewer-list">
            <li><b>After Glycolysis:</b> Cells use aerobic respiration (with oxygen) to get MORE energy, mainly in mitochondria.</li>
            <li><b>Pyruvate Prep:</b> Pyruvate (from glycolysis) is converted to acetyl-CoA to enter the next stage.</li>
            <li>
              <b>Pyruvate Breakdown (3 Steps):</b>
              <ol>
                <li><b>Decarboxylation:</b> Remove a carbon (as CO₂).</li>
                <li><b>Oxidation:</b> Remove electrons to make NADH.</li>
                <li><b>Acetyl-CoA Formation:</b> Attach Coenzyme A.</li>
              </ol>
              <div className="small">✅ This happens <b>TWICE</b> per glucose molecule.</div>
            </li>
            <li><b>Krebs Cycle (Citric Acid Cycle):</b> Occurs in the mitochondrial matrix.</li>
            <li><b>Goal:</b> Extract high-energy electrons and release CO₂.</li>
            <li><b>Step 1 (Citrate Formation):</b> Acetyl-CoA (2C) + Oxaloacetate (4C) → Citrate (6C). This is a key regulated step.</li>
            <li><b>Step 2 (Isomerization):</b> Citrate is rearranged.</li>
            <li><b>Step 3 (Oxidation/Decarboxylation):</b> Citrate → α-ketoglutarate (5C), releasing CO₂, and making NADH.</li>
            <li><b>Step 4 (Oxidation/Decarboxylation):</b> α-ketoglutarate → Succinyl-CoA (4C), releasing CO₂, and making NADH.</li>
            <li><b>Takeaway:</b> This cycle systematically breaks down fuel molecules, capturing energy as NADH and releasing CO₂.</li>
          </ul>

          <hr className="reviewer-divider" />

          <ul className="reviewer-list">
            <li><b>What it is:</b> The Krebs Cycle (Citric Acid Cycle) is a central part of cellular respiration happening in the mitochondrial matrix.</li>
            <li><b>Main Goal:</b> Generate ATP and crucial electron carriers (NADH & FADH₂) for the Electron Transport Chain.</li>
            <li><b>Inputs:</b> Acetyl-CoA (2C) joins Oxaloacetate (4C) to form Citrate (6C).</li>
            <li><b>Key Outputs (per turn):</b> 3 NADH, 1 FADH₂, 1 ATP (or GTP), and 2 CO₂.</li>
            <li><b>Overall Yield (per glucose):</b> 6 NADH, 2 FADH₂, 2 ATP, 4 CO₂.</li>
            <li><b>Why it matters:</b> Produces the “fuel” (electron carriers) for massive ATP production, even though it doesn’t directly use oxygen.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
