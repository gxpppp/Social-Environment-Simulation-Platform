import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ModelService, GenerateRequest } from './model.service';
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
  getAvailableModels(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.modelService.getAvailableModels(category, search);
  }

  @Get('categories')
  @ApiOperation({ summary: '获取模型分类列表' })
  getModelCategories() {
    return this.modelService.getModelCategories();
  }

  @Get('search')
  @ApiOperation({ summary: '搜索模型' })
  searchModels(
    @Query('q') query: string,
    @Query('category') category?: string,
  ) {
    return this.modelService.searchModels(query, category);
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
    // 根据任务类型推荐模型
    const recommendedModels = this.modelService.getAvailableModels('text');
    let selectedModel = recommendedModels[0]?.id || 'deepseek-ai/DeepSeek-V3';
    
    // 根据复杂度选择
    if (complexity === 'high') {
      const highEndModel = recommendedModels.find(m => 
        m.id.includes('72B') || m.id.includes('V3') || m.id.includes('R1')
      );
      if (highEndModel) selectedModel = highEndModel.id;
    }
    
    return { modelId: selectedModel };
  }

  @Get('templates')
  @ApiOperation({ summary: '获取提示词模板类型' })
  getTemplateTypes() {
    return this.promptTemplateService.getTemplateTypes();
  }

  @Post('test')
  @ApiOperation({ summary: '测试模型调用' })
  async testModel(
    @Body('model') model: string,
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
