import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  // API设置
  siliconFlowApiKey: string
  defaultModel: string
  
  // UI设置
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  
  // 操作
  setSiliconFlowApiKey: (key: string) => void
  setDefaultModel: (model: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // 默认值
      siliconFlowApiKey: '',
      defaultModel: 'deepseek-v3',
      theme: 'system',
      sidebarCollapsed: false,

      // 设置方法
      setSiliconFlowApiKey: (key) => set({ siliconFlowApiKey: key }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setTheme: (theme) => set({ theme }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'sesp-settings',
    }
  )
)
