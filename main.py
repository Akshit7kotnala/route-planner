import pygame
import sys
import time
import os
from datetime import datetime
from core.map_io import save_map, load_map, list_saved_maps
from core.graph              import create_india_map
from core.map_generator      import generate_random_map
from core.astar              import AStar, AStarSilent
from core.algorithms         import BFS, Dijkstra
from utils.timer             import Timer
from visualization.display   import Display
from visualization.controls  import Controls

MAP_WIDTH  = 650
MAP_HEIGHT = 750
FPS        = 60


def reroute_silent(graph, controls):
    """Run both paths silently and return (fast_path, clean_path)"""
    def _reset_keep_states(graph, start, goal):
        for node in graph.nodes.values():
            if node.state not in ('start', 'end'):
                node.reset()
            else:
                s = node.state
                node.reset()
                node.state = s

    silent_clean = AStarSilent(
        graph, controls.heuristic,
        mode='cleanest', pollution_weight=50.0
    )
    clean = silent_clean.run(controls.start_name, controls.goal_name)
    _reset_keep_states(graph, controls.start_name, controls.goal_name)

    silent_fast = AStarSilent(graph, controls.heuristic, mode='fastest')
    fast = silent_fast.run(controls.start_name, controls.goal_name)
    _reset_keep_states(graph, controls.start_name, controls.goal_name)

    return fast, clean


def run_comparison(graph, start_name, goal_name):
    results = []
    algorithms = [
        ("A*",       AStarSilent(graph, 'euclidean')),
        ("Dijkstra", Dijkstra(graph)),
        ("BFS",      BFS(graph)),
    ]
    for name, algo in algorithms:
        t0   = time.perf_counter()
        path = algo.run(start_name, goal_name)
        t_ms = round((time.perf_counter() - t0) * 1000, 3)
        dist = algo.total_distance() if name == "BFS" and path \
               else (path[-1].g if path else 0)
        results.append({
            'name':           name,
            'path':           path,
            'nodes_explored': algo.nodes_explored,
            'distance':       dist,
            'time_ms':        t_ms,
            'found':          algo.found,
            'winner':         False
        })
    found = [r for r in results if r['found']]
    if found:
        min(found, key=lambda r: r['nodes_explored'])['winner'] = True
    return results


