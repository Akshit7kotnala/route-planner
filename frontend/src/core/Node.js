export class Node {
  constructor(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.neighbors = []; // { node, distance, pollution, traffic }

    this.g = Infinity;
    this.h = 0;
    this.f = Infinity;
    this.parent = null;
    this.state = 'unvisited';
    this.pollutionG = 0;
  }

  addNeighbor(node, distance, pollution = 5.0, traffic = 1.0) {
    this.neighbors.push({ node, distance, pollution, traffic });
  }

  reset() {
    this.g = Infinity;
    this.h = 0;
    this.f = Infinity;
    this.parent = null;
    this.state = 'unvisited';
    this.pollutionG = 0;
  }
}
