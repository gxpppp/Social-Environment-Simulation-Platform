import { Module } from '@nestjs/common';
import { SimulationEngineService } from './simulation-engine.service';
import { AgentManagerService } from './agent-manager.service';
import { EventManagerService } from './event-manager.service';
import { NetworkManagerService } from './network-manager.service';
import { TickSchedulerService } from './tick-scheduler.service';

@Module({
  providers: [
    SimulationEngineService,
    AgentManagerService,
    EventManagerService,
    NetworkManagerService,
    TickSchedulerService,
  ],
  exports: [SimulationEngineService],
})
export class SimulationEngineModule {}
