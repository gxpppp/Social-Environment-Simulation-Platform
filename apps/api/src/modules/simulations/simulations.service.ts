import { Injectable } from '@nestjs/common';

export interface SimulationSession {
  id: string;
  sceneId: string;
  status: 'running' | 'paused' | 'stopped' | 'completed';
  currentTick: number;
  totalTicks: number;
  startTime: Date;
}

@Injectable()
export class SimulationsService {
  private sessions: Map<string, SimulationSession> = new Map();

  async createSession(sceneId: string, config: any): Promise<SimulationSession> {
    const session: SimulationSession = {
      id: `sim_${Date.now()}`,
      sceneId,
      status: 'running',
      currentTick: 0,
      totalTicks: config.duration || 100,
      startTime: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<SimulationSession | undefined> {
    return this.sessions.get(sessionId);
  }

  async updateSession(sessionId: string, updates: Partial<SimulationSession>): Promise<SimulationSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    Object.assign(session, updates);
    return session;
  }

  async pauseSession(sessionId: string): Promise<SimulationSession> {
    return this.updateSession(sessionId, { status: 'paused' });
  }

  async resumeSession(sessionId: string): Promise<SimulationSession> {
    return this.updateSession(sessionId, { status: 'running' });
  }

  async stopSession(sessionId: string): Promise<SimulationSession> {
    return this.updateSession(sessionId, { status: 'stopped' });
  }

  async getAllSessions(): Promise<SimulationSession[]> {
    return Array.from(this.sessions.values());
  }
}
