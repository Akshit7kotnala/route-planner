import { Graph } from './Graph.js';

export function createIndiaMap() {
  const g = new Graph();

  // North India
  g.addNode('Delhi', 340, 160);
  g.addNode('Jaipur', 250, 210);
  g.addNode('Agra', 370, 210);
  g.addNode('Lucknow', 460, 200);
  g.addNode('Kanpur', 440, 225);
  g.addNode('Varanasi', 500, 240);
  g.addNode('Amritsar', 250, 100);
  g.addNode('Chandigarh', 300, 120);
  g.addNode('Dehradun', 340, 110);

  // West India
  g.addNode('Mumbai', 180, 490);
  g.addNode('Pune', 200, 540);
  g.addNode('Nashik', 210, 440);
  g.addNode('Surat', 170, 400);
  g.addNode('Ahmedabad', 150, 310);
  g.addNode('Jodhpur', 200, 260);
  g.addNode('Udaipur', 220, 300);

  // Central India
  g.addNode('Bhopal', 360, 330);
  g.addNode('Indore', 300, 360);
  g.addNode('Nagpur', 420, 390);
  g.addNode('Raipur', 490, 390);

  // East India
  g.addNode('Kolkata', 580, 310);
  g.addNode('Bhubaneswar', 550, 400);
  g.addNode('Patna', 510, 230);

  // South India
  g.addNode('Hyderabad', 380, 480);
  g.addNode('Bangalore', 340, 580);
  g.addNode('Chennai', 450, 580);
  g.addNode('Kochi', 300, 650);
  g.addNode('Coimbatore', 330, 630);
  g.addNode('Visakhapatnam', 510, 470);
  g.addNode('Mangalore', 280, 580);

  // Roads
  g.addEdge('Delhi', 'Agra', 200);
  g.addEdge('Delhi', 'Jaipur', 280);
  g.addEdge('Delhi', 'Chandigarh', 250);
  g.addEdge('Delhi', 'Dehradun', 300);
  g.addEdge('Chandigarh', 'Amritsar', 230);
  g.addEdge('Chandigarh', 'Dehradun', 180);
  g.addEdge('Agra', 'Lucknow', 340);
  g.addEdge('Agra', 'Kanpur', 300);
  g.addEdge('Lucknow', 'Kanpur', 80);
  g.addEdge('Lucknow', 'Varanasi', 320);
  g.addEdge('Varanasi', 'Patna', 250);
  g.addEdge('Mumbai', 'Pune', 150);
  g.addEdge('Mumbai', 'Nashik', 170);
  g.addEdge('Mumbai', 'Surat', 280);
  g.addEdge('Surat', 'Ahmedabad', 270);
  g.addEdge('Ahmedabad', 'Jaipur', 670);
  g.addEdge('Ahmedabad', 'Jodhpur', 480);
  g.addEdge('Ahmedabad', 'Udaipur', 260);
  g.addEdge('Jaipur', 'Jodhpur', 340);
  g.addEdge('Jaipur', 'Udaipur', 400);
  g.addEdge('Nashik', 'Pune', 210);
  g.addEdge('Bhopal', 'Indore', 195);
  g.addEdge('Bhopal', 'Nagpur', 350);
  g.addEdge('Bhopal', 'Agra', 400);
  g.addEdge('Indore', 'Ahmedabad', 400);
  g.addEdge('Indore', 'Mumbai', 590);
  g.addEdge('Nagpur', 'Raipur', 300);
  g.addEdge('Nagpur', 'Hyderabad', 500);
  g.addEdge('Nagpur', 'Pune', 700);
  g.addEdge('Raipur', 'Bhubaneswar', 440);
  g.addEdge('Raipur', 'Kolkata', 700);
  g.addEdge('Kolkata', 'Bhubaneswar', 440);
  g.addEdge('Kolkata', 'Patna', 580);
  g.addEdge('Patna', 'Lucknow', 528);
  g.addEdge('Bhubaneswar', 'Visakhapatnam', 440);
  g.addEdge('Hyderabad', 'Bangalore', 570);
  g.addEdge('Hyderabad', 'Chennai', 630);
  g.addEdge('Hyderabad', 'Visakhapatnam', 630);
  g.addEdge('Hyderabad', 'Pune', 560);
  g.addEdge('Bangalore', 'Chennai', 350);
  g.addEdge('Bangalore', 'Kochi', 540);
  g.addEdge('Bangalore', 'Coimbatore', 360);
  g.addEdge('Bangalore', 'Mangalore', 350);
  g.addEdge('Chennai', 'Coimbatore', 500);
  g.addEdge('Chennai', 'Visakhapatnam', 800);
  g.addEdge('Kochi', 'Coimbatore', 200);
  g.addEdge('Kochi', 'Mangalore', 300);

  return g;
}

export function generateRandomMap(numCities = 20, width = 650, height = 680) {
  const CITY_NAMES = [
    'Delhi',
    'Mumbai',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Ahmedabad',
    'Jaipur',
    'Lucknow',
    'Surat',
    'Kanpur',
    'Nagpur',
    'Patna',
    'Indore',
    'Bhopal',
    'Visakhapatnam',
    'Vadodara',
    'Agra',
    'Nashik',
    'Varanasi',
    'Meerut',
    'Rajkot',
    'Amritsar',
    'Allahabad',
    'Jodhpur',
    'Coimbatore',
    'Kochi',
    'Dehradun',
    'Chandigarh',
    'Mangalore',
    'Mysore',
    'Bhubaneswar',
    'Guwahati',
    'Raipur',
    'Ranchi',
    'Udaipur',
    'Srinagar',
    'Shimla',
    'Jammu',
  ];

  const g = new Graph();
  const margin = 60;
  const minDist = 80;
  const connD = 220;
  const names = [...CITY_NAMES]
    .sort(() => Math.random() - 0.5)
    .slice(0, numCities);

  const positions = [];

  for (const name of names) {
    let placed = false;
    let tries = 0;

    while (!placed && tries < 1000) {
      tries += 1;
      const x = margin + Math.random() * (width - margin * 2);
      const y = margin + Math.random() * (height - margin * 2);
      const tooClose = positions.some(
        ([px, py]) => Math.sqrt((x - px) ** 2 + (y - py) ** 2) < minDist
      );

      if (!tooClose) {
        g.addNode(name, Math.round(x), Math.round(y));
        positions.push([x, y]);
        placed = true;
      }
    }
  }

  const nodeList = Object.values(g.nodes);

  nodeList.forEach((a, i) => {
    nodeList.forEach((b, j) => {
      if (i >= j) return;
      const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
      if (d <= connD) g.addEdge(a.name, b.name, Math.round(d));
    });
  });

  // Ensure min 2 neighbors
  nodeList.forEach((node) => {
    if (node.neighbors.length < 2) {
      const others = nodeList
        .filter((n) => n !== node)
        .sort(
          (a, b) =>
            Math.sqrt((node.x - a.x) ** 2 + (node.y - a.y) ** 2) -
            Math.sqrt((node.x - b.x) ** 2 + (node.y - b.y) ** 2)
        );

      for (const other of others) {
        if (node.neighbors.length >= 2) break;
        const already = node.neighbors.some((nb) => nb.node.name === other.name);
        if (!already) {
          const d = Math.round(
            Math.sqrt((node.x - other.x) ** 2 + (node.y - other.y) ** 2)
          );
          g.addEdge(node.name, other.name, d);
        }
      }
    }
  });

  return g;
}
