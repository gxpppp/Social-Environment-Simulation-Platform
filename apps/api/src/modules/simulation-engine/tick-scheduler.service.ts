import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

// Tick状态
export interface TickState {
  tick: number;
  timestamp: Date;
  status: 'running' | 'paused' | 'completed';
}

// Tick配置
export interface TickConfig {
  totalTicks: number;
  tickInterval: number;  // 每个tick的间隔时间（毫秒）
  autoStart?: boolean;
}

@Injectable()
export class TickSchedulerService {
  private readonly logger = new Logger(TickSchedulerService.name);
  
  private currentTick = 0;
  private totalTicks = 0;
  private tickInterval = 1000;
  private isRunning = false;
  private isPaused = false;
  private timer: NodeJS.Timeout | null = null;
  
  private tickSubject = new Subject<TickState>();
  private completeSubject = new Subject<void>();

  /**
   * 获取Tick流
   */
  getTickStream(): Observable<TickState> {
    return this.tickSubject.asObservable();
  }

  /**
   * 获取完成流
   */
  getCompleteStream(): Observable<void> {
    return this.completeSubject.asObservable();
  }

  /**
   * 初始化调度器
   */
  initialize(config: TickConfig): void {
    this.currentTick = 0;
    this.totalTicks = config.totalTicks;
    this.tickInterval = config.tickInterval;
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.logger.log(`Tick scheduler initialized: ${config.totalTicks} ticks, ${config.tickInterval}ms interval`);
  }

  /**
   * 开始调度
   */
  start(): void {
    if (this.isRunning) {
      this.logger.warn('Tick scheduler is already running');
      return;
    }

    if (this.currentTick >= this.totalTicks) {
      this.logger.warn('Simulation already completed');
      return;
    }

    this.isRunning = true;
    this.isPaused = false;

    this.timer = setInterval(() => {
      this.executeTick();
    }, this.tickInterval);

    this.logger.log('Tick scheduler started');
  }

  /**
   * 暂停调度
   */
  pause(): void {
    if (!this.isRunning || this.isPaused) {
      return;
    }

    this.isPaused = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.tickSubject.next({
      tick: this.currentTick,
      timestamp: new Date(),
      status: 'paused',
    });

    this.logger.log(`Tick scheduler paused at tick ${this.currentTick}`);
  }

  /**
   * 恢复调度
   */
  resume(): void {
    if (!this.isRunning || !this.isPaused) {
      return;
    }

    this.isPaused = false;
    this.timer = setInterval(() => {
      this.executeTick();
    }, this.tickInterval);

    this.logger.log('Tick scheduler resumed');
  }

  /**
   * 停止调度
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    this.logger.log('Tick scheduler stopped');
  }

  /**
   * 单步执行
   */
  step(): void {
    if (this.isRunning && !this.isPaused) {
      this.pause();
    }

    if (this.currentTick < this.totalTicks) {
      this.executeTick();
    }
  }

  /**
   * 执行单个Tick
   */
  private executeTick(): void {
    if (this.currentTick >= this.totalTicks) {
      this.complete();
      return;
    }

    this.currentTick++;

    this.tickSubject.next({
      tick: this.currentTick,
      timestamp: new Date(),
      status: 'running',
    });

    this.logger.debug(`Tick ${this.currentTick}/${this.totalTicks} executed`);
  }

  /**
   * 完成模拟
   */
  private complete(): void {
    this.stop();

    this.tickSubject.next({
      tick: this.currentTick,
      timestamp: new Date(),
      status: 'completed',
    });

    this.completeSubject.next();
    this.logger.log(`Simulation completed at tick ${this.currentTick}`);
  }

  /**
   * 获取当前Tick
   */
  getCurrentTick(): number {
    return this.currentTick;
  }

  /**
   * 获取总Tick数
   */
  getTotalTicks(): number {
    return this.totalTicks;
  }

  /**
   * 获取进度
   */
  getProgress(): number {
    if (this.totalTicks === 0) return 0;
    return this.currentTick / this.totalTicks;
  }

  /**
   * 是否运行中
   */
  isRunningState(): boolean {
    return this.isRunning && !this.isPaused;
  }

  /**
   * 是否暂停
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * 设置Tick间隔
   */
  setTickInterval(interval: number): void {
    this.tickInterval = interval;
    
    // 如果正在运行，重启定时器
    if (this.isRunning && !this.isPaused && this.timer) {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.executeTick();
      }, this.tickInterval);
    }
  }

  /**
   * 重置
   */
  reset(): void {
    this.stop();
    this.currentTick = 0;
    this.totalTicks = 0;
    // 不要重新创建Subject，而是complete它们
    this.tickSubject.complete();
    this.completeSubject.complete();
    // 创建新的Subject
    this.tickSubject = new Subject<TickState>();
    this.completeSubject = new Subject<void>();
  }
}
