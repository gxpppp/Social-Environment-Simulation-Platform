import { Test, TestingModule } from '@nestjs/testing';
import { EventManagerService } from './event-manager.service';

describe('EventManagerService', () => {
  let service: EventManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventManagerService],
    }).compile();

    service = module.get<EventManagerService>(EventManagerService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('addEvent', () => {
    it('should add an event with generated ID', () => {
      const event = service.addEvent({
        tick: 1,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent1',
        data: {
          description: 'Test event',
          impact: 0.5,
        },
      });

      expect(event.id).toBeDefined();
      expect(event.id.startsWith('evt_')).toBe(true);
      expect(event.tick).toBe(1);
    });

    it('should add multiple events', () => {
      service.addEvent({
        tick: 1,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent1',
        data: { description: 'Event 1', impact: 0.5 },
      });

      service.addEvent({
        tick: 2,
        timestamp: new Date(),
        type: 'opinion_change',
        source: 'agent2',
        data: { description: 'Event 2', impact: 0.3 },
      });

      expect(service.getAllEvents()).toHaveLength(2);
    });
  });

  describe('logOpinionChange', () => {
    it('should log opinion change event', () => {
      const event = service.logOpinionChange(1, 'agent1', 0.2, 0.5, 'Test reason');

      expect(event.type).toBe('opinion_change');
      expect(event.source).toBe('agent1');
      expect(event.tick).toBe(1);
      expect(event.data.impact).toBe(0.3); // 0.5 - 0.2
      expect(event.data.description).toContain('0.20');
      expect(event.data.description).toContain('0.50');
      expect(event.data.description).toContain('Test reason');
    });

    it('should handle negative opinion change', () => {
      const event = service.logOpinionChange(1, 'agent1', 0.5, 0.2, 'Negative change');

      expect(event.data.impact).toBe(-0.3);
    });
  });

  describe('logInteraction', () => {
    it('should log interaction event', () => {
      const event = service.logInteraction(
        1,
        'agent1',
        'agent2',
        'communicate',
        'Hello',
        0.5,
      );

      expect(event.type).toBe('interaction');
      expect(event.source).toBe('agent1');
      expect(event.target).toBe('agent2');
      expect(event.tick).toBe(1);
      expect(event.data.description).toContain('agent1');
      expect(event.data.description).toContain('agent2');
      expect(event.data.description).toContain('Hello');
      expect(event.data.impact).toBe(0.5);
    });
  });

  describe('logNetworkChange', () => {
    it('should log connect event', () => {
      const event = service.logNetworkChange(1, 'agent1', 'agent2', 'connect');

      expect(event.type).toBe('network_change');
      expect(event.data.description).toContain('建立连接');
      expect(event.data.impact).toBe(0.1);
    });

    it('should log disconnect event', () => {
      const event = service.logNetworkChange(1, 'agent1', 'agent2', 'disconnect');

      expect(event.data.description).toContain('断开连接');
      expect(event.data.impact).toBe(-0.1);
    });

    it('should log strengthen event', () => {
      const event = service.logNetworkChange(1, 'agent1', 'agent2', 'strengthen');

      expect(event.data.description).toContain('关系加强');
      expect(event.data.impact).toBe(0.1);
    });

    it('should log weaken event', () => {
      const event = service.logNetworkChange(1, 'agent1', 'agent2', 'weaken');

      expect(event.data.description).toContain('关系减弱');
      expect(event.data.impact).toBe(-0.1);
    });
  });

  describe('external events', () => {
    it('should add and retrieve external events', () => {
      service.addExternalEvent({
        tick: 5,
        type: 'policy',
        description: 'Policy announcement',
        impact: 0.8,
        targetAgents: ['agent1', 'agent2'],
      });

      const events = service.getExternalEventsForTick(5);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('policy');
    });

    it('should trigger external event', () => {
      service.addExternalEvent({
        tick: 5,
        type: 'news',
        description: 'Breaking news',
        impact: 0.5,
      });

      const eventConfig = service.getExternalEventsForTick(5)[0];
      const event = service.triggerExternalEvent(5, eventConfig);

      expect(event.type).toBe('external_event');
      expect(event.source).toBe('system');
      expect(event.data.description).toBe('Breaking news');
    });
  });

  describe('getRecentEvents', () => {
    beforeEach(() => {
      for (let i = 0; i < 15; i++) {
        service.addEvent({
          tick: i,
          timestamp: new Date(),
          type: 'interaction',
          source: `agent${i}`,
          data: { description: `Event ${i}`, impact: 0.1 },
        });
      }
    });

    it('should return recent events in reverse order', () => {
      const recent = service.getRecentEvents(5);

      expect(recent).toHaveLength(5);
      expect(recent[0].source).toBe('agent14');
      expect(recent[4].source).toBe('agent10');
    });

    it('should return all events if count exceeds total', () => {
      const recent = service.getRecentEvents(100);

      expect(recent).toHaveLength(15);
    });
  });

  describe('getAgentEvents', () => {
    beforeEach(() => {
      service.addEvent({
        tick: 1,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent1',
        target: 'agent2',
        data: { description: 'Event 1', impact: 0.1 },
      });

      service.addEvent({
        tick: 2,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent2',
        target: 'agent3',
        data: { description: 'Event 2', impact: 0.2 },
      });

      service.addEvent({
        tick: 3,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent1',
        data: { description: 'Event 3', impact: 0.3 },
      });
    });

    it('should return events for specific agent as source', () => {
      const events = service.getAgentEvents('agent1');
      expect(events).toHaveLength(2);
    });

    it('should return events for specific agent as target', () => {
      const events = service.getAgentEvents('agent2');
      expect(events).toHaveLength(2); // as source and target
    });

    it('should return empty array for agent with no events', () => {
      const events = service.getAgentEvents('agent4');
      expect(events).toHaveLength(0);
    });
  });

  describe('getEventsForTick', () => {
    beforeEach(() => {
      service.addEvent({
        tick: 1,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent1',
        data: { description: 'Event 1', impact: 0.1 },
      });

      service.addEvent({
        tick: 2,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent2',
        data: { description: 'Event 2', impact: 0.2 },
      });

      service.addEvent({
        tick: 1,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent3',
        data: { description: 'Event 3', impact: 0.3 },
      });
    });

    it('should return events for specific tick', () => {
      const events = service.getEventsForTick(1);
      expect(events).toHaveLength(2);
    });

    it('should return empty array for tick with no events', () => {
      const events = service.getEventsForTick(3);
      expect(events).toHaveLength(0);
    });
  });

  describe('getEventStats', () => {
    beforeEach(() => {
      service.logOpinionChange(1, 'agent1', 0, 0.5, 'Change 1');
      service.logOpinionChange(2, 'agent2', 0, -0.3, 'Change 2');
      service.logInteraction(1, 'agent1', 'agent2', 'talk', 'Hello', 0.5);
      service.logInteraction(2, 'agent2', 'agent3', 'talk', 'Hi', 0.3);
      service.logNetworkChange(3, 'agent1', 'agent2', 'connect');
    });

    it('should return correct event statistics', () => {
      const stats = service.getEventStats();

      expect(stats.total).toBe(5);
      expect(stats.opinionChanges).toBe(2);
      expect(stats.interactions).toBe(2);
      expect(stats.byType['opinion_change']).toBe(2);
      expect(stats.byType['interaction']).toBe(2);
      expect(stats.byType['network_change']).toBe(1);
    });
  });

  describe('getTimeline', () => {
    beforeEach(() => {
      // Tick 1: 2 events
      service.addEvent({
        tick: 1,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent1',
        data: { description: 'Event 1', impact: 0.1 },
      });
      service.addEvent({
        tick: 1,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent2',
        data: { description: 'Event 2', impact: 0.5 }, // Major event
      });

      // Tick 2: 1 event
      service.addEvent({
        tick: 2,
        timestamp: new Date(),
        type: 'interaction',
        source: 'agent3',
        data: { description: 'Event 3', impact: 0.2 },
      });
    });

    it('should return timeline with event counts', () => {
      const timeline = service.getTimeline();

      expect(timeline).toHaveLength(2);
      expect(timeline[0].tick).toBe(1);
      expect(timeline[0].eventCount).toBe(2);
      expect(timeline[1].tick).toBe(2);
      expect(timeline[1].eventCount).toBe(1);
    });

    it('should include major events', () => {
      const timeline = service.getTimeline();

      expect(timeline[0].majorEvents).toHaveLength(1);
      expect(timeline[0].majorEvents[0].data.impact).toBe(0.5);
    });
  });
});
