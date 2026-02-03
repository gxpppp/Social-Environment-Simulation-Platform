## P0-2: AI角色属性编辑器 - Big Five人格模型UI

### 功能需求

#### 1. Big Five人格模型编辑器
- **开放性 (Openness)**: 好奇心、创造力、对新经验的接受度 (0-1滑块)
- **尽责性 (Conscientiousness)**: 组织性、自律性、可靠性 (0-1滑块)
- **外向性 (Extraversion)**: 社交性、活跃度、寻求刺激 (0-1滑块)
- **宜人性 (Agreeableness)**: 合作性、信任度、利他主义 (0-1滑块)
- **神经质 (Neuroticism)**: 情绪稳定性、焦虑倾向、压力反应 (0-1滑块)

#### 2. 可视化组件
- **雷达图**: 展示五维人格特质分布
- **人格标签**: 根据数值自动生成描述标签
- **对比模式**: 可与平均值或其他Agent对比

#### 3. 知识背景配置
- **领域选择**: 多选下拉框（政治、经济、科技、文化等）
- **知识深度**: 滑块控制（初学者/中级/专家）
- **信息源偏好**: 选择偏好的信息渠道

#### 4. 行为模式设置
- **决策风格**: 理性型/直觉型/依赖型
- **风险偏好**: 保守/稳健/激进
- **社交倾向**: 内向/平衡/外向
- **影响力**: 本地/区域/全国

#### 5. AI辅助生成
- 根据角色描述自动生成人格特质
- 调用Silicon Flow API生成合理配置
- 一键优化建议

### 技术实现方案

#### 前端组件结构
```
components/
├── AgentEditor/
│   ├── index.tsx              # 主编辑器组件
│   ├── BasicInfo.tsx          # 基础信息表单
│   ├── PersonalityEditor.tsx  # Big Five编辑器
│   ├── RadarChart.tsx         # 雷达图可视化
│   ├── KnowledgeConfig.tsx    # 知识背景配置
│   ├── BehaviorSettings.tsx   # 行为模式设置
│   └── AIGenerator.tsx        # AI辅助生成
```

#### 后端API扩展
- `POST /agents/generate-personality` - AI生成人格特质
- `GET /agents/templates` - 获取角色模板列表

#### 页面流程
1. 角色列表页 → 点击"创建角色"
2. 进入角色编辑器（分步骤向导）
3. 步骤1: 基础信息（名称、描述、头像）
4. 步骤2: 人格特质（Big Five雷达图）
5. 步骤3: 知识背景（领域、深度）
6. 步骤4: 行为模式（决策、风险偏好）
7. 步骤5: 预览和保存

### 交互设计

#### 雷达图交互
- 拖拽顶点调整数值
- 实时显示数值标签
- 悬停显示维度说明
- 支持多组数据对比

#### 滑块组件
- 自定义刻度标签
- 实时预览人格描述
- 颜色渐变（低→高）

#### AI生成功能
- 输入角色描述文本
- 点击"AI生成"按钮
- 显示生成进度
- 应用生成结果到表单

### 数据结构

```typescript
interface AgentAttributes {
  // Big Five人格特质
  personality: {
    openness: number;        // 开放性 0-1
    conscientiousness: number; // 尽责性 0-1
    extraversion: number;    // 外向性 0-1
    agreeableness: number;   // 宜人性 0-1
    neuroticism: number;     // 神经质 0-1
  };
  
  // 知识背景
  knowledge: {
    domains: string[];       // 知识领域
    depth: number;           // 知识深度 0-1
    sources: string[];       // 信息源偏好
  };
  
  // 行为模式
  behavior: {
    decisionStyle: 'rational' | 'intuitive' | 'dependent';
    riskTolerance: number;   // 风险偏好 0-1
    socialOrientation: number; // 社交倾向 0-1
    influence: 'local' | 'regional' | 'national';
  };
}
```

请确认此设计方案后，我将立即开始实现代码。