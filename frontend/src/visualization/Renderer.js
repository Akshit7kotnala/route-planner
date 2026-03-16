import { TRAFFIC_COLORS, TRAFFIC_LABELS } from '../core/Graph.js';

const STATE_COLORS = {
  unvisited: '#c8c8c8',
  open: '#00c864',
  closed: '#dc3232',
  start: '#ffa500',
  end: '#00ffff',
  path: '#b400ff',
};

const FAST_COLOR = '#ffdc00';
const CLEAN_COLOR = '#00ff96';
const NODE_R = 14;

function pollutionColor(score) {
  score = Math.max(1, Math.min(10, score));
  if (score <= 4) {
    const r = Math.round((score / 4) * 200);
    return `rgb(${r},200,0)`;
  }

  const g = Math.round(((10 - score) / 6) * 200);
  return `rgb(220,${g},0)`;
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawEdges(graph, fastPath = [], cleanPath = []) {
    const { ctx } = this;

    const fastSet = new Set();
    const cleanSet = new Set();

    for (let i = 0; i < fastPath.length - 1; i += 1) {
      fastSet.add(`${fastPath[i].name}|${fastPath[i + 1].name}`);
      fastSet.add(`${fastPath[i + 1].name}|${fastPath[i].name}`);
    }
    for (let i = 0; i < cleanPath.length - 1; i += 1) {
      cleanSet.add(`${cleanPath[i].name}|${cleanPath[i + 1].name}`);
      cleanSet.add(`${cleanPath[i + 1].name}|${cleanPath[i].name}`);
    }

    const drawn = new Set();

    Object.values(graph.nodes).forEach((node) => {
      node.neighbors.forEach(({ node: nb, distance, traffic }) => {
        const key = [node.name, nb.name].sort().join('|');
        if (drawn.has(key)) return;
        drawn.add(key);

        const isFast = fastSet.has(`${node.name}|${nb.name}`);
        const isClean = cleanSet.has(`${node.name}|${nb.name}`);

        let color;
        let width;
        if (isFast && isClean) {
          color = '#00ffff';
          width = 5;
        } else if (isFast) {
          color = FAST_COLOR;
          width = 4;
        } else if (isClean) {
          color = CLEAN_COLOR;
          width = 4;
        } else {
          const tc = TRAFFIC_COLORS[traffic] || '#505050';
          color = tc + '55';
          width = 2;
        }

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();

        if (isFast || isClean) {
          const mx = (node.x + nb.x) / 2;
          const my = (node.y + nb.y) / 2;
          ctx.fillStyle = '#ffffff88';
          ctx.font = '10px Consolas';
          ctx.textAlign = 'center';
          ctx.fillText(Math.round(distance), mx, my);
        }
      });
    });

    Object.entries(graph.edges).forEach(([key, data]) => {
      if (!data.blocked) return;
      const [nameA, nameB] = key.split('|');
      const a = graph.nodes[nameA];
      const b = graph.nodes[nameB];
      if (!a || !b) return;

      ctx.beginPath();
      ctx.strokeStyle = '#b40000';
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 4]);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      ctx.fillStyle = '#ff3232';
      ctx.font = 'bold 14px Consolas';
      ctx.textAlign = 'center';
      ctx.fillText('✕', mx, my);
    });
  }

  drawNodes(graph) {
    const { ctx } = this;

    Object.values(graph.nodes).forEach((node) => {
      const color = STATE_COLORS[node.state] || STATE_COLORS.unvisited;

      if (['start', 'end', 'path'].includes(node.state)) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_R + 6, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Consolas';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y - NODE_R - 6);
    });
  }

  drawTooltip(node, mx, my, canvasWidth, canvasHeight) {
    if (!node) return;
    const { ctx } = this;

    const g = node.g === Infinity ? '∞' : node.g.toFixed(1);
    const h = node.h.toFixed(1);
    const f = node.f === Infinity ? '∞' : node.f.toFixed(1);
    const p = node.pollutionG.toFixed(1);

    const lines = [
      { text: node.name, color: '#00ffff', bold: true },
      { text: `State : ${node.state}`, color: '#ffffff', bold: false },
      { text: `g     : ${g}`, color: '#00c864', bold: false },
      { text: `h     : ${h}`, color: '#ffdc00', bold: false },
      { text: `f     : ${f}`, color: '#ffa500', bold: false },
      { text: `AQI   : ${p}`, color: pollutionColor(node.pollutionG || 1), bold: false },
      { text: '──────────────', color: '#444444', bold: false },
      ...node.neighbors.map(({ node: nb, distance, pollution, traffic }) => ({
        text: `${nb.name} ${Math.round(distance)}km ${TRAFFIC_LABELS[traffic] ?? ''}`,
        color: TRAFFIC_COLORS[traffic] || pollutionColor(pollution),
        bold: false,
      })),
    ];

    const PAD = 10;
    const LH = 18;
    const W = 200;
    const H = PAD * 2 + lines.length * LH;

    let tx = mx + 20;
    let ty = my - H / 2;
    if (tx + W > canvasWidth) tx = mx - W - 20;
    if (ty < 5) ty = 5;
    if (ty + H > canvasHeight) ty = canvasHeight - H - 5;

    ctx.fillStyle = 'rgba(10,10,30,0.92)';
    ctx.beginPath();
    ctx.roundRect(tx, ty, W, H, 8);
    ctx.fill();

    const bc = STATE_COLORS[node.state] || '#888888';
    ctx.strokeStyle = bc;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(tx, ty, W, H, 8);
    ctx.stroke();

    lines.forEach((line, i) => {
      ctx.fillStyle = line.color;
      ctx.font = `${line.bold ? 'bold ' : ''}11px Consolas`;
      ctx.textAlign = 'left';
      ctx.fillText(line.text, tx + PAD, ty + PAD + i * LH + 12);
    });
  }
}
