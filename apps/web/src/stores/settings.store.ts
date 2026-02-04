import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 生成参数接口
interface GenerationParams {
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
}

// 设置状态接口
interface SettingsState {
  // API设置
  apiKey: string
  defaultModel: string
  
  // 生成参数
  generationParams: GenerationParams
  
  // UI设置
  darkMode: boolean
  compactMode: boolean
  language: string
  
  // 高级设置
  defaultSimulationDuration: number
  autoSave: boolean
  
  // 操作
  updateSettings: (settings: Partial<Omit<SettingsState, 'updateSettings'>>) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 默认值
      apiKey: '',
      defaultModel: 'deepseek-ai/DeepSeek-V3',
      
      // 生成参数默认值
      generationParams: {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
      },
      
      // UI设置默认值
      darkMode: false,
      compactMode: false,
      language: 'zh-CN',
      
      // 高级设置默认值
      defaultSimulationDuration: 365,
      autoSave: true,

      // 设置方法
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
    }),
    {
      name: 'sesp-settings',
    }
  )
)
