export default function ControlPanel({
  startName,
  goalName,
  status,
  heuristic,
  mode,
  animSpeed,
  setAnimSpeed,
  trafficOn,
  nodesExplored,
  timeMs,
  fastPath,
  cleanPath,
  onRun,
  onReset,
  onToggleMode,
  onToggleTraffic,
  onCycleHeuristic,
  onNewRandomMap,
  onLoadIndiaMap,
  onUnblock,
  onCompare,
  recentChanges,
}) {
  const fastDist = fastPath?.length ? Math.round(fastPath[fastPath.length - 1].g) : null;
  const cleanPoll = cleanPath?.length
    ? cleanPath[cleanPath.length - 1].pollutionG.toFixed(1)
    : null;
  const fastPoll = fastPath?.length ? fastPath[fastPath.length - 1].pollutionG.toFixed(1) : null;

  const saved =
    fastPoll && cleanPoll ? (parseFloat(fastPoll) - parseFloat(cleanPoll)).toFixed(1) : null;

  return (
    <div style={styles.panel}>
      <div style={styles.title}>A* ROUTE PLANNER</div>

      <div
        style={{
          ...styles.badge,
          background: mode === 'cleanest' ? '#00ff9622' : '#ffdc0022',
          border: `1px solid ${mode === 'cleanest' ? '#00ff96' : '#ffdc00'}`,
          color: mode === 'cleanest' ? '#00ff96' : '#ffdc00',
        }}
      >
        {mode === 'cleanest' ? '🌿 CLEANEST MODE' : '⚡ FASTEST MODE'}
      </div>

      <Divider />

      <Section title="SETTINGS">
        <Row label="Start" value={startName || '---'} />
        <Row label="Goal" value={goalName || '---'} />
        <Row label="Method" value={heuristic} />
        <Row
          label="Status"
          value={status}
          color={
            status.includes('✓')
              ? '#00c864'
              : status.includes('No path')
                ? '#dc3232'
                : '#ffffff'
          }
        />
      </Section>

      <Divider />

      <Section title="RESULTS">
        <Row label="Explored" value={`${nodesExplored} cities`} />
        <Row label="Time" value={`${timeMs} ms`} />
        {fastDist && <Row label="⚡ Distance" value={`${fastDist} km`} color="#ffdc00" />}
        {fastPoll && <Row label="⚡ AQI" value={fastPoll} color="#ffdc00" />}
        {cleanPoll && <Row label="🌿 AQI" value={cleanPoll} color="#00ff96" />}
        {saved && parseFloat(saved) > 0 && (
          <Row
            label="AQI Saved"
            value={`${saved} (${Math.round((parseFloat(saved) / parseFloat(fastPoll)) * 100)}%)`}
            color="#00ff96"
          />
        )}
      </Section>

      {fastPath?.length > 0 && (
        <>
          <Divider />
          <Section title="⚡ FASTEST PATH">
            <div style={styles.path}>
              {fastPath.map((n, i) => (
                <span key={n.name} style={{ color: '#ffdc00' }}>
                  {i > 0 && <span style={{ color: '#555' }}> → </span>}
                  {n.name}
                </span>
              ))}
            </div>
          </Section>
        </>
      )}

      {cleanPath?.length > 0 && (
        <>
          <Divider />
          <Section title="🌿 CLEANEST PATH">
            <div style={styles.path}>
              {cleanPath.map((n, i) => (
                <span key={n.name} style={{ color: '#00ff96' }}>
                  {i > 0 && <span style={{ color: '#555' }}> → </span>}
                  {n.name}
                </span>
              ))}
            </div>
          </Section>
        </>
      )}

      <Divider />

      <Section title="ANIMATION SPEED">
        <div style={styles.speedRow}>
          <button
            type="button"
            style={styles.smallBtn}
            onClick={() => setAnimSpeed((s) => Math.max(1, s - 1))}
          >
            −
          </button>
          <span style={{ color: '#ffdc00', margin: '0 8px' }}>{animSpeed}x</span>
          <button
            type="button"
            style={styles.smallBtn}
            onClick={() => setAnimSpeed((s) => Math.min(30, s + 1))}
          >
            +
          </button>
        </div>
      </Section>

      <Divider />

      <Section title="CONTROLS">
        <Btn onClick={onRun} color="#ffa500">
          ▶ Run A*
        </Btn>
        <Btn onClick={onToggleMode} color={mode === 'cleanest' ? '#00ff96' : '#ffdc00'}>
          {mode === 'cleanest' ? '🌿 Switch to Fast' : '⚡ Switch to Clean'}
        </Btn>
        <Btn onClick={onCycleHeuristic} color="#b400ff">
          H: {heuristic}
        </Btn>
        <Btn onClick={onCompare} color="#00ffff">
          📊 Compare Algos
        </Btn>
        <Btn onClick={onToggleTraffic} color={trafficOn ? '#ff6400' : '#888888'}>
          {trafficOn ? '🔴 Traffic ON' : '⚫ Traffic OFF'}
        </Btn>
        <Btn onClick={onUnblock} color="#888888">
          🔓 Unblock Roads
        </Btn>
        <Btn onClick={onReset} color="#dc3232">
          ↺ Reset
        </Btn>
        <Btn onClick={onNewRandomMap} color="#00c864">
          🎲 Random Map
        </Btn>
        <Btn onClick={onLoadIndiaMap} color="#0096ff">
          🗺 India Map
        </Btn>
      </Section>

      {recentChanges?.length > 0 && (
        <>
          <Divider />
          <Section title="🔴 TRAFFIC UPDATES">
            {recentChanges.map((c, i) => (
              <div key={i} style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>
                {c.nameA} ↔ {c.nameB}:
                <span style={{ color: '#ff6400', marginLeft: 4 }}>
                  {c.traffic === 6 ? 'Jammed' : c.traffic === 3 ? 'Heavy' : c.traffic === 1.8 ? 'Moderate' : 'Clear'}
                </span>
              </div>
            ))}
          </Section>
        </>
      )}

      <Divider />

      <Section title="LEGEND">
        {[
          ['#ffa500', 'Start city'],
          ['#00ffff', 'End city'],
          ['#00c864', 'Open (exploring)'],
          ['#dc3232', 'Closed (done)'],
          ['#b400ff', 'Shortest path'],
          ['#ffdc00', 'Fastest route'],
          ['#00ff96', 'Cleanest route'],
        ].map(([color, label]) => (
          <div key={label} style={styles.legendRow}>
            <div style={{ ...styles.dot, background: color }} />
            <span style={{ fontSize: 11, color: '#ccc' }}>{label}</span>
          </div>
        ))}
      </Section>

      <Divider />

      <Section title="TIPS">
        <div style={styles.hint}>Left click → set start/end</div>
        <div style={styles.hint}>Right click road → block it</div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ color: '#ffa500', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, color = '#ffffff' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span
        style={{
          color,
          maxWidth: 140,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function Btn({ children, onClick, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.btn,
        borderColor: color,
        color,
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={styles.divider} />;
}

const styles = {
  panel: {
    width: 240,
    height: '100vh',
    overflowY: 'auto',
    background: '#111111',
    borderLeft: '1px solid #2a2a2a',
    padding: '16px 12px',
    flexShrink: 0,
  },
  title: {
    color: '#00ffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  badge: {
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    background: '#2a2a2a',
    margin: '8px 0',
  },
  btn: {
    display: 'block',
    width: '100%',
    padding: '6px 8px',
    marginBottom: 4,
    background: 'transparent',
    border: '1px solid',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    fontFamily: 'Consolas, monospace',
    textAlign: 'left',
    transition: 'opacity 0.15s',
  },
  smallBtn: {
    padding: '2px 10px',
    background: '#222',
    border: '1px solid #444',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'Consolas',
  },
  speedRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 4,
  },
  path: {
    fontSize: 10,
    lineHeight: 1.6,
    wordBreak: 'break-word',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  hint: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
};
