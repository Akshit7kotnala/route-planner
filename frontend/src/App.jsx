import { useCallback, useEffect } from 'react';
import MapCanvas from './components/MapCanvas.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import ComparisonModal from './components/ComparisonModal.jsx';
import { useAstar } from './hooks/useAstar.js';
import './App.css';

export default function App() {
  const {
    graph,
    fastPath,
    cleanPath,
    startName,
    goalName,
    nodesExplored,
    status,
    timeMs,
    heuristic,
    mode,
    animSpeed,
    setAnimSpeed,
    trafficOn,
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
  } = useAstar();

  const handleKey = useCallback((e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      runAstar();
    }
    if (e.code === 'KeyR') reset();
    if (e.code === 'KeyH') cycleHeuristic();
    if (e.code === 'KeyM') toggleMode();
    if (e.code === 'KeyT') toggleTraffic();
    if (e.code === 'KeyC') runComparison();
    if (e.code === 'KeyG') newRandomMap();
  }, [cycleHeuristic, newRandomMap, reset, runAstar, runComparison, toggleMode, toggleTraffic]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div style={styles.app}>
      <div style={styles.canvasWrap}>
        <MapCanvas
          graph={graph}
          fastPath={fastPath}
          cleanPath={cleanPath}
          onCityClick={handleCityClick}
          onBlockEdge={handleBlockEdge}
        />
      </div>

      <ControlPanel
        startName={startName}
        goalName={goalName}
        status={status}
        heuristic={heuristic}
        mode={mode}
        animSpeed={animSpeed}
        setAnimSpeed={setAnimSpeed}
        trafficOn={trafficOn}
        nodesExplored={nodesExplored}
        timeMs={timeMs}
        fastPath={fastPath}
        cleanPath={cleanPath}
        recentChanges={recentChanges}
        onRun={runAstar}
        onReset={reset}
        onToggleMode={toggleMode}
        onToggleTraffic={toggleTraffic}
        onCycleHeuristic={cycleHeuristic}
        onNewRandomMap={newRandomMap}
        onLoadIndiaMap={loadIndiaMap}
        onUnblock={unblockAll}
        onCompare={runComparison}
      />

      {showComp && (
        <ComparisonModal results={compResults} onClose={() => setShowComp(false)} />
      )}
    </div>
  );
}

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    outline: 'none',
    background: '#0a0a0a',
  },
  canvasWrap: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
  },
};
