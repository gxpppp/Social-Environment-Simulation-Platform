import React from 'react'
import { Form, Input, Select, Radio, Card, Typography, Row, Col, Slider } from 'antd'
import { 
  FileTextOutlined, 
  ClockCircleOutlined, 
  TagOutlined,
  AppstoreOutlined
} from '@ant-design/icons'

const { TextArea } = Input
const { Text } = Typography
const { Option } = Select

// 场景类型选项
const sceneTypes = [
  {
    value: 'policy',
    label: '政策评估',
    description: '评估政策发布后的社会影响',
    icon: '📋',
    color: '#1890ff',
  },
  {
    value: 'opinion',
    label: '舆论演化',
    description: '模拟观点在社会中的传播过程',
    icon: '💬',
    color: '#52c41a',
  },
  {
    value: 'market',
    label: '市场分析',
    description: '分析市场竞争和消费者行为',
    icon: '📊',
    color: '#faad14',
  },
  {
    value: 'training',
    label: '团队培训',
    description: '团队协作和决策能力训练',
    icon: '🎓',
    color: '#eb2f96',
  },
]

// 时间步长选项
const timeSteps = [
  { value: 'day', label: '1天', description: '精细粒度，适合短期模拟' },
  { value: 'week', label: '1周', description: '中等粒度，适合中期模拟' },
  { value: 'month', label: '1月', description: '粗粒度，适合长期模拟' },
]

interface BasicConfigProps {
  value: {
    name: string
    description: string
    type: string
    duration: number
    timeStep: string
  }
  onChange: (value: BasicConfigProps['value']) => void
}

export const BasicConfig: React.FC<BasicConfigProps> = ({ value, onChange }) => {
  const handleChange = (field: string, newValue: any) => {
    onChange({ ...value, [field]: newValue })
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* 场景名称和描述 */}
        <Col span={24}>
          <Card title="基本信息" bordered={false}>
            <Form layout="vertical">
              <Form.Item
                label="场景名称"
                required
                tooltip="给场景起一个简洁明了的名称"
              >
                <Input
                  prefix={<FileTextOutlined />}
                  placeholder="例如：新能源汽车补贴政策影响评估"
                  value={value.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  maxLength={100}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="场景描述"
                required
                tooltip="详细描述场景的背景、目标和预期结果"
              >
                <TextArea
                  placeholder="描述场景的背景、模拟目标和预期分析结果..."
                  value={value.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* 场景类型 */}
        <Col span={24}>
          <Card title="场景类型" bordered={false}>
            <Radio.Group
              value={value.type}
              onChange={(e) => handleChange('type', e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={[16, 16]}>
                {sceneTypes.map((type) => (
                  <Col span={12} key={type.value}>
                    <Radio.Button
                      value={type.value}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: 16,
                        borderRadius: 8,
                        borderColor: value.type === type.value ? type.color : undefined,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 32, marginRight: 12 }}>
                          {type.icon}
                        </span>
                        <div>
                          <Text strong style={{ fontSize: 16, display: 'block' }}>
                            {type.label}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {type.description}
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

        {/* 模拟时长 */}
        <Col span={12}>
          <Card title="模拟时长" bordered={false}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Text strong style={{ fontSize: 24 }}>
                {value.duration} 天
              </Text>
            </div>
            <Slider
              value={value.duration}
              onChange={(val) => handleChange('duration', val)}
              min={7}
              max={365}
              step={1}
              marks={{
                7: '1周',
                30: '1月',
                90: '3月',
                180: '6月',
                365: '1年',
              }}
            />
            <div style={{ marginTop: 12, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text type="secondary">
                {getDurationDescription(value.duration)}
              </Text>
            </div>
          </Card>
        </Col>

        {/* 时间步长 */}
        <Col span={12}>
          <Card title="时间步长" bordered={false}>
            <Radio.Group
              value={value.timeStep}
              onChange={(e) => handleChange('timeStep', e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={[8, 8]}>
                {timeSteps.map((step) => (
                  <Col span={24} key={step.value}>
                    <Radio.Button
                      value={step.value}
                      style={{
                        width: '100%',
                        height: 'auto',
                        padding: 12,
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <Text strong>{step.label}</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                          {step.description}
                        </Text>
                      </div>
                    </Radio.Button>
                  </Col>
                ))}
              </Row>
            </Radio.Group>
          </Card>
        </Col>
      </Row>

      {/* 配置摘要 */}
      <Card title="配置摘要" style={{ marginTop: 24 }} bordered={false}>
        <BasicConfigSummary value={value} />
      </Card>
    </div>
  )
}

// 时长描述
const getDurationDescription = (duration: number): string => {
  if (duration <= 30) {
    return '短期模拟，适合观察快速变化的现象，如突发事件的影响。'
  }
  if (duration <= 90) {
    return '中期模拟，适合观察趋势性变化，如政策实施的初期效果。'
  }
  if (duration <= 180) {
    return '中长期模拟，适合观察持续性影响，如社会态度的渐进变化。'
  }
  return '长期模拟，适合观察深远影响，如文化变迁和结构性变化。'
}

// 配置摘要组件
const BasicConfigSummary: React.FC<{ value: BasicConfigProps['value'] }> = ({ value }) => {
  const selectedType = sceneTypes.find((t) => t.value === value.type)
  const selectedStep = timeSteps.find((s) => s.value === value.timeStep)

  return (
    <div>
      <Row gutter={[24, 16]}>
        <Col span={12}>
          <Text strong>场景类型：</Text>
          {selectedType ? (
            <span style={{ marginLeft: 8 }}>
              {selectedType.icon} {selectedType.label}
            </span>
          ) : (
            <Text type="secondary">未选择</Text>
          )}
        </Col>
        <Col span={12}>
          <Text strong>模拟时长：</Text>
          <span style={{ marginLeft: 8 }}>{value.duration} 天</span>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            （约{(value.duration / 30).toFixed(1)}个月）
          </Text>
        </Col>
        <Col span={12}>
          <Text strong>时间步长：</Text>
          <span style={{ marginLeft: 8 }}>{selectedStep?.label || '未选择'}</span>
        </Col>
        <Col span={12}>
          <Text strong>预计Tick数：</Text>
          <span style={{ marginLeft: 8 }}>
            {Math.ceil(value.duration / (value.timeStep === 'day' ? 1 : value.timeStep === 'week' ? 7 : 30))}
          </span>
        </Col>
      </Row>
    </div>
  )
}
