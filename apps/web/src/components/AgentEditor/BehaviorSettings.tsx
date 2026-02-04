import React from 'react'
import { Card, Radio, Slider, Typography, Tag, Row, Col } from 'antd'

const { Text } = Typography

interface BehaviorSettingsProps {
  value: {
    decisionStyle: 'rational' | 'intuitive' | 'dependent'
    riskTolerance: number
    socialOrientation: number
    influence: 'local' | 'regional' | 'national'
  }
  onChange: (value: BehaviorSettingsProps['value']) => void
}

// 决策风格选项
const decisionStyles = [
  {
    value: 'rational',
    label: '理性型',
    description: '基于逻辑分析和事实证据做决策',
    characteristics: ['逻辑分析', '数据驱动', '深思熟虑'],
    color: '#1890ff',
  },
  {
    value: 'intuitive',
    label: '直觉型',
    description: '基于直觉和第一印象快速决策',
    characteristics: ['直觉判断', '快速反应', '经验导向'],
    color: '#faad14',
  },
  {
    value: 'dependent',
    label: '依赖型',
    description: '倾向于参考他人意见和专家建议',
    characteristics: ['寻求建议', '从众心理', '信任权威'],
    color: '#52c41a',
  },
]

// 影响力范围选项
const influenceLevels = [
  {
    value: 'local',
    label: '本地',
    description: '影响范围限于亲友和邻里',
    reach: '10-50人',
    color: '#87d068',
  },
  {
    value: 'regional',
    label: '区域',
    description: '在特定区域或社群有一定影响力',
    reach: '100-1000人',
    color: '#108ee9',
  },
  {
    value: 'national',
    label: '全国',
    description: '具有广泛的社会影响力',
    reach: '1000+人',
    color: '#f50',
  },
]

