import type { DataRow } from '../types/index';
import { generateStartupMetrics, generateExoplanets, generateFitnessTracker } from './generateDemoData';

export interface DemoDataset {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  generate: () => DataRow[];
}

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: 'startups',
    name: 'Startup Metrics',
    description: 'Series B companies in Asia outperform — 300 startups across 5 regions',
    rowCount: 300,
    generate: generateStartupMetrics,
  },
  {
    id: 'exoplanets',
    name: 'Exoplanets',
    description: 'Hot Jupiters cluster separately from rocky planets — 400 discovered worlds',
    rowCount: 400,
    generate: generateExoplanets,
  },
  {
    id: 'fitness',
    name: 'Fitness Tracker',
    description: 'Weekend warriors vs daily athletes — 250 workout sessions',
    rowCount: 250,
    generate: generateFitnessTracker,
  },
];
