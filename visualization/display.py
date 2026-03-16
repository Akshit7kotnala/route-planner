import pygame
from core.graph import TRAFFIC_COLORS, TRAFFIC_LABELS, TRAFFIC_CLEAR

WHITE      = (255, 255, 255)
BLACK      = (10,  10,  10)
GREY       = (40,  40,  40)
DARK_GREY  = (25,  25,  25)
ORANGE     = (255, 165,  0)
CYAN       = (0,   255, 255)
GREEN      = (0,   200, 100)
RED        = (220,  50,  50)
PURPLE     = (180,  0,  255)
YELLOW     = (255, 220,  0)
WHITE_NODE = (200, 200, 200)
TOOLTIP_BG = (20,  20,  40)
CLEAN_PATH = (0,   255, 150)
FAST_PATH  = (255, 220,   0)

NODE_RADIUS  = 16
FONT_SIZE    = 13
LABEL_OFFSET = 20
EDGE_WIDTH   = 2
PATH_WIDTH   = 5
PANEL_WIDTH  = 260


def pollution_color(score):
    score = max(1, min(10, score))
    if score <= 4:
        return (int(score / 4 * 200), 200, 0)
    else:
        return (220, int((10 - score) / 6 * 200), 0)


class Display:
    def __init__(self, width, height):
        pygame.init()
        self.width       = width
        self.height      = height
        self.PANEL_WIDTH = PANEL_WIDTH
        self.screen      = pygame.display.set_mode(
            (width + PANEL_WIDTH, height)
        )
        pygame.display.set_caption("A* Route Planner — Live Traffic")
        self.font       = pygame.font.SysFont("consolas", FONT_SIZE)
        self.font_bold  = pygame.font.SysFont("consolas", FONT_SIZE + 2, bold=True)
        self.font_large = pygame.font.SysFont("consolas", FONT_SIZE + 6, bold=True)

    def draw_background(self):
        self.screen.fill(BLACK)
        pygame.draw.rect(
            self.screen, DARK_GREY,
            (self.width, 0, PANEL_WIDTH, self.height)
        )
        pygame.draw.line(
            self.screen, GREY,
            (self.width, 0), (self.width, self.height), 2
        )

    def draw_edges(self, graph, fast_path=None, clean_path=None):
        fast_set  = set()
        clean_set = set()

        if fast_path and len(fast_path) > 1:
            for i in range(len(fast_path) - 1):
                fast_set.add((fast_path[i].name,   fast_path[i+1].name))
                fast_set.add((fast_path[i+1].name, fast_path[i].name))

        if clean_path and len(clean_path) > 1:
            for i in range(len(clean_path) - 1):
                clean_set.add((clean_path[i].name,   clean_path[i+1].name))
                clean_set.add((clean_path[i+1].name, clean_path[i].name))

        blocked_set = {
            key for key, data in graph.edges.items()
            if data.get('blocked')
        }

        drawn = set()
        for node in graph.nodes.values():
            for neighbor, dist, pollution, traffic in node.neighbors:
                edge_key = tuple(sorted([node.name, neighbor.name]))
                if edge_key in drawn:
                    continue
                drawn.add(edge_key)

                is_fast  = (node.name, neighbor.name) in fast_set
                is_clean = (node.name, neighbor.name) in clean_set

                if is_fast and is_clean:
                    color = CYAN
                    width = PATH_WIDTH + 2
                elif is_fast:
                    color = FAST_PATH
                    width = PATH_WIDTH
                elif is_clean:
                    color = CLEAN_PATH
                    width = PATH_WIDTH
                else:
                    # Color by traffic level
                    t_color = TRAFFIC_COLORS.get(traffic, (80, 80, 80))
                    color   = tuple(c // 2 for c in t_color)
                    width   = EDGE_WIDTH + (1 if traffic > 1.0 else 0)

                pygame.draw.line(
                    self.screen, color,
                    (node.x, node.y),
                    (neighbor.x, neighbor.y),
                    width
                )

                mid_x = (node.x + neighbor.x) // 2
                mid_y = (node.y + neighbor.y) // 2

                if is_fast or is_clean:
                    label = self.font.render(str(int(dist)), True, WHITE)
                    self.screen.blit(label, (mid_x, mid_y))

        # Draw blocked roads
        for (name_a, name_b) in blocked_set:
            node_a = graph.nodes.get(name_a)
            node_b = graph.nodes.get(name_b)
            if not node_a or not node_b:
                continue
            pygame.draw.line(
                self.screen, (180, 0, 0),
                (node_a.x, node_a.y),
                (node_b.x, node_b.y), 4
            )
            mid_x = (node_a.x + node_b.x) // 2
            mid_y = (node_a.y + node_b.y) // 2
            x_surf = self.font_bold.render("✕", True, (255, 50, 50))
            self.screen.blit(
                x_surf,
                (mid_x - x_surf.get_width() // 2,
                 mid_y - x_surf.get_height() // 2)
            )

    def draw_nodes(self, graph):
        state_colors = {
            'unvisited': WHITE_NODE,
            'open':      GREEN,
            'closed':    RED,
            'start':     ORANGE,
            'end':       CYAN,
            'path':      PURPLE,
        }

        for node in graph.nodes.values():
            color = state_colors.get(node.state, WHITE_NODE)

            if node.state in ('start', 'end', 'path'):
                pygame.draw.circle(
                    self.screen, color,
                    (node.x, node.y), NODE_RADIUS + 5, 2
                )

            pygame.draw.circle(
                self.screen, color,
                (node.x, node.y), NODE_RADIUS
            )

            label = self.font_bold.render(node.name, True, WHITE)
            self.screen.blit(
                label,
                (node.x - label.get_width() // 2,
                 node.y - NODE_RADIUS - LABEL_OFFSET)
            )

    def draw_tooltip(self, graph, mouse_pos):
        mx, my  = mouse_pos
        hovered = None
        for node in graph.nodes.values():
            if ((mx-node.x)**2 + (my-node.y)**2)**0.5 <= NODE_RADIUS + 5:
                hovered = node
                break

        if not hovered:
            return

        g_val = f"{hovered.g:.1f}" if hovered.g != float('inf') else "∞"
        h_val = f"{hovered.h:.1f}"
        f_val = f"{hovered.f:.1f}" if hovered.f != float('inf') else "∞"
        p_val = f"{hovered.pollution_g:.1f} AQI"

        lines = [
            (f"  {hovered.name}",              CYAN,   True),
            (f"  State    : {hovered.state}",  WHITE,  False),
            (f"  g cost   : {g_val}",          GREEN,  False),
            (f"  h cost   : {h_val}",          YELLOW, False),
            (f"  f cost   : {f_val}",          ORANGE, False),
            (f"  pollution: {p_val}",          RED,    False),
            ("  ──────────────────",           GREY,   False),
            ("  Roads:",                       WHITE,  False),
        ]

        for neighbor, dist, poll, traffic in hovered.neighbors:
            t_color = TRAFFIC_COLORS.get(traffic, (200, 200, 200))
            t_label = TRAFFIC_LABELS.get(traffic, "")
            lines.append((
                f"    {neighbor.name} {int(dist)}km [{t_label}]",
                t_color, False
            ))

        padding = 10
        line_h  = FONT_SIZE + 6
        tip_w   = 240
        tip_h   = padding * 2 + len(lines) * line_h

        tx = mx + 20
        ty = my - tip_h // 2
        if tx + tip_w > self.width: tx = mx - tip_w - 20
        if ty < 5:                  ty = 5
        if ty + tip_h > self.height: ty = self.height - tip_h - 5

        pygame.draw.rect(self.screen, TOOLTIP_BG,
                         (tx, ty, tip_w, tip_h), border_radius=8)

        state_colors = {
            'unvisited': WHITE_NODE, 'open': GREEN, 'closed': RED,
            'start': ORANGE, 'end': CYAN, 'path': PURPLE,
        }
        pygame.draw.rect(
            self.screen,
            state_colors.get(hovered.state, WHITE_NODE),
            (tx, ty, tip_w, tip_h), 2, border_radius=8
        )

        for i, (text, color, bold) in enumerate(lines):
            f = self.font_bold if bold else self.font
            surf = f.render(text, True, color)
            self.screen.blit(surf, (tx+padding, ty+padding+i*line_h))

    def draw_traffic_ticker(self, changed_roads, tick):
        """Show recently changed roads at bottom of map"""
        if not changed_roads:
            return
        y = self.height - 22
        x = 10
        for name_a, name_b, traffic in changed_roads[-4:]:
            t_color = TRAFFIC_COLORS.get(traffic, WHITE)
            t_label = TRAFFIC_LABELS.get(traffic, "")
            text    = f"{name_a}↔{name_b}: {t_label}"
            surf    = self.font.render(text, True, t_color)
            bg      = pygame.Surface(
                (surf.get_width() + 6, surf.get_height() + 4)
            )
            bg.set_alpha(160)
            bg.fill(BLACK)
            self.screen.blit(bg, (x - 3, y - 2))
            self.screen.blit(surf, (x, y))
            x += surf.get_width() + 20
            if x > self.width - 100:
                break

    def draw_panel(self, start_name, goal_name,
                   fast_path, clean_path,
                   nodes_explored, time_ms,
                   heuristic, status,
                   anim_speed=5, mode='fastest',
                   traffic_on=False, traffic_interval=5):

        x = self.width + 15
        y = 20

        def write(text, color=WHITE, big=False):
            nonlocal y
            f    = self.font_large if big else self.font
            surf = f.render(text, True, color)
            self.screen.blit(surf, (x, y))
            y   += surf.get_height() + 8

        write("A* ROUTE PLANNER", CYAN, big=True)
        y += 4

        mode_color = CLEAN_PATH if mode == 'cleanest' else FAST_PATH
        write(f"Mode: {'🌿 CLEAN' if mode == 'cleanest' else '⚡ FAST'}",
              mode_color)

        traffic_color = GREEN if traffic_on else GREY
        write(f"Traffic: {'🔴 LIVE' if traffic_on else 'OFF'}",
              traffic_color)
        if traffic_on:
            write(f"  update every {traffic_interval}s", GREY)
        y += 4

        pygame.draw.line(self.screen, GREY,
                         (x, y), (x+PANEL_WIDTH-30, y), 1)
        y += 10

        write("SETTINGS", ORANGE)
        write(f"Start  : {start_name or '---'}")
        write(f"Goal   : {goal_name  or '---'}")
        write(f"Method : {heuristic.capitalize()}")
        y += 6

        pygame.draw.line(self.screen, GREY,
                         (x, y), (x+PANEL_WIDTH-30, y), 1)
        y += 10

        write("RESULTS", ORANGE)
        write(f"Status  : {status}")
        write(f"Explored: {nodes_explored} cities")
        write(f"Time    : {time_ms} ms")

        if fast_path:
            y += 4
            write("⚡ FASTEST", FAST_PATH)
            write(f"  Dist : {fast_path[-1].g:.0f}")
            write(f"  Stops: {len(fast_path)}")
            write(f"  AQI  : {fast_path[-1].pollution_g:.1f}")

        if clean_path:
            write("🌿 CLEANEST", CLEAN_PATH)
            write(f"  Stops: {len(clean_path)}")
            write(f"  AQI  : {clean_path[-1].pollution_g:.1f}")

        if fast_path and clean_path:
            y += 4
            pygame.draw.line(self.screen, GREY,
                             (x, y), (x+PANEL_WIDTH-30, y), 1)
            y += 8
            saved = fast_path[-1].pollution_g - clean_path[-1].pollution_g
            if saved > 0:
                pct = saved / fast_path[-1].pollution_g * 100
                write(f"AQI saved: {saved:.1f} ({pct:.0f}%)", CLEAN_PATH)

        y += 6
        pygame.draw.line(self.screen, GREY,
                         (x, y), (x+PANEL_WIDTH-30, y), 1)
        y += 10

        write("CONTROLS", ORANGE)
        write("L-click = start/end")
        write("R-click = block road")
        write("SPACE = run A*")
        write("T = toggle traffic")
        write("M = fast/clean mode")
        write("U = unblock roads")
        write("C = compare algos")
        write("S = screenshot")
        write("Ctrl+S = save map")
        write("Ctrl+L = load map")
        write("R = reset")
        write("H = heuristic")
        write("G = random map")
        write(f"+/- = speed: {anim_speed}x")
        write("Q = quit")

        y += 6
        pygame.draw.line(self.screen, GREY,
                         (x, y), (x+PANEL_WIDTH-30, y), 1)
        y += 10

        write("TRAFFIC", ORANGE)
        for traffic, color in TRAFFIC_COLORS.items():
            label = TRAFFIC_LABELS[traffic]
            pygame.draw.circle(self.screen, color, (x+6, y+6), 6)
            surf  = self.font.render(label, True, WHITE)
            self.screen.blit(surf, (x+18, y))
            y += 18

    def draw_comparison_panel(self, results):
        overlay = pygame.Surface(
            (self.width + self.PANEL_WIDTH, self.height),
            pygame.SRCALPHA
        )
        overlay.fill((0, 0, 0, 180))
        self.screen.blit(overlay, (0, 0))

        box_w   = 200
        box_h   = 280
        spacing = 30
        total_w = len(results) * box_w + (len(results)-1) * spacing
        start_x = (self.width - total_w) // 2
        start_y = (self.height - box_h) // 2
        colors  = [CYAN, YELLOW, GREEN]

        title = self.font_large.render("ALGORITHM COMPARISON", True, WHITE)
        self.screen.blit(title, (
            self.width//2 - title.get_width()//2, start_y - 60
        ))
        sub = self.font.render("Press C again or R to close", True, GREY)
        self.screen.blit(sub, (
            self.width//2 - sub.get_width()//2, start_y - 30
        ))

        for i, result in enumerate(results):
            bx = start_x + i * (box_w + spacing)
            by = start_y
            c  = colors[i % len(colors)]

            pygame.draw.rect(self.screen, DARK_GREY,
                             (bx, by, box_w, box_h), border_radius=10)
            pygame.draw.rect(self.screen, c,
                             (bx, by, box_w, box_h), 2, border_radius=10)

            ns = self.font_large.render(result['name'], True, c)
            self.screen.blit(ns, (
                bx + box_w//2 - ns.get_width()//2, by+15
            ))
            pygame.draw.line(self.screen, c,
                             (bx+10, by+45), (bx+box_w-10, by+45), 1)

            py = by + 60
            for label, value in [
                ("Found",    "Yes" if result['found'] else "No"),
                ("Explored", f"{result['nodes_explored']} cities"),
                ("Distance", f"{result['distance']:.0f} km" if result['found'] else "N/A"),
                ("Stops",    f"{len(result['path'])} cities" if result['found'] else "N/A"),
                ("Time",     f"{result['time_ms']} ms"),
            ]:
                ls = self.font.render(f"{label}:", True, GREY)
                vs = self.font.render(value, True, WHITE)
                self.screen.blit(ls, (bx+15, py))
                self.screen.blit(vs, (bx+box_w-vs.get_width()-15, py))
                py += 28

            if result.get('winner'):
                badge = self.font_bold.render("★ MOST EFFICIENT", True, YELLOW)
                self.screen.blit(badge, (
                    bx+box_w//2 - badge.get_width()//2,
                    by+box_h-35
                ))

    def update(self):
        pygame.display.flip()