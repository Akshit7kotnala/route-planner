import json
import os
from core.graph import Graph


def save_map(graph, filename=None):
    """
    Save current graph to a JSON file.
    Default saves to maps/map_TIMESTAMP.json
    """
    import time

    os.makedirs("maps", exist_ok=True)

    if filename is None:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename  = f"maps/map_{timestamp}.json"

    data = {
        "nodes": [],
        "edges": []
    }

    # Save nodes
    for name, node in graph.nodes.items():
        data["nodes"].append({
            "name": name,
            "x":    node.x,
            "y":    node.y
        })

    # Save edges (no duplicates)
    seen = set()
    for key, edge_data in graph.edges.items():
        if key in seen:
            continue
        seen.add(key)
        name_a, name_b = key
        data["edges"].append({
            "from":      name_a,
            "to":        name_b,
            "distance":  edge_data["distance"],
            "pollution": edge_data["pollution"],
            "traffic":   edge_data.get("traffic", 1.0),
            "blocked":   edge_data.get("blocked", False)
        })

    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Map saved → {filename}")
    return filename


def load_map(filename):
    """
    Load a graph from a JSON file.
    Returns a Graph object or None if file not found.
    """
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        return None

    with open(filename, "r") as f:
        data = json.load(f)

    g = Graph()

    # Load nodes
    for node_data in data["nodes"]:
        g.add_node(node_data["name"], node_data["x"], node_data["y"])

    # Load edges
    for edge_data in data["edges"]:
        name_a   = edge_data["from"]
        name_b   = edge_data["to"]
        distance = edge_data["distance"]
        pollution= edge_data["pollution"]
        traffic  = edge_data.get("traffic", 1.0)
        blocked  = edge_data.get("blocked", False)

        # Add edge manually to preserve all data
        node_a = g.nodes[name_a]
        node_b = g.nodes[name_b]

        if not blocked:
            node_a.add_neighbor(node_b, distance, pollution, traffic)
            node_b.add_neighbor(node_a, distance, pollution, traffic)

        key = tuple(sorted([name_a, name_b]))
        g.edges[key] = {
            "distance":  distance,
            "pollution": pollution,
            "traffic":   traffic,
            "blocked":   blocked
        }

    print(f"Map loaded ← {filename}")
    return g


def list_saved_maps():
    """Return list of all saved map files"""
    os.makedirs("maps", exist_ok=True)
    files = [
        f for f in os.listdir("maps")
        if f.endswith(".json")
    ]
    files.sort(reverse=True)   # newest first
    return [os.path.join("maps", f) for f in files]