import { Test, TestingModule } from '@nestjs/testing';
import { AgentManagerService, AgentState } from './agent-manager.service';

describe('AgentManagerService', () => {
  let service: AgentManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentManagerService],
    }).compile();

    service = module.get<AgentManagerService>(AgentManagerService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('initializeAgents', () => {
    it('should initialize agents with correct default values', () => {
      const configs = [
        { agentId: 'agent1', initialStance: 0.5 },
        { agentId: 'agent2', initialStance: -0.3 },
      ];

      service.initializeAgents(configs);

      const agent1 = service.getAgentState('agent1');
      expect(agent1).toBeDefined();
      expect(agent1.opinion).toBe(0.5);
      expect(agent1.emotion).toBe(0);
      expect(agent1.activity).toBe(0.5);
      expect(agent1.connections).toEqual([]);

      const agent2 = service.getAgentState('agent2');
      expect(agent2.opinion).toBe(-0.3);
    });

    it('should clear existing agents before initialization', () => {
      service.initializeAgents([{ agentId: 'agent1', initialStance: 0 }]);
      service.initializeAgents([{ agentId: 'agent2', initialStance: 0 }]);

      expect(service.getAgentState('agent1')).toBeUndefined();
      expect(service.getAgentState('agent2')).toBeDefined();
    });
  });

  describe('updateAgentOpinion', () => {
    beforeEach(() => {
      service.initializeAgents([{ agentId: 'agent1', initialStance: 0 }]);
    });

    it('should update opinion correctly', () => {
      service.updateAgentOpinion('agent1', 0.3);
      expect(service.getAgentState('agent1').opinion).toBe(0.3);
    });

    it('should not exceed maximum opinion value of 1', () => {
      service.updateAgentOpinion('agent1', 2);
      expect(service.getAgentState('agent1').opinion).toBe(1);
    });

    it('should not go below minimum opinion value of -1', () => {
      service.updateAgentOpinion('agent1', -2);
      expect(service.getAgentState('agent1').opinion).toBe(-1);
    });

    it('should handle non-existent agent gracefully', () => {
      expect(() => service.updateAgentOpinion('nonexistent', 0.5)).not.toThrow();
    });
  });

  describe('addConnection', () => {
    beforeEach(() => {
      service.initializeAgents([
        { agentId: 'agent1', initialStance: 0 },
        { agentId: 'agent2', initialStance: 0 },
      ]);
    });

    it('should add connection between agents', () => {
      service.addConnection('agent1', 'agent2');
      const agent1 = service.getAgentState('agent1');
      expect(agent1.connections).toContain('agent2');
    });

    it('should not add duplicate connections', () => {
      service.addConnection('agent1', 'agent2');
      service.addConnection('agent1', 'agent2');
      const agent1 = service.getAgentState('agent1');
      expect(agent1.connections).toEqual(['agent2']);
    });
  });

  describe('addAgentMemory', () => {
    beforeEach(() => {
      service.initializeAgents([{ agentId: 'agent1', initialStance: 0 }]);
    });

    it('should add memory to agent', () => {
      const memory = {
        tick: 1,
        type: 'interaction' as const,
        content: 'Test memory',
        impact: 0.5,
      };

      service.addAgentMemory('agent1', memory);
      const agent = service.getAgentState('agent1');
      expect(agent.memory).toHaveLength(1);
      expect(agent.memory[0].content).toBe('Test memory');
    });

    it('should keep only last 20 memories', () => {
      for (let i = 0; i < 25; i++) {
        service.addAgentMemory('agent1', {
          tick: i,
          type: 'interaction',
          content: `Memory ${i}`,
          impact: 0.1,
        });
      }

      const agent = service.getAgentState('agent1');
      expect(agent.memory).toHaveLength(20);
      expect(agent.memory[0].content).toBe('Memory 5');
      expect(agent.memory[19].content).toBe('Memory 24');
    });
  });

  describe('calculateGlobalMetrics', () => {
    it('should return zero metrics when no agents', () => {
      const metrics = service.calculateGlobalMetrics();
      expect(metrics.supportRate).toBe(0);
      expect(metrics.opposeRate).toBe(0);
      expect(metrics.neutralRate).toBe(0);
    });

    it('should calculate correct opinion distribution', () => {
      service.initializeAgents([
        { agentId: 'agent1', initialStance: 0.5 },   // support
        { agentId: 'agent2', initialStance: 0.8 },   // support
        { agentId: 'agent3', initialStance: -0.5 },  // oppose
        { agentId: 'agent4', initialStance: 0.1 },   // neutral
      ]);

      const metrics = service.calculateGlobalMetrics();
      expect(metrics.supportRate).toBe(0.5); // 2/4
      expect(metrics.opposeRate).toBe(0.25); // 1/4
      expect(metrics.neutralRate).toBe(0.25); // 1/4
    });
  });

  describe('getOpinionDistribution', () => {
    it('should return empty array when no agents', () => {
      expect(service.getOpinionDistribution()).toEqual([]);
    });

    it('should return opinion values for all agents', () => {
      service.initializeAgents([
        { agentId: 'agent1', initialStance: 0.5 },
        { agentId: 'agent2', initialStance: -0.3 },
      ]);

      const distribution = service.getOpinionDistribution();
      expect(distribution).toHaveLength(2);
      expect(distribution).toContain(0.5);
      expect(distribution).toContain(-0.3);
    });
  });
});
