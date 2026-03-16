export default function ComparisonModal({ results, onClose }) {
  if (!results) return null;

  const colors = ['#00ffff', '#ffdc00', '#00c864'];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.title}>ALGORITHM COMPARISON</div>
        <div style={styles.sub}>Click outside to close</div>

        <div style={styles.grid}>
          {results.map((r, i) => (
            <div
              key={r.name}
              style={{
                ...styles.card,
                borderColor: colors[i],
              }}
            >
              <div style={{ ...styles.cardTitle, color: colors[i] }}>{r.name}</div>
              <div style={styles.divider} />

              {[
                ['Found', r.found ? 'Yes' : 'No'],
                ['Explored', `${r.nodesExplored} cities`],
                ['Distance', r.found ? `${r.distance} km` : 'N/A'],
                ['Stops', r.found ? `${r.path.length} cities` : 'N/A'],
                ['Time', `${r.timeMs} ms`],
              ].map(([label, value]) => (
                <div key={label} style={styles.row}>
                  <span style={{ color: '#666' }}>{label}:</span>
                  <span style={{ color: '#fff' }}>{value}</span>
                </div>
              ))}

              {r.winner && <div style={styles.badge}>★ MOST EFFICIENT</div>}
            </div>
          ))}
        </div>

        <button type="button" style={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: 12,
    padding: 32,
    maxWidth: 740,
    width: '90%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 2,
  },
  sub: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
  },
  card: {
    background: '#1a1a1a',
    border: '2px solid',
    borderRadius: 10,
    padding: 16,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    background: '#333',
    marginBottom: 12,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'Consolas, monospace',
  },
  badge: {
    marginTop: 12,
    color: '#ffdc00',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  closeBtn: {
    display: 'block',
    margin: '24px auto 0',
    padding: '8px 32px',
    background: 'transparent',
    border: '1px solid #555',
    color: '#fff',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: 'Consolas',
    fontSize: 13,
  },
};
