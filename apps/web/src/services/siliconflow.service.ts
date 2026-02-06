import { getApiKey } from '@/utils/crypto'

const SILICON_FLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

interface SiliconFlowResponse {
  id: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * 验证模型是否存在于 Silicon Flow API
 * 直接从前端调用，不经过后端
 */
export async function validateModel(modelId: string): Promise<{ valid: boolean; message: string }> {
  const apiKey = await getApiKey()
  
  if (!apiKey) {
    return { valid: false, message: '请先配置 API Key' }
  }

  try {
    const response = await fetch(SILICON_FLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || ''
      
      if (response.status === 401) {
        return { valid: false, message: 'API Key 无效，请检查 API Key 是否正确' }
      }
      
      if (response.status === 400 && errorMessage.includes('model')) {
        return { valid: false, message: `模型 "${modelId}" 不存在或不可用，请检查模型ID是否正确` }
      }
      
      return { valid: false, message: `验证失败: ${errorMessage || response.statusText}` }
    }

    const data: SiliconFlowResponse = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      return { valid: true, message: '模型验证成功' }
    }
    
    return { valid: false, message: '模型返回异常，请检查模型ID是否正确' }
  } catch (error: any) {
    console.error('验证模型时出错:', error)
    return { valid: false, message: `验证失败: ${error.message || '网络错误'}` }
  }
}

/**
 * 测试模型调用
 */
export async function testModel(modelId: string, prompt: string): Promise<{ success: boolean; content?: string; message?: string }> {
  const apiKey = await getApiKey()
  
  if (!apiKey) {
    return { success: false, message: '请先配置 API Key' }
  }

  try {
    const response = await fetch(SILICON_FLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, message: errorData.error?.message || response.statusText }
    }

    const data: SiliconFlowResponse = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      return { success: true, content: data.choices[0].message.content }
    }
    
    return { success: false, message: '模型返回为空' }
  } catch (error: any) {
    console.error('测试模型时出错:', error)
    return { success: false, message: error.message || '网络错误' }
  }
}

/**
 * 生成文本
 */
export async function generateText(
  modelId: string,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: {
    temperature?: number
    max_tokens?: number
    top_p?: number
  }
): Promise<{ success: boolean; content?: string; usage?: any; message?: string }> {
  const apiKey = await getApiKey()
  
  if (!apiKey) {
    return { success: false, message: '请先配置 API Key' }
  }

  try {
    const response = await fetch(SILICON_FLOW_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 1024,
        top_p: options?.top_p ?? 0.9,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { success: false, message: errorData.error?.message || response.statusText }
    }

    const data: SiliconFlowResponse = await response.json()
    
    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        content: data.choices[0].message.content,
        usage: data.usage,
      }
    }
    
    return { success: false, message: '模型返回为空' }
  } catch (error: any) {
    console.error('生成文本时出错:', error)
    return { success: false, message: error.message || '网络错误' }
  }
}
