import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SimulationsService, SimulationSession } from './simulations.service';

@ApiTags('模拟')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('simulations')
export class SimulationsController {
  constructor(private readonly simulationsService: SimulationsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有模拟会话' })
  findAll() {
    return this.simulationsService.getAllSessions();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个模拟会话' })
  findOne(@Param('id') id: string) {
    return this.simulationsService.getSession(id);
  }

  @Post()
  @ApiOperation({ summary: '创建模拟会话' })
  create(@Body() data: { sceneId: string; config: any }) {
    return this.simulationsService.createSession(data.sceneId, data.config);
  }

  @Post(':id/pause')
  @ApiOperation({ summary: '暂停模拟' })
  pause(@Param('id') id: string) {
    return this.simulationsService.pauseSession(id);
  }

  @Post(':id/resume')
  @ApiOperation({ summary: '恢复模拟' })
  resume(@Param('id') id: string) {
    return this.simulationsService.resumeSession(id);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: '停止模拟' })
  stop(@Param('id') id: string) {
    return this.simulationsService.stopSession(id);
  }
}
