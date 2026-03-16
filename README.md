# 🗺️ A* Route Planner — Pollution & Traffic Aware

A route planning project with two interfaces:

- a **Python + Pygame desktop visualizer**
- a **React + Vite web frontend**

It explores pathfinding beyond shortest distance by comparing **fastest** and **cleanest** routes across an interactive India city map with live traffic simulation.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Pygame](https://img.shields.io/badge/Pygame-2.6-green)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-8-yellow)
![Algorithm](https://img.shields.io/badge/Algorithm-A*-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## Live Demo

- Web app: [https://route-planner-black.vercel.app/](https://route-planner-black.vercel.app/)

---

## Features

### Core Algorithm
- **A* pathfinding** with visual exploration
- **Multi-objective cost function** balancing distance, traffic, and pollution
- **3 heuristics**: Euclidean, Manhattan, Diagonal
- **Algorithm comparison** with A*, Dijkstra, and BFS

### Routing Modes
- **Fastest mode** for shortest traffic-adjusted route
- **Cleanest mode** for lower AQI exposure
- **Dual path display** showing fastest and cleanest alternatives
- **AQI savings comparison**

### Simulation Features
- **Live traffic updates** with rerouting
- **Road blocking** by user interaction
- **Random map generation**
- **Tooltip stats** for nodes and edges

### Interfaces
- **Desktop app** built with Pygame
- **Web app** built with React, Vite, and Canvas rendering

---

## Project Structure

```text
Planning_project/
├── core/                  # Python graph + pathfinding logic
├── visualization/         # Python Pygame rendering
├── utils/                 # Python helpers
├── maps/                  # Saved map JSON files
├── screenshots/           # Saved screenshots
├── frontend/              # React + Vite web app
│   ├── src/
│   │   ├── components/
│   │   ├── core/
│   │   ├── hooks/
│   │   └── visualization/
│   ├── package.json
│   └── vite.config.js
├── main.py                # Python desktop entry point
└── README.md
```

---

## Run The Python App

### Prerequisites

```bash
python3 --version
python3 -m pip install pygame
```

### Run

```bash
cd ~/Downloads/Planning_project
python3 main.py
```

---

## Run The Web App

### Prerequisites

```bash
node --version
npm --version
```

### Run

```bash
cd ~/Downloads/Planning_project/frontend
npm install
npm run dev
```

### Build

```bash
cd ~/Downloads/Planning_project/frontend
npm run build
```

---

## Desktop Controls

| Key | Action |
|-----|--------|
| Left Click | Set start / goal city |
| Right Click | Block a road |
| SPACE | Run A* animation |
| T | Toggle live traffic |
| M | Switch Fast ↔ Clean mode |
| C | Compare A* vs BFS vs Dijkstra |
| H | Cycle heuristic |
| G | Generate random map |
| S | Save screenshot |
| Ctrl+S | Save map to JSON |
| Ctrl+L | Load saved map |
| U | Unblock all roads |
| R | Reset |
| + / - | Animation speed |
| Q | Quit |

---

## How A* Works

A* uses:

```text
f(n) = g(n) + h(n)
```

- `g(n)` = actual travel cost so far
- `h(n)` = estimated remaining distance
- `f(n)` = total estimated route score

For cleaner routing, the edge cost also includes pollution and traffic weighting.

```text
edge_cost = distance × traffic_multiplier
          + pollution_weight × AQI_score × traffic_multiplier
```

---

## Tech Stack

- **Python 3.12**
- **Pygame 2.6**
- **React 19**
- **Vite 8**
- **JavaScript Canvas rendering**
- **JSON** for saved maps

---

## Roadmap

- [x] Web version with React + Vite
- [ ] Improve frontend interaction polish
- [ ] Real GPS coordinates for Indian cities
- [ ] Multiple simultaneous route comparison
- [ ] Export path data for external map tools

---

## Author

**Akshit**

- GitHub: [@Akshit7kotnala](https://github.com/Akshit7kotnala)

---

## License

MIT License — feel free to use and modify.