export const BehaviorSettings: React.FC<BehaviorSettingsProps> = ({
  value,
  onChange,
}) => {
  const handleDecisionStyleChange = (e: any) => {
    onChange({ ...value, decisionStyle: e.target.value })
  }

  const handleRiskToleranceChange = (newValue: number) => {
    onChange({ ...value, riskTolerance: newValue / 100 })
  }

  const handleSocialOrientationChange = (newValue: number) => {
    onChange({ ...value, socialOrientation: newValue / 100 })
  }

  const handleInfluenceChange = (e: any) => {
    onChange({ ...value, influence: e.target.value })
  }

  const getRiskInfo = (value: number) => {
    if (value < 0.3) return { label: '保守型', color: '#52c41a' }
    if (value < 0.6) return { label: '稳健型', color: '#faad14' }
    return { label: '激进型', color: '#f5222d' }
  }

  const getSocialLabel = (value: number) => {
    if (value < 0.3) return { label: '内向型', color: '#1890ff' }
    if (value < 0.6) return { label: '平衡型', color: '#faad14' }
    return { label: '外向型', color: '#eb2f96' }
  }

  const riskInfo = getRiskInfo(value.riskTolerance)
  const socialInfo = getSocialLabel(value.socialOrientation)

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* 决策风格 */}
        <Col span={24}>
          <Card title="决策风格" bordered={false}>
            <Radio.Group
              value={value.decisionStyle}
              onChange={handleDecisionStyleChange}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 16]}>
                {decisionStyles.map((style) => (
                  <Col span={8} key={style.value}>
                    <Radio.Button
                      value={style.value}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: 16,
                        borderRadius: 8,
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <div
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: style.color,
                              marginRight: 8,
                            }}
                          />
                          <Text strong style={{ fontSize: 16 }}>
                            {style.label}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                          {style.description}
                        </Text>
                        <div>
                          {style.characteristics.map((char) => (
                            <Tag key={char} style={{ margin: '2px 4px 2px 0', fontSize: 12 }}>
                              {char}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </Radio.Button>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Card>
        </Col>

        {/* 风险偏好和社交倾向 */}
        <Col span={12}>
          <Card title="风险偏好" bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Tag color={riskInfo.color} style={{ fontSize: 14 }}>
                {riskInfo.label}
              </Tag>
            </div>
            <Slider
              value={value.riskTolerance * 100}
              onChange={handleRiskToleranceChange}
              min={0}
              max={100}
              step={1}
              marks={{
                0: '保守',
                50: '稳健',
                100: '激进',
              }}
            />
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text type="secondary">
                {getRiskDescription(value.riskTolerance)}
              </Text>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="社交倾向" bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Tag color={socialInfo.color} style={{ fontSize: 14 }}>
                {socialInfo.label}
              </Tag>
            </div>
            <Slider
              value={value.socialOrientation * 100}
              onChange={handleSocialOrientationChange}
              min={0}
              max={100}
              step={1}
              marks={{
                0: '内向',
                50: '平衡',
                100: '外向',
              }}
            />
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text type="secondary">
                {getSocialDescription(value.socialOrientation)}
              </Text>
            </div>
          </Card>
        </Col>

        {/* 影响力范围 */}
        <Col span={24}>
          <Card title="影响力范围" bordered={false}>
            <Radio.Group
              value={value.influence}
              onChange={handleInfluenceChange}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 16]}>
                {influenceLevels.map((level) => (
                  <Col span={8} key={level.value}>
                    <Radio.Button
                      value={level.value}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: 16,
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <Tag color={level.color} style={{ fontSize: 16, marginBottom: 8 }}>
                          {level.label}
                        </Tag>
                        <div>
                          <Text type="secondary" style={{ display: 'block' }}>
                            {level.description}
                          </Text>
                          <Text strong style={{ display: 'block', marginTop: 8 }}>
                            影响范围：{level.reach}
                          </Text>
                        </div>
                      </div>
                    </Radio.Button>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Card>
        </Col>
      </Row>

      {/* 行为模式摘要 */}
      <Card title="行为模式摘要" style={{ marginTop: 24 }} bordered={false}>
        <BehaviorSummary value={value} />
      </Card>
    </div>
  )
}

// 风险偏好描述
const getRiskDescription = (value: number): string => {
  if (value < 0.3) {
    return '倾向于避免风险，偏好稳定和安全的选择。在决策时会优先考虑潜在损失，通常选择保守方案。'
  }
  if (value < 0.6) {
    return '能够平衡风险和收益，在可控范围内愿意承担一定风险。会根据具体情况灵活调整策略。'
  }
  return '愿意承担高风险以追求高回报，对不确定性有较高的容忍度。倾向于选择激进和创新的方案。'
}

// 社交倾向描述
const getSocialDescription = (value: number): string => {
  if (value < 0.3) {
    return '偏好独处和深度思考，社交活动较少。在群体中通常扮演观察者和倾听者的角色。'
  }
  if (value < 0.6) {
    return '既能享受独处时光，也能在社交场合表现自如。能够根据情境调整自己的社交状态。'
  }
  return '热爱社交，精力充沛，喜欢成为关注的焦点。在社交活动中能够获得能量和满足感。'
}

// 行为模式摘要组件
const BehaviorSummary: React.FC<{ value: BehaviorSettingsProps['value'] }> = ({ value }) => {
  const getDecisionStyleLabel = () => {
    const style = decisionStyles.find((s) => s.value === value.decisionStyle)
    return style?.label || '未知'
  }

  const getInfluenceLabel = () => {
    const level = influenceLevels.find((l) => l.value === value.influence)
    return level?.label || '未知'
  }

  const getBehaviorProfile = () => {
    const profiles: string[] = []

    // 根据决策风格和风险偏好
    if (value.decisionStyle === 'rational' && value.riskTolerance < 0.4) {
      profiles.push('谨慎分析师')
    } else if (value.decisionStyle === 'intuitive' && value.riskTolerance > 0.6) {
      profiles.push('冒险行动派')
    } else if (value.decisionStyle === 'dependent' && value.socialOrientation > 0.6) {
      profiles.push('社交影响者')
    } else if (value.riskTolerance > 0.7 && value.influence === 'national') {
      profiles.push('变革推动者')
    } else if (value.riskTolerance < 0.3 && value.decisionStyle === 'rational') {
      profiles.push('稳健守护者')
    } else {
      profiles.push('平衡型参与者')
    }

    return profiles[0]
  }

  return (
    <div>
      <Row gutter={[24, 16]}>
        <Col span={8}>
          <Text strong>决策风格：</Text>
          <Tag color="blue">{getDecisionStyleLabel()}</Tag>
        </Col>
        <Col span={8}>
          <Text strong>影响力：</Text>
          <Tag color="green">{getInfluenceLabel()}</Tag>
        </Col>
        <Col span={8}>
          <Text strong>行为画像：</Text>
          <Tag color="purple">{getBehaviorProfile()}</Tag>
        </Col>
      </Row>
      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          该角色在模拟中将表现出
          <Tag style={{ margin: '0 4px' }}>{getDecisionStyleLabel()}</Tag>
          的决策特征，
          具有
          <Tag style={{ margin: '0 4px' }}>{getRiskInfo(value.riskTolerance).label}</Tag>
          的风险偏好，
          并能够在
          <Tag style={{ margin: '0 4px' }}>{getInfluenceLabel()}</Tag>
          范围内产生影响。
        </Text>
      </div>
    </div>
  )
}
