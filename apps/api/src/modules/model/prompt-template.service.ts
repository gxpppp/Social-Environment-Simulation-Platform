import { Injectable } from '@nestjs/common';

// 提示词模板类型
export type PromptType = 
  | 'agent_decision'
  | 'agent_dialogue'
  | 'agent_reflection'
  | 'scene_analysis'
  | 'event_reaction'
  | 'personality_generation';

// 提示词模板配置
interface PromptTemplate {
  system: string;
  user: string;
  examples?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

@Injectable()
export class PromptTemplateService {
  private templates: Map<PromptType, PromptTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * 初始化所有提示词模板
   */
  private initializeTemplates() {
    // Agent决策提示词
    this.templates.set('agent_decision', {
      system: `你是一个具有特定人格特质和社会背景的AI Agent。你需要根据当前情境做出符合你性格的决策。

你的决策应该：
1. 符合你的人格特质（Big Five模型）
2. 考虑你的知识背景和经验
3. 考虑当前的社会环境和关系网络
4. 体现你的价值观和目标

请以JSON格式输出你的决策，包含以下字段：
- action: 行动类型（communicate/action/reflect/wait）
- target: 目标对象（如果有）
- content: 具体内容
- reasoning: 决策理由`,
      user: `当前情境：{{situation}}

你的属性：
- 姓名：{{name}}
- 人格特质：{{personality}}
- 知识背景：{{knowledge}}
- 当前情绪：{{emotion}}
- 记忆摘要：{{memory}}

可用行动：{{availableActions}}

请做出决策：`,
    });

    // Agent对话提示词
    this.templates.set('agent_dialogue', {
      system: `你正在与另一个Agent进行对话。你的回应应该：
1. 符合你的人格特质和沟通风格
2. 考虑对话的上下文和历史
3. 体现你的立场和观点
4. 自然、真实，像真实的人类对话

请用第一人称回应，保持角色一致性。`,
      user: `对话对象：{{targetName}}
对方说："{{message}}"

对话历史：
{{history}}

你的立场：{{stance}}
你的目标：{{goal}}

请回应：`,
    });

    // Agent反思提示词
    this.templates.set('agent_reflection', {
      system: `作为具有自我意识的Agent，你需要定期反思：
1. 最近的经历和互动
2. 你的情绪变化
3. 你的观点是否受到影响
4. 你的人际关系变化

反思应该影响你的：
- 情绪状态
- 观点态度
- 对他人的印象
- 未来的行为倾向`,
      user: `最近事件：
{{recentEvents}}

当前状态：
- 情绪：{{emotion}}
- 观点：{{opinion}}
- 重要关系：{{relationships}}

请进行反思并描述你的变化：`,
    });

    // 场景分析提示词
    this.templates.set('scene_analysis', {
      system: `你是一个社会动力学专家。请分析给定的社会场景，识别：
1. 关键影响因素
2. 潜在的群体行为模式
3. 观点传播路径
4. 可能的演化趋势

分析应该基于社会网络理论和群体动力学原理。`,
      user: `场景描述：
{{sceneDescription}}

Agent群体特征：
{{agentCharacteristics}}

环境参数：
{{environmentParams}}

请提供详细分析：`,
    });

    // 事件反应提示词
    this.templates.set('event_reaction', {
      system: `一个外部事件发生了。作为Agent，你需要根据事件内容和你的属性做出反应。

考虑：
1. 事件对你的直接影响
2. 事件对你关心的人的影响
3. 你的价值观和立场
4. 你的行动能力和意愿

反应可以是：支持、反对、中立、传播、行动等。`,
      user: `事件：{{eventDescription}}
事件影响范围：{{impact}}

你的属性：
- 立场：{{stance}}
- 关注度：{{concern}}
- 影响力：{{influence}}

请描述你的反应：`,
    });

    // 人格生成提示词
    this.templates.set('personality_generation', {
      system: `根据给定的角色描述，生成详细的Big Five人格特质配置。

Big Five维度（0-1范围）：
- Openness（开放性）：好奇心、创造力、对新经验的接受度
- Conscientiousness（尽责性）：组织性、自律性、可靠性
- Extraversion（外向性）：社交性、活跃度、寻求刺激
- Agreeableness（宜人性）：合作性、信任度、利他主义
- Neuroticism（神经质）：情绪稳定性、焦虑倾向、压力反应

请生成符合角色定位的具体数值（0.0-1.0），并提供简要说明。`,
      user: `角色描述：{{description}}
角色类型：{{roleType}}
背景设定：{{background}}

请生成详细的人格特质配置：`,
    });
  }

  /**
   * 渲染提示词模板
   */
  renderTemplate(
    type: PromptType,
    variables: Record<string, string>,
  ): { system: string; user: string } {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`Unknown prompt template: ${type}`);
    }

    let systemPrompt = template.system;
    let userPrompt = template.user;

    // 替换变量
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      systemPrompt = systemPrompt.replace(placeholder, value);
      userPrompt = userPrompt.replace(placeholder, value);
    }

    return { system: systemPrompt, user: userPrompt };
  }

  /**
   * 构建完整的消息数组
   */
  buildMessages(
    type: PromptType,
    variables: Record<string, string>,
  ): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
    const { system, user } = this.renderTemplate(type, variables);
    const template = this.templates.get(type);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: system },
    ];

    // 添加示例（few-shot learning）
    if (template?.examples) {
      messages.push(...template.examples);
    }

    messages.push({ role: 'user', content: user });

    return messages;
  }

  /**
   * 添加自定义模板
   */
  addCustomTemplate(type: string, template: PromptTemplate): void {
    this.templates.set(type as PromptType, template);
  }

  /**
   * 获取所有模板类型
   */
  getTemplateTypes(): PromptType[] {
    return Array.from(this.templates.keys());
  }

  /**
   * 估算提示词Token数
   */
  estimatePromptTokens(type: PromptType, variables: Record<string, string>): number {
    const messages = this.buildMessages(type, variables);
    let totalChars = 0;
    for (const msg of messages) {
      totalChars += msg.content.length;
    }
    // 粗略估算：每个token约4个字符
    return Math.ceil(totalChars / 4);
  }
}
