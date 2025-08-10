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
    // 領土数をそのまま使用
    this.territoryCount = territoryCount;
  }

  generateMap(): Map<string, Territory> {
    const territories = new Map<string, Territory>();
    
    // グリッドベースでマップ全体を敷き詰める
    const cells = this.createHexGrid();
    
    cells.forEach((cell, index) => {
      const territory: Territory = {
        id: `territory-${index}`,
        ownerId: null,
        diceCount: 0,
        position: cell.center,
        adjacentTerritoryIds: cell.neighbors,
        vertices: cell.vertices,
      };
      territories.set(territory.id, territory);
    });

    return territories;
  }

  private createHexGrid(): VoronoiCell[] {
    const cells: VoronoiCell[] = [];
    const hexRadius = 50;  // 大きくして隙間を埋める
    const hexHeight = hexRadius * Math.sqrt(3);
    const hexWidth = hexRadius * 2;
    
    // グリッドの行と列を計算（より密に配置）
    const cols = Math.floor(this.width / (hexWidth * 0.75)) + 1;
    const rows = Math.floor(this.height / (hexHeight * 0.86)) + 1;  // 行間を狭める
    
    // グリッド配列を作成（隣接関係の計算用）
    const grid: (VoronoiCell | null)[][] = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = new Array(cols).fill(null);
    }
    
    let cellIndex = 0;
    
    // 中央から外側に向かって領土を配置
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(cols / 2);
    const positions: Array<{ row: number; col: number; distance: number }> = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const distance = Math.abs(row - centerRow) + Math.abs(col - centerCol);
        positions.push({ row, col, distance });
      }
    }
    
    // 中心からの距離でソート
    positions.sort((a, b) => a.distance - b.distance);
    
    // 必要な領土数だけ配置
    for (let i = 0; i < Math.min(this.territoryCount, positions.length); i++) {
      const { row, col } = positions[i];
      
      // オフセット（偶数行は右にずらす）
      const offset = row % 2 === 0 ? 0 : hexWidth * 0.375;
      
      const center: Position = {
        x: 20 + col * hexWidth * 0.75 + offset,
        y: 20 + row * hexHeight * 0.86  // 縦の間隔を狭める
      };
      
      // 境界外チェック（より緩い条件）
      if (center.x > this.width + hexRadius || center.y > this.height + hexRadius) {
        continue;
      }
      
      // 六角形の頂点を生成（少しランダム性を加える）
      const vertices = this.createHexagonVertices(center, hexRadius);
      
      const cell: VoronoiCell = {
        id: `territory-${cellIndex}`,
        center,
        vertices,
        neighbors: []
      };
      
      cells.push(cell);
      grid[row][col] = cell;
      cellIndex++;
    }
    
    // グリッドベースで隣接関係を計算
    this.calculateGridNeighbors(cells, grid, rows, cols);
    
    return cells;
  }

  private createHexagonVertices(center: Position, radius: number): Position[] {
    const vertices: Position[] = [];
    const angleOffset = Math.PI / 6; // 30度回転させて平らな辺を上下にする
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI / 3) + angleOffset;
      // ランダム性を減らして隙間を最小化
      const variation = 0.95 + Math.random() * 0.1;
      const r = radius * variation;
      
      vertices.push({
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r
      });
    }
    
    return vertices;
  }

  private calculateGridNeighbors(
    cells: VoronoiCell[], 
    grid: (VoronoiCell | null)[][], 
    rows: number, 
    cols: number
  ): void {
    // グリッドベースで正確な隣接関係を計算
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row][col];
        if (!cell) continue;
        
        const neighbors: string[] = [];
        
        // 六角形グリッドの隣接パターン
        // 偶数行と奇数行で隣接パターンが異なる
        const isEvenRow = row % 2 === 0;
        
        const neighborOffsets = isEvenRow ? [
          // 偶数行の隣接オフセット
          { dr: -1, dc: -1 }, // 左上
          { dr: -1, dc: 0 },  // 右上
          { dr: 0, dc: -1 },  // 左
          { dr: 0, dc: 1 },   // 右
          { dr: 1, dc: -1 },  // 左下
          { dr: 1, dc: 0 }    // 右下
        ] : [
          // 奇数行の隣接オフセット
          { dr: -1, dc: 0 },  // 左上
          { dr: -1, dc: 1 },  // 右上
          { dr: 0, dc: -1 },  // 左
          { dr: 0, dc: 1 },   // 右
          { dr: 1, dc: 0 },   // 左下
          { dr: 1, dc: 1 }    // 右下
        ];
        
        for (const { dr, dc } of neighborOffsets) {
          const newRow = row + dr;
          const newCol = col + dc;
          
          if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const neighbor = grid[newRow][newCol];
            if (neighbor) {
              neighbors.push(neighbor.id);
            }
          }
        }
        
        cell.neighbors = neighbors;
      }
    }
    
    // 連結性を確保
    this.ensureConnectivity(cells);
  }
  
  private ensureConnectivity(cells: VoronoiCell[]): void {
    // 孤立した領土がないか確認
    const visited = new Set<string>();
    const queue: string[] = [];
    
    if (cells.length === 0) return;
    
    // 最初の領土から開始
    queue.push(cells[0].id);
    visited.add(cells[0].id);
    
    // BFSで連結成分を探索
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const current = cells.find(c => c.id === currentId);
      if (!current) continue;
      
      for (const neighborId of current.neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }
    
    // 連結されていない領土を見つける
    const unconnected = cells.filter(c => !visited.has(c.id));
    
    // 連結されていない領土を最寄りの領土に接続
    for (const isolated of unconnected) {
      let minDistance = Infinity;
      let nearestCell: VoronoiCell | null = null;
      
      for (const other of cells) {
        if (other.id === isolated.id) continue;
        
        const distance = Math.sqrt(
          Math.pow(isolated.center.x - other.center.x, 2) +
          Math.pow(isolated.center.y - other.center.y, 2)
        );
        
        if (distance < minDistance && visited.has(other.id)) {
          minDistance = distance;
          nearestCell = other;
        }
      }
      
      if (nearestCell) {
        // 相互に隣接関係を追加
        isolated.neighbors.push(nearestCell.id);
        nearestCell.neighbors.push(isolated.id);
        visited.add(isolated.id);
      }
    }
  }
}