export class BFS {
  constructor(graph) {
    this.graph = graph;
    this.path = [];
    this.nodesExplored = 0;
    this.found = false;
  }

  run(startName, goalName) {
    this.graph.reset();
    this.path = [];
    this.nodesExplored = 0;
    this.found = false;

    const start = this.graph.getNode(startName);
    const goal = this.graph.getNode(goalName);
    if (!start || !goal) return [];

    const queue = [start];
    const visited = new Set([start.name]);
    start.parent = null;

    while (queue.length) {
      const current = queue.shift();
      this.nodesExplored += 1;

      if (current === goal) {
        this.found = true;
        this.path = this._reconstruct(goal);
        return this.path;
      }

      for (const { node: neighbor } of current.neighbors) {
        if (!visited.has(neighbor.name)) {
          visited.add(neighbor.name);
          neighbor.parent = current;
          queue.push(neighbor);
        }
      }
    }
    return [];
  }

  totalDistance() {
    if (this.path.length < 2) return 0;
    let total = 0;

    for (let i = 0; i < this.path.length - 1; i += 1) {
      const a = this.path[i];
      const b = this.path[i + 1];
      const nb = a.neighbors.find((n) => n.node.name === b.name);
      if (nb) total += nb.distance;
    }

    return total;
  }

  _reconstruct(goal) {
    const path = [];
    let current = goal;

    while (current) {
      path.push(current);
      current = current.parent;
    }

    return path.reverse();
  }
}

export class Dijkstra {
  constructor(graph) {
    this.graph = graph;
    this.path = [];
    this.nodesExplored = 0;
    this.found = false;
  }

  run(startName, goalName) {
    this.graph.reset();
    this.path = [];
    this.nodesExplored = 0;
    this.found = false;

    const start = this.graph.getNode(startName);
    const goal = this.graph.getNode(goalName);
    if (!start || !goal) return [];

    start.g = 0;
    const openList = [start];
    const closedSet = new Set();

    while (openList.length) {
      openList.sort((a, b) => a.g - b.g);
      const current = openList.shift();

      if (closedSet.has(current.name)) continue;
      closedSet.add(current.name);
      this.nodesExplored += 1;

      if (current === goal) {
        this.found = true;
        this.path = this._reconstruct(goal);
        return this.path;
      }

      for (const { node: nb, distance, traffic } of current.neighbors) {
        if (closedSet.has(nb.name)) continue;
        const tg = current.g + distance * traffic;
        if (tg < nb.g) {
          nb.g = tg;
          nb.parent = current;
          openList.push(nb);
        }
      }
    }

    return [];
  }

  _reconstruct(goal) {
    const path = [];
    let current = goal;

    while (current) {
      path.push(current);
      current = current.parent;
    }

    return path.reverse();
  }
}
