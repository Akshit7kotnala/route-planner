import { useState, useRef, useCallback, useEffect, useReducer } from 'react';
import { AStar } from '../core/AStar.js';
import { BFS, Dijkstra } from '../core/algorithms.js';
import { createIndiaMap, generateRandomMap } from '../core/mapData.js';

const HEURISTIC_NAMES = ['euclidean', 'manhattan', 'diagonal'];

export function useAstar() {
  const [graph, setGraph] = useState(() => createIndiaMap());
  const [, forceRender] = useReducer((count) => count + 1, 0);
  const [startName, setStartName] = useState(null);
  const [goalName, setGoalName] = useState(null);
  const [fastPath, setFastPath] = useState([]);
  const [cleanPath, setCleanPath] = useState([]);
  const [nodesExplored, setNodesExplored] = useState(0);
  const [status, setStatus] = useState('Click a city -> START');
  const [heuristic, setHeuristic] = useState('euclidean');
  const [mode, setMode] = useState('fastest');
  const [animSpeed, setAnimSpeed] = useState(5);
  const [animating, setAnimating] = useState(false);
  const [trafficOn, setTrafficOn] = useState(false);
  const [recentChanges, setRecentChanges] = useState([]);
  const [compResults, setCompResults] = useState(null);
  const [showComp, setShowComp] = useState(false);
  const [timeMs, setTimeMs] = useState(0);

  const astarRef = useRef(null);
  const animFrameRef = useRef(null);
  const trafficIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // -- Helpers ------------------------------------------------
  const resetPaths = useCallback(() => {
    setFastPath([]);
    setCleanPath([]);
    setNodesExplored(0);
    setTimeMs(0);
    setCompResults(null);
    setShowComp(false);
  }, []);

  const refreshGraph = useCallback(() => {
    forceRender();
  }, []);

  const silentRun = useCallback((g, currentMode, h) => {
    const clone = g.clone();
    const silent = new AStar(clone, h, currentMode, 50);
    const path = silent.run(
      g.nodes[Object.keys(g.nodes).find((k) => g.nodes[k].state === 'start')],
      null
    );
    return { clone, silent, path };
  }, []);

  const reroute = useCallback((g, sName, gName, h) => {
    const gc1 = g.clone();
    const fast = new AStar(gc1, h, 'fastest', 50);
    const fp = fast.run(sName, gName);

    const gc2 = g.clone();
    const clean = new AStar(gc2, h, 'cleanest', 50);
    const cp = clean.run(sName, gName);

    setFastPath(fp);
    setCleanPath(cp);

    if (fp.length || cp.length) {
      setStatus('Rerouted!');
    } else {
      setStatus('No path - all routes blocked!');
    }
  }, []);

  // -- City click --------------------------------------------
  const handleCityClick = useCallback(
    (node) => {
      if (!startName) {
        node.state = 'start';
        setStartName(node.name);
        setStatus('Click a city -> GOAL');
        refreshGraph();
      } else if (!goalName) {
        if (node.name === startName) return;
        node.state = 'end';
        setGoalName(node.name);
        setStatus('Press SPACE or Run button');
        refreshGraph();
      }
    },
    [goalName, refreshGraph, startName]
  );

  // -- Block road --------------------------------------------
  const handleBlockEdge = useCallback(
    (nameA, nameB) => {
      graph.blockEdge(nameA, nameB);
      refreshGraph();
      if (startName && goalName) {
        reroute(graph, startName, goalName, heuristic);
      }
    },
    [goalName, graph, heuristic, refreshGraph, reroute, startName]
  );

  // -- Run A* animation --------------------------------------
  const runAstar = useCallback(() => {
    if (!startName || !goalName) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (mode === 'fastest') {
      const gc = graph.clone();
      const s = new AStar(gc, heuristic, 'cleanest', 50);
      setCleanPath(s.run(startName, goalName));
      graph.nodes[startName].state = 'start';
      graph.nodes[goalName].state = 'end';
    } else {
      const gc = graph.clone();
      const s = new AStar(gc, heuristic, 'fastest', 50);
      setFastPath(s.run(startName, goalName));
      graph.nodes[startName].state = 'start';
      graph.nodes[goalName].state = 'end';
    }

    graph.reset();
    graph.nodes[startName].state = 'start';
    graph.nodes[goalName].state = 'end';

    const astar = new AStar(graph, heuristic, mode, 50);
    astar.initialize(startName, goalName);
    astarRef.current = astar;
    startTimeRef.current = performance.now();
    setAnimating(true);
    setStatus(`Searching (${mode})...`);
  }, [graph, startName, goalName, heuristic, mode]);

  // -- Animation loop ----------------------------------------
  useEffect(() => {
    if (!animating || !astarRef.current) return undefined;

    const tick = () => {
      const astar = astarRef.current;
      let running = true;

      for (let i = 0; i < animSpeed; i += 1) {
        running = astar.step();
        if (!running) break;
      }

      refreshGraph();

      if (!running) {
        setAnimating(false);
        const ms = Math.round(performance.now() - startTimeRef.current);
        setTimeMs(ms);
        setNodesExplored(astar.nodesExplored);

        if (mode === 'fastest') setFastPath([...astar.path]);
        else setCleanPath([...astar.path]);

        setStatus(astar.found ? 'Path found! OK' : 'No path found');
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [animating, animSpeed, mode, refreshGraph]);

  // -- Traffic simulation ------------------------------------
  useEffect(() => {
    if (!trafficOn) {
      clearInterval(trafficIntervalRef.current);
      return undefined;
    }

    trafficIntervalRef.current = setInterval(() => {
      const changed = graph.updateTraffic(0.25);
      setRecentChanges(changed.slice(-4));
      refreshGraph();

      if (startName && goalName && !animating) {
        reroute(graph, startName, goalName, heuristic);
      }
    }, 5000);

    return () => clearInterval(trafficIntervalRef.current);
  }, [trafficOn, graph, startName, goalName, animating, heuristic, refreshGraph, reroute]);

  // -- Algorithm comparison ----------------------------------
  const runComparison = useCallback(() => {
    if (!startName || !goalName) return;

    const algorithms = [
      { name: 'A*', algo: new AStar(graph.clone(), heuristic) },
      { name: 'Dijkstra', algo: new Dijkstra(graph.clone()) },
      { name: 'BFS', algo: new BFS(graph.clone()) },
    ];

    const results = algorithms.map(({ name, algo }) => {
      const t0 = performance.now();
      const path = algo.run(startName, goalName);
      const tms = Math.round(performance.now() - t0);
      const dist =
        name === 'BFS'
          ? algo.totalDistance
            ? algo.totalDistance()
            : 0
          : path.length
            ? path[path.length - 1].g
            : 0;

      return {
        name,
        path,
        nodesExplored: algo.nodesExplored,
        distance: Math.round(dist),
        timeMs: tms,
        found: algo.found,
        winner: false,
      };
    });

    const found = results.filter((r) => r.found);
    if (found.length) {
      found.reduce((a, b) => (a.nodesExplored < b.nodesExplored ? a : b)).winner = true;
    }

    graph.reset();
    if (startName) graph.nodes[startName].state = 'start';
    if (goalName) graph.nodes[goalName].state = 'end';
    refreshGraph();

    setCompResults(results);
    setShowComp(true);
  }, [goalName, graph, heuristic, refreshGraph, startName]);

  // -- Reset --------------------------------------------------
  const reset = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setAnimating(false);
    graph.reset();
    setStartName(null);
    setGoalName(null);
    resetPaths();
    setStatus('Click a city -> START');
    setRecentChanges([]);
    refreshGraph();
  }, [graph, refreshGraph, resetPaths]);

  // -- New random map ----------------------------------------
  const newRandomMap = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(trafficIntervalRef.current);
    const g = generateRandomMap(20);
    setGraph(g);
    setStartName(null);
    setGoalName(null);
    setAnimating(false);
    setTrafficOn(false);
    resetPaths();
    setStatus('Click a city -> START');
    setRecentChanges([]);
  }, [resetPaths]);

  // -- Load India map ----------------------------------------
  const loadIndiaMap = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    clearInterval(trafficIntervalRef.current);
    const g = createIndiaMap();
    setGraph(g);
    setStartName(null);
    setGoalName(null);
    setAnimating(false);
    setTrafficOn(false);
    resetPaths();
    setStatus('Click a city -> START');
    setRecentChanges([]);
  }, [resetPaths]);

  const unblockAll = useCallback(() => {
    graph.unblockAll();
    if (startName) graph.nodes[startName].state = 'start';
    if (goalName) graph.nodes[goalName].state = 'end';
    refreshGraph();

    if (startName && goalName && !animating) {
      reroute(graph, startName, goalName, heuristic);
    }
  }, [animating, goalName, graph, heuristic, refreshGraph, reroute, startName]);

  const toggleMode = useCallback(() => {
    setMode((current) => {
      const nextMode = current === 'fastest' ? 'cleanest' : 'fastest';
      if (startName && goalName && !animating) {
        reroute(graph, startName, goalName, heuristic);
        setStatus(`Mode: ${nextMode}`);
      }
      return nextMode;
    });
  }, [animating, goalName, graph, heuristic, reroute, startName]);

  const cycleHeuristic = useCallback(() => {
    setHeuristic((current) => {
      const idx = HEURISTIC_NAMES.indexOf(current);
      const nextHeuristic = HEURISTIC_NAMES[(idx + 1) % HEURISTIC_NAMES.length];
      if (startName && goalName && !animating) {
        reroute(graph, startName, goalName, nextHeuristic);
        setStatus(`Heuristic: ${nextHeuristic}`);
      }
      return nextHeuristic;
    });
  }, [animating, goalName, graph, reroute, startName]);

  const toggleTraffic = useCallback(() => {
    setTrafficOn((current) => {
      const nextTraffic = !current;
      setStatus(nextTraffic ? 'Traffic simulation ON' : 'Traffic simulation OFF');
      return nextTraffic;
    });
  }, []);

  return {
    graph,
    startName,
    goalName,
    fastPath,
    cleanPath,
    nodesExplored,
    status,
    timeMs,
    heuristic,
    setHeuristic,
    mode,
    setMode,
    animSpeed,
    setAnimSpeed,
    animating,
    trafficOn,
    setTrafficOn,
    recentChanges,
    compResults,
    showComp,
    setShowComp,
    handleCityClick,
    handleBlockEdge,
    runAstar,
    runComparison,
    reset,
    newRandomMap,
    loadIndiaMap,
    unblockAll,
    toggleMode,
    cycleHeuristic,
    toggleTraffic,
    silentRun,
  };
}
