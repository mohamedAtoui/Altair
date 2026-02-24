import type { DataRow } from '../types/index';

// ── Deterministic PRNG (Park–Miller) ────────────────────────────────
function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────
function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function between(rng: () => number, lo: number, hi: number): number {
  return lo + rng() * (hi - lo);
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

// ── 1. Startup Metrics ──────────────────────────────────────────────
export function generateStartupMetrics(count = 300): DataRow[] {
  const rng = seededRandom(42);
  const regions = ['Asia', 'Europe', 'North America', 'South America', 'Africa'];
  const stages = ['Seed', 'Series A', 'Series B', 'Series C'];
  const categories = ['SaaS', 'Fintech', 'HealthTech', 'EdTech', 'CleanTech'];

  const rows: DataRow[] = [];

  for (let i = 0; i < count; i++) {
    const region = pick(rng, regions);
    const funding_stage = pick(rng, stages);
    const category = pick(rng, categories);

    let revenue = Math.round(between(rng, 10000, 5000000));
    let growth_rate = Math.round(between(rng, -10, 80) * 100) / 100;
    const employees = Math.round(between(rng, 5, 5000));

    // Pattern: Series B + Asia outperform
    if (funding_stage === 'Series B' && region === 'Asia') {
      revenue = Math.round(revenue * 1.8);
      growth_rate = Math.round(growth_rate * 1.4 * 100) / 100;
    }

    // Outliers: a few companies with 10x revenue
    if (i % 75 === 0) {
      revenue = Math.round(revenue * 10);
    }

    rows.push({
      company_name: `Company_${pad(i + 1, 3)}`,
      revenue,
      growth_rate,
      employees,
      region,
      funding_stage,
      category,
    });
  }

  return rows;
}

// ── 2. Exoplanets ───────────────────────────────────────────────────
export function generateExoplanets(count = 400): DataRow[] {
  const rng = seededRandom(123);
  const starTypes = ['M', 'K', 'G', 'F', 'A', 'B'];
  const methods = ['Transit', 'Radial Velocity', 'Direct Imaging', 'Microlensing'];

  const rows: DataRow[] = [];

  for (let i = 0; i < count; i++) {
    let mass = Math.round(between(rng, 0.01, 20) * 100) / 100;
    let radius = Math.round(between(rng, 0.3, 15) * 100) / 100;
    let orbital_period = Math.round(between(rng, 0.5, 1000) * 100) / 100;
    let temperature = Math.round(between(rng, 200, 3000));
    const star_type = pick(rng, starTypes);
    const discovery_method = pick(rng, methods);

    // Hot Jupiters cluster: high mass + short period
    if (mass > 5 && orbital_period < 10) {
      temperature = Math.round(between(rng, 1500, 3000));
      radius = Math.round(between(rng, 8, 15) * 100) / 100;
    }

    // Rocky planets cluster: low mass + small radius
    if (mass < 1) {
      radius = Math.round(between(rng, 0.3, 3) * 100) / 100;
    }

    rows.push({
      planet_name: `Exo-${pad(i + 1, 4)}`,
      mass,
      radius,
      orbital_period,
      temperature,
      star_type,
      discovery_method,
    });
  }

  return rows;
}

// ── 4. Knowledge Concepts ───────────────────────────────────────────
export function generateKnowledgeConcepts(count = 80): DataRow[] {
  const rng = seededRandom(2024);

  const concepts: { concept: string; domain: string; importance: number; year: number; description: string }[] = [
    // Interfaces
    { concept: 'Gestural Input', domain: 'Interfaces', importance: 9, year: 2010, description: 'Direct manipulation through body movement' },
    { concept: 'Haptic Feedback', domain: 'Interfaces', importance: 8, year: 2012, description: 'Tactile response to digital interaction' },
    { concept: 'Spatial Computing', domain: 'Interfaces', importance: 10, year: 2023, description: 'Computing that blends digital and physical space' },
    { concept: 'Voice Interface', domain: 'Interfaces', importance: 7, year: 2014, description: 'Natural language as primary input modality' },
    { concept: 'Brain-Computer Interface', domain: 'Interfaces', importance: 9, year: 2020, description: 'Neural signals translated to digital commands' },
    { concept: 'Tangible UI', domain: 'Interfaces', importance: 6, year: 2008, description: 'Physical objects as digital controllers' },
    { concept: 'Gaze Tracking', domain: 'Interfaces', importance: 7, year: 2016, description: 'Eye movement as cursor and intent signal' },
    { concept: 'Adaptive Interface', domain: 'Interfaces', importance: 8, year: 2018, description: 'UI that reshapes to user behavior patterns' },
    { concept: 'Zero UI', domain: 'Interfaces', importance: 7, year: 2015, description: 'Invisible interfaces embedded in environment' },
    { concept: 'Multimodal Fusion', domain: 'Interfaces', importance: 9, year: 2021, description: 'Combining gesture, voice, and gaze simultaneously' },
    { concept: 'Kinesthetic Memory', domain: 'Interfaces', importance: 6, year: 2009, description: 'Muscle memory in interface interaction patterns' },
    { concept: 'Responsive Typography', domain: 'Interfaces', importance: 5, year: 2013, description: 'Text that adapts to context and reading conditions' },
    { concept: 'Micro-interactions', domain: 'Interfaces', importance: 7, year: 2014, description: 'Tiny animated feedback moments in UI' },
    { concept: 'Dark Patterns', domain: 'Interfaces', importance: 4, year: 2010, description: 'Deceptive UI designed to manipulate users' },
    { concept: 'Progressive Disclosure', domain: 'Interfaces', importance: 6, year: 2005, description: 'Revealing complexity gradually as needed' },
    { concept: 'Ambient Display', domain: 'Interfaces', importance: 7, year: 2017, description: 'Peripheral awareness through subtle visual cues' },

    // Cognition
    { concept: 'Cognitive Load Theory', domain: 'Cognition', importance: 9, year: 1988, description: 'Working memory limits shape learning design' },
    { concept: 'Distributed Cognition', domain: 'Cognition', importance: 8, year: 1995, description: 'Thinking spread across people, tools, environment' },
    { concept: 'Embodied Cognition', domain: 'Cognition', importance: 9, year: 2001, description: 'Body and movement shape abstract thought' },
    { concept: 'Attention Economy', domain: 'Cognition', importance: 7, year: 2006, description: 'Human attention as scarce economic resource' },
    { concept: 'Flow State', domain: 'Cognition', importance: 8, year: 1990, description: 'Optimal challenge-skill balance in experience' },
    { concept: 'Enactive Perception', domain: 'Cognition', importance: 7, year: 2004, description: 'Perception through active bodily engagement' },
    { concept: 'Cognitive Offloading', domain: 'Cognition', importance: 8, year: 2016, description: 'Using external tools to extend mental capacity' },
    { concept: 'Situated Learning', domain: 'Cognition', importance: 7, year: 1991, description: 'Knowledge constructed through contextual activity' },
    { concept: 'Mirror Neurons', domain: 'Cognition', importance: 6, year: 1996, description: 'Neural basis for learning through observation' },
    { concept: 'Metacognition', domain: 'Cognition', importance: 8, year: 2000, description: 'Thinking about thinking processes' },
    { concept: 'Sensory Integration', domain: 'Cognition', importance: 7, year: 2003, description: 'Brain combining multiple sensory inputs into unity' },
    { concept: 'Prospective Memory', domain: 'Cognition', importance: 5, year: 2007, description: 'Remembering to perform future intended actions' },
    { concept: 'Cognitive Flexibility', domain: 'Cognition', importance: 8, year: 2011, description: 'Switching between mental frameworks fluidly' },
    { concept: 'Pattern Recognition', domain: 'Cognition', importance: 9, year: 1998, description: 'Identifying structure in noisy information streams' },

    // Systems
    { concept: 'Network Topology', domain: 'Systems', importance: 9, year: 1969, description: 'Shape of connections determines system behavior' },
    { concept: 'Emergence', domain: 'Systems', importance: 10, year: 1972, description: 'Complex behavior arising from simple local rules' },
    { concept: 'Feedback Loops', domain: 'Systems', importance: 9, year: 1960, description: 'Circular causality amplifying or dampening change' },
    { concept: 'Scale-Free Networks', domain: 'Systems', importance: 8, year: 1999, description: 'Networks with power-law degree distribution' },
    { concept: 'Resilience Engineering', domain: 'Systems', importance: 7, year: 2006, description: 'Designing systems that adapt to unexpected failure' },
    { concept: 'Autopoiesis', domain: 'Systems', importance: 6, year: 1980, description: 'Self-creating and self-maintaining living systems' },
    { concept: 'Information Entropy', domain: 'Systems', importance: 8, year: 1948, description: 'Measuring uncertainty and disorder in data' },
    { concept: 'Graph Theory', domain: 'Systems', importance: 9, year: 1736, description: 'Mathematics of relationships and connections' },
    { concept: 'Swarm Intelligence', domain: 'Systems', importance: 7, year: 2001, description: 'Collective behavior of decentralized agents' },
    { concept: 'Chaos Theory', domain: 'Systems', importance: 7, year: 1963, description: 'Sensitivity to initial conditions in deterministic systems' },
    { concept: 'Cybernetics', domain: 'Systems', importance: 8, year: 1948, description: 'Study of control and communication in systems' },
    { concept: 'Complex Adaptive Systems', domain: 'Systems', importance: 9, year: 1994, description: 'Systems that learn and evolve through interaction' },

    // Culture
    { concept: 'Digital Literacy', domain: 'Culture', importance: 8, year: 2005, description: 'Ability to critically navigate digital information' },
    { concept: 'Participatory Design', domain: 'Culture', importance: 7, year: 1990, description: 'End users as co-creators of technology' },
    { concept: 'Open Source', domain: 'Culture', importance: 9, year: 1998, description: 'Collaborative transparent knowledge production' },
    { concept: 'Techno-Animism', domain: 'Culture', importance: 5, year: 2015, description: 'Attributing agency and spirit to technology' },
    { concept: 'Data Sovereignty', domain: 'Culture', importance: 8, year: 2018, description: 'Ownership rights over personal digital information' },
    { concept: 'Algorithmic Bias', domain: 'Culture', importance: 9, year: 2016, description: 'Systematic discrimination embedded in code' },
    { concept: 'Digital Commons', domain: 'Culture', importance: 7, year: 2003, description: 'Shared digital resources governed collectively' },
    { concept: 'Memetic Evolution', domain: 'Culture', importance: 6, year: 1976, description: 'Cultural ideas spreading and mutating like genes' },
    { concept: 'Surveillance Capitalism', domain: 'Culture', importance: 8, year: 2019, description: 'Monetizing behavioral prediction from personal data' },
    { concept: 'Post-Digital', domain: 'Culture', importance: 5, year: 2013, description: 'Culture where digital is unremarkable background' },
    { concept: 'Maker Culture', domain: 'Culture', importance: 6, year: 2005, description: 'DIY ethos applied to technology and craft' },
    { concept: 'Speculative Design', domain: 'Culture', importance: 7, year: 2013, description: 'Design as tool for imagining alternative futures' },

    // Technology
    { concept: 'Neural Networks', domain: 'Technology', importance: 10, year: 2012, description: 'Layered computation inspired by biological neurons' },
    { concept: 'WebGL', domain: 'Technology', importance: 7, year: 2011, description: 'GPU-accelerated 3D graphics in web browsers' },
    { concept: 'Edge Computing', domain: 'Technology', importance: 8, year: 2019, description: 'Processing data near its source for speed' },
    { concept: 'Transformer Architecture', domain: 'Technology', importance: 10, year: 2017, description: 'Attention-based model revolutionizing AI' },
    { concept: 'WebAssembly', domain: 'Technology', importance: 7, year: 2017, description: 'Near-native performance code in browsers' },
    { concept: 'Federated Learning', domain: 'Technology', importance: 8, year: 2016, description: 'Training AI models without centralizing data' },
    { concept: 'Generative Adversarial Networks', domain: 'Technology', importance: 8, year: 2014, description: 'Two competing networks producing realistic outputs' },
    { concept: 'Diffusion Models', domain: 'Technology', importance: 9, year: 2020, description: 'Iterative denoising for high-quality generation' },
    { concept: 'Knowledge Graphs', domain: 'Technology', importance: 9, year: 2012, description: 'Structured representation of entity relationships' },
    { concept: 'Quantum Computing', domain: 'Technology', importance: 8, year: 2019, description: 'Harnessing quantum mechanics for computation' },
    { concept: 'Reinforcement Learning', domain: 'Technology', importance: 9, year: 2013, description: 'Agents learning through reward and exploration' },
    { concept: 'Digital Twin', domain: 'Technology', importance: 7, year: 2017, description: 'Virtual replica mirroring physical system state' },
    { concept: 'Homomorphic Encryption', domain: 'Technology', importance: 6, year: 2020, description: 'Computing on encrypted data without decrypting' },
    { concept: 'Vector Databases', domain: 'Technology', importance: 8, year: 2021, description: 'Storing and searching high-dimensional embeddings' },
    { concept: 'Mixture of Experts', domain: 'Technology', importance: 8, year: 2022, description: 'Routing to specialized sub-networks for efficiency' },
    { concept: 'Retrieval Augmented Generation', domain: 'Technology', importance: 9, year: 2023, description: 'Grounding AI outputs in retrieved knowledge' },
  ];

  const rows: DataRow[] = [];

  // Use defined concepts first
  for (let i = 0; i < Math.min(count, concepts.length); i++) {
    const c = concepts[i];
    rows.push({
      concept: c.concept,
      domain: c.domain,
      importance: c.importance,
      year: c.year,
      description: c.description,
    });
  }

  // Fill remaining with variations if count exceeds pre-defined
  const domains = ['Interfaces', 'Cognition', 'Systems', 'Culture', 'Technology'];
  const suffixes = ['Theory', 'Framework', 'Protocol', 'Model', 'Paradigm', 'Method'];
  for (let i = concepts.length; i < count; i++) {
    const domain = pick(rng, domains);
    rows.push({
      concept: `${domain} ${pick(rng, suffixes)} ${i}`,
      domain,
      importance: Math.round(between(rng, 3, 10)),
      year: Math.round(between(rng, 1980, 2024)),
      description: `Generated concept in ${domain.toLowerCase()} domain`,
    });
  }

  return rows;
}

// ── 3. Fitness Tracker ──────────────────────────────────────────────
export function generateFitnessTracker(count = 250): DataRow[] {
  const rng = seededRandom(77);
  const activities = ['Running', 'Cycling', 'Swimming', 'Yoga', 'HIIT'];
  const times = ['Morning', 'Afternoon', 'Evening', 'Night'];

  const rows: DataRow[] = [];

  for (let i = 0; i < count; i++) {
    const activity_type = pick(rng, activities);
    const time_of_day = pick(rng, times);

    let heart_rate = Math.round(between(rng, 60, 190));
    let calories = Math.round(between(rng, 100, 1200));
    const steps = Math.round(between(rng, 500, 25000));
    const duration = Math.round(between(rng, 10, 120));

    // Weekend warriors: Morning + HIIT/Running → boosted output
    if (time_of_day === 'Morning' && (activity_type === 'HIIT' || activity_type === 'Running')) {
      calories = Math.round(calories * 1.5);
      heart_rate = Math.round(heart_rate * 1.2);
    }

    // Daily athletes: Evening + Yoga → lower heart rate
    if (time_of_day === 'Evening' && activity_type === 'Yoga') {
      heart_rate = Math.round(heart_rate * 0.7);
    }

    rows.push({
      user_id: `User_${pad(i + 1, 3)}`,
      heart_rate,
      calories,
      steps,
      duration,
      activity_type,
      time_of_day,
    });
  }

  return rows;
}
