import { Injectable } from '@nestjs/common';

// Agent状态
export interface AgentState {
  agentId: string;
  opinion: number;        // -1 (反对) 到 1 (支持)
  emotion: number;        // -1 (负面) 到 1 (正面)
  activity: number;       // 0 (不活跃) 到 1 (活跃)
  connections: string[];  // 连接的其他Agent ID
  memory: AgentMemory[];  // 近期记忆
  lastAction: string;     // 最后行动
  actionCount: number;    // 行动次数
}

// Agent记忆
export interface AgentMemory {
  tick: number;
  type: 'perception' | 'interaction' | 'decision';
  content: string;
  impact: number;
}

// Agent决策
export interface AgentDecision {
  action: 'communicate' | 'interact' | 'reflect' | 'wait';
  target?: string;        // 目标Agent ID
  content?: string;       // 内容
  opinionChange?: number; // 观点变化
  reasoning: string;      // 决策理由
}

@Injectable()
export class AgentManagerService {
  private agentStates: Map<string, AgentState> = new Map();

  /**
   * 初始化Agent状态
   */
  initializeAgents(agentConfigs: any[]): void {
    this.agentStates.clear();
    
    for (const config of agentConfigs) {
      const state: AgentState = {
        agentId: config.agentId,
        opinion: config.initialStance || 0,
        emotion: 0,
        activity: 0.5,
        connections: [],
        memory: [],
        lastAction: 'wait',
        actionCount: 0,
      };
      
      this.agentStates.set(config.agentId, state);
    }
  }

  /**
   * 获取Agent状态
   */
  getAgentState(agentId: string): AgentState | undefined {
    return this.agentStates.get(agentId);
  }

  /**
   * 获取所有Agent状态
   */
  getAllAgentStates(): AgentState[] {
    return Array.from(this.agentStates.values());
  }

  /**
   * 更新Agent状态
   */
  updateAgentState(agentId: string, updates: Partial<AgentState>): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      Object.assign(state, updates);
    }
  }

  /**
   * 更新Agent观点
   */
  updateAgentOpinion(agentId: string, change: number): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      state.opinion = Math.max(-1, Math.min(1, state.opinion + change));
    }
  }

  /**
   * 添加Agent记忆
   */
  addAgentMemory(agentId: string, memory: AgentMemory): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      state.memory.push(memory);
      // 只保留最近20条记忆
      if (state.memory.length > 20) {
        state.memory.shift();
      }
    }
  }

  /**
   * 添加Agent连接
   */
  addConnection(agentId: string, targetId: string): void {
    const state = this.agentStates.get(agentId);
    if (state && !state.connections.includes(targetId)) {
      state.connections.push(targetId);
    }
  }

  /**
   * 移除Agent连接
   */
  removeConnection(agentId: string, targetId: string): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      state.connections = state.connections.filter(id => id !== targetId);
    }
  }

  /**
   * 获取Agent的邻居
   */
  getNeighbors(agentId: string): string[] {
    const state = this.agentStates.get(agentId);
    return state ? state.connections : [];
  }

  /**
   * 计算全局指标
   */
  calculateGlobalMetrics(): {
    supportRate: number;
    opposeRate: number;
    neutralRate: number;
    avgActivity: number;
  } {
    const states = this.getAllAgentStates();
    const total = states.length;
    
    if (total === 0) {
      return { supportRate: 0, opposeRate: 0, neutralRate: 0, avgActivity: 0 };
    }

    let support = 0;
    let oppose = 0;
    let neutral = 0;
    let totalActivity = 0;

    for (const state of states) {
      if (state.opinion > 0.3) support++;
      else if (state.opinion < -0.3) oppose++;
      else neutral++;
      
      totalActivity += state.activity;
    }

    return {
      supportRate: support / total,
      opposeRate: oppose / total,
      neutralRate: neutral / total,
      avgActivity: totalActivity / total,
    };
  }

  /**
   * 获取观点分布
   */
  getOpinionDistribution(): number[] {
    const states = this.getAllAgentStates();
    return states.map(s => s.opinion);
  }

  /**
   * 重置所有状态
   */
  reset(): void {
    this.agentStates.clear();
  }
}
