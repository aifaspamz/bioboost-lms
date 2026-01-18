export const krebsSteps = [
    { id: 1, name: "Citrate Formation", molecules: ["Acetyl-CoA", "Oxaloacetate", "Citrate"], energy: "—" },
    { id: 2, name: "Isomerization", molecules: ["Citrate", "Isocitrate"], energy: "—" },
    { id: 3, name: "1st Oxidation", molecules: ["Isocitrate", "α-Ketoglutarate", "CO₂"], energy: "+ NADH" },
    { id: 4, name: "2nd Oxidation", molecules: ["α-Ketoglutarate", "Succinyl-CoA", "CO₂"], energy: "+ NADH" },
    { id: 5, name: "Substrate-level phosphorylation", molecules: ["Succinyl-CoA", "Succinate"], energy: "+ ATP (or GTP)" },
    { id: 6, name: "Oxidation", molecules: ["Succinate", "Fumarate"], energy: "+ FADH₂" },
    { id: 7, name: "Hydration", molecules: ["Fumarate", "Malate"], energy: "—" },
    { id: 8, name: "3rd Oxidation", molecules: ["Malate", "Oxaloacetate"], energy: "+ NADH" },
  ];
  
  export const gameQuestions = [
    { question: "What molecule is formed in Step 1?", options: ["Citrate", "Malate", "Fumarate", "Succinate"], answer: "Citrate" },
    { question: "Which step produces FADH₂?", options: ["Step 3", "Step 6", "Step 8", "Step 2"], answer: "Step 6" },
    { question: "What comes after Citrate?", options: ["Isocitrate", "Malate", "Oxaloacetate", "Succinate"], answer: "Isocitrate" },
    { question: "How many CO₂ are released per cycle?", options: ["0", "1", "2", "3"], answer: "2" },
    { question: "Which molecule is regenerated at the end?", options: ["Citrate", "Oxaloacetate", "Succinyl-CoA", "Acetyl-CoA"], answer: "Oxaloacetate" },
    { question: "Which step produces ATP (or GTP)?", options: ["Step 5", "Step 6", "Step 1", "Step 8"], answer: "Step 5" },
    { question: "Step 3 produces which electron carrier?", options: ["FADH₂", "ATP", "NADH", "CO₂"], answer: "NADH" },
    { question: "Malate converts into what at Step 8?", options: ["Citrate", "Oxaloacetate", "Succinate", "Fumarate"], answer: "Oxaloacetate" },
    { question: "Succinate converts into what at Step 6?", options: ["Fumarate", "Malate", "Citrate", "Isocitrate"], answer: "Fumarate" },
    { question: "Where does Krebs Cycle happen?", options: ["Nucleus", "Mitochondrial matrix", "Ribosome", "Cell membrane"], answer: "Mitochondrial matrix" },
  ];
  
  export const quizQuestions = [
    { id: 1, type: "mcq", question: "How many NADH are produced per Krebs cycle?", options: ["1", "2", "3", "4"], answer: "3", explanation: "Krebs cycle produces 3 NADH per turn." },
    { id: 2, type: "tf", question: "Krebs cycle occurs in the mitochondrial matrix.", answer: "true", explanation: "It mainly occurs in the mitochondrial matrix (eukaryotes)." },
    { id: 3, type: "mcq", question: "Which step produces FADH₂?", options: ["Step 2", "Step 5", "Step 6", "Step 8"], answer: "Step 6", explanation: "Succinate → Fumarate produces FADH₂." },
    { id: 4, type: "tf", question: "Two CO₂ molecules are released per cycle.", answer: "true", explanation: "Decarboxylation happens twice (Steps 3 and 4)." },
    { id: 5, type: "mcq", question: "Which molecule is regenerated at the end?", options: ["Citrate", "Oxaloacetate", "Malate", "Succinate"], answer: "Oxaloacetate", explanation: "Oxaloacetate is regenerated at Step 8." },
    { id: 6, type: "mcq", question: "ATP (or GTP) is produced at:", options: ["Step 3", "Step 4", "Step 5", "Step 7"], answer: "Step 5", explanation: "Succinyl-CoA → Succinate yields ATP/GTP." },
    { id: 7, type: "tf", question: "Citrate is formed from Acetyl-CoA + Oxaloacetate.", answer: "true", explanation: "That is Step 1 of the cycle." },
    { id: 8, type: "mcq", question: "Succinate converts to:", options: ["Malate", "Fumarate", "Isocitrate", "Citrate"], answer: "Fumarate", explanation: "Succinate → Fumarate is Step 6." },
    { id: 9, type: "tf", question: "Krebs cycle produces 2 NADH only.", answer: "false", explanation: "It produces 3 NADH per cycle." },
    { id: 10, type: "mcq", question: "How many CO₂ per cycle?", options: ["1", "2", "3", "4"], answer: "2", explanation: "Two CO₂ are released per cycle." },
  ];
  