import math
import random
from core.node import Node


# Traffic levels
TRAFFIC_CLEAR    = 1.0   # no congestion
TRAFFIC_MODERATE = 1.8   # some congestion
TRAFFIC_HEAVY    = 3.0   # heavy traffic
TRAFFIC_JAMMED   = 6.0   # nearly blocked

TRAFFIC_LEVELS = [
    TRAFFIC_CLEAR,
    TRAFFIC_MODERATE,
    TRAFFIC_HEAVY,
    TRAFFIC_JAMMED
]

TRAFFIC_COLORS = {
    TRAFFIC_CLEAR:    (0,   200,  0),    # green
    TRAFFIC_MODERATE: (255, 200,  0),    # yellow
    TRAFFIC_HEAVY:    (255, 100,  0),    # orange
    TRAFFIC_JAMMED:   (200,   0,  0),    # red
}

TRAFFIC_LABELS = {
    TRAFFIC_CLEAR:    "Clear",
    TRAFFIC_MODERATE: "Moderate",
    TRAFFIC_HEAVY:    "Heavy",
    TRAFFIC_JAMMED:   "Jammed",
}


class Graph:
    def __init__(self):
        self.nodes = {}
        self.edges = {}

    def add_node(self, name, x, y):
        node = Node(name, x, y)
        self.nodes[name] = node
        return node

    def add_edge(self, name_a, name_b, distance=None, pollution=None):
        node_a = self.nodes[name_a]
        node_b = self.nodes[name_b]

        if distance is None:
            distance = math.sqrt(
                (node_a.x - node_b.x)**2 + (node_a.y - node_b.y)**2
            )

        if pollution is None:
            pollution = self._simulate_pollution(name_a, name_b)

        distance  = round(distance, 1)
        pollution = round(pollution, 1)
        traffic   = TRAFFIC_CLEAR

        node_a.add_neighbor(node_b, distance, pollution, traffic)
        node_b.add_neighbor(node_a, distance, pollution, traffic)

        key = tuple(sorted([name_a, name_b]))
        self.edges[key] = {
            'distance':  distance,
            'pollution': pollution,
            'traffic':   traffic,
            'blocked':   False
        }

    def _simulate_pollution(self, name_a, name_b):
        HIGH_POLLUTION = {
            "Delhi", "Mumbai", "Kolkata", "Kanpur",
            "Lucknow", "Patna", "Agra", "Varanasi",
            "Ahmedabad", "Surat", "Nagpur"
        }
        MEDIUM_POLLUTION = {
            "Pune", "Hyderabad", "Chennai", "Bhopal",
            "Indore", "Jaipur", "Bhubaneswar", "Raipur"
        }
        score = 3.0
        if name_a in HIGH_POLLUTION or name_b in HIGH_POLLUTION:
            score += random.uniform(4.0, 6.0)
        elif name_a in MEDIUM_POLLUTION or name_b in MEDIUM_POLLUTION:
            score += random.uniform(2.0, 4.0)
        else:
            score += random.uniform(0.5, 2.0)
        return min(score, 10.0)

    def get_node(self, name):
        return self.nodes.get(name, None)

    def get_edge_data(self, name_a, name_b):
        key = tuple(sorted([name_a, name_b]))
        return self.edges.get(key, {})

    def update_traffic(self, change_fraction=0.3):
        """
        Randomly change traffic on a fraction of roads.
        change_fraction = how many roads change per update (0.0-1.0)
        """
        active_edges = [
            (key, data) for key, data in self.edges.items()
            if not data.get('blocked')
        ]

        num_to_change = max(1, int(len(active_edges) * change_fraction))
        edges_to_change = random.sample(
            active_edges,
            min(num_to_change, len(active_edges))
        )

        changed = []
        for key, data in edges_to_change:
            old_traffic = data['traffic']

            # Weighted random — clear roads more likely to stay clear
            weights = [4, 3, 2, 1]
            new_traffic = random.choices(TRAFFIC_LEVELS, weights=weights)[0]
            data['traffic'] = new_traffic

            # Update neighbors
            name_a, name_b = key
            node_a = self.nodes.get(name_a)
            node_b = self.nodes.get(name_b)

            if node_a and node_b:
                # Update node_a's neighbor entry for node_b
                node_a.neighbors = [
                    (n, d, p, new_traffic if n.name == name_b else t)
                    for n, d, p, t in node_a.neighbors
                ]
                node_b.neighbors = [
                    (n, d, p, new_traffic if n.name == name_a else t)
                    for n, d, p, t in node_b.neighbors
                ]

            if old_traffic != new_traffic:
                changed.append((name_a, name_b, new_traffic))

        return changed

    def block_edge(self, name_a, name_b):
        node_a = self.nodes.get(name_a)
        node_b = self.nodes.get(name_b)
        if not node_a or not node_b:
            return False

        node_a.neighbors = [
            (n, d, p, t) for n, d, p, t in node_a.neighbors
            if n.name != name_b
        ]
        node_b.neighbors = [
            (n, d, p, t) for n, d, p, t in node_b.neighbors
            if n.name != name_a
        ]

        key = tuple(sorted([name_a, name_b]))
        if key in self.edges:
            self.edges[key]['blocked'] = True

        print(f"Road blocked: {name_a} ↔ {name_b}")
        return True

    def unblock_all(self):
        for node in self.nodes.values():
            node.neighbors = []

        for (name_a, name_b), data in self.edges.items():
            data['blocked'] = False
            node_a  = self.nodes[name_a]
            node_b  = self.nodes[name_b]
            dist    = data['distance']
            poll    = data['pollution']
            traffic = data['traffic']
            node_a.add_neighbor(node_b, dist, poll, traffic)
            node_b.add_neighbor(node_a, dist, poll, traffic)

        print("All roads restored")

    def reset(self):
        for node in self.nodes.values():
            node.reset()

    def __repr__(self):
        result = "Graph:\n"
        for name, node in self.nodes.items():
            neighbors = [(n.name, round(d, 1)) for n, d, p, t in node.neighbors]
            result += f"  {name} → {neighbors}\n"
        return result


