import { Module } from '@nestjs/common';
import { SimulationsService } from './simulations.service';
import { SimulationsController } from './simulations.controller';
import { SimulationsGateway } from './simulations.gateway';

@Module({
  providers: [SimulationsService, SimulationsGateway],
  controllers: [SimulationsController],
  exports: [SimulationsService],
})
export class SimulationsModule {}
