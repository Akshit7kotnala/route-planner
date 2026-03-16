import pygame
import math


class Controls:
    def __init__(self, graph):
        self.graph                 = graph
        self.start_name            = None
        self.goal_name             = None
        self.heuristics            = ['euclidean', 'manhattan', 'diagonal']
        self.h_index               = 0
        self.should_run            = False
        self.should_reset          = False
        self.should_quit           = False
        self.should_generate       = False
        self.should_compare        = False
        self.should_screenshot     = False
        self.should_unblock        = False
        self.should_toggle_traffic = False
        self.should_save_map       = False
        self.should_load_map       = False
        self.mode                  = 'fastest'
        self.blocked_edge          = None

    @property
    def heuristic(self):
        return self.heuristics[self.h_index]

    def handle_events(self):
        self.should_run            = False
        self.should_reset          = False
        self.should_quit           = False
        self.should_generate       = False
        self.should_compare        = False
        self.should_screenshot     = False
        self.should_unblock        = False
        self.should_toggle_traffic = False
        self.should_save_map       = False
        self.should_load_map       = False
        self.blocked_edge          = None

        for event in pygame.event.get():

            if event.type == pygame.QUIT:
                self.should_quit = True

            if event.type == pygame.KEYDOWN:

                # Ctrl+S → save map
                if event.key == pygame.K_s:
                    mods = pygame.key.get_mods()
                    if mods & pygame.KMOD_CTRL:
                        self.should_save_map = True
                    else:
                        self.should_screenshot = True

                # Ctrl+L → load map
                if event.key == pygame.K_l:
                    mods = pygame.key.get_mods()
                    if mods & pygame.KMOD_CTRL:
                        self.should_load_map = True

                if event.key == pygame.K_SPACE:
                    if self.start_name and self.goal_name:
                        self.should_run = True
                    else:
                        print("Select start and goal first")

                if event.key == pygame.K_r:
                    self.should_reset = True

                if event.key == pygame.K_h:
                    self.h_index = (self.h_index + 1) % len(self.heuristics)
                    print(f"Heuristic: {self.heuristic}")

                if event.key == pygame.K_g:
                    self.should_generate = True

                if event.key == pygame.K_c:
                    self.should_compare = True

                if event.key == pygame.K_m:
                    self.mode = (
                        'cleanest' if self.mode == 'fastest' else 'fastest'
                    )
                    print(f"Mode: {self.mode}")

                if event.key == pygame.K_u:
                    self.should_unblock = True

                if event.key == pygame.K_t:
                    self.should_toggle_traffic = True

                if event.key == pygame.K_q:
                    self.should_quit = True

            if event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:
                    self._handle_click(event.pos)
                if event.button == 3:
                    self._handle_right_click(event.pos)

    def _handle_click(self, pos):
        clicked_node = self._get_node_at(pos)
        if not clicked_node:
            return

        if self.start_name is None:
            self.start_name    = clicked_node.name
            clicked_node.state = 'start'
            print(f"Start: {clicked_node.name}")

        elif self.goal_name is None:
            if clicked_node.name == self.start_name:
                print("Goal must differ from start")
                return
            self.goal_name     = clicked_node.name
            clicked_node.state = 'end'
            print(f"Goal: {clicked_node.name}")

        else:
            print("Both selected — press R to reset")

    def _handle_right_click(self, pos):
        edge = self._get_edge_at(pos)
        if edge:
            self.blocked_edge = edge

    def _get_edge_at(self, pos, threshold=15):
        mx, my    = pos
        best_dist = threshold
        best_edge = None
        seen      = set()

        for node in self.graph.nodes.values():
            for neighbor, _, _, _ in node.neighbors:
                key = tuple(sorted([node.name, neighbor.name]))
                if key in seen:
                    continue
                seen.add(key)
                dist = self._point_to_segment_dist(
                    mx, my, node.x, node.y, neighbor.x, neighbor.y
                )
                if dist < best_dist:
                    best_dist = dist
                    best_edge = (node.name, neighbor.name)

        return best_edge

    def _point_to_segment_dist(self, px, py, ax, ay, bx, by):
        dx = bx - ax
        dy = by - ay
        if dx == 0 and dy == 0:
            return math.sqrt((px-ax)**2 + (py-ay)**2)
        t = max(0, min(1,
            ((px-ax)*dx + (py-ay)*dy) / (dx*dx + dy*dy)
        ))
        return math.sqrt(
            (px-(ax+t*dx))**2 + (py-(ay+t*dy))**2
        )

    def _get_node_at(self, pos):
        mx, my = pos
        for node in self.graph.nodes.values():
            if ((mx-node.x)**2 + (my-node.y)**2)**0.5 <= 20:
                return node
        return None

    def reset(self, graph):
        self.start_name = None
        self.goal_name  = None
        graph.reset()
        print("Reset — click two cities")