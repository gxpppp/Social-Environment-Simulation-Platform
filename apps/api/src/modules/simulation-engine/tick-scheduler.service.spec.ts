import { Test, TestingModule } from '@nestjs/testing';
import { TickSchedulerService } from './tick-scheduler.service';

describe('TickSchedulerService', () => {
  let service: TickSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TickSchedulerService],
    }).compile();

    service = module.get<TickSchedulerService>(TickSchedulerService);
  });

  afterEach(() => {
    service.reset();
  });

  describe('initialize', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should initialize with correct values', () => {
      service.initialize({ totalTicks: 100, tickInterval: 1000 });
      expect(service.getCurrentTick()).toBe(0);
      expect(service.getTotalTicks()).toBe(100);
      expect(service.getProgress()).toBe(0);
    });

    it('should reset current tick on re-initialization', () => {
      service.initialize({ totalTicks: 100, tickInterval: 1000 });
      service.start();
      jest.advanceTimersByTime(1000);
      
      service.initialize({ totalTicks: 50, tickInterval: 500 });
      expect(service.getCurrentTick()).toBe(0);
      expect(service.getTotalTicks()).toBe(50);
    });
  });

  describe('start', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      service.initialize({ totalTicks: 10, tickInterval: 1000 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start ticking', (done) => {
      const ticks: number[] = [];
      
      service.getTickStream().subscribe((state) => {
        ticks.push(state.tick);
        if (state.tick === 3) {
          service.stop();
          expect(ticks).toEqual([1, 2, 3]);
          done();
        }
      });

      service.start();
      jest.advanceTimersByTime(3000);
    });

    it('should not start if already running', () => {
      service.start();
      const isRunning = service.isRunningState();
      
      // Try to start again
      service.start();
      expect(service.isRunningState()).toBe(isRunning);
    });

    it('should not start if already completed', () => {
      service.start();
      jest.advanceTimersByTime(10000);
      
      service.start();
      expect(service.isRunningState()).toBe(false);
    });
  });

  describe('pause and resume', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      service.initialize({ totalTicks: 10, tickInterval: 1000 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should pause ticking', (done) => {
      let tickCount = 0;
      
      service.getTickStream().subscribe((state) => {
        tickCount = state.tick;
        if (state.tick === 3) {
          service.pause();
          expect(service.isPausedState()).toBe(true);
          expect(service.isRunningState()).toBe(false);
          done();
        }
      });

      service.start();
      jest.advanceTimersByTime(3000);
    });

    it('should resume ticking', (done) => {
      const ticks: number[] = [];
      
      service.getTickStream().subscribe((state) => {
        ticks.push(state.tick);
        if (state.tick === 5) {
          service.stop();
          expect(ticks).toEqual([1, 2, 3, 4, 5]);
          done();
        }
      });

      service.start();
      jest.advanceTimersByTime(3000);
      service.pause();
      jest.advanceTimersByTime(2000); // Should not tick while paused
      service.resume();
      jest.advanceTimersByTime(2000);
    });

    it('should not pause if not running', () => {
      expect(() => service.pause()).not.toThrow();
      expect(service.isPausedState()).toBe(false);
    });

    it('should not resume if not paused', () => {
      service.start();
      service.resume(); // Already running
      expect(service.isRunningState()).toBe(true);
    });
  });

  describe('stop', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      service.initialize({ totalTicks: 10, tickInterval: 1000 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should stop ticking', () => {
      service.start();
      jest.advanceTimersByTime(3000);
      
      service.stop();
      expect(service.isRunningState()).toBe(false);
      expect(service.isPausedState()).toBe(false);
      expect(service.getCurrentTick()).toBe(3);
    });

    it('should not throw if stopped when not running', () => {
      expect(() => service.stop()).not.toThrow();
    });
  });

  describe('step', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      service.initialize({ totalTicks: 10, tickInterval: 1000 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should execute single tick', (done) => {
      service.getTickStream().subscribe((state) => {
        expect(state.tick).toBe(1);
        done();
      });

      service.step();
    });

    it('should pause if running when stepping', () => {
      service.start();
      jest.advanceTimersByTime(1000);
      
      service.step();
      expect(service.isPausedState()).toBe(true);
    });

    it('should not step beyond total ticks', () => {
      service.initialize({ totalTicks: 2, tickInterval: 1000 });
      
      service.step();
      service.step();
      
      let tickReceived = false;
      service.getTickStream().subscribe(() => {
        tickReceived = true;
      });
      
      service.step();
      expect(tickReceived).toBe(false);
      expect(service.getCurrentTick()).toBe(2);
    });
  });

  describe('progress', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      service.initialize({ totalTicks: 100, tickInterval: 100 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should calculate correct progress', () => {
      expect(service.getProgress()).toBe(0);
      
      service.start();
      jest.advanceTimersByTime(250);
      
      expect(service.getProgress()).toBe(0.02); // 2/100
    });

    it('should return 0 when total ticks is 0', () => {
      service.initialize({ totalTicks: 0, tickInterval: 100 });
      expect(service.getProgress()).toBe(0);
    });
  });

  describe('setTickInterval', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      service.initialize({ totalTicks: 10, tickInterval: 1000 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should update tick interval', () => {
      service.setTickInterval(500);
      
      const ticks: number[] = [];
      service.getTickStream().subscribe((state) => {
        ticks.push(state.tick);
      });

      service.start();
      jest.advanceTimersByTime(1000);
      
      expect(ticks.length).toBeGreaterThanOrEqual(1);
    });

    it('should restart timer if running', () => {
      service.start();
      
      const ticks: number[] = [];
      service.getTickStream().subscribe((state) => {
        ticks.push(state.tick);
      });

      jest.advanceTimersByTime(500);
      service.setTickInterval(200);
      jest.advanceTimersByTime(500);
      
      expect(ticks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('complete stream', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      service.initialize({ totalTicks: 3, tickInterval: 100 });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should emit complete event when finished', (done) => {
      service.getCompleteStream().subscribe(() => {
        expect(service.getCurrentTick()).toBe(3);
        done();
      });

      service.start();
      jest.advanceTimersByTime(500);
    });
  });
});
