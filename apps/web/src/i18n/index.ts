import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 中文翻译
const zhCN = {
  translation: {
    // 通用
    common: {
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      delete: '删除',
      edit: '编辑',
      create: '创建',
      search: '搜索',
      loading: '加载中...',
      noData: '暂无数据',
      success: '操作成功',
      error: '操作失败',
      warning: '警告',
      info: '提示',
      import: '导入',
      export: '导出',
      batch: '批量操作',
    },
    // 导航
    nav: {
      dashboard: '工作台',
      scenes: '场景管理',
      agents: '角色管理',
      simulation: '模拟控制',
      analytics: '分析中心',
      settings: '系统设置',
      users: '用户管理',
    },
    // 场景
    scene: {
      title: '场景管理',
      create: '创建场景',
      edit: '编辑场景',
      name: '场景名称',
      description: '场景描述',
      duration: '模拟时长',
      timeStep: '时间步长',
      agents: 'Agent数量',
      status: '状态',
      createdAt: '创建时间',
      actions: '操作',
    },
    // Agent
    agent: {
      title: '角色管理',
      create: '创建角色',
      edit: '编辑角色',
      name: '角色名称',
      description: '角色描述',
      personality: '人格特质',
      behavior: '行为模式',
      stance: '初始立场',
      influence: '影响力',
      activity: '活跃度',
    },
    // 模拟
    simulation: {
      title: '模拟控制',
      start: '开始模拟',
      pause: '暂停',
      stop: '停止',
      step: '单步执行',
      reset: '重置',
      speed: '模拟速度',
      currentTick: '当前Tick',
      totalTicks: '总Ticks',
      progress: '进度',
    },
    // 分析
    analytics: {
      title: '分析中心',
      network: '网络关系',
      timeline: '事件流',
      trends: '趋势分析',
      export: '导出报告',
    },
    // 设置
    settings: {
      title: '系统设置',
      apiKey: 'API Key',
      model: '默认模型',
      language: '界面语言',
      theme: '主题设置',
    },
    // 导入
    import: {
      title: '导入{{type}}',
      types: {
        scenes: '场景',
        agents: '角色',
      },
      templateTip: '请使用模板格式导入数据',
      downloadTemplate: '下载模板：',
      sceneTemplate: '场景导入模板',
      agentTemplate: '角色导入模板',
      dragOrClick: '点击或拖拽文件到此区域上传',
      supportedFormats: '支持 Excel、CSV、JSON 格式',
      start: '开始导入',
      noFileSelected: '请先选择文件',
      success: '成功导入 {{count}} 条数据',
      partialSuccess: '部分导入成功，成功 {{imported}} 条，失败 {{errors}} 条',
      failed: '导入失败',
      templateDownloaded: '模板下载成功',
      allSuccess: '导入成功',
      partialSuccessTitle: '部分导入成功',
      allFailed: '导入失败',
      resultSummary: '总计 {{total}} 条，成功 {{imported}} 条，失败 {{errors}} 条',
      errorDetails: '错误详情',
      row: '行号',
      field: '字段',
      value: '值',
      message: '错误信息',
    },
    // 批量操作
    batch: {
      noSelection: '请先选择数据',
      selected: '已选择 {{count}} 项',
      delete: '批量删除',
      copy: '批量复制',
      enable: '批量启用',
      disable: '批量禁用',
      confirmDelete: '确认删除',
      confirmCopy: '确认复制',
      confirmEnable: '确认启用',
      confirmDisable: '确认禁用',
      deleteConfirmContent: '确定要删除选中的 {{count}} 个{{entity}}吗？此操作不可恢复。',
      copyConfirmContent: '确定要复制选中的 {{count}} 个{{entity}}吗？',
      enableConfirmContent: '确定要启用选中的 {{count}} 个{{entity}}吗？',
      disableConfirmContent: '确定要禁用选中的 {{count}} 个{{entity}}吗？',
      deleteSuccess: '成功删除 {{count}} 项',
      copySuccess: '成功复制 {{count}} 项',
      enableSuccess: '成功启用 {{count}} 项',
      disableSuccess: '成功禁用 {{count}} 项',
      actionFailed: '操作失败',
    },
  },
};

// 英文翻译
const enUS = {
  translation: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      noData: 'No Data',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
    },
    nav: {
      dashboard: 'Dashboard',
      scenes: 'Scenes',
      agents: 'Agents',
      simulation: 'Simulation',
      analytics: 'Analytics',
      settings: 'Settings',
      users: 'Users',
    },
    scene: {
      title: 'Scene Management',
      create: 'Create Scene',
      edit: 'Edit Scene',
      name: 'Scene Name',
      description: 'Description',
      duration: 'Duration',
      timeStep: 'Time Step',
      agents: 'Agent Count',
      status: 'Status',
      createdAt: 'Created At',
      actions: 'Actions',
    },
    agent: {
      title: 'Agent Management',
      create: 'Create Agent',
      edit: 'Edit Agent',
      name: 'Agent Name',
      description: 'Description',
      personality: 'Personality',
      behavior: 'Behavior',
      stance: 'Initial Stance',
      influence: 'Influence',
      activity: 'Activity',
    },
    simulation: {
      title: 'Simulation Control',
      start: 'Start',
      pause: 'Pause',
      stop: 'Stop',
      step: 'Step',
      reset: 'Reset',
      speed: 'Speed',
      currentTick: 'Current Tick',
      totalTicks: 'Total Ticks',
      progress: 'Progress',
    },
    analytics: {
      title: 'Analytics Center',
      network: 'Network Graph',
      timeline: 'Event Timeline',
      trends: 'Trends',
      export: 'Export Report',
    },
    settings: {
      title: 'Settings',
      apiKey: 'API Key',
      model: 'Default Model',
      language: 'Language',
      theme: 'Theme',
    },
  },
};

// 初始化i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
    fallbackLng: 'zh-CN',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

// 语言配置
export const languages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
];

// 切换语言
export const changeLanguage = (lng: string) => {
  i18n.changeLanguage(lng);
};

// 获取当前语言
export const getCurrentLanguage = () => i18n.language;
