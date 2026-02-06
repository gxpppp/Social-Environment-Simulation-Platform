import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AgentsService } from './agents.service';
import { Agent } from '../../entities/agent.entity';

@ApiTags('AI角色')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  @ApiOperation({ summary: '获取所有AI角色' })
  findAll() {
    return this.agentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个AI角色' })
  findOne(@Param('id') id: string) {
    return this.agentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建AI角色' })
  create(@Body() agentData: Partial<Agent>) {
    return this.agentsService.create(agentData);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新AI角色' })
  update(@Param('id') id: string, @Body() updateData: Partial<Agent>) {
    return this.agentsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除AI角色' })
  remove(@Param('id') id: string) {
    return this.agentsService.remove(id);
  }
}
