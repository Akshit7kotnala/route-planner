import heapq
from core.heuristics import HEURISTICS


class AStar:
    def __init__(self, graph, heuristic='euclidean',
                 mode='fastest', pollution_weight=50.0):
        self.graph            = graph
        self.heuristic        = HEURISTICS[heuristic]
        self.mode             = mode
        self.pollution_weight = pollution_weight
        self.open_list        = []
        self.closed_set       = set()
        self.path             = []
        self.nodes_explored   = 0
        self.found            = False
        self.finished         = False
        self.total_pollution  = 0.0
        self._generator       = None

    def _edge_cost(self, distance, pollution, traffic):
        base = distance * traffic
        if self.mode == 'cleanest':
            return base + self.pollution_weight * pollution * traffic
        return base

    def initialize(self, start_name, goal_name):
        self.graph.reset()
        self.open_list       = []
        self.closed_set      = set()
        self.path            = []
        self.nodes_explored  = 0
        self.found           = False
        self.finished        = False
        self.total_pollution = 0.0

        self.start = self.graph.get_node(start_name)
        self.goal  = self.graph.get_node(goal_name)

        if not self.start or not self.goal:
            self.finished = True
            return

        self.start.state       = 'start'
        self.goal.state        = 'end'
        self.start.g           = 0
        self.start.pollution_g = 0
        self.start.h           = self.heuristic(self.start, self.goal)
        self.start.f           = self.start.g + self.start.h

        heapq.heappush(self.open_list, (self.start.f, self.start))
        self._generator = self._step_generator()

    def step(self):
        if self.finished:
            return False
        try:
            next(self._generator)
            return True
        except StopIteration:
            self.finished = True
            return False

    def _step_generator(self):
        while self.open_list:
            current_f, current = heapq.heappop(self.open_list)

            if current in self.closed_set:
                yield
                continue

            self.closed_set.add(current)
            self.nodes_explored += 1

            if current.state not in ('start', 'end'):
                current.state = 'closed'

            yield

            if current == self.goal:
                self.found           = True
                self.path            = self._reconstruct_path(self.goal)
                self.total_pollution = self.goal.pollution_g
                self.finished        = True
                return

            for neighbor, distance, pollution, traffic in current.neighbors:
                if neighbor in self.closed_set:
                    continue

                edge_cost   = self._edge_cost(distance, pollution, traffic)
                tentative_g = current.g + edge_cost
                tentative_p = current.pollution_g + pollution * traffic

                if tentative_g < neighbor.g:
                    neighbor.g           = tentative_g
                    neighbor.h           = self.heuristic(neighbor, self.goal)
                    neighbor.f           = neighbor.g + neighbor.h
                    neighbor.parent      = current
                    neighbor.pollution_g = tentative_p

                    if neighbor.state not in ('start', 'end'):
                        neighbor.state = 'open'

                    heapq.heappush(
                        self.open_list, (neighbor.f, neighbor)
                    )
            yield

        self.finished = True

    def _reconstruct_path(self, goal):
        path    = []
        current = goal
        while current:
            path.append(current)
            current = current.parent
        path.reverse()
        for node in path:
            if node.state not in ('start', 'end'):
                node.state = 'path'
        return path

    def run(self, start_name, goal_name):
        self.initialize(start_name, goal_name)
        while not self.finished:
            self.step()
        return self.path

    def print_result(self):
        if not self.path:
            print("No path found.")
            return
        print(f"\n=== A* ({self.mode.upper()}) ===")
        print(f"Path     : {' → '.join(n.name for n in self.path)}")
        print(f"Cost     : {self.path[-1].g:.1f}")
        print(f"Pollution: {self.total_pollution:.1f} AQI")
        print(f"Explored : {self.nodes_explored} cities")


class AStarSilent:
    def __init__(self, graph, heuristic='euclidean',
                 mode='fastest', pollution_weight=50.0):
        self.graph            = graph
        self.heuristic        = HEURISTICS[heuristic]
        self.mode             = mode
        self.pollution_weight = pollution_weight
        self.path             = []
        self.nodes_explored   = 0
        self.found            = False
        self.total_pollution  = 0.0

    def _edge_cost(self, distance, pollution, traffic):
        base = distance * traffic
        if self.mode == 'cleanest':
            return base + self.pollution_weight * pollution * traffic
        return base

    def run(self, start_name, goal_name):
        self.graph.reset()
        self.path            = []
        self.nodes_explored  = 0
        self.found           = False
        self.total_pollution = 0.0

        start = self.graph.get_node(start_name)
        goal  = self.graph.get_node(goal_name)

        if not start or not goal:
            return []

        start.g           = 0
        start.pollution_g = 0
        start.h           = self.heuristic(start, goal)
        start.f           = start.g + start.h

        open_list  = [(start.f, start)]
        closed_set = set()

        while open_list:
            _, current = heapq.heappop(open_list)

            if current in closed_set:
                continue

            closed_set.add(current)
            self.nodes_explored += 1

            if current == goal:
                self.found           = True
                self.path            = self._reconstruct(goal)
                self.total_pollution = goal.pollution_g
                return self.path

            for neighbor, distance, pollution, traffic in current.neighbors:
                if neighbor in closed_set:
                    continue

                edge_cost   = self._edge_cost(distance, pollution, traffic)
                tentative_g = current.g + edge_cost
                tentative_p = current.pollution_g + pollution * traffic

                if tentative_g < neighbor.g:
                    neighbor.g           = tentative_g
                    neighbor.h           = self.heuristic(neighbor, goal)
                    neighbor.f           = neighbor.g + neighbor.h
                    neighbor.parent      = current
                    neighbor.pollution_g = tentative_p
                    heapq.heappush(open_list, (neighbor.f, neighbor))

        return []

    def _reconstruct(self, goal):
        path    = []
        current = goal
        while current:
            path.append(current)
            current = current.parent
        path.reverse()
        return path