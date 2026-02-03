import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';
import { Scene } from '../../entities/scene.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scene])],
  providers: [ScenesService],
  controllers: [ScenesController],
  exports: [ScenesService],
})
export class ScenesModule {}
