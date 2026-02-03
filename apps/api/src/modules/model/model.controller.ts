import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ModelService, GenerateRequest, ModelId } from './model.service';
import { PromptTemplateService } from './prompt-template.service';

@ApiTags('模型')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('models')
export class ModelController {
  constructor(
    private readonly modelService: ModelService,
    private readonly promptTemplateService: PromptTemplateService,
  ) {}

  @Get('available')
  @ApiOperation({ summary: '获取可用模型列表' })
  getAvailableModels() {
    return this.modelService.getAvailableModels();
  }

  @Post('generate')
  @ApiOperation({ summary: '生成文本' })
  async generate(@Body() request: GenerateRequest) {
    return this.modelService.generate(request);
  }

  @Post('select')
  @ApiOperation({ summary: '智能模型选择' })
  selectModel(
    @Body('taskType') taskType: 'decision' | 'analysis' | 'dialogue' | 'reasoning',
    @Body('complexity') complexity: 'low' | 'medium' | 'high' = 'medium',
    @Body('preferChinese') preferChinese: boolean = true,
  ) {
    const modelId = this.modelService.selectModelForTask(
      taskType,
      complexity,
      preferChinese,
    );
    return { modelId };
  }

  @Get('templates')
  @ApiOperation({ summary: '获取提示词模板类型' })
  getTemplateTypes() {
    return this.promptTemplateService.getTemplateTypes();
  }

  @Post('test')
  @ApiOperation({ summary: '测试模型调用' })
  async testModel(
    @Body('model') model: ModelId,
    @Body('prompt') prompt: string,
  ) {
    return this.modelService.generate({
      model,
      messages: [
        { role: 'user', content: prompt },
      ],
    });
  }

  @Get('estimate-tokens')
  @ApiOperation({ summary: '估算Token使用量' })
  estimateTokens(@Query('text') text: string) {
    const tokens = this.modelService.estimateTokens(text);
    return { text, estimatedTokens: tokens };
  }
}
