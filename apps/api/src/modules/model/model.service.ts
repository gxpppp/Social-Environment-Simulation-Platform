import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Silicon Flow API 响应类型
interface SiliconFlowResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 生成请求参数
export interface GenerateRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

// 生成响应
export interface GenerateResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

// 模型信息接口
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  contextWindow: number;
  pricing: { input: number; output: number };
  capabilities: string[];
  category: 'text' | 'vision' | 'embedding' | 'audio' | 'reranker';
  isPro: boolean;
  provider: string;
}

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);
  private readonly apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
  private modelsCache: ModelInfo[] = [];
  private modelsLoaded = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.loadModelsFromFile();
  }

  /**
   * 从文件加载Silicon Flow模型列表
   */
  private loadModelsFromFile(): void {
    try {
      const modelsFilePath = path.join(process.cwd(), '..', '..', 'models-list', 'siliconflow_models.txt');
      
      if (!fs.existsSync(modelsFilePath)) {
        this.logger.warn('Models file not found, using default models');
        this.loadDefaultModels();
        return;
      }

      const content = fs.readFileSync(modelsFilePath, 'utf-8');
      const lines = content.split('\n');
      
      const models: ModelInfo[] = [];
      
      for (const line of lines) {
        // 解析格式: "序号. 模型ID" 或 "序号. Pro/模型ID"
        const match = line.match(/^\d+\.\s*(Pro\/)?(.+)$/);
        if (match) {
          const isPro = !!match[1];
          const fullModelId = match[2].trim();
          
          // 跳过Deprecated标记的模型
          if (fullModelId.includes('Deprecated')) continue;
          
          const modelInfo = this.parseModelInfo(fullModelId, isPro);
          if (modelInfo) {
            models.push(modelInfo);
          }
        }
      }

      this.modelsCache = models;
      this.modelsLoaded = true;
      this.logger.log(`Loaded ${models.length} models from file`);
    } catch (error) {
      this.logger.error('Failed to load models from file:', error.message);
      this.loadDefaultModels();
    }
  }

  /**
   * 解析模型信息
   */
  private parseModelInfo(fullModelId: string, isPro: boolean): ModelInfo | null {
    const parts = fullModelId.split('/');
    if (parts.length < 2) return null;

    const provider = parts[0];
    const modelName = parts[parts.length - 1];
    
    // 确定模型类别
    let category: ModelInfo['category'] = 'text';
    if (fullModelId.toLowerCase().includes('vl') || fullModelId.toLowerCase().includes('vision')) {
      category = 'vision';
    } else if (fullModelId.toLowerCase().includes('embedding')) {
      category = 'embedding';
    } else if (fullModelId.toLowerCase().includes('reranker')) {
      category = 'reranker';
    } else if (fullModelId.toLowerCase().includes('tts') || fullModelId.toLowerCase().includes('voice')) {
      category = 'audio';
    }

    // 提取版本号
    const versionMatch = modelName.match(/[Vv]?(\d+)(?:\.(\d+))?/);
    const version = versionMatch ? versionMatch[0] : '';

    // 生成描述
    let description = this.generateModelDescription(provider, modelName, category);

    // 估算参数（基于模型名称）
    const params = this.estimateModelParams(modelName);

    return {
      id: fullModelId,
      name: this.formatModelName(modelName, provider, isPro),
      description,
      maxTokens: this.estimateMaxTokens(modelName),
      contextWindow: this.estimateContextWindow(modelName),
      pricing: this.estimatePricing(modelName, isPro),
      capabilities: this.determineCapabilities(category, modelName),
      category,
      isPro,
      provider,
    };
  }

  /**
   * 格式化模型名称
   */
  private formatModelName(modelName: string, provider: string, isPro: boolean): string {
    let name = modelName.replace(/-/g, ' ');
    
    // 特殊处理
    if (name.includes('DeepSeek')) name = name.replace('DeepSeek', 'DeepSeek ');
    if (name.includes('Qwen')) name = name.replace('Qwen', 'Qwen ');
    if (name.includes('GLM')) name = name.replace('GLM', 'GLM ');
    
    if (isPro) {
      name = `[Pro] ${name}`;
    }
    
    return name;
  }

  /**
   * 生成模型描述
   */
  private generateModelDescription(provider: string, modelName: string, category: string): string {
    const descriptions: Record<string, string> = {
      'deepseek-ai': '深度求索',
      'Qwen': '通义千问',
      'moonshotai': '月之暗面',
      'THUDM': '智谱AI',
      'zai-org': '智源研究院',
      'MiniMaxAI': 'MiniMax',
      'meta-llama': 'Meta',
      'Pro': '专业版',
    };

    const providerDesc = descriptions[provider] || provider;
    
    if (category === 'vision') {
      return `${providerDesc}视觉模型，支持图像理解`;
    } else if (category === 'embedding') {
      return `${providerDesc}嵌入模型，用于文本向量化`;
    } else if (category === 'reranker') {
      return `${providerDesc}重排序模型`;
    } else if (category === 'audio') {
      return `${providerDesc}语音模型`;
    }
    
    if (modelName.includes('Reasoning') || modelName.includes('R1')) {
      return `${providerDesc}推理模型，擅长复杂逻辑分析`;
    } else if (modelName.includes('Coder')) {
      return `${providerDesc}代码模型，擅长编程任务`;
    } else if (modelName.includes('Instruct')) {
      return `${providerDesc}指令模型，通用对话能力强`;
    }
    
    return `${providerDesc}大语言模型`;
  }

  /**
   * 估算模型参数量
   */
  private estimateModelParams(modelName: string): number {
    const match = modelName.match(/(\d+)(?:B|b)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 估算最大Token数
   */
  private estimateMaxTokens(modelName: string): number {
    if (modelName.includes('32B') || modelName.includes('72B')) return 8192;
    if (modelName.includes('14B') || modelName.includes('7B')) return 4096;
    return 4096;
  }

  /**
   * 估算上下文窗口
   */
  private estimateContextWindow(modelName: string): number {
    if (modelName.includes('128K') || modelName.includes('128k')) return 128000;
    if (modelName.includes('64K') || modelName.includes('64k')) return 64000;
    if (modelName.includes('32K') || modelName.includes('32k')) return 32000;
    if (modelName.includes('8K') || modelName.includes('8k')) return 8192;
    return 32000;
  }

  /**
   * 估算价格
   */
  private estimatePricing(modelName: string, isPro: boolean): { input: number; output: number } {
    const basePrice = isPro ? 0.004 : 0.002;
    
    if (modelName.includes('72B') || modelName.includes('70B')) {
      return { input: basePrice * 2, output: basePrice * 4 };
    } else if (modelName.includes('32B')) {
      return { input: basePrice * 1.5, output: basePrice * 3 };
    } else if (modelName.includes('14B') || modelName.includes('7B')) {
      return { input: basePrice, output: basePrice * 2 };
    }
    
    return { input: basePrice, output: basePrice * 2 };
  }

  /**
   * 确定模型能力
   */
  private determineCapabilities(category: string, modelName: string): string[] {
    const capabilities: string[] = [];
    
    if (category === 'text') {
      capabilities.push('chat', 'analysis');
      if (modelName.includes('Reasoning') || modelName.includes('R1')) {
        capabilities.push('reasoning');
      }
      if (modelName.includes('Coder')) {
        capabilities.push('coding');
      }
      if (modelName.includes('Chinese') || modelName.includes('Qwen')) {
        capabilities.push('chinese');
      }
    } else if (category === 'vision') {
      capabilities.push('vision', 'image-understanding');
    } else if (category === 'embedding') {
      capabilities.push('embedding');
    } else if (category === 'reranker') {
      capabilities.push('reranking');
    } else if (category === 'audio') {
      capabilities.push('audio', 'speech');
    }
    
    return capabilities;
  }

  /**
   * 加载默认模型（当文件不存在时）
   */
  private loadDefaultModels(): void {
    this.modelsCache = [
      {
        id: 'deepseek-ai/DeepSeek-V3',
        name: 'DeepSeek V3',
        description: '深度求索V3，通用能力强',
        maxTokens: 8192,
        contextWindow: 64000,
        pricing: { input: 0.002, output: 0.008 },
        capabilities: ['chat', 'analysis', 'reasoning'],
        category: 'text',
        isPro: false,
        provider: 'deepseek-ai',
      },
      {
        id: 'deepseek-ai/DeepSeek-R1',
        name: 'DeepSeek R1',
        description: '深度求索R1，推理能力强',
        maxTokens: 8192,
        contextWindow: 64000,
        pricing: { input: 0.004, output: 0.016 },
        capabilities: ['chat', 'analysis', 'reasoning', 'math'],
        category: 'text',
        isPro: false,
        provider: 'deepseek-ai',
      },
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen 2.5 72B',
        description: '通义千问72B，中文能力强',
        maxTokens: 8192,
        contextWindow: 32000,
        pricing: { input: 0.005, output: 0.01 },
        capabilities: ['chat', 'analysis', 'reasoning', 'chinese'],
        category: 'text',
        isPro: false,
        provider: 'Qwen',
      },
    ];
    this.modelsLoaded = true;
  }

  /**
   * 获取可用模型列表
   */
  getAvailableModels(category?: string, searchQuery?: string): ModelInfo[] {
    let models = this.modelsCache;

    // 按类别筛选
    if (category && category !== 'all') {
      models = models.filter(m => m.category === category);
    }

    // 按搜索词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      models = models.filter(m => 
        m.id.toLowerCase().includes(query) ||
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query)
      );
    }

    return models;
  }

  /**
   * 搜索模型
   */
  searchModels(query: string, category?: string): ModelInfo[] {
    return this.getAvailableModels(category, query);
  }

  /**
   * 获取模型分类列表
   */
  getModelCategories(): { value: string; label: string; count: number }[] {
    const categories = [
      { value: 'all', label: '全部模型', count: this.modelsCache.length },
      { value: 'text', label: '文本模型', count: this.modelsCache.filter(m => m.category === 'text').length },
      { value: 'vision', label: '视觉模型', count: this.modelsCache.filter(m => m.category === 'vision').length },
      { value: 'embedding', label: '嵌入模型', count: this.modelsCache.filter(m => m.category === 'embedding').length },
      { value: 'audio', label: '语音模型', count: this.modelsCache.filter(m => m.category === 'audio').length },
      { value: 'reranker', label: '重排序模型', count: this.modelsCache.filter(m => m.category === 'reranker').length },
    ];
    return categories;
  }

  /**
   * 根据ID获取模型信息
   */
  getModelById(modelId: string): ModelInfo | undefined {
    return this.modelsCache.find(m => m.id === modelId);
  }

  /**
   * 生成文本响应
   */
  async generate(request: GenerateRequest, apiKey?: string): Promise<GenerateResponse> {
    const key = apiKey || this.configService.get<string>('SILICON_FLOW_API_KEY');
    
    if (!key) {
      throw new HttpException(
        'Silicon Flow API Key not configured',
        HttpStatus.BAD_REQUEST,
      );
    }

    const modelConfig = this.getModelById(request.model);
    if (!modelConfig) {
      throw new HttpException(
        `Unknown model: ${request.model}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<SiliconFlowResponse>(
          this.apiUrl,
          {
            model: modelConfig.id,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.max_tokens ?? 1024,
            top_p: request.top_p ?? 0.9,
            frequency_penalty: request.frequency_penalty ?? 0,
            presence_penalty: request.presence_penalty ?? 0,
            stream: false,
          },
          {
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            timeout: 60000,
          },
        ),
      );

      const data = response.data as SiliconFlowResponse;
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Empty response from API');
      }

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        model: request.model,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 流式生成（用于长文本）
   */
  async *generateStream(
    request: GenerateRequest,
    apiKey?: string,
  ): AsyncGenerator<string, void, unknown> {
    const key = apiKey || this.configService.get<string>('SILICON_FLOW_API_KEY');
    
    if (!key) {
      throw new HttpException(
        'Silicon Flow API Key not configured',
        HttpStatus.BAD_REQUEST,
      );
    }

    const modelConfig = this.getModelById(request.model);
    if (!modelConfig) {
      throw new HttpException(
        `Unknown model: ${request.model}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            model: modelConfig.id,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.max_tokens ?? 1024,
            stream: true,
          },
          {
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            responseType: 'stream',
          },
        ),
      );

      const stream = response.data as any;
      for await (const chunk of stream) {
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * 估算Token使用量
   */
  estimateTokens(text: string): number {
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return Math.ceil(chineseChars + englishWords * 1.3);
  }

  /**
   * 错误处理
   */
  private handleError(error: any): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      this.logger.error(`API Error [${status}]: ${message}`);

      switch (status) {
        case 401:
          throw new HttpException('Invalid API Key', HttpStatus.UNAUTHORIZED);
        case 429:
          throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
        case 500:
        case 502:
        case 503:
          throw new HttpException('Service temporarily unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        default:
          throw new HttpException(
            message || 'API request failed',
            status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }

    this.logger.error(`Unexpected error: ${error.message}`);
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