def main():
    graph    = create_india_map()
    display  = Display(MAP_WIDTH, MAP_HEIGHT)
    controls = Controls(graph)
    timer    = Timer()
    clock    = pygame.time.Clock()

    fast_path          = []
    clean_path         = []
    nodes_explored     = 0
    time_ms            = 0
    status             = "Select start city"
    astar              = None
    animating          = False
    anim_speed         = 5
    show_comparison    = False
    comparison_results = []

    # ── Traffic simulation state ─────────────────────
    traffic_on           = False
    traffic_interval     = 5       # seconds between updates
    last_traffic_update  = time.time()
    recently_changed     = []      # for the ticker display

    while True:
        clock.tick(FPS)
        controls.handle_events()

        # ── Quit ─────────────────────────────────────
        if controls.should_quit:
            pygame.quit()
            sys.exit()

        # ── Reset ────────────────────────────────────
        if controls.should_reset:
            controls.reset(graph)
            fast_path          = []
            clean_path         = []
            nodes_explored     = 0
            time_ms            = 0
            status             = "Select start city"
            astar              = None
            animating          = False
            show_comparison    = False
            comparison_results = []
            recently_changed   = []

        # ── Generate random map ──────────────────────
        if controls.should_generate:
            graph    = generate_random_map(num_cities=20)
            controls = Controls(graph)
            fast_path          = []
            clean_path         = []
            nodes_explored     = 0
            time_ms            = 0
            status             = "Select start city"
            astar              = None
            animating          = False
            show_comparison    = False
            comparison_results = []
            recently_changed   = []

        # ── Speed controls ───────────────────────────
        keys = pygame.key.get_pressed()
        if keys[pygame.K_EQUALS] or keys[pygame.K_PLUS]:
            anim_speed = min(anim_speed + 1, 30)
        if keys[pygame.K_MINUS]:
            anim_speed = max(anim_speed - 1, 1)

        # ── Toggle traffic ───────────────────────────
        if controls.should_toggle_traffic:
            traffic_on          = not traffic_on
            last_traffic_update = time.time()
            status = f"Traffic {'ON 🔴' if traffic_on else 'OFF'}"
            print(f"Traffic simulation: {'ON' if traffic_on else 'OFF'}")

        # ── Live traffic update ──────────────────────
        if traffic_on:
            now = time.time()
            if now - last_traffic_update >= traffic_interval:
                last_traffic_update = now
                changed = graph.update_traffic(change_fraction=0.25)
                recently_changed = changed

                # Auto reroute if path exists
                if (controls.start_name and controls.goal_name
                        and (fast_path or clean_path)
                        and not animating):
                    fast_path, clean_path = reroute_silent(graph, controls)
                    if fast_path or clean_path:
                        status = "Traffic updated — rerouted!"
                    else:
                        status = "Traffic jammed all routes!"

        # ── Screenshot ───────────────────────────────
        if controls.should_screenshot:
            folder    = "screenshots"
            os.makedirs(folder, exist_ok=True)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename  = f"{folder}/route_{timestamp}.png"
            pygame.image.save(display.screen, filename)
            print(f"Screenshot saved → {filename}")
            status = f"Saved: route_{timestamp}.png"
        

        # Save map
        if controls.should_save_map:
            filename = save_map(graph)
            status   = f"Map saved → {filename}"
            print(f"Saved: {filename}")

        # Load map
        if controls.should_load_map:
            saved = list_saved_maps()
            if saved:
                # Load the most recent saved map
                loaded = load_map(saved[0])
                if loaded:
                    graph    = loaded
                    controls = Controls(graph)
                    fast_path          = []
                    clean_path         = []
                    nodes_explored     = 0
                    time_ms            = 0
                    astar              = None
                    animating          = False
                    show_comparison    = False
                    comparison_results = []
                    recently_changed   = []
                    status = f"Loaded: {saved[0]}"
                    print(f"Loaded: {saved[0]}")
            else:
                status = "No saved maps found — press Ctrl+S to save first"
                print("No saved maps in maps/ folder")
        # ── Unblock roads ────────────────────────────
        if controls.should_unblock:
            graph.unblock_all()
            fast_path  = []
            clean_path = []
            status     = "Roads restored — press SPACE to rerun"

        # ── Block a road + reroute ───────────────────
        if controls.blocked_edge:
            name_a, name_b = controls.blocked_edge
            graph.block_edge(name_a, name_b)
            if controls.start_name and controls.goal_name:
                fast_path, clean_path = reroute_silent(graph, controls)
                status = "Road blocked! Rerouted ✕" if (fast_path or clean_path) \
                         else "No path — all routes blocked!"

        # ── Algorithm comparison ─────────────────────
        if controls.should_compare:
            if controls.start_name and controls.goal_name:
                comparison_results = run_comparison(
                    graph, controls.start_name, controls.goal_name
                )
                show_comparison = not show_comparison
                graph.reset()
                if controls.start_name:
                    graph.get_node(controls.start_name).state = 'start'
                if controls.goal_name:
                    graph.get_node(controls.goal_name).state  = 'end'
                fast_path  = []
                clean_path = []
            else:
                print("Select start and goal first")

        # ── Run A* animation ─────────────────────────
        if controls.should_run:
            show_comparison = False
            animating       = False

            if controls.mode == 'fastest':
                silent     = AStarSilent(
                    graph, controls.heuristic,
                    mode='cleanest', pollution_weight=50.0
                )
                clean_path = silent.run(
                    controls.start_name, controls.goal_name
                )
                graph.reset()
                if controls.start_name:
                    graph.get_node(controls.start_name).state = 'start'
                if controls.goal_name:
                    graph.get_node(controls.goal_name).state  = 'end'
                timer.start()
                astar = AStar(graph, controls.heuristic, mode='fastest')
            else:
                silent    = AStarSilent(graph, controls.heuristic)
                fast_path = silent.run(
                    controls.start_name, controls.goal_name
                )
                graph.reset()
                if controls.start_name:
                    graph.get_node(controls.start_name).state = 'start'
                if controls.goal_name:
                    graph.get_node(controls.goal_name).state  = 'end'
                timer.start()
                astar = AStar(
                    graph, controls.heuristic,
                    mode='cleanest', pollution_weight=50.0
                )

            astar.initialize(controls.start_name, controls.goal_name)
            animating = True
            status    = f"Searching ({controls.mode})..."

        # ── Advance animation ─────────────────────────
        if animating and astar:
            for _ in range(anim_speed):
                still = astar.step()
                if not still:
                    animating      = False
                    timer.stop()
                    time_ms        = timer.get_elapsed_ms()
                    nodes_explored = astar.nodes_explored

                    if controls.mode == 'fastest':
                        fast_path = astar.path
                    else:
                        clean_path = astar.path

                    status = "Path found!" if astar.path else "No path found"
                    if astar.path:
                        astar.print_result()
                    break

        # ── Status message ───────────────────────────
        if not animating and not controls.should_run:
            if not controls.start_name:
                status = "Click a city → START"
            elif not controls.goal_name:
                status = "Click a city → GOAL"
            elif not fast_path and not clean_path:
                status = "Press SPACE to run"

        # ── Draw ─────────────────────────────────────
        display.draw_background()
        display.draw_edges(graph, fast_path, clean_path)
        display.draw_nodes(graph)
        display.draw_tooltip(graph, pygame.mouse.get_pos())
        display.draw_traffic_ticker(recently_changed, 0)
        display.draw_panel(
            start_name       = controls.start_name,
            goal_name        = controls.goal_name,
            fast_path        = fast_path,
            clean_path       = clean_path,
            nodes_explored   = nodes_explored,
            time_ms          = time_ms,
            heuristic        = controls.heuristic,
            status           = status,
            anim_speed       = anim_speed,
            mode             = controls.mode,
            traffic_on       = traffic_on,
            traffic_interval = traffic_interval
        )

        if show_comparison and comparison_results:
            display.draw_comparison_panel(comparison_results)

        display.update()


if __name__ == "__main__":
    main()