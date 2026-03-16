import math

def manhattan(node_a, node_b):
    """
    Sum of horizontal + vertical distance.
    Best for grid movement (up/down/left/right only).
    """
    return abs(node_a.x - node_b.x) + abs(node_a.y - node_b.y)


def euclidean(node_a, node_b):
    """
    Straight-line distance between two points.
    Best for city-map style where you can move in any direction.
    This is our PRIMARY heuristic for node-edge graphs.
    """
    return math.sqrt((node_a.x - node_b.x)**2 + (node_a.y - node_b.y)**2)


def diagonal(node_a, node_b):
    """
    Allows diagonal movement — cheaper than Euclidean.
    Best for 8-directional grid movement.
    """
    dx = abs(node_a.x - node_b.x)
    dy = abs(node_a.y - node_b.y)
    return max(dx, dy)


# Dictionary so we can switch heuristics easily later
HEURISTICS = {
    'euclidean': euclidean,
    'manhattan': manhattan,
    'diagonal': diagonal
}