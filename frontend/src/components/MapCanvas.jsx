import { useEffect, useRef, useCallback } from 'react';
import { Renderer } from '../visualization/Renderer.js';

const NODE_R = 14;

export default function MapCanvas({
  graph,
  fastPath,
  cleanPath,
  onCityClick,
  onBlockEdge,
}) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // Initialize renderer
  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new Renderer(canvasRef.current);
    }
  }, []);

  // Draw every time graph changes
  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    r.clear();
    r.drawEdges(graph, fastPath, cleanPath);
    r.drawNodes(graph);
  }, [graph, fastPath, cleanPath]);

  // Mouse move -> tooltip
  const handleMouseMove = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      const r = rendererRef.current;
      if (!canvas || !r) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      r.clear();
      r.drawEdges(graph, fastPath, cleanPath);
      r.drawNodes(graph);

      const hovered = Object.values(graph.nodes).find(
        (n) => Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) <= NODE_R + 5
      );
      if (hovered) {
        r.drawTooltip(hovered, mx, my, canvas.width, canvas.height);
      }
    },
    [graph, fastPath, cleanPath]
  );

  // Left click -> set city
  const handleClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const clicked = Object.values(graph.nodes).find(
        (n) => Math.sqrt((mx - n.x) ** 2 + (my - n.y) ** 2) <= NODE_R + 5
      );
      if (clicked) onCityClick(clicked);
    },
    [graph, onCityClick]
  );

  // Right click -> block road
  const handleRightClick = useCallback(
    (e) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let bestDist = 15;
      let bestEdge = null;
      const drawn = new Set();

      Object.values(graph.nodes).forEach((node) => {
        node.neighbors.forEach(({ node: nb }) => {
          const key = [node.name, nb.name].sort().join('|');
          if (drawn.has(key)) return;
          drawn.add(key);

          const dx = nb.x - node.x;
          const dy = nb.y - node.y;
          const len2 = dx * dx + dy * dy;
          const t =
            len2 === 0
              ? 0
              : Math.max(
                  0,
                  Math.min(1, ((mx - node.x) * dx + (my - node.y) * dy) / len2)
                );
          const dist = Math.sqrt((mx - (node.x + t * dx)) ** 2 + (my - (node.y + t * dy)) ** 2);
          if (dist < bestDist) {
            bestDist = dist;
            bestEdge = [node.name, nb.name];
          }
        });
      });

      if (bestEdge) onBlockEdge(bestEdge[0], bestEdge[1]);
    },
    [graph, onBlockEdge]
  );

  return (
    <canvas
      ref={canvasRef}
      width={660}
      height={720}
      style={{ cursor: 'crosshair', display: 'block' }}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onContextMenu={handleRightClick}
    />
  );
}
