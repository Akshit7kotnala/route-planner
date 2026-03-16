import heapq
from collections import deque
from core.heuristics import HEURISTICS


class BFS:
    def __init__(self, graph):
        self.graph          = graph
        self.path           = []
        self.nodes_explored = 0
        self.found          = False

    def run(self, start_name, goal_name):
        self.graph.reset()
        self.path           = []
        self.nodes_explored = 0
        self.found          = False

        start = self.graph.get_node(start_name)
        goal  = self.graph.get_node(goal_name)

        if not start or not goal:
            return []

        queue        = deque([start])
        visited      = set([start])
        start.parent = None

        while queue:
            current = queue.popleft()
            self.nodes_explored += 1

            if current == goal:
                self.found = True
                self.path  = self._reconstruct(goal)
                return self.path

            for neighbor, _, _ in current.neighbors:
                if neighbor not in visited:
                    visited.add(neighbor)
                    neighbor.parent = current
                    queue.append(neighbor)

        return []

    def _reconstruct(self, goal):
        path    = []
        current = goal
        while current:
            path.append(current)
            current = current.parent
        path.reverse()
        return path

    def total_distance(self):
        if not self.path or len(self.path) < 2:
            return 0
        total = 0
        for i in range(len(self.path) - 1):
            node_a = self.path[i]
            node_b = self.path[i + 1]
            for neighbor, dist, _ in node_a.neighbors:
                if neighbor == node_b:
                    total += dist
                    break
        return total


class Dijkstra:
    def __init__(self, graph):
        self.graph          = graph
        self.path           = []
        self.nodes_explored = 0
        self.found          = False

    def run(self, start_name, goal_name):
        self.graph.reset()
        self.path           = []
        self.nodes_explored = 0
        self.found          = False

        start = self.graph.get_node(start_name)
        goal  = self.graph.get_node(goal_name)

        if not start or not goal:
            return []

        start.g    = 0
        open_list  = [(0, start)]
        closed_set = set()

        while open_list:
            current_g, current = heapq.heappop(open_list)

            if current in closed_set:
                continue

            closed_set.add(current)
            self.nodes_explored += 1

            if current == goal:
                self.found = True
                self.path  = self._reconstruct(goal)
                return self.path

            for neighbor, distance, _ in current.neighbors:
                if neighbor in closed_set:
                    continue
                tentative_g = current.g + distance
                if tentative_g < neighbor.g:
                    neighbor.g      = tentative_g
                    neighbor.parent = current
                    heapq.heappush(open_list, (neighbor.g, neighbor))

        return []

    def _reconstruct(self, goal):
        path    = []
        current = goal
        while current:
            path.append(current)
            current = current.parent
        path.reverse()
        return path