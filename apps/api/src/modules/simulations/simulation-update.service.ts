import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

export interface SimulationDelta {
  tick: number;
  timestamp: number;
  agentUpdates?: AgentUpdate[];
  networkUpdates?: NetworkUpdate[];
  metrics?: MetricsUpdate;
  events?: SimulationEvent[];
}

export interface AgentUpdate {
  agentId: string;
  stance?: number;
  position?: { x: number; y: number };
  state?: string;
  lastAction?: string;
}

export interface NetworkUpdate {
  type: 'add' | 'remove' | 'update';
  source: string;
  target: string;
  weight?: number;
}

export interface MetricsUpdate {
  supportRate?: number;
  opposeRate?: number;
  neutralRate?: number;
  networkDensity?: number;
  avgDegree?: number;
  clusteringCoefficient?: number;
}

export interface SimulationEvent {
  id: string;
  type: string;
  timestamp: number;
  data: any;
}

/**
 * 模拟增量更新服务
 * 实现增量数据传输，减少网络带宽占用
 */
@Injectable()
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'simulation-updates',
})
export class SimulationUpdateService {
  @WebSocketServer()
  server: Server;

  // 缓存每个模拟的完整状态（用于计算增量）
  private stateCache: Map<string, any> = new Map();
  
  // 批量更新队列
  private updateQueue: Map<string, SimulationDelta[]> = new Map();
  
  // 批量发送定时器
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 发送增量更新
   */
  sendDeltaUpdate(simulationId: string, delta: SimulationDelta): void {
    const room = `simulation:${simulationId}`;
    
    // 计算实际增量（只发送变化的数据）
    const compressedDelta = this.compressDelta(simulationId, delta);
    
    if (this.hasChanges(compressedDelta)) {
      // 加入批量队列
      this.queueUpdate(simulationId, compressedDelta);
    }
  }

  /**
   * 发送完整状态（用于初始加载或恢复）
   */
  sendFullState(simulationId: string, state: any): void {
    const room = `simulation:${simulationId}`;
    
    // 缓存完整状态
    this.stateCache.set(simulationId, JSON.parse(JSON.stringify(state)));
    
    // 发送完整状态
    this.server.to(room).emit('full_state', {
      simulationId,
      timestamp: Date.now(),
      state,
    });
  }

  /**
   * 发送批量更新
   */
  private flushUpdates(simulationId: string): void {
    const updates = this.updateQueue.get(simulationId);
    if (!updates || updates.length === 0) return;

    const room = `simulation:${simulationId}`;
    
    // 合并多个更新
    const batchedUpdate = this.batchDeltas(updates);
    
    // 发送批量更新
    this.server.to(room).emit('delta_update', {
      simulationId,
      timestamp: Date.now(),
      deltas: batchedUpdate,
    });

    // 清空队列
    this.updateQueue.set(simulationId, []);
  }

  /**
   * 将更新加入队列
   */
  private queueUpdate(simulationId: string, delta: SimulationDelta): void {
    if (!this.updateQueue.has(simulationId)) {
      this.updateQueue.set(simulationId, []);
    }
    
    this.updateQueue.get(simulationId)!.push(delta);

    // 设置批量发送定时器（100ms）
    if (!this.batchTimers.has(simulationId)) {
      const timer = setTimeout(() => {
        this.flushUpdates(simulationId);
        this.batchTimers.delete(simulationId);
      }, 100);
      this.batchTimers.set(simulationId, timer);
    }
  }

