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
