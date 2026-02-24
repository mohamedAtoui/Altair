import type { DataRow } from '../types/index';
import { generateKnowledgeConcepts, generateStartupMetrics, generateExoplanets, generateFitnessTracker } from './generateDemoData';

export interface DemoDataset {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  generate: () => DataRow[];
}

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: 'knowledge',
    name: 'Knowledge Concepts',
    description: 'Topology of ideas across Interfaces, Cognition, Systems, Culture & Technology',
    rowCount: 80,
    generate: generateKnowledgeConcepts,
  },
  {
    id: 'startups',
    name: 'Startup Metrics',
    description: 'Series B companies in Asia outperform — 200 startups across 5 regions',
    rowCount: 200,
    generate: () => generateStartupMetrics(200),
  },
  {
    id: 'exoplanets',
    name: 'Exoplanets',
    description: 'Hot Jupiters cluster separately from rocky planets — 250 discovered worlds',
    rowCount: 250,
    generate: () => generateExoplanets(250),
  },
  {
    id: 'fitness',
    name: 'Fitness Tracker',
    description: 'Weekend warriors vs daily athletes — 150 workout sessions',
    rowCount: 150,
    generate: () => generateFitnessTracker(150),
  },
];
