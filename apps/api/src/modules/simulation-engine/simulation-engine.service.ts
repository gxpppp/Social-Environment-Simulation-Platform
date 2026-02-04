import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scene } from '../../entities/scene.entity';
import { AgentManagerService, AgentState, AgentDecision } from './agent-manager.service';
import { NetworkManagerService } from './network-manager.service';
import { EventManagerService, SimulationEvent } from './event-manager.service';
import { TickSchedulerService } from './tick-scheduler.service';
import { SimulationsGateway } from '../simulations/simulations.gateway';

// 模拟会话状态
export interface SimulationSession {
  id: string;
  sceneId: string;
  status: 'running' | 'paused' | 'stopped' | 'completed';
  currentTick: number;
  totalTicks: number;
  startTime: Date;
  metrics: {
    supportRate: number;
    opposeRate: number;
    neutralRate: number;
    networkDensity: number;
    activityLevel: number;
  };
  recentEvents: SimulationEvent[];
}

@Injectable()
export class SimulationEngineService {
  private readonly logger = new Logger(SimulationEngineService.name);
  private sessions: Map<string, SimulationSession> = new Map();

  constructor(
    @InjectRepository(Scene)
    private sceneRepository: Repository<Scene>,
    private agentManager: AgentManagerService,
    private networkManager: NetworkManagerService,
    private eventManager: EventManagerService,
    private tickScheduler: TickSchedulerService,
    private gateway: SimulationsGateway,
  ) {}

  /**
   * 创建模拟会话
   */
  async createSession(sceneId: string): Promise<SimulationSession> {
    const scene = await this.sceneRepository.findOne({
      where: { id: sceneId },
      relations: ['agents'],
    });

    if (!scene) {
      throw new Error('Scene not found');
    }

    const sessionId = `sim_${Date.now()}`;
    const agentConfigs = scene.config?.agents || [];
    const totalTicks = Math.ceil(
      scene.config?.duration / (scene.config?.timeStep === 'day' ? 1 : scene.config?.timeStep === 'week' ? 7 : 30) || 100
    );

    // 初始化Agent状态
    this.agentManager.initializeAgents(agentConfigs);

    // 初始化网络
    const agentIds = agentConfigs.map((a: any) => a.agentId);
    this.networkManager.initializeRandomNetwork(agentIds, 0.15);

    // 同步Agent的连接状态
    for (const agentId of agentIds) {
      const neighbors = this.networkManager.getNeighbors(agentId);
      this.agentManager.updateAgentState(agentId, { connections: neighbors });
    }

    // 创建会话
    const session: SimulationSession = {
      id: sessionId,
      sceneId,
      status: 'running',
      currentTick: 0,
      totalTicks,
      startTime: new Date(),
      metrics: {
        supportRate: 0,
        opposeRate: 0,
        neutralRate: 0,
        networkDensity: 0,
        activityLevel: 0,
      },
      recentEvents: [],
    };

    this.sessions.set(sessionId, session);

    // 初始化Tick调度器
    this.tickScheduler.initialize({
      totalTicks,
      tickInterval: 1000, // 1秒一个tick
    });

    // 订阅Tick事件
    this.tickScheduler.getTickStream().subscribe((tickState) => {
      this.handleTick(sessionId, tickState.tick);
    });

    // 启动调度
    this.tickScheduler.start();

    this.logger.log(`Simulation session ${sessionId} created for scene ${sceneId}`);
    return session;
  }

