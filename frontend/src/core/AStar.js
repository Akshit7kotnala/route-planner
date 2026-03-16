import { HEURISTICS } from './heuristics.js';

export class AStar {
  constructor(graph, heuristic = 'euclidean', mode = 'fastest', pollutionWeight = 50) {
    this.graph = graph;
    this.heuristicFn = HEURISTICS[heuristic];
    this.mode = mode;
    this.pollutionWeight = pollutionWeight;

    this.openList = []; // min-heap manually managed
    this.closedSet = new Set();
    this.path = [];
    this.nodesExplored = 0;
    this.found = false;
    this.finished = false;
    this.totalPollution = 0;
    this._steps = null;
    this._stepIndex = 0;
  }

  _edgeCost(distance, pollution, traffic) {
    const base = distance * traffic;
    if (this.mode === 'cleanest') {
      return base + this.pollutionWeight * pollution * traffic;
    }
    return base;
  }

  _heapPush(item) {
    this.openList.push(item);
    this.openList.sort((a, b) => a.node.f - b.node.f);
  }

  _heapPop() {
    return this.openList.shift();
  }

  initialize(startName, goalName) {
    this.graph.reset();
    this.openList = [];
    this.closedSet = new Set();
    this.path = [];
    this.nodesExplored = 0;
    this.found = false;
    this.finished = false;
    this.totalPollution = 0;

    this.start = this.graph.getNode(startName);
    this.goal = this.graph.getNode(goalName);

    if (!this.start || !this.goal) {
      this.finished = true;
      return;
    }

    this.start.state = 'start';
    this.goal.state = 'end';
    this.start.g = 0;
    this.start.pollutionG = 0;
    this.start.h = this.heuristicFn(this.start, this.goal);
    this.start.f = this.start.g + this.start.h;

    this._heapPush({ node: this.start });
  }

  // Returns true if still running, false if done
  step() {
    if (this.finished) return false;
    if (this.openList.length === 0) {
      this.finished = true;
      return false;
    }

    const { node: current } = this._heapPop();

    if (this.closedSet.has(current.name)) return true;

    this.closedSet.add(current.name);
    this.nodesExplored += 1;

    if (current.state !== 'start' && current.state !== 'end') {
      current.state = 'closed';
    }

    if (current === this.goal) {
      this.found = true;
      this.path = this._reconstructPath(this.goal);
      this.totalPollution = this.goal.pollutionG;
      this.finished = true;
      return false;
    }

    for (const { node: neighbor, distance, pollution, traffic } of current.neighbors) {
      if (this.closedSet.has(neighbor.name)) continue;

      const cost = this._edgeCost(distance, pollution, traffic);
      const tentativeG = current.g + cost;
      const tentativeP = current.pollutionG + pollution * traffic;

      if (tentativeG < neighbor.g) {
        neighbor.g = tentativeG;
        neighbor.h = this.heuristicFn(neighbor, this.goal);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = current;
        neighbor.pollutionG = tentativeP;

        if (neighbor.state !== 'start' && neighbor.state !== 'end') {
          neighbor.state = 'open';
        }

        this._heapPush({ node: neighbor });
      }
    }

    return true;
  }

  run(startName, goalName) {
    this.initialize(startName, goalName);
    while (!this.finished) this.step();
    return this.path;
  }

  _reconstructPath(goal) {
    const path = [];
    let current = goal;

    while (current) {
      path.push(current);
      current = current.parent;
    }

    path.reverse();
    path.forEach((n) => {
      if (n.state !== 'start' && n.state !== 'end') {
        n.state = 'path';
      }
    });
    return path;
  }
}
