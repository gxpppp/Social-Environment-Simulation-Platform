import api from './api'

export interface ModelInfo {
  id: string
  name: string
  description: string
  maxTokens: number
  contextWindow: number
  pricing: {
    input: number
    output: number
  }
  capabilities: string[]
  category: 'text' | 'vision' | 'embedding' | 'audio' | 'reranker'
  isPro: boolean
  provider: string
}

export interface GenerateRequest {
  model: string
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  temperature?: number
  max_tokens?: number
}

export interface GenerateResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
}

export const modelApi = {
  // 获取可用模型列表
  getAvailableModels: (category?: string, search?: string): Promise<ModelInfo[]> =>
    api.get('/models/available', { params: { category, search } }),

  // 获取模型分类列表
  getModelCategories: (): Promise<{ value: string; label: string; count: number }[]> =>
    api.get('/models/categories'),

  // 搜索模型
  searchModels: (query: string, category?: string): Promise<ModelInfo[]> =>
    api.get('/models/search', { params: { q: query, category } }),

  // 生成文本
  generate: (request: GenerateRequest): Promise<GenerateResponse> =>
    api.post('/models/generate', request),

  // 智能模型选择
  selectModel: (params: {
    taskType: 'decision' | 'analysis' | 'dialogue' | 'reasoning'
    complexity?: 'low' | 'medium' | 'high'
    preferChinese?: boolean
  }): Promise<{ modelId: string }> =>
    api.post('/models/select', params),

  // 获取提示词模板类型
  getTemplateTypes: (): Promise<string[]> =>
    api.get('/models/templates'),

  // 测试模型调用
  testModel: (model: string, prompt: string): Promise<GenerateResponse> =>
    api.post('/models/test', { model, prompt }),

  // 估算Token使用量
  estimateTokens: (text: string): Promise<{ text: string; estimatedTokens: number }> =>
    api.get('/models/estimate-tokens', { params: { text } }),

  // 验证模型是否存在于Silicon Flow API
  validateModel: (modelId: string): Promise<{ valid: boolean; message: string }> =>
    api.post('/models/validate', { modelId }),
}