  /**
   * 处理每个Tick
   */
  private async handleTick(sessionId: string, tick: number): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Session ${sessionId} not found`);
      return;
    }

    try {
      session.currentTick = tick;

      // 1. 处理外部事件
      await this.processExternalEvents(sessionId, tick);

      // 2. Agent决策和行动
      await this.processAgentActions(sessionId, tick);

      // 3. 网络演化
      this.evolveNetwork(sessionId, tick);

      // 4. 更新指标
      this.updateMetrics(sessionId);

      // 5. 广播状态
      this.broadcastState(sessionId);

      // 6. 更新会话状态
      session.recentEvents = this.eventManager.getRecentEvents(5);

      this.logger.debug(`Tick ${tick} processed for session ${sessionId}`);
    } catch (error) {
      this.logger.error(
        `Error processing tick ${tick} for session ${sessionId}: ${error.message}`,
        error.stack,
      );
      // 继续运行，不要中断模拟
    }
  }

  /**
   * 处理外部事件
   */
  private async processExternalEvents(sessionId: string, tick: number): Promise<void> {
    const externalEvents = this.eventManager.getExternalEventsForTick(tick);
    
    for (const eventConfig of externalEvents) {
      this.eventManager.triggerExternalEvent(tick, eventConfig);
      
      // 影响目标Agent
      if (eventConfig.targetAgents) {
        for (const agentId of eventConfig.targetAgents) {
          const impact = eventConfig.impact * (0.5 + Math.random() * 0.5);
          this.agentManager.updateAgentOpinion(agentId, impact);
          
          this.eventManager.logOpinionChange(
            tick,
            agentId,
            0, // 简化处理
            impact,
            `受外部事件影响: ${eventConfig.description}`,
          );
        }
      }
    }
  }

  /**
   * 处理Agent行动
   */
  private async processAgentActions(sessionId: string, tick: number): Promise<void> {
    const agentStates = this.agentManager.getAllAgentStates();

    for (const agentState of agentStates) {
      // 基于活跃度决定是否行动
      if (Math.random() > agentState.activity) {
        continue;
      }

      // 简化的决策逻辑
      const decision = this.makeSimpleDecision(agentState);
      
      switch (decision.action) {
        case 'communicate':
          await this.handleCommunication(sessionId, tick, agentState, decision);
          break;
        case 'interact':
          await this.handleInteraction(sessionId, tick, agentState, decision);
          break;
        case 'reflect':
          this.handleReflection(sessionId, tick, agentState);
          break;
        default:
          // wait - 不行动
          break;
      }

      // 更新Agent状态
      this.agentManager.updateAgentState(agentState.agentId, {
        lastAction: decision.action,
        actionCount: agentState.actionCount + 1,
      });
    }
  }

  /**
   * 简化决策逻辑
   */
  private makeSimpleDecision(agentState: AgentState): AgentDecision {
    const neighbors = agentState.connections;
    
    if (neighbors.length === 0) {
      return { action: 'wait', reasoning: '没有可交互的邻居' };
    }

    // 随机选择行动
    const actions: AgentDecision['action'][] = ['communicate', 'interact', 'reflect', 'wait'];
    const weights = [0.4, 0.3, 0.2, 0.1]; // 行动权重
    
    const random = Math.random();
    let cumulative = 0;
    let selectedAction: AgentDecision['action'] = 'wait';
    
    for (let i = 0; i < actions.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        selectedAction = actions[i];
        break;
      }
    }

    const target = neighbors[Math.floor(Math.random() * neighbors.length)];

    return {
      action: selectedAction,
      target,
      reasoning: '基于当前状态和邻居选择的随机决策',
    };
  }

  /**
   * 处理交流
   */
  private async handleCommunication(
    sessionId: string,
    tick: number,
    agentState: AgentState,
    decision: AgentDecision,
  ): Promise<void> {
    if (!decision.target) return;

    const targetState = this.agentManager.getAgentState(decision.target);
    if (!targetState) return;

    // 观点影响计算
    const opinionDiff = agentState.opinion - targetState.opinion;
    const edge = this.networkManager.getEdge(agentState.agentId, decision.target);
    const relationshipStrength = edge?.weight || 0.5;
    
    // 影响强度
    const influence = relationshipStrength * 0.1 * (agentState.activity + 0.5);
    const opinionChange = opinionDiff * influence * 0.3;

    // 更新目标观点
    this.agentManager.updateAgentOpinion(decision.target, opinionChange);

    // 强化关系
    this.networkManager.strengthenRelationship(agentState.agentId, decision.target, 0.02);

    // 记录事件
    this.eventManager.logInteraction(
      tick,
      agentState.agentId,
      decision.target,
      'communicate',
      `观点交流: 影响 ${opinionChange.toFixed(3)}`,
      opinionChange,
    );

    this.eventManager.logOpinionChange(
      tick,
      decision.target,
      targetState.opinion,
      targetState.opinion + opinionChange,
      `受 ${agentState.agentId} 影响`,
    );
  }

  /**
   * 处理交互
   */
  private async handleInteraction(
    sessionId: string,
    tick: number,
    agentState: AgentState,
    decision: AgentDecision,
  ): Promise<void> {
    if (!decision.target) return;

    // 强化关系
    this.networkManager.strengthenRelationship(agentState.agentId, decision.target, 0.05);

    // 记录事件
    this.eventManager.logInteraction(
      tick,
      agentState.agentId,
      decision.target,
      'interact',
      '社交互动',
      0.05,
    );
  }

  /**
   * 处理反思
   */
  private handleReflection(sessionId: string, tick: number, agentState: AgentState): void {
    // 轻微调整观点（向邻居平均观点靠拢）
    const neighbors = agentState.connections;
    if (neighbors.length === 0) return;

    let avgOpinion = 0;
    for (const neighborId of neighbors) {
      const neighbor = this.agentManager.getAgentState(neighborId);
      if (neighbor) {
        avgOpinion += neighbor.opinion;
      }
    }
    avgOpinion /= neighbors.length;

    const opinionDiff = avgOpinion - agentState.opinion;
    const opinionChange = opinionDiff * 0.02; // 很小的影响

    this.agentManager.updateAgentOpinion(agentState.agentId, opinionChange);

    // 记录事件
    this.eventManager.logOpinionChange(
      tick,
      agentState.agentId,
      agentState.opinion,
      agentState.opinion + opinionChange,
      '反思和观察后的观点调整',
    );
  }

  /**
   * 网络演化
   */
  private evolveNetwork(sessionId: string, tick: number): void {
    const agentStates = this.agentManager.getAllAgentStates();
    const agentIds = agentStates.map((a) => a.agentId);

    // 1. 强化频繁交互的关系（已在handleCommunication中处理）

    // 2. 基于相似性建立新连接
    for (const agentState of agentStates) {
      if (agentState.connections.length >= 10) continue; // 限制最大连接数

      const potentialFriends = this.networkManager.findPotentialFriends(
        agentState.agentId,
        agentIds,
      );

      for (const friendId of potentialFriends.slice(0, 2)) {
        // 最多尝试2个
        const friend = this.agentManager.getAgentState(friendId);
        if (!friend) continue;

        // 观点相似度
        const opinionDiff = Math.abs(agentState.opinion - friend.opinion);
        
        // 相似且连接数不多时建立连接
        if (opinionDiff < 0.3 && friend.connections.length < 10) {
          if (Math.random() < 0.1) {
            // 10%概率
            this.networkManager.addEdge(agentState.agentId, friendId, 0.3, 'friend');
            this.eventManager.logNetworkChange(
              tick,
              agentState.agentId,
              friendId,
              'connect',
            );
          }
        }
      }
    }

    // 3. 衰减弱关系
    for (const agentState of agentStates) {
      for (const neighborId of agentState.connections) {
        this.networkManager.weakenRelationship(agentState.agentId, neighborId, 0.01);
      }
    }

    // 4. 同步Agent的连接状态
    for (const agentState of agentStates) {
      const neighbors = this.networkManager.getNeighbors(agentState.agentId);
      this.agentManager.updateAgentState(agentState.agentId, { connections: neighbors });
    }
  }

  /**
   * 更新指标
   */
  private updateMetrics(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Agent指标
    const agentMetrics = this.agentManager.calculateGlobalMetrics();

    // 网络指标
    const agentIds = this.agentManager.getAllAgentStates().map((a) => a.agentId);
    const networkStats = this.networkManager.getNetworkStats(agentIds);

    session.metrics = {
      supportRate: agentMetrics.supportRate,
      opposeRate: agentMetrics.opposeRate,
      neutralRate: agentMetrics.neutralRate,
      networkDensity: networkStats.density,
      activityLevel: agentMetrics.avgActivity,
    };
  }

  /**
   * 广播状态
   */
  private broadcastState(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    this.gateway.broadcastStatus(sessionId, {
      tick: session.currentTick,
      totalTicks: session.totalTicks,
      metrics: session.metrics,
      agentStates: this.agentManager.getAllAgentStates().map((s) => ({
        agentId: s.agentId,
        opinion: s.opinion,
        emotion: s.emotion,
        activity: s.activity,
      })),
      recentEvents: session.recentEvents,
    });
  }

  /**
   * 暂停模拟
   */
  pauseSession(sessionId: string): void {
    this.tickScheduler.pause();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'paused';
    }
  }

  /**
   * 恢复模拟
   */
  resumeSession(sessionId: string): void {
    this.tickScheduler.resume();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'running';
    }
  }

  /**
   * 停止模拟
   */
  stopSession(sessionId: string): void {
    this.tickScheduler.stop();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'stopped';
    }
  }

  /**
   * 单步执行
   */
  stepSession(sessionId: string): void {
    this.tickScheduler.step();
  }

  /**
   * 获取会话状态
   */
  getSession(sessionId: string): SimulationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 获取所有会话
   */
  getAllSessions(): SimulationSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 获取会话统计
   */
  getSessionStats(sessionId: string): any {
    return {
      events: this.eventManager.getEventStats(),
      network: this.networkManager.getNetworkStats(
        this.agentManager.getAllAgentStates().map((a) => a.agentId),
      ),
    };
  }
}
