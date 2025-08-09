import type { Territory, Position } from '../types';

interface VoronoiCell {
  id: string;
  center: Position;
  vertices: Position[];
  neighbors: string[];
}

export class MapGenerator {
  private width: number;
  private height: number;
  private territoryCount: number;

  constructor(width: number = 800, height: number = 600, territoryCount: number = 20) {
    this.width = width;
    this.height = height;
    this.territoryCount = territoryCount;
  }

  generateMap(): Map<string, Territory> {
    const territories = new Map<string, Territory>();
    const cells = this.generateVoronoiCells();

    cells.forEach((cell, index) => {
      const territory: Territory = {
        id: `territory-${index}`,
        ownerId: null,
        diceCount: 0,
        position: cell.center,
        adjacentTerritoryIds: cell.neighbors,
        vertices: cell.vertices, // 多角形の頂点
      };
      territories.set(territory.id, territory);
    });

    return territories;
  }

  private generateVoronoiCells(): VoronoiCell[] {
    // ランダムな点を生成（境界から少し離す）
    const points = this.generateRandomPoints();
    
    // 簡易的なボロノイ図の実装
    const cells: VoronoiCell[] = [];
    
    points.forEach((point, index) => {
      const neighbors = this.findNeighbors(point, points, index);
      const vertices = this.generateCellVertices(point, points, index);
      
      cells.push({
        id: `territory-${index}`,
        center: point,
        vertices: vertices,
        neighbors: neighbors.map(n => `territory-${n}`),
      });
    });

    return cells;
  }

  private generateRandomPoints(): Position[] {
    const points: Position[] = [];
    const margin = 50;
    const minDistance = 80; // 最小距離を保証

    while (points.length < this.territoryCount) {
      const x = margin + Math.random() * (this.width - 2 * margin);
      const y = margin + Math.random() * (this.height - 2 * margin);
      
      // 既存の点から十分離れているか確認
      const tooClose = points.some(p => 
        Math.sqrt(Math.pow(p.x - x, 2) + Math.pow(p.y - y, 2)) < minDistance
      );

      if (!tooClose) {
        points.push({ x, y });
      }
    }

    // Lloyd's relaxationを1回実行してより均等な配置に
    return this.lloydRelaxation(points);
  }

  private lloydRelaxation(points: Position[]): Position[] {
    const relaxed: Position[] = [];
    
    points.forEach((point, index) => {
      const neighbors = this.findNearestPoints(point, points, 6).filter(i => i !== index);
      
      // 重心を計算
      let centerX = point.x;
      let centerY = point.y;
      let count = 1;
      
      neighbors.forEach(n => {
        centerX += points[n].x;
        centerY += points[n].y;
        count++;
      });
      
      relaxed.push({
        x: centerX / count,
        y: centerY / count,
      });
    });

    return relaxed;
  }

  private findNeighbors(point: Position, points: Position[], index: number): number[] {
    // Delaunay三角形分割の簡易版
    // 最も近い点を隣接として扱う
    const distances = points.map((p, i) => ({
      index: i,
      distance: i === index ? Infinity : Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
    }));

    distances.sort((a, b) => a.distance - b.distance);
    
    // 近い順に3-6個の隣接を選択
    const neighborCount = 3 + Math.floor(Math.random() * 4);
    return distances.slice(0, neighborCount).map(d => d.index);
  }

  private findNearestPoints(point: Position, points: Position[], count: number): number[] {
    const distances = points.map((p, i) => ({
      index: i,
      distance: Math.sqrt(Math.pow(p.x - point.x, 2) + Math.pow(p.y - point.y, 2))
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, count).map(d => d.index);
  }

  private generateCellVertices(center: Position, points: Position[], index: number): Position[] {
    // 簡易的な多角形生成
    const vertices: Position[] = [];
    const angleStep = (Math.PI * 2) / 6;
    const radius = 40 + Math.random() * 20;
    const irregularity = 0.3;

    for (let i = 0; i < 6; i++) {
      const angle = angleStep * i + (Math.random() - 0.5) * irregularity;
      const r = radius * (1 + (Math.random() - 0.5) * irregularity);
      
      vertices.push({
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r,
      });
    }

    return vertices;
  }

  // 実際のボロノイ領域を計算（より正確な実装）
  computeVoronoiRegion(siteIndex: number, sites: Position[]): Position[] {
    const site = sites[siteIndex];
    const vertices: Position[] = [];
    
    // 各隣接サイトとの垂直二等分線を計算
    const neighbors = this.findNeighbors(site, sites, siteIndex);
    
    neighbors.forEach(neighborIndex => {
      const neighbor = sites[neighborIndex];
      
      // 中点を計算
      const midX = (site.x + neighbor.x) / 2;
      const midY = (site.y + neighbor.y) / 2;
      
      // 垂直二等分線の方向
      const dx = neighbor.y - site.y;
      const dy = site.x - neighbor.x;
      const length = Math.sqrt(dx * dx + dy * dy);
      
      if (length > 0) {
        // 垂直二等分線上の点を追加
        const normalX = dx / length;
        const normalY = dy / length;
        const offset = 100;
        
        vertices.push({
          x: midX + normalX * offset,
          y: midY + normalY * offset,
        });
        vertices.push({
          x: midX - normalX * offset,
          y: midY - normalY * offset,
        });
      }
    });

    // 頂点を角度でソート
    vertices.sort((a, b) => {
      const angleA = Math.atan2(a.y - site.y, a.x - site.x);
      const angleB = Math.atan2(b.y - site.y, b.x - site.x);
      return angleA - angleB;
    });

    // 凸包を計算して返す
    return this.computeConvexHull(vertices);
  }

  private computeConvexHull(points: Position[]): Position[] {
    if (points.length < 3) return points;

    // Graham's scan algorithm
    const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
    
    const cross = (o: Position, a: Position, b: Position) => {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    };

    const lower: Position[] = [];
    for (const p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }

    const upper: Position[] = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }

    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }
}