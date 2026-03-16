class Node:
    def __init__(self, name, x, y):
        self.name      = name
        self.x         = x
        self.y         = y
        self.neighbors = []   # (node, distance, pollution, traffic)

        self.g           = float('inf')
        self.h           = 0
        self.f           = float('inf')
        self.parent      = None
        self.state       = 'unvisited'
        self.pollution_g = 0.0

    def add_neighbor(self, neighbor_node, distance,
                     pollution=5.0, traffic=1.0):
        self.neighbors.append((neighbor_node, distance, pollution, traffic))

    def reset(self):
        self.g           = float('inf')
        self.h           = 0
        self.f           = float('inf')
        self.parent      = None
        self.state       = 'unvisited'
        self.pollution_g = 0.0

    def __lt__(self, other):
        return self.f < other.f

    def __repr__(self):
        return f"Node({self.name})"