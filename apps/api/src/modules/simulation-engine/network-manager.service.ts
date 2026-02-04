import { Injectable } from '@nestjs/common';

// 网络边
export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;      // 关系强度 0-1
  type: 'friend' | 'colleague' | 'family' | 'follow';
  createdAt: number;   // 创建时的tick
  lastInteraction: number; // 最后交互的tick
}

// 网络统计
export interface NetworkStats {
  nodeCount: number;
  edgeCount: number;
  density: number;
  avgDegree: number;
  clusteringCoefficient: number;
  diameter: number;
}

@Injectable()
export class NetworkManagerService {
  private edges: Map<string, NetworkEdge> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map();

  /**
   * 生成边ID
   */
  private getEdgeId(source: string, target: string): string {
    return source < target ? `${source}-${target}` : `${target}-${source}`;
  }

  /**
   * 添加边
   */
  addEdge(source: string, target: string, weight: number = 0.5, type: NetworkEdge['type'] = 'friend'): void {
    const edgeId = this.getEdgeId(source, target);
    
    if (this.edges.has(edgeId)) {
      // 更新现有边
      const edge = this.edges.get(edgeId)!;
      edge.weight = Math.min(1, edge.weight + 0.1);
      return;
    }

    // 创建新边
    const edge: NetworkEdge = {
      source,
      target,
      weight,
      type,
      createdAt: Date.now(),
      lastInteraction: Date.now(),
    };

    this.edges.set(edgeId, edge);

    // 更新邻接表
    if (!this.adjacencyList.has(source)) {
      this.adjacencyList.set(source, new Set());
    }
    if (!this.adjacencyList.has(target)) {
      this.adjacencyList.set(target, new Set());
    }
    this.adjacencyList.get(source)!.add(target);
    this.adjacencyList.get(target)!.add(source);
  }

  /**
   * 移除边
   */
  removeEdge(source: string, target: string): void {
    const edgeId = this.getEdgeId(source, target);
    this.edges.delete(edgeId);

    // 更新邻接表
    this.adjacencyList.get(source)?.delete(target);
    this.adjacencyList.get(target)?.delete(source);
  }

  /**
   * 获取边
   */
  getEdge(source: string, target: string): NetworkEdge | undefined {
    const edgeId = this.getEdgeId(source, target);
    return this.edges.get(edgeId);
  }

  /**
   * 获取所有边
   */
  getAllEdges(): NetworkEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * 获取节点的邻居
   */
  getNeighbors(nodeId: string): string[] {
    return Array.from(this.adjacencyList.get(nodeId) || []);
  }

  /**
   * 获取节点的度
   */
  getDegree(nodeId: string): number {
    return this.adjacencyList.get(nodeId)?.size || 0;
  }

  /**
   * 强化关系
   */
  strengthenRelationship(source: string, target: string, amount: number = 0.1): void {
    const edge = this.getEdge(source, target);
    if (edge) {
      edge.weight = Math.min(1, edge.weight + amount);
      edge.lastInteraction = Date.now();
    }
  }

  /**
   * 弱化关系
   */
  weakenRelationship(source: string, target: string, amount: number = 0.05): void {
    const edge = this.getEdge(source, target);
    if (edge) {
      edge.weight = Math.max(0, edge.weight - amount);
      if (edge.weight < 0.1) {
        this.removeEdge(source, target);
      }
    }
  }

  /**
   * 计算网络密度
   */
  calculateDensity(nodeCount: number): number {
    if (nodeCount < 2) return 0;
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    return this.edges.size / maxEdges;
  }

  /**
   * 计算聚类系数
   */
  calculateClusteringCoefficient(nodeId: string): number {
    const neighbors = this.getNeighbors(nodeId);
    const degree = neighbors.length;
    
    if (degree < 2) return 0;

    let triangles = 0;
    for (let i = 0; i < degree; i++) {
      for (let j = i + 1; j < degree; j++) {
        if (this.getEdge(neighbors[i], neighbors[j])) {
          triangles++;
        }
      }
    }

    const possibleTriangles = (degree * (degree - 1)) / 2;
    return triangles / possibleTriangles;
  }

  /**
   * 计算平均聚类系数
   */
  calculateAverageClusteringCoefficient(nodeIds: string[]): number {
    if (nodeIds.length === 0) return 0;
    
    let total = 0;
    for (const nodeId of nodeIds) {
      total += this.calculateClusteringCoefficient(nodeId);
    }
    return total / nodeIds.length;
  }

  /**
   * 查找最短路径（BFS）
   */
  findShortestPath(source: string, target: string): string[] | null {
    if (source === target) return [source];

    const visited = new Set<string>();
    const queue: Array<{ node: string; path: string[] }> = [{ node: source, path: [source] }];
    
    visited.add(source);

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      const neighbors = this.getNeighbors(node);

      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const newPath = [...path, neighbor];
          if (neighbor === target) {
            return newPath;
          }
          visited.add(neighbor);
          queue.push({ node: neighbor, path: newPath });
        }
      }
    }

    return null;
  }

  /**
   * 计算网络直径
   */
  calculateDiameter(nodeIds: string[]): number {
    let diameter = 0;

    for (const source of nodeIds) {
      for (const target of nodeIds) {
        if (source !== target) {
          const path = this.findShortestPath(source, target);
          if (path) {
            diameter = Math.max(diameter, path.length - 1);
          }
        }
      }
    }

    return diameter;
  }

  /**
   * 获取网络统计
   */
  getNetworkStats(nodeIds: string[]): NetworkStats {
    const nodeCount = nodeIds.length;
    const edgeCount = this.edges.size;
    
    let totalDegree = 0;
    for (const nodeId of nodeIds) {
      totalDegree += this.getDegree(nodeId);
    }

    return {
      nodeCount,
      edgeCount,
      density: this.calculateDensity(nodeCount),
      avgDegree: nodeCount > 0 ? totalDegree / nodeCount : 0,
      clusteringCoefficient: this.calculateAverageClusteringCoefficient(nodeIds),
      diameter: this.calculateDiameter(nodeIds),
    };
  }

  /**
   * 查找潜在朋友（共同邻居）
   */
  findPotentialFriends(nodeId: string, allNodeIds: string[]): string[] {
    const neighbors = new Set(this.getNeighbors(nodeId));
    const candidates: Array<{ id: string; commonNeighbors: number }> = [];

    for (const otherId of allNodeIds) {
      if (otherId !== nodeId && !neighbors.has(otherId)) {
        const otherNeighbors = new Set(this.getNeighbors(otherId));
        const common = [...neighbors].filter(n => otherNeighbors.has(n));
        
        if (common.length > 0) {
          candidates.push({ id: otherId, commonNeighbors: common.length });
        }
      }
    }

    // 按共同邻居数排序
    return candidates
      .sort((a, b) => b.commonNeighbors - a.commonNeighbors)
      .map(c => c.id);
  }

  /**
   * 初始化网络（随机连接）
   */
  initializeRandomNetwork(nodeIds: string[], connectionProbability: number = 0.1): void {
    this.edges.clear();
    this.adjacencyList.clear();

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        if (Math.random() < connectionProbability) {
          this.addEdge(nodeIds[i], nodeIds[j], Math.random() * 0.5 + 0.3);
        }
      }
    }
  }

  /**
   * 重置网络
   */
  reset(): void {
    this.edges.clear();
    this.adjacencyList.clear();
  }
}
