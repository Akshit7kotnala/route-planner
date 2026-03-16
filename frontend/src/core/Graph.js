import { Node } from './Node.js';

export const TRAFFIC_CLEAR = 1.0;
export const TRAFFIC_MODERATE = 1.8;
export const TRAFFIC_HEAVY = 3.0;
export const TRAFFIC_JAMMED = 6.0;

export const TRAFFIC_LEVELS = [
  TRAFFIC_CLEAR,
  TRAFFIC_MODERATE,
  TRAFFIC_HEAVY,
  TRAFFIC_JAMMED,
];

export const TRAFFIC_COLORS = {
  [TRAFFIC_CLEAR]: '#00c800',
  [TRAFFIC_MODERATE]: '#ffc800',
  [TRAFFIC_HEAVY]: '#ff6400',
  [TRAFFIC_JAMMED]: '#c80000',
};

export const TRAFFIC_LABELS = {
  [TRAFFIC_CLEAR]: 'Clear',
  [TRAFFIC_MODERATE]: 'Moderate',
  [TRAFFIC_HEAVY]: 'Heavy',
  [TRAFFIC_JAMMED]: 'Jammed',
};

export class Graph {
  constructor() {
    this.nodes = {}; // name -> Node
    this.edges = {}; // 'A|B' -> { distance, pollution, traffic, blocked }
  }

  addNode(name, x, y) {
    const node = new Node(name, x, y);
    this.nodes[name] = node;
    return node;
  }

  _edgeKey(a, b) {
    return [a, b].sort().join('|');
  }

  _simulatePollution(a, b) {
    const HIGH = new Set([
      'Delhi',
      'Mumbai',
      'Kolkata',
      'Kanpur',
      'Lucknow',
      'Patna',
      'Agra',
      'Varanasi',
      'Ahmedabad',
      'Surat',
      'Nagpur',
    ]);
    const MED = new Set([
      'Pune',
      'Hyderabad',
      'Chennai',
      'Bhopal',
      'Indore',
      'Jaipur',
      'Bhubaneswar',
      'Raipur',
    ]);
    let score = 3.0;
    if (HIGH.has(a) || HIGH.has(b)) {
      score += 4.0 + Math.random() * 2.0;
    } else if (MED.has(a) || MED.has(b)) {
      score += 2.0 + Math.random() * 2.0;
    } else {
      score += 0.5 + Math.random() * 1.5;
    }
    return Math.min(score, 10.0);
  }

  addEdge(nameA, nameB, distance = null, pollution = null) {
    const nodeA = this.nodes[nameA];
    const nodeB = this.nodes[nameB];
    if (!nodeA || !nodeB) return;

    if (distance === null) {
      distance = Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2);
    }

    if (pollution === null) {
      pollution = this._simulatePollution(nameA, nameB);
    }

    distance = Math.round(distance * 10) / 10;
    pollution = Math.round(pollution * 10) / 10;

    const traffic = TRAFFIC_CLEAR;
    nodeA.addNeighbor(nodeB, distance, pollution, traffic);
    nodeB.addNeighbor(nodeA, distance, pollution, traffic);

    const key = this._edgeKey(nameA, nameB);
    this.edges[key] = { distance, pollution, traffic, blocked: false };
  }

  getNode(name) {
    return this.nodes[name] || null;
  }

  blockEdge(nameA, nameB) {
    const nodeA = this.nodes[nameA];
    const nodeB = this.nodes[nameB];
    if (!nodeA || !nodeB) return false;

    nodeA.neighbors = nodeA.neighbors.filter((n) => n.node.name !== nameB);
    nodeB.neighbors = nodeB.neighbors.filter((n) => n.node.name !== nameA);

    const key = this._edgeKey(nameA, nameB);
    if (this.edges[key]) this.edges[key].blocked = true;
    return true;
  }

  unblockAll() {
    Object.values(this.nodes).forEach((n) => {
      n.neighbors = [];
    });

    Object.entries(this.edges).forEach(([key, data]) => {
      data.blocked = false;
      const [nameA, nameB] = key.split('|');
      const nodeA = this.nodes[nameA];
      const nodeB = this.nodes[nameB];

      if (nodeA && nodeB) {
        nodeA.addNeighbor(nodeB, data.distance, data.pollution, data.traffic);
        nodeB.addNeighbor(nodeA, data.distance, data.pollution, data.traffic);
      }
    });
  }

  updateTraffic(changeFraction = 0.25) {
    const active = Object.entries(this.edges).filter(([, d]) => !d.blocked);

    const num = Math.max(1, Math.floor(active.length * changeFraction));
    const shuffled = active.sort(() => Math.random() - 0.5).slice(0, num);
    const changed = [];
    const weights = [4, 3, 2, 1];
    const total = weights.reduce((a, b) => a + b, 0);

    shuffled.forEach(([key, data]) => {
      const rand = Math.random() * total;
      let cumul = 0;
      let newT = TRAFFIC_CLEAR;

      for (let i = 0; i < TRAFFIC_LEVELS.length; i += 1) {
        cumul += weights[i];
        if (rand <= cumul) {
          newT = TRAFFIC_LEVELS[i];
          break;
        }
      }

      const old = data.traffic;
      data.traffic = newT;

      const [nameA, nameB] = key.split('|');
      const nodeA = this.nodes[nameA];
      const nodeB = this.nodes[nameB];

      if (nodeA) {
        nodeA.neighbors = nodeA.neighbors.map((nb) =>
          nb.node.name === nameB ? { ...nb, traffic: newT } : nb
        );
      }

      if (nodeB) {
        nodeB.neighbors = nodeB.neighbors.map((nb) =>
          nb.node.name === nameA ? { ...nb, traffic: newT } : nb
        );
      }

      if (old !== newT) changed.push({ nameA, nameB, traffic: newT });
    });

    return changed;
  }

  reset() {
    Object.values(this.nodes).forEach((n) => n.reset());
  }

  clone() {
    const g = new Graph();

    Object.values(this.nodes).forEach((n) => g.addNode(n.name, n.x, n.y));

    Object.entries(this.edges).forEach(([key, data]) => {
      if (!data.blocked) {
        const [a, b] = key.split('|');
        g.addEdge(a, b, data.distance, data.pollution);
        const k2 = g._edgeKey(a, b);
        g.edges[k2].traffic = data.traffic;
        g.nodes[a].neighbors = g.nodes[a].neighbors.map((nb) =>
          nb.node.name === b ? { ...nb, traffic: data.traffic } : nb
        );
        g.nodes[b].neighbors = g.nodes[b].neighbors.map((nb) =>
          nb.node.name === a ? { ...nb, traffic: data.traffic } : nb
        );
      }
    });

    return g;
  }
}
