import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulationEngineService } from './simulation-engine.service';
import { AgentManagerService } from './agent-manager.service';
import { EventManagerService } from './event-manager.service';
import { NetworkManagerService } from './network-manager.service';
import { TickSchedulerService } from './tick-scheduler.service';
import { Scene } from '../../entities/scene.entity';
import { SimulationsGateway } from '../simulations/simulations.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Scene])],
  providers: [
    SimulationEngineService,
    AgentManagerService,
    EventManagerService,
    NetworkManagerService,
    TickSchedulerService,
    SimulationsGateway,
  ],
  exports: [SimulationEngineService],
})
export class SimulationEngineModule {}
