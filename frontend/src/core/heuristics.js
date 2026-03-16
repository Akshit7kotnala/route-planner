export const euclidean = (a, b) =>
  Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const manhattan = (a, b) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const diagonal = (a, b) =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

export const HEURISTICS = { euclidean, manhattan, diagonal };
