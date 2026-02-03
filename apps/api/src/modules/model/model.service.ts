import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

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

// 可用模型配置
export const AVAILABLE_MODELS = {
  // DeepSeek系列
  'deepseek-v3': {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek-V3',
    description: '深度求索V3，通用能力强',
    maxTokens: 8192,
    contextWindow: 64000,
    pricing: { input: 0.002, output: 0.008 },
    capabilities: ['chat', 'analysis', 'reasoning'],
  },
  'deepseek-r1': {
    id: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek-R1',
    description: '深度求索R1，推理能力强',
    maxTokens: 8192,
    contextWindow: 64000,
    pricing: { input: 0.004, output: 0.016 },
    capabilities: ['chat', 'analysis', 'reasoning', 'math'],
  },
  // Qwen系列
  'qwen-max': {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen-Max',
    description: '通义千问Max，中文能力强',
    maxTokens: 8192,
    contextWindow: 32000,
    pricing: { input: 0.005, output: 0.01 },
    capabilities: ['chat', 'analysis', 'reasoning', 'chinese'],
  },
  // Llama系列
  'llama-3-70b': {
    id: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    name: 'Llama-3-70B',
    description: 'Meta Llama 3 70B',
    maxTokens: 8192,
    contextWindow: 128000,
    pricing: { input: 0.004, output: 0.008 },
    capabilities: ['chat', 'analysis', 'reasoning'],
  },
} as const;

export type ModelId = keyof typeof AVAILABLE_MODELS;

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);
  private readonly apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

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

    const modelConfig = AVAILABLE_MODELS[request.model as ModelId];
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
            timeout: 60000, // 60秒超时
          },
        ),
      );

      const data = response.data;
      
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
   * 智能模型选择
   * 根据任务类型和复杂度自动选择最适合的模型
   */
  selectModelForTask(
    taskType: 'decision' | 'analysis' | 'dialogue' | 'reasoning',
    complexity: 'low' | 'medium' | 'high' = 'medium',
    preferChinese: boolean = true,
  ): ModelId {
    // 如果需要中文能力
    if (preferChinese) {
      if (taskType === 'reasoning' && complexity === 'high') {
        return 'deepseek-r1';
      }
      return 'qwen-max';
    }

    // 根据任务类型选择
    switch (taskType) {
      case 'reasoning':
        return complexity === 'high' ? 'deepseek-r1' : 'deepseek-v3';
      case 'analysis':
        return 'llama-3-70b';
      case 'decision':
        return 'deepseek-v3';
      case 'dialogue':
      default:
        return complexity === 'high' ? 'qwen-max' : 'deepseek-v3';
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

    const modelConfig = AVAILABLE_MODELS[request.model as ModelId];

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

      // 处理流式响应
      const stream = response.data;
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
   * 获取可用模型列表
   */
  getAvailableModels() {
    return Object.entries(AVAILABLE_MODELS).map(([id, config]) => ({
      id,
      ...config,
    }));
  }

  /**
   * 估算Token使用量
   */
  estimateTokens(text: string): number {
    // 粗略估算：中文字符 ≈ 1 token，英文单词 ≈ 1.3 tokens
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
