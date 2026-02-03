import React from 'react'
import { Card, Slider, Row, Col, Typography, Tag, Tooltip } from 'antd'
import { RadarChart } from './RadarChart'
import { InfoCircleOutlined } from '@ant-design/icons'

const { Text } = Typography

interface PersonalityData {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

interface PersonalityEditorProps {
  value: PersonalityData
  onChange: (value: PersonalityData) => void
}

const dimensions = [
  {
    key: 'openness',
    label: '开放性 (Openness)',
    description: '好奇心、创造力、对新经验的接受度',
    lowLabel: '传统保守',
    highLabel: '开放好奇',
    color: '#1890ff',
  },
  {
    key: 'conscientiousness',
    label: '尽责性 (Conscientiousness)',
    description: '组织性、自律性、可靠性',
    lowLabel: '随性自由',
    highLabel: '严谨自律',
    color: '#52c41a',
  },
  {
    key: 'extraversion',
    label: '外向性 (Extraversion)',
    description: '社交性、活跃度、寻求刺激',
    lowLabel: '内向安静',
    highLabel: '外向活跃',
    color: '#faad14',
  },
  {
    key: 'agreeableness',
    label: '宜人性 (Agreeableness)',
    description: '合作性、信任度、利他主义',
    lowLabel: '理性独立',
    highLabel: '友善合作',
    color: '#eb2f96',
  },
  {
    key: 'neuroticism',
    label: '神经质 (Neuroticism)',
    description: '情绪稳定性、焦虑倾向、压力反应',
    lowLabel: '情绪稳定',
    highLabel: '情绪敏感',
    color: '#f5222d',
  },
]

// 根据人格特质生成描述标签
const generatePersonalityTags = (data: PersonalityData): string[] => {
  const tags: string[] = []

  if (data.openness > 0.7) tags.push('富有创造力')
  else if (data.openness < 0.3) tags.push('传统稳重')

  if (data.conscientiousness > 0.7) tags.push('高度自律')
  else if (data.conscientiousness < 0.3) tags.push('随性自由')

  if (data.extraversion > 0.7) tags.push('社交达人')
  else if (data.extraversion < 0.3) tags.push('内向思考者')

  if (data.agreeableness > 0.7) tags.push('善解人意')
  else if (data.agreeableness < 0.3) tags.push('理性客观')

  if (data.neuroticism > 0.7) tags.push('情绪丰富')
  else if (data.neuroticism < 0.3) tags.push('情绪稳定')

  return tags
}

export const PersonalityEditor: React.FC<PersonalityEditorProps> = ({
  value,
  onChange,
}) => {
  const handleSliderChange = (dimension: string) => (newValue: number) => {
    onChange({
      ...value,
      [dimension]: newValue / 100,
    })
  }

  const handleRadarChange = (dimension: string, newValue: number) => {
    onChange({
      ...value,
      [dimension]: newValue,
    })
  }

  const personalityTags = generatePersonalityTags(value)

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* 左侧：雷达图 */}
        <Col span={12}>
          <Card title="人格特质分布" bordered={false}>
            <RadarChart
              data={value}
              size={350}
              interactive={true}
              onChange={handleRadarChange}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">
                拖拽图中的圆点可直接调整数值
              </Text>
            </div>
          </Card>
        </Col>

        {/* 右侧：滑块控制 */}
        <Col span={12}>
          <Card title="特质调整" bordered={false}>
            {dimensions.map((dim) => (
              <div key={dim.key} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ color: dim.color }}>
                    {dim.label}
                  </Text>
                  <Tooltip title={dim.description}>
                    <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                  </Tooltip>
                  <Text style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                    {(value[dim.key as keyof PersonalityData] * 100).toFixed(0)}%
                  </Text>
                </div>
                <Slider
                  value={value[dim.key as keyof PersonalityData] * 100}
                  onChange={handleSliderChange(dim.key)}
                  min={0}
                  max={100}
                  step={1}
                  tooltip={{ formatter: (val) => `${val}%` }}
                  trackStyle={{ backgroundColor: dim.color }}
                  handleStyle={{ borderColor: dim.color }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dim.lowLabel}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dim.highLabel}
                  </Text>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      {/* 人格标签 */}
      <Card title="人格特征" style={{ marginTop: 24 }} bordered={false}>
        <div>
          {personalityTags.length > 0 ? (
            personalityTags.map((tag) => (
              <Tag key={tag} color="blue" style={{ margin: '4px 8px 4px 0' }}>
                {tag}
              </Tag>
            ))
          ) : (
            <Text type="secondary">调整特质值以生成人格标签</Text>
          )}
        </div>
      </Card>

      {/* 人格描述 */}
      <Card title="人格描述" style={{ marginTop: 16 }} bordered={false}>
        <PersonalityDescription data={value} />
      </Card>
    </div>
  )
}

// 人格描述组件
const PersonalityDescription: React.FC<{ data: PersonalityData }> = ({ data }) => {
  const getDescription = () => {
    const parts: string[] = []

    // 开放性
    if (data.openness > 0.7) {
      parts.push('对新事物充满好奇，喜欢探索和创新')
    } else if (data.openness < 0.3) {
      parts.push('偏好熟悉的事物，重视传统和经验')
    } else {
      parts.push('对新事物持开放态度，但也重视实用性')
    }

    // 尽责性
    if (data.conscientiousness > 0.7) {
      parts.push('做事有条理，高度自律，追求完美')
    } else if (data.conscientiousness < 0.3) {
      parts.push('随性而为，灵活应变，不拘小节')
    } else {
      parts.push('能够平衡计划与灵活性')
    }

    // 外向性
    if (data.extraversion > 0.7) {
      parts.push('喜欢社交，精力充沛，善于表达')
    } else if (data.extraversion < 0.3) {
      parts.push('偏好独处，深思熟虑，内敛沉稳')
    } else {
      parts.push('既能享受社交也能独处')
    }

    // 宜人性
    if (data.agreeableness > 0.7) {
      parts.push('善解人意，乐于助人，重视和谐')
    } else if (data.agreeableness < 0.3) {
      parts.push('理性客观，独立自主，注重逻辑')
    } else {
      parts.push('能够在理性与感性之间取得平衡')
    }

    // 神经质
    if (data.neuroticism > 0.7) {
      parts.push('情绪丰富，对变化敏感，容易焦虑')
    } else if (data.neuroticism < 0.3) {
      parts.push('情绪稳定，处变不惊，心态平和')
    } else {
      parts.push('情绪反应适中，能够自我调节')
    }

    return parts.join('；') + '。'
  }

  return <Text>{getDescription()}</Text>
}
