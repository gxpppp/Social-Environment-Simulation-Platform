import React, { useState, useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tooltip,
  Badge,
  Divider,
  Switch,
  Slider,
  Alert,
  Button,
  Radio,
} from 'antd'
import {
  ClockCircleOutlined,
  CalendarOutlined,
  SettingOutlined,
  InfoCircleOutlined,
  HistoryOutlined,
  ThunderboltOutlined,
  HourglassOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const { Text, Title, Paragraph } = Typography
const { Option } = Select
const { RangePicker } = DatePicker
const { TextArea } = Input

// 时间步长选项
interface TimeStepOption {
  value: string
  label: string
  description: string
  icon: React.ReactNode
  days: number
  granularity: 'fine' | 'normal' | 'coarse'
}

const timeStepOptions: TimeStepOption[] = [
  {
    value: 'hour',
    label: '1小时',
    description: '精细模拟，适合短期事件',
    icon: <FieldTimeOutlined />,
    days: 1 / 24,
    granularity: 'fine',
  },
  {
    value: 'day',
    label: '1天',
    description: '日常粒度，适合日常模拟',
    icon: <ClockCircleOutlined />,
    days: 1,
    granularity: 'normal',
  },
  {
    value: 'week',
    label: '1周',
    description: '周度粒度，适合中期趋势',
    icon: <CalendarOutlined />,
    days: 7,
    granularity: 'normal',
  },
  {
    value: 'month',
    label: '1月',
    description: '月度粒度，适合长期模拟',
    icon: <HistoryOutlined />,
    days: 30,
    granularity: 'coarse',
  },
  {
    value: 'quarter',
    label: '1季度',
    description: '季度粒度，适合宏观分析',
    icon: <HourglassOutlined />,
    days: 90,
    granularity: 'coarse',
  },
  {
    value: 'year',
    label: '1年',
    description: '年度粒度，适合战略模拟',
    icon: <SettingOutlined />,
    days: 365,
    granularity: 'coarse',
  },
]

// 预设模板
const durationPresets = [
  { name: '短期实验', duration: 365, timeStep: 'day', description: '1年，按天模拟' },
  { name: '中期观察', duration: 730, timeStep: 'week', description: '2年，按周模拟' },
  { name: '长期趋势', duration: 1825, timeStep: 'month', description: '5年，按月模拟' },
  { name: '战略规划', duration: 3650, timeStep: 'quarter', description: '10年，按季度模拟' },
]

interface BasicConfigProps {
  value?: {
    name?: string
    description?: string
    duration?: number
    timeStep?: string
    startDate?: Dayjs
    endDate?: Dayjs
    customDuration?: boolean
    customTimeStep?: boolean
  }
  onChange?: (value: any) => void
}

export default function BasicConfig({ value = {}, onChange }: BasicConfigProps) {
  const [form] = Form.useForm()
  const [useCustom, setUseCustom] = useState(false)
  const [estimatedTicks, setEstimatedTicks] = useState(0)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // 计算预计Tick数
  const calculateTicks = (duration: number, timeStep: string) => {
    const stepOption = timeStepOptions.find((opt) => opt.value === timeStep)
    if (!stepOption) return 0
    return Math.ceil(duration / stepOption.days)
  }

  // 更新表单值
  const updateValue = (changedValues: any) => {
    const newValue = { ...value, ...changedValues }
    
    // 计算预计Tick数
    if (newValue.duration && newValue.timeStep) {
      const ticks = calculateTicks(newValue.duration, newValue.timeStep)
      setEstimatedTicks(ticks)
    }
    
    onChange?.(newValue)
  }

  // 应用预设
  const applyPreset = (preset: (typeof durationPresets)[0]) => {
    form.setFieldsValue({
      duration: preset.duration,
      timeStep: preset.timeStep,
    })
    setSelectedPreset(preset.name)
    updateValue({
      duration: preset.duration,
      timeStep: preset.timeStep,
    })
  }

  // 监听表单变化
  const handleValuesChange = (changedValues: any, allValues: any) => {
    updateValue(allValues)
    
    // 如果用户手动修改，取消预设选择
    if (changedValues.duration || changedValues.timeStep) {
      setSelectedPreset(null)
    }
  }

  // 初始化
  useEffect(() => {
    if (value.duration && value.timeStep) {
      const ticks = calculateTicks(value.duration, value.timeStep)
      setEstimatedTicks(ticks)
    }
  }, [])

  return (
    <div>
      <Title level={4}>
        <SettingOutlined /> 基础配置
      </Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: value.name,
          description: value.description,
          duration: value.duration || 365,
          timeStep: value.timeStep || 'day',
          ...value,
        }}
        onValuesChange={handleValuesChange}
      >
        {/* 场景名称 */}
        <Form.Item
          label="场景名称"
          name="name"
          rules={[{ required: true, message: '请输入场景名称' }]}
        >
          <Input placeholder="例如：社交媒体舆论演化模拟" maxLength={100} showCount />
        </Form.Item>

        {/* 场景描述 */}
        <Form.Item
          label="场景描述"
          name="description"
          rules={[{ required: true, message: '请输入场景描述' }]}
        >
          <TextArea
            placeholder="描述这个模拟场景的背景、目的和预期结果..."
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Divider />

        {/* 时间配置 */}
        <Card
          title={
            <Space>
              <ClockCircleOutlined />
              <span>时间配置</span>
              <Badge
                count={`预计 ${estimatedTicks.toLocaleString()} 个Tick`}
                style={{ backgroundColor: '#1890ff' }}
              />
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          {/* 预设模板 */}
          <Alert
            message="快速选择预设"
            description="选择适合您研究目标的预设配置，或自定义设置"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {durationPresets.map((preset) => (
              <Col xs={24} sm={12} md={6} key={preset.name}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => applyPreset(preset)}
                  style={{
                    borderColor: selectedPreset === preset.name ? '#1890ff' : undefined,
                    backgroundColor: selectedPreset === preset.name ? '#e6f7ff' : undefined,
                  }}
                >
                  <Space direction="vertical" size={4}>
                    <Text strong>{preset.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {preset.description}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider style={{ margin: '16px 0' }}>
            <Text type="secondary">或自定义配置</Text>
          </Divider>

          {/* 自定义配置 */}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="模拟时长"
                name="duration"
                rules={[
                  { required: true, message: '请输入模拟时长' },
                  { type: 'number', min: 365, message: '模拟时长至少为1年（365天）' },
                ]}
                tooltip="模拟的总时间跨度，最少1年"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={365}
                  max={36500}
                  step={1}
                  addonAfter="天"
                  placeholder="365"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="时间步长"
                name="timeStep"
                rules={[{ required: true, message: '请选择时间步长' }]}
                tooltip="每个Tick代表的时间跨度"
              >
                <Select placeholder="选择时间步长">
                  {timeStepOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <Space>
                        {option.icon}
                        <span>{option.label}</span>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          - {option.description}
                        </Text>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* 时间配置预览 */}
          <Card
            size="small"
            title="配置预览"
            style={{ marginTop: 16, backgroundColor: '#f6ffed' }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Text type="secondary">模拟时长:</Text>
                <br />
                <Text strong>
                  {(() => {
                    const days = form.getFieldValue('duration') || 365
                    if (days >= 365) {
                      const years = Math.floor(days / 365)
                      const remainingDays = days % 365
                      return `${years}年${remainingDays > 0 ? remainingDays + '天' : ''}`
                    }
                    return `${days}天`
                  })()}
                </Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">时间步长:</Text>
                <br />
                <Text strong>
                  {(() => {
                    const step = form.getFieldValue('timeStep')
                    const option = timeStepOptions.find((opt) => opt.value === step)
                    return option?.label || '1天'
                  })()}
                </Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">预计Tick数:</Text>
                <br />
                <Text strong style={{ color: '#1890ff', fontSize: 18 }}>
                  {estimatedTicks.toLocaleString()}
                </Text>
              </Col>
            </Row>
            <Paragraph type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
              <InfoCircleOutlined /> 每个Tick代表一个时间步长，系统将在每个Tick执行Agent决策和交互计算
            </Paragraph>
          </Card>
        </Card>

        {/* 高级选项 */}
        <Card
          title={
            <Space>
              <ThunderboltOutlined />
              <span>高级选项</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="随机种子"
                name={['environment', 'randomSeed']}
                tooltip="设置随机种子以确保模拟结果可复现"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="留空则随机生成"
                  min={0}
                  max={999999}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="并发Agent数"
                name={['environment', 'maxConcurrentAgents']}
                tooltip="同时处理的Agent数量上限"
                initialValue={100}
              >
                <Slider min={10} max={1000} step={10} marks={{ 10: '10', 100: '100', 500: '500', 1000: '1000' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="启用事件系统"
            name={['environment', 'enableEvents']}
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="关闭" />
          </Form.Item>

          <Form.Item
            label="启用网络演化"
            name={['environment', 'enableNetworkEvolution']}
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="关闭" />
          </Form.Item>
        </Card>
      </Form>
    </div>
  )
}
