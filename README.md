# Altair — Topologies of Thoughts

An interactive 3D data visualization platform that lets you explore datasets using hand gestures. Upload any CSV, watch it transform into a particle cloud, and manipulate it in real-time through your webcam.

## What It Does

Altair renders tabular data as a 3D particle system where each row becomes a point in space. You can map columns to position, color, and size, then explore the data physically using six hand gestures tracked via your webcam.

Three network topology modes reveal different structural relationships in your data:

- **Centralized** — Hub-and-spoke layout where one central node connects to all others
- **Decentralized** — Clustered groups with sparse bridges between them
- **Distributed** — k-nearest-neighbor connections where each node links to its closest peers

Swipe gestures switch between topologies in real-time with smooth animated transitions.

## Hand Gestures

| Gesture | Action |
|---------|--------|
| Open Hand | Push particles away from your hand |
| Pinch | Select a single data point |
| Fist | Collapse clusters toward your hand |
| Point | Highlight a category, dim everything else |
| Swipe Left/Right | Cycle through topology modes |

Hand tracking runs on-device via MediaPipe — no data leaves your browser.

## Data Pipeline

1. Upload a CSV (or pick a built-in demo dataset)
2. Columns are auto-analyzed and classified as numeric, categorical, or text
3. Smart auto-detection maps columns to X/Y/Z position, color, and size
4. UMAP dimensionality reduction projects high-dimensional data into 3D (runs in a web worker)
5. k-NN graph edges are computed to form the network topology
6. Particles render via instanced meshes with a bloom post-processing pass

You can override any mapping manually, toggle category visibility, and view column statistics and correlations.

## Built-in Demo Datasets

- Knowledge Concepts
- Startups
- Exoplanets
- Fitness Tracker

## Features

- **Real-time 3D rendering** — 10K+ particles via Three.js instanced meshes
- **Hand tracking** — MediaPipe 21-point hand landmarks at ~30fps
- **Gesture classification** — Rule-based detection with debouncing and One-Euro filtering for smooth tracking
- **Particle physics** — Repulsion, spring dynamics, collapse, and damping
- **Dynamic column mapping** — Reassign what drives position, color, size, and labels on the fly
- **Filtering** — Toggle visibility per category
- **Presentation mode** — Save snapshots and build a story walkthrough
- **Onboarding** — Interactive 5-step tutorial for first-time users

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Three.js** / **React Three Fiber** / **Drei** — 3D rendering
- **Zustand** — State management (6 stores: app, data, particles, graph, hand, presentation)
- **MediaPipe Tasks Vision** — Hand landmark detection via WASM/GPU
- **UMAP-JS** — Dimensionality reduction
- **PapaParse** — CSV parsing
- **D3 Scale / D3 Scale Chromatic** — Data normalization and color schemes

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` and allow camera access when prompted.

## Project Structure

```
src/
├── components/
│   ├── scene/       # 3D scene: particles, edges, hand cursor, labels, tooltips
│   └── ui/          # Overlay panels: data import, topology selector, filters, onboarding
├── hooks/           # Hand tracking, gesture classification, data loading, physics
├── stores/          # Zustand state stores
├── lib/             # Algorithms: gesture detection, physics, layout engine, graph processing
├── types/           # TypeScript interfaces
└── constants/       # Tunable parameters
```
