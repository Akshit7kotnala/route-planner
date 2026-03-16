import random
import math
from core.graph import Graph

CITY_NAMES = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Kolkata",
    "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
    "Surat", "Kanpur", "Nagpur", "Patna", "Indore",
    "Bhopal", "Visakhapatnam", "Vadodara", "Agra", "Nashik",
    "Varanasi", "Meerut", "Rajkot", "Amritsar", "Allahabad",
    "Jodhpur", "Coimbatore", "Kochi", "Dehradun", "Chandigarh",
    "Mangalore", "Mysore", "Bhubaneswar", "Guwahati", "Raipur",
    "Ranchi", "Udaipur", "Srinagar", "Shimla", "Jammu"
]


def generate_random_map(
    num_cities    = 20,
    width         = 620,
    height        = 700,
    margin        = 60,
    min_dist      = 80,
    connect_dist  = 220,
    min_neighbors = 2
):
    g        = Graph()
    names    = random.sample(CITY_NAMES, min(num_cities, len(CITY_NAMES)))
    positions = []
    attempts  = 0

    for name in names:
        placed = False
        while not placed and attempts < 1000:
            attempts += 1
            x = random.randint(margin, width  - margin)
            y = random.randint(margin, height - margin)

            too_close = any(
                math.sqrt((x-px)**2 + (y-py)**2) < min_dist
                for px, py in positions
            )

            if not too_close:
                g.add_node(name, x, y)
                positions.append((x, y))
                placed = True

    node_list = list(g.nodes.values())

    for i, node_a in enumerate(node_list):
        for j, node_b in enumerate(node_list):
            if i >= j:
                continue
            dist = math.sqrt(
                (node_a.x - node_b.x)**2 + (node_a.y - node_b.y)**2
            )
            if dist <= connect_dist:
                g.add_edge(node_a.name, node_b.name, round(dist, 1))

    for node in node_list:
        if len(node.neighbors) < min_neighbors:
            others = sorted(
                [n for n in node_list if n != node],
                key=lambda n: math.sqrt(
                    (node.x - n.x)**2 + (node.y - n.y)**2
                )
            )
            for other in others:
                if len(node.neighbors) >= min_neighbors:
                    break
                already = any(
                    nb.name == other.name
                    for nb, _, _, _ in node.neighbors
                )
                if not already:
                    dist = math.sqrt(
                        (node.x - other.x)**2 + (node.y - other.y)**2
                    )
                    g.add_edge(node.name, other.name, round(dist, 1))

    return g