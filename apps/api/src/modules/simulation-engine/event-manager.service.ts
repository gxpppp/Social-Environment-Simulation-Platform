import { Injectable } from '@nestjs/common';

// 模拟事件
export interface SimulationEvent {
  id: string;
  tick: number;
  timestamp: Date;
  type: 'opinion_change' | 'interaction' | 'external_event' | 'network_change';
  source: string;       // Agent ID 或 'system'
  target?: string;      // 目标Agent ID
  data: {
    description: string;
    impact: number;     // 影响程度 -1 到 1
    details?: any;
  };
}

// 外部事件配置
export interface ExternalEventConfig {
  tick: number;
  type: string;
  description: string;
  impact: number;
  targetAgents?: string[];
}

@Injectable()
export class EventManagerService {
  private events: SimulationEvent[] = [];
  private externalEvents: ExternalEventConfig[] = [];
  private eventIdCounter = 0;

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${++this.eventIdCounter}`;
  }

  /**
   * 添加事件
   */
  addEvent(event: Omit<SimulationEvent, 'id'>): SimulationEvent {
    const newEvent: SimulationEvent = {
      ...event,
      id: this.generateEventId(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  /**
   * 记录观点变化事件
   */
  logOpinionChange(
    tick: number,
    agentId: string,
    oldOpinion: number,
    newOpinion: number,
    reason: string,
  ): SimulationEvent {
    const change = newOpinion - oldOpinion;
    return this.addEvent({
      tick,
      timestamp: new Date(),
      type: 'opinion_change',
      source: agentId,
      data: {
        description: `观点从 ${oldOpinion.toFixed(2)} 变为 ${newOpinion.toFixed(2)}: ${reason}`,
        impact: change,
        details: { oldOpinion, newOpinion, reason },
      },
    });
  }

  /**
   * 记录交互事件
   */
  logInteraction(
    tick: number,
    sourceId: string,
    targetId: string,
    interactionType: string,
    content: string,
    impact: number,
  ): SimulationEvent {
    return this.addEvent({
      tick,
      timestamp: new Date(),
      type: 'interaction',
      source: sourceId,
      target: targetId,
      data: {
        description: `${sourceId} ${interactionType} ${targetId}: ${content}`,
        impact,
        details: { interactionType, content },
      },
    });
  }

  /**
   * 记录网络变化事件
   */
  logNetworkChange(
    tick: number,
    sourceId: string,
    targetId: string,
    changeType: 'connect' | 'disconnect' | 'strengthen' | 'weaken',
  ): SimulationEvent {
    const descriptions: Record<string, string> = {
      connect: `与 ${targetId} 建立连接`,
      disconnect: `与 ${targetId} 断开连接`,
      strengthen: `与 ${targetId} 的关系加强`,
      weaken: `与 ${targetId} 的关系减弱`,
    };

    return this.addEvent({
      tick,
      timestamp: new Date(),
      type: 'network_change',
      source: sourceId,
      target: targetId,
      data: {
        description: descriptions[changeType],
        impact: changeType === 'connect' || changeType === 'strengthen' ? 0.1 : -0.1,
        details: { changeType },
      },
    });
  }

  /**
   * 添加外部事件
   */
  addExternalEvent(config: ExternalEventConfig): void {
    this.externalEvents.push(config);
  }

  /**
   * 获取当前tick的外部事件
   */
  getExternalEventsForTick(tick: number): ExternalEventConfig[] {
    return this.externalEvents.filter(e => e.tick === tick);
  }

  /**
   * 触发外部事件
   */
  triggerExternalEvent(tick: number, eventConfig: ExternalEventConfig): SimulationEvent {
    return this.addEvent({
      tick,
      timestamp: new Date(),
      type: 'external_event',
      source: 'system',
      data: {
        description: eventConfig.description,
        impact: eventConfig.impact,
        details: { eventType: eventConfig.type },
      },
    });
  }

  /**
   * 获取所有事件
   */
  getAllEvents(): SimulationEvent[] {
    return [...this.events];
  }

  /**
   * 获取最近事件
   */
  getRecentEvents(count: number = 10): SimulationEvent[] {
    return this.events.slice(-count).reverse();
  }

  /**
   * 获取特定Agent的事件
   */
  getAgentEvents(agentId: string): SimulationEvent[] {
    return this.events.filter(
      e => e.source === agentId || e.target === agentId
    );
  }

  /**
   * 获取特定tick的事件
   */
  getEventsForTick(tick: number): SimulationEvent[] {
    return this.events.filter(e => e.tick === tick);
  }

  /**
   * 获取事件统计
   */
  getEventStats(): {
    total: number;
    byType: Record<string, number>;
    opinionChanges: number;
    interactions: number;
  } {
    const byType: Record<string, number> = {};
    let opinionChanges = 0;
    let interactions = 0;

    for (const event of this.events) {
      byType[event.type] = (byType[event.type] || 0) + 1;
      
      if (event.type === 'opinion_change') {
        opinionChanges++;
      } else if (event.type === 'interaction') {
        interactions++;
      }
    }

    return {
      total: this.events.length,
      byType,
      opinionChanges,
      interactions,
    };
  }

  /**
   * 获取事件时间线
   */
  getTimeline(): Array<{ tick: number; eventCount: number; majorEvents: SimulationEvent[] }> {
    const timeline: Map<number, { tick: number; eventCount: number; majorEvents: SimulationEvent[] }> = new Map();

    for (const event of this.events) {
      if (!timeline.has(event.tick)) {
        timeline.set(event.tick, {
          tick: event.tick,
          eventCount: 0,
          majorEvents: [],
        });
      }

      const tickData = timeline.get(event.tick)!;
      tickData.eventCount++;
      
      // 记录重要事件（影响大于0.3）
      if (Math.abs(event.data.impact) > 0.3) {
        tickData.majorEvents.push(event);
      }
    }

    return Array.from(timeline.values()).sort((a, b) => a.tick - b.tick);
  }

  /**
   * 重置
   */
  reset(): void {
    this.events = [];
    this.externalEvents = [];
    this.eventIdCounter = 0;
  }
}
