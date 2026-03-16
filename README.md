# 🗺️ A* Route Planner — Pollution & Traffic Aware

A desktop pathfinding visualizer built in Python that goes beyond
shortest distance — it finds the **cleanest** and **fastest** routes
through an interactive India city map with live traffic simulation.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![Pygame](https://img.shields.io/badge/Pygame-2.6-green)
![Algorithm](https://img.shields.io/badge/Algorithm-A*-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 🎥 Demo

> *Select two cities → watch A* find the optimal path in real time*

![Demo](screenshots/demo.png)

---

## ✨ Features

### Core Algorithm
- **A* Pathfinding** with step-by-step animation
- **Multi-objective cost function** — balances distance + pollution
- **3 heuristics** — Euclidean, Manhattan, Diagonal (switchable live)
- **Generator-based animation** — one step per frame, fully controllable

### Routing Modes
- ⚡ **Fastest Mode** — minimizes distance only
- 🌿 **Cleanest Mode** — avoids high AQI pollution roads
- **Dual path display** — both routes shown simultaneously
- **AQI savings comparison** — shows % pollution reduction

### Live Traffic Simulation
- Roads randomly change between Clear → Moderate → Heavy → Jammed
- **Auto-reroutes** every time traffic updates
- Color-coded roads by congestion level
- Live traffic ticker at bottom of screen

### Dynamic Re-routing
- **Right click any road** to block it
- Path **instantly recalculates** avoiding blocked road
- Simulates real-world road closures like Google Maps

### Algorithm Comparison
- Run **A* vs Dijkstra vs BFS** on same route
- Side-by-side stats: nodes explored, distance, time
- ★ badge highlights most efficient algorithm

### Map Features
- **30 Indian cities** with real approximate distances
- **Random map generator** — new city layouts on demand
- **Save/Load maps** to JSON — share custom maps
- **Node hover tooltip** — see live g, h, f costs + AQI

---

## 🚀 Quick Start

### Prerequisites
```bash
python --version   # needs 3.10+
pip install pygame
```

### Run
```bash
git clone https://github.com/YOUR_USERNAME/route-planner.git
cd route-planner
python main.py
```

---

## 🎮 Controls

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

## 📁 Project Structure
```
route-planner/
│
├── core/
│   ├── node.py          # City node with g/h/f costs
│   ├── graph.py         # India map + traffic simulation
│   ├── astar.py         # A* with animation + silent mode
│   ├── algorithms.py    # BFS + Dijkstra for comparison
│   ├── heuristics.py    # Euclidean, Manhattan, Diagonal
│   ├── map_generator.py # Random city map generator
│   └── map_io.py        # Save/load maps to JSON
│
├── visualization/
│   ├── display.py       # Pygame drawing engine
│   └── controls.py      # Mouse + keyboard input
│
├── utils/
│   └── timer.py         # Performance measurement
│
├── maps/                # Saved map JSON files
├── screenshots/         # Saved screenshots
├── main.py              # Entry point
└── README.md
```

---

## 🧠 How A* Works

A* finds the shortest path using:
```
f(n) = g(n) + h(n)
```

- **g(n)** → actual cost from start to current node
- **h(n)** → heuristic estimate to goal (Euclidean distance)
- **f(n)** → total estimated cost — lowest f explored first

### Pollution-Weighted Cost Function
```
edge_cost = distance × traffic_multiplier
          + pollution_weight × AQI_score × traffic_multiplier
```

This makes A* prefer roads that are both short AND clean —
exactly how modern navigation apps balance time vs air quality.

---

## 📊 Algorithm Comparison

| Algorithm | Uses Weights | Uses Heuristic | Result |
|-----------|-------------|----------------|--------|
| BFS | ❌ | ❌ | Shortest hops, not distance |
| Dijkstra | ✅ | ❌ | Optimal distance, explores more |
| A* | ✅ | ✅ | Optimal distance, explores least |

---

## 🛠️ Tech Stack

- **Python 3.12**
- **Pygame 2.6** — visualization and input
- **heapq** — priority queue for A*
- **collections.deque** — queue for BFS
- **JSON** — map save/load format

---

## 📸 Screenshots

| India Map | Comparison Panel |
|-----------|-----------------|
| ![map](screenshots/demo.png) | ![comparison](screenshots/demo.png) |

---

## 🔮 Roadmap

- [ ] Web version (React + Canvas)
- [ ] Real GPS coordinates for Indian cities
- [ ] Multiple simultaneous route comparison
- [ ] Export path as KML for Google Maps

---

## 👨‍💻 Author

**Akshit** — Backend Engineer & CS Student
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
- Portfolio: [your-portfolio-link]

---

## 📄 License

MIT License — feel free to use and modify.