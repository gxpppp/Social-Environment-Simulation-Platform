import React, { useState } from 'react'
import { Card, Input, Button, Spin, message, Typography, Tag, Alert } from 'antd'
import { RobotOutlined, ThunderboltOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { modelApi } from '@/services/model.service'

const { TextArea } = Input
const { Text } = Typography

interface AIGeneratorProps {
  onGenerate: (attributes: {
    personality: {
      openness: number
      conscientiousness: number
      extraversion: number
      agreeableness: number
      neuroticism: number
    }
    knowledge: {
      domains: string[]
      depth: number
      sources: string[]
    }
    behavior: {
      decisionStyle: 'rational' | 'intuitive' | 'dependent'
      riskTolerance: number
      socialOrientation: number
      influence: 'local' | 'regional' | 'national'
    }
  }) => void
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ onGenerate }) => {
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) {
      message.error('请输入角色描述')
      return
    }

    setLoading(true)
    try {
      // 调用AI生成人格特质
      const response = await modelApi.generate({
        model: 'deepseek-v3',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的角色设计助手。根据用户提供的角色描述，生成符合Big Five人格模型的详细配置。

请返回JSON格式的配置，包含以下字段：
{
  "personality": {
    "openness": 0-1之间的数字,
    "conscientiousness": 0-1之间的数字,
    "extraversion": 0-1之间的数字,
    "agreeableness": 0-1之间的数字,
    "neuroticism": 0-1之间的数字
  },
  "knowledge": {
    "domains": ["领域1", "领域2", ...],
    "depth": 0-1之间的数字,
    "sources": ["信息源1", "信息源2", ...]
  },
  "behavior": {
    "decisionStyle": "rational" | "intuitive" | "dependent",
    "riskTolerance": 0-1之间的数字,
    "socialOrientation": 0-1之间的数字,
    "influence": "local" | "regional" | "national"
  }
}

注意：
1. 数值要符合角色描述的特征
2. 知识领域从以下选项中选择：politics, economics, technology, culture, society, environment, health, education, media, law
3. 信息源从以下选项中选择：official, mainstream, social, professional, word_of_mouth, international
4. 只返回JSON，不要其他说明文字`,
          },
          {
            role: 'user',
            content: `请为以下角色生成人格特质配置：\n\n${description}`,
          },
        ],
        temperature: 0.7,
      })

      // 解析JSON响应
      const content = response.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const attributes = JSON.parse(jsonMatch[0])
        onGenerate(attributes)
        setGenerated(true)
        message.success('AI生成成功！')
      } else {
        throw new Error('无法解析AI响应')
      }
    } catch (error: any) {
      message.error(`生成失败: ${error.message || '未知错误'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <RobotOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>AI辅助生成</span>
        </div>
      }
      bordered={false}
    >
      <Alert
        message="智能生成角色属性"
        description="输入角色的基本信息和背景描述，AI将自动生成符合Big Five人格模型的详细配置。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <TextArea
        placeholder="例如：李明，35岁，是一名软件工程师，性格内向但技术能力强，喜欢钻研新技术，对社交活动不太感兴趣，但在技术社区很活跃..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        style={{ marginBottom: 16 }}
      />

      <Button
        type="primary"
        icon={<ThunderboltOutlined />}
        onClick={handleGenerate}
        loading={loading}
        disabled={!description.trim()}
        block
      >
        {loading ? 'AI生成中...' : '一键生成角色属性'}
      </Button>

      {generated && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Tag icon={<CheckCircleOutlined />} color="success">
            生成成功！属性已应用到表单
          </Tag>
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Spin tip="AI正在分析角色特征..." />
        </div>
      )}
    </Card>
  )
}
