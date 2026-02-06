import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ScenesService } from './scenes.service';
import { Scene } from '../../entities/scene.entity';

@ApiTags('场景')
@Controller('scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  @Get()
  @ApiOperation({ summary: '获取所有场景' })
  findAll() {
    return this.scenesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个场景' })
  findOne(@Param('id') id: string) {
    return this.scenesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建场景' })
  create(@Body() sceneData: Partial<Scene>) {
    return this.scenesService.create(sceneData);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新场景' })
  update(@Param('id') id: string, @Body() updateData: Partial<Scene>) {
    return this.scenesService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除场景' })
  remove(@Param('id') id: string) {
    return this.scenesService.remove(id);
  }
}