  /**
   * 压缩增量（只保留变化的数据）
   */
  private compressDelta(simulationId: string, delta: SimulationDelta): SimulationDelta {
    const cachedState = this.stateCache.get(simulationId);
    const compressed: SimulationDelta = {
      tick: delta.tick,
      timestamp: delta.timestamp,
    };

    // 压缩Agent更新
    if (delta.agentUpdates && delta.agentUpdates.length > 0) {
      compressed.agentUpdates = delta.agentUpdates.map(update => {
        const cached = cachedState?.agents?.[update.agentId];
        const changes: AgentUpdate = { agentId: update.agentId };

        if (cached?.stance !== update.stance) changes.stance = update.stance;
        if (cached?.state !== update.state) changes.state = update.state;
        if (cached?.lastAction !== update.lastAction) changes.lastAction = update.lastAction;
        if (update.position && (
          cached?.position?.x !== update.position.x ||
          cached?.position?.y !== update.position.y
        )) {
          changes.position = update.position;
        }

        return changes;
      }).filter(u => Object.keys(u).length > 1);
    }

    // 压缩网络更新
    if (delta.networkUpdates && delta.networkUpdates.length > 0) {
      compressed.networkUpdates = delta.networkUpdates;
    }

    // 压缩指标更新（只发送变化的指标）
    if (delta.metrics) {
      const cachedMetrics = cachedState?.metrics || {};
      compressed.metrics = {};
      
      Object.entries(delta.metrics).forEach(([key, value]) => {
        if (cachedMetrics[key] !== value) {
          compressed.metrics![key] = value;
        }
      });

      if (Object.keys(compressed.metrics).length === 0) {
        delete compressed.metrics;
      }
    }

    // 更新缓存
    this.updateCache(simulationId, delta);

    return compressed;
  }

  /**
   * 更新缓存状态
   */
  private updateCache(simulationId: string, delta: SimulationDelta): void {
    const cached = this.stateCache.get(simulationId) || {};

    if (delta.agentUpdates) {
      cached.agents = cached.agents || {};
      delta.agentUpdates.forEach(update => {
        cached.agents[update.agentId] = {
          ...cached.agents[update.agentId],
          ...update,
        };
      });
    }

    if (delta.metrics) {
      cached.metrics = { ...cached.metrics, ...delta.metrics };
    }

    this.stateCache.set(simulationId, cached);
  }

  /**
   * 合并多个增量
   */
  private batchDeltas(deltas: SimulationDelta[]): SimulationDelta {
    if (deltas.length === 1) return deltas[0];

    const batched: SimulationDelta = {
      tick: deltas[0].tick,
      timestamp: deltas[deltas.length - 1].timestamp,
      agentUpdates: [],
      networkUpdates: [],
      metrics: {},
      events: [],
    };

    const agentUpdateMap = new Map<string, AgentUpdate>();
    const networkUpdateMap = new Map<string, NetworkUpdate>();

    deltas.forEach(delta => {
      // 合并Agent更新（后面的覆盖前面的）
      delta.agentUpdates?.forEach(update => {
        const existing = agentUpdateMap.get(update.agentId);
        agentUpdateMap.set(update.agentId, { ...existing, ...update });
      });

      // 合并网络更新
      delta.networkUpdates?.forEach(update => {
        const key = `${update.source}-${update.target}`;
        networkUpdateMap.set(key, update);
      });

      // 合并指标（取最新的）
      if (delta.metrics) {
        Object.assign(batched.metrics!, delta.metrics);
      }

      // 合并事件
      if (delta.events) {
        batched.events!.push(...delta.events);
      }
    });

    batched.agentUpdates = Array.from(agentUpdateMap.values());
    batched.networkUpdates = Array.from(networkUpdateMap.values());

    return batched;
  }

  /**
   * 检查是否有实际变化
   */
  private hasChanges(delta: SimulationDelta): boolean {
    return !!(
      (delta.agentUpdates && delta.agentUpdates.length > 0) ||
      (delta.networkUpdates && delta.networkUpdates.length > 0) ||
      (delta.metrics && Object.keys(delta.metrics).length > 0) ||
      (delta.events && delta.events.length > 0)
    );
  }

  /**
   * 清理模拟缓存
   */
  clearCache(simulationId: string): void {
    this.stateCache.delete(simulationId);
    this.updateQueue.delete(simulationId);
    
    const timer = this.batchTimers.get(simulationId);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(simulationId);
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    cachedSimulations: number;
    queuedUpdates: number;
    activeTimers: number;
  } {
    return {
      cachedSimulations: this.stateCache.size,
      queuedUpdates: Array.from(this.updateQueue.values()).reduce(
        (sum, queue) => sum + queue.length, 0
      ),
      activeTimers: this.batchTimers.size,
    };
  }
}
