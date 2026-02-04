import { Test, TestingModule } from '@nestjs/testing';
import { NetworkManagerService } from './network-manager.service';

describe('NetworkManagerService', () => {
  let service: NetworkManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NetworkManagerService],
    }).compile();

    service = module.get<NetworkManagerService>(NetworkManagerService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('addEdge', () => {
    it('should add an edge between two nodes', () => {
      service.addEdge('node1', 'node2', 0.5);
      const edge = service.getEdge('node1', 'node2');
      expect(edge).toBeDefined();
      expect(edge.weight).toBe(0.5);
      expect(edge.source).toBe('node1');
      expect(edge.target).toBe('node2');
    });

    it('should create undirected edge', () => {
      service.addEdge('node1', 'node2', 0.5);
      expect(service.getEdge('node1', 'node2')).toBeDefined();
      expect(service.getEdge('node2', 'node1')).toBeDefined();
    });

    it('should strengthen existing edge', () => {
      service.addEdge('node1', 'node2', 0.5);
      service.addEdge('node1', 'node2', 0.5);
      const edge = service.getEdge('node1', 'node2');
      expect(edge.weight).toBe(0.6); // 0.5 + 0.1
    });

    it('should update neighbors correctly', () => {
      service.addEdge('node1', 'node2');
      expect(service.getNeighbors('node1')).toContain('node2');
      expect(service.getNeighbors('node2')).toContain('node1');
    });
  });

  describe('removeEdge', () => {
    beforeEach(() => {
      service.addEdge('node1', 'node2');
    });

    it('should remove an edge', () => {
      service.removeEdge('node1', 'node2');
      expect(service.getEdge('node1', 'node2')).toBeUndefined();
    });

    it('should update neighbors after removal', () => {
      service.removeEdge('node1', 'node2');
      expect(service.getNeighbors('node1')).not.toContain('node2');
      expect(service.getNeighbors('node2')).not.toContain('node1');
    });
  });

  describe('strengthenRelationship', () => {
    beforeEach(() => {
      service.addEdge('node1', 'node2', 0.5);
    });

    it('should increase edge weight', () => {
      service.strengthenRelationship('node1', 'node2', 0.1);
      expect(service.getEdge('node1', 'node2').weight).toBe(0.6);
    });

    it('should not exceed maximum weight of 1', () => {
      service.strengthenRelationship('node1', 'node2', 1);
      expect(service.getEdge('node1', 'node2').weight).toBe(1);
    });
  });

  describe('weakenRelationship', () => {
    beforeEach(() => {
      service.addEdge('node1', 'node2', 0.5);
    });

    it('should decrease edge weight', () => {
      service.weakenRelationship('node1', 'node2', 0.1);
      expect(service.getEdge('node1', 'node2').weight).toBe(0.4);
    });

    it('should remove edge when weight falls below 0.1', () => {
      service.weakenRelationship('node1', 'node2', 0.5);
      expect(service.getEdge('node1', 'node2')).toBeUndefined();
    });

    it('should not go below minimum weight of 0', () => {
      service.weakenRelationship('node1', 'node2', 1);
      expect(service.getEdge('node1', 'node2')).toBeUndefined();
    });
  });

  describe('calculateDensity', () => {
    it('should return 0 for less than 2 nodes', () => {
      expect(service.calculateDensity(1)).toBe(0);
      expect(service.calculateDensity(0)).toBe(0);
    });

    it('should calculate correct density', () => {
      // 4 nodes, max edges = 6
      service.addEdge('node1', 'node2');
      service.addEdge('node2', 'node3');
      service.addEdge('node3', 'node4');
      // 3 edges out of 6 possible
      expect(service.calculateDensity(4)).toBe(0.5);
    });
  });

  describe('calculateClusteringCoefficient', () => {
    beforeEach(() => {
      // Create triangle: node1-node2-node3-node1
      service.addEdge('node1', 'node2');
      service.addEdge('node2', 'node3');
      service.addEdge('node3', 'node1');
    });

    it('should return 0 for nodes with less than 2 neighbors', () => {
      service.addEdge('node4', 'node1');
      expect(service.calculateClusteringCoefficient('node4')).toBe(0);
    });

    it('should calculate correct clustering coefficient', () => {
      // node1 has neighbors node2 and node3, which are connected
      // Clustering coefficient = 1 / 1 = 1
      expect(service.calculateClusteringCoefficient('node1')).toBe(1);
    });

    it('should calculate partial clustering', () => {
      // Add node4 connected to node1 and node2, but not to node3
      service.addEdge('node1', 'node4');
      service.addEdge('node2', 'node4');
      // node1 has 3 neighbors (node2, node3, node4)
      // Only node2-node3 are connected
      // Clustering coefficient = 1 / 3 = 0.33...
      expect(service.calculateClusteringCoefficient('node1')).toBeCloseTo(0.33, 1);
    });
  });

  describe('findShortestPath', () => {
    beforeEach(() => {
      // Create path: node1 - node2 - node3 - node4
      service.addEdge('node1', 'node2');
      service.addEdge('node2', 'node3');
      service.addEdge('node3', 'node4');
    });

    it('should return single node for same source and target', () => {
      const path = service.findShortestPath('node1', 'node1');
      expect(path).toEqual(['node1']);
    });

    it('should find direct path', () => {
      const path = service.findShortestPath('node1', 'node2');
      expect(path).toEqual(['node1', 'node2']);
    });

    it('should find multi-hop path', () => {
      const path = service.findShortestPath('node1', 'node4');
      expect(path).toEqual(['node1', 'node2', 'node3', 'node4']);
    });

    it('should return null for disconnected nodes', () => {
      service.addEdge('node5', 'node6');
      const path = service.findShortestPath('node1', 'node5');
      expect(path).toBeNull();
    });
  });

  describe('findPotentialFriends', () => {
    beforeEach(() => {
      // Create network: node1 connected to node2 and node3
      // node2 connected to node4
      // node3 connected to node4
      service.addEdge('node1', 'node2');
      service.addEdge('node1', 'node3');
      service.addEdge('node2', 'node4');
      service.addEdge('node3', 'node4');
    });

    it('should find friends of friends', () => {
      const potentialFriends = service.findPotentialFriends('node1', ['node1', 'node2', 'node3', 'node4']);
      expect(potentialFriends).toContain('node4');
    });

    it('should sort by common neighbors', () => {
      // Add node5 connected to node2 only
      service.addEdge('node2', 'node5');
      const potentialFriends = service.findPotentialFriends('node1', ['node1', 'node2', 'node3', 'node4', 'node5']);
      // node4 has 2 common neighbors (node2, node3), node5 has 1
      expect(potentialFriends[0]).toBe('node4');
    });

    it('should not include existing friends', () => {
      const potentialFriends = service.findPotentialFriends('node1', ['node1', 'node2', 'node3', 'node4']);
      expect(potentialFriends).not.toContain('node2');
      expect(potentialFriends).not.toContain('node3');
    });
  });

  describe('getNetworkStats', () => {
    it('should return correct stats for empty network', () => {
      const stats = service.getNetworkStats(['node1']);
      expect(stats.nodeCount).toBe(1);
      expect(stats.edgeCount).toBe(0);
      expect(stats.density).toBe(0);
      expect(stats.avgDegree).toBe(0);
    });

    it('should return correct stats for connected network', () => {
      service.addEdge('node1', 'node2');
      service.addEdge('node2', 'node3');
      
      const stats = service.getNetworkStats(['node1', 'node2', 'node3']);
      expect(stats.nodeCount).toBe(3);
      expect(stats.edgeCount).toBe(2);
      expect(stats.avgDegree).toBeCloseTo(1.33, 1);
    });
  });

  describe('initializeRandomNetwork', () => {
    it('should create random edges based on probability', () => {
      const nodeIds = ['node1', 'node2', 'node3', 'node4'];
      service.initializeRandomNetwork(nodeIds, 1); // 100% probability
      
      // Should have 6 edges (complete graph)
      expect(service.getAllEdges()).toHaveLength(6);
    });

    it('should clear existing edges', () => {
      service.addEdge('old1', 'old2');
      service.initializeRandomNetwork(['node1', 'node2'], 0);
      
      expect(service.getEdge('old1', 'old2')).toBeUndefined();
    });
  });
});