def create_india_map():
    random.seed(42)
    g = Graph()

    g.add_node("Delhi",         340, 160)
    g.add_node("Jaipur",        250, 210)
    g.add_node("Agra",          370, 210)
    g.add_node("Lucknow",       460, 200)
    g.add_node("Kanpur",        440, 225)
    g.add_node("Varanasi",      500, 240)
    g.add_node("Amritsar",      250, 100)
    g.add_node("Chandigarh",    300, 120)
    g.add_node("Dehradun",      340, 110)
    g.add_node("Mumbai",        180, 490)
    g.add_node("Pune",          200, 540)
    g.add_node("Nashik",        210, 440)
    g.add_node("Surat",         170, 400)
    g.add_node("Ahmedabad",     150, 310)
    g.add_node("Jodhpur",       200, 260)
    g.add_node("Udaipur",       220, 300)
    g.add_node("Bhopal",        360, 330)
    g.add_node("Indore",        300, 360)
    g.add_node("Nagpur",        420, 390)
    g.add_node("Raipur",        490, 390)
    g.add_node("Kolkata",       580, 310)
    g.add_node("Bhubaneswar",   550, 400)
    g.add_node("Patna",         510, 230)
    g.add_node("Hyderabad",     380, 480)
    g.add_node("Bangalore",     340, 580)
    g.add_node("Chennai",       450, 580)
    g.add_node("Kochi",         300, 650)
    g.add_node("Coimbatore",    330, 630)
    g.add_node("Visakhapatnam", 510, 470)
    g.add_node("Mangalore",     280, 580)

    g.add_edge("Delhi",       "Agra",           200)
    g.add_edge("Delhi",       "Jaipur",         280)
    g.add_edge("Delhi",       "Chandigarh",     250)
    g.add_edge("Delhi",       "Dehradun",       300)
    g.add_edge("Chandigarh",  "Amritsar",       230)
    g.add_edge("Chandigarh",  "Dehradun",       180)
    g.add_edge("Agra",        "Lucknow",        340)
    g.add_edge("Agra",        "Kanpur",         300)
    g.add_edge("Lucknow",     "Kanpur",          80)
    g.add_edge("Lucknow",     "Varanasi",       320)
    g.add_edge("Varanasi",    "Patna",          250)
    g.add_edge("Mumbai",      "Pune",           150)
    g.add_edge("Mumbai",      "Nashik",         170)
    g.add_edge("Mumbai",      "Surat",          280)
    g.add_edge("Surat",       "Ahmedabad",      270)
    g.add_edge("Ahmedabad",   "Jaipur",         670)
    g.add_edge("Ahmedabad",   "Jodhpur",        480)
    g.add_edge("Ahmedabad",   "Udaipur",        260)
    g.add_edge("Jaipur",      "Jodhpur",        340)
    g.add_edge("Jaipur",      "Udaipur",        400)
    g.add_edge("Nashik",      "Pune",           210)
    g.add_edge("Bhopal",      "Indore",         195)
    g.add_edge("Bhopal",      "Nagpur",         350)
    g.add_edge("Bhopal",      "Agra",           400)
    g.add_edge("Indore",      "Ahmedabad",      400)
    g.add_edge("Indore",      "Mumbai",         590)
    g.add_edge("Nagpur",      "Raipur",         300)
    g.add_edge("Nagpur",      "Hyderabad",      500)
    g.add_edge("Nagpur",      "Pune",           700)
    g.add_edge("Raipur",      "Bhubaneswar",    440)
    g.add_edge("Raipur",      "Kolkata",        700)
    g.add_edge("Kolkata",     "Bhubaneswar",    440)
    g.add_edge("Kolkata",     "Patna",          580)
    g.add_edge("Patna",       "Lucknow",        528)
    g.add_edge("Bhubaneswar", "Visakhapatnam",  440)
    g.add_edge("Hyderabad",   "Bangalore",      570)
    g.add_edge("Hyderabad",   "Chennai",        630)
    g.add_edge("Hyderabad",   "Visakhapatnam",  630)
    g.add_edge("Hyderabad",   "Pune",           560)
    g.add_edge("Bangalore",   "Chennai",        350)
    g.add_edge("Bangalore",   "Kochi",          540)
    g.add_edge("Bangalore",   "Coimbatore",     360)
    g.add_edge("Bangalore",   "Mangalore",      350)
    g.add_edge("Chennai",     "Coimbatore",     500)
    g.add_edge("Chennai",     "Visakhapatnam",  800)
    g.add_edge("Kochi",       "Coimbatore",     200)
    g.add_edge("Kochi",       "Mangalore",      300)

    return g