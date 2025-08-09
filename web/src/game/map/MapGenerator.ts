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
    const hexRadius = 40;
    const hexHeight = hexRadius * Math.sqrt(3);
    const hexWidth = hexRadius * 2;
    
    // グリッドの行と列を計算
    const cols = Math.floor((this.width - 40) / (hexWidth * 0.75)) + 1;
    const rows = Math.floor((this.height - 40) / hexHeight) + 1;
    
    // 実際の領土数を調整
    const targetCount = Math.min(this.territoryCount, cols * rows);
    const skipPattern = this.generateSkipPattern(cols * rows, targetCount);
    
    let cellIndex = 0;
    let gridIndex = 0;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // ランダムにいくつかのセルをスキップして自然な形にする
        if (skipPattern[gridIndex++]) {
          continue;
        }
        
        // オフセット（偶数行は右にずらす）
        const offset = row % 2 === 0 ? 0 : hexWidth * 0.375;
        
        const center: Position = {
          x: 40 + col * hexWidth * 0.75 + offset,
          y: 40 + row * hexHeight
        };
        
        // 境界外チェック
        if (center.x > this.width - 30 || center.y > this.height - 30) {
          continue;
        }
        
        // 六角形の頂点を生成（少しランダム性を加える）
        const vertices = this.createHexagonVertices(center, hexRadius);
        
        cells.push({
          id: `territory-${cellIndex}`,
          center,
          vertices,
          neighbors: [] // 後で設定
        });
        
        cellIndex++;
        if (cellIndex >= targetCount) break;
      }
      if (cellIndex >= targetCount) break;
    }
    
    // 隣接関係を計算
    this.calculateNeighbors(cells);
    
    return cells;
  }

  private generateSkipPattern(total: number, target: number): boolean[] {
    const pattern: boolean[] = new Array(total).fill(false);
    const toSkip = total - target;
    
    if (toSkip <= 0) return pattern;
    
    // エッジ付近のセルを優先的にスキップ
    const skipIndices: number[] = [];
    const centerCol = Math.floor(Math.sqrt(total) / 2);
    const centerRow = centerCol;
    
    for (let i = 0; i < total; i++) {
      skipIndices.push(i);
    }
    
    // 中心から遠い順にソート
    skipIndices.sort((a, b) => {
      const colA = a % Math.floor(Math.sqrt(total));
      const rowA = Math.floor(a / Math.sqrt(total));
      const colB = b % Math.floor(Math.sqrt(total));
      const rowB = Math.floor(b / Math.sqrt(total));
      
      const distA = Math.abs(colA - centerCol) + Math.abs(rowA - centerRow);
      const distB = Math.abs(colB - centerCol) + Math.abs(rowB - centerRow);
      
      return distB - distA;
    });
    
    // 遠い場所から順にスキップ
    for (let i = 0; i < toSkip && i < skipIndices.length; i++) {
      pattern[skipIndices[i]] = true;
    }
    
    return pattern;
  }

  private createHexagonVertices(center: Position, radius: number): Position[] {
    const vertices: Position[] = [];
    const angleOffset = Math.PI / 6; // 30度回転させて平らな辺を上下にする
    
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI / 3) + angleOffset;
      // 少しランダム性を加える
      const variation = 0.9 + Math.random() * 0.2;
      const r = radius * variation;
      
      vertices.push({
        x: center.x + Math.cos(angle) * r,
        y: center.y + Math.sin(angle) * r
      });
    }
    
    return vertices;
  }

  private calculateNeighbors(cells: VoronoiCell[]): void {
    const maxDistance = 85; // 隣接とみなす最大距離
    
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const neighbors: string[] = [];
      
      for (let j = 0; j < cells.length; j++) {
        if (i === j) continue;
        
        const other = cells[j];
        const distance = Math.sqrt(
          Math.pow(cell.center.x - other.center.x, 2) +
          Math.pow(cell.center.y - other.center.y, 2)
        );
        
        if (distance < maxDistance) {
          neighbors.push(other.id);
        }
      }
      
      cell.neighbors = neighbors;
    }
    
    // 孤立した領土を除去
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i].neighbors.length === 0) {
        cells.splice(i, 1);
      }
    }
    
    // インデックスを再計算
    cells.forEach((cell, index) => {
      cell.id = `territory-${index}`;
    });
    
    // 隣接関係を再計算
    for (const cell of cells) {
      const newNeighbors: string[] = [];
      for (const neighborId of cell.neighbors) {
        const neighbor = cells.find(c => c.id === neighborId || 
          neighborId.includes(c.id.split('-')[1]));
        if (neighbor) {
          newNeighbors.push(neighbor.id);
        }
      }
      cell.neighbors = newNeighbors;
    }
  }
}