import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  message,
  List,
  Tag,
  Spin,
  Space,
  Tabs,
  Badge,
  Tooltip,
  Empty,
  InputNumber,
  Divider,
  Typography,
  Row,
  Col,
  Alert,
} from 'antd'
import {
  KeyOutlined,
  RobotOutlined,
  DollarOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SoundOutlined,
  DatabaseOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useSettingsStore } from '@/stores/settings.store'
import { modelApi, ModelInfo } from '@/services/model.service'
import { debounce } from 'lodash-es'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
const { Option } = Select
const { Search } = Input

// 模型类别图标映射
const categoryIcons: Record<string, React.ReactNode> = {
  text: <RobotOutlined />,
  vision: <EyeOutlined />,
  embedding: <DatabaseOutlined />,
  audio: <SoundOutlined />,
  reranker: <FilterOutlined />,
}

// 模型类别颜色映射
const categoryColors: Record<string, string> = {
  text: 'blue',
  vision: 'purple',
  embedding: 'cyan',
  audio: 'orange',
  reranker: 'green',
}

// 模型类别中文名称
const categoryNames: Record<string, string> = {
  text: '文本模型',
  vision: '视觉模型',
  embedding: '嵌入模型',
  audio: '语音模型',
  reranker: '重排序模型',
}

export default function Settings() {
  const [form] = Form.useForm()
  const { settings, updateSettings } = useSettingsStore()

  // 模型相关状态
  const [models, setModels] = useState<ModelInfo[]>([])
  const [filteredModels, setFilteredModels] = useState<ModelInfo[]>([])
  const [categories, setCategories] = useState<{ value: string; label: string; count: number }[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)

  // 加载模型列表
  const loadModels = useCallback(async (category?: string, search?: string) => {
    if (!settings.apiKey) {
      message.warning('请先配置API Key')
      return
    }

    setLoadingModels(true)
    try {
      const [modelsData, categoriesData] = await Promise.all([
        modelApi.getAvailableModels(category, search),
        modelApi.getModelCategories(),
      ])
      setModels(modelsData)
      setFilteredModels(modelsData)
      setCategories(categoriesData)
      setApiKeyValid(true)
    } catch (error) {
      message.error('加载模型列表失败，请检查API Key是否正确')
      setApiKeyValid(false)
    } finally {
      setLoadingModels(false)
    }
  }, [settings.apiKey])

  // 首次加载和API Key变化时加载模型
  useEffect(() => {
    if (settings.apiKey) {
      loadModels()
    }
  }, [settings.apiKey, loadModels])

  // 搜索防抖
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value)
      loadModels(selectedCategory, value)
    }, 300),
    [selectedCategory, loadModels]
  )

  // 处理搜索
  const handleSearch = (value: string) => {
    debouncedSearch(value)
  }

  // 处理类别筛选
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    loadModels(category, searchQuery)
  }

  // 验证API Key
  const validateApiKey = async () => {
    const apiKey = form.getFieldValue('apiKey')
    if (!apiKey) {
      message.warning('请输入API Key')
      return
    }

    setLoadingModels(true)
    try {
      await modelApi.getAvailableModels()
      setApiKeyValid(true)
      message.success('API Key验证成功')
      // 保存到store
      updateSettings({ apiKey })
    } catch (error) {
      setApiKeyValid(false)
      message.error('API Key验证失败')
    } finally {
      setLoadingModels(false)
    }
  }

  // 保存设置
  const handleSave = (values: any) => {
    updateSettings(values)
    message.success('设置已保存')
  }

  // 渲染模型选项
  const renderModelOption = (model: ModelInfo) => (
    <Option key={model.id} value={model.id}>
      <Space direction="vertical" size={0} style={{ width: '100%' }}>
        <Space>
          <Text strong>{model.name}</Text>
          {model.isPro && <Tag color="gold">Pro</Tag>}
          <Tag color={categoryColors[model.category]}>{categoryNames[model.category]}</Tag>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {model.id} · 上下文 {model.contextWindow.toLocaleString()} tokens
        </Text>
        <Space size={8}>
          {model.capabilities.slice(0, 3).map((cap) => (
            <Tag key={cap} size="small">
              {cap}
            </Tag>
          ))}
          <Text type="secondary" style={{ fontSize: 12 }}>
            <DollarOutlined /> ¥{model.pricing.input}/1K tokens
          </Text>
        </Space>
      </Space>
    </Option>
  )

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={2}>
        <RobotOutlined /> 系统设置
      </Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        onFinish={handleSave}
      >
        <Tabs defaultActiveKey="model">
          {/* 模型设置 */}
          <TabPane
            tab={
              <span>
                <RobotOutlined />
                模型设置
              </span>
            }
            key="model"
          >
            <Card title="API配置" style={{ marginBottom: 24 }}>
              <Alert
                message="Silicon Flow API Key配置"
                description="请输入您的Silicon Flow API Key以获取完整的模型列表。您可以在 https://siliconflow.cn 获取API Key。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item
                label="API Key"
                name="apiKey"
                rules={[{ required: true, message: '请输入API Key' }]}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  addonAfter={
                    <Button
                      type="primary"
                      size="small"
                      icon={apiKeyValid ? <CheckCircleOutlined /> : <ReloadOutlined />}
                      onClick={validateApiKey}
                      loading={loadingModels}
                    >
                      {apiKeyValid ? '已验证' : '验证并加载'}
                    </Button>
                  }
                />
              </Form.Item>
            </Card>

            <Card
              title={
                <Space>
                  <span>模型选择</span>
                  {apiKeyValid && (
                    <Badge count={models.length} style={{ backgroundColor: '#52c41a' }} />
                  )}
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              {!apiKeyValid ? (
                <Empty
                  description="请先验证API Key以加载模型列表"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <>
                  {/* 搜索和筛选 */}
                  <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                      <Search
                        placeholder="搜索模型名称、ID或提供商..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        onChange={(e) => debouncedSearch(e.target.value)}
                      />
                    </Col>
                    <Col xs={24} sm={12} md={16}>
                      <Space wrap>
                        {categories.map((cat) => (
                          <Button
                            key={cat.value}
                            type={selectedCategory === cat.value ? 'primary' : 'default'}
                            size="small"
                            icon={categoryIcons[cat.value] || <RobotOutlined />}
                            onClick={() => handleCategoryChange(cat.value)}
                          >
                            {cat.label}
                            <Badge count={cat.count} style={{ marginLeft: 4 }} />
                          </Button>
                        ))}
                      </Space>
                    </Col>
                  </Row>

                  {/* 模型选择器 */}
                  <Form.Item
                    label="默认模型"
                    name="defaultModel"
                    rules={[{ required: true, message: '请选择默认模型' }]}
                    tooltip="选择用于Agent生成和模拟的默认大语言模型"
                  >
                    <Select
                      showSearch
                      placeholder="选择模型"
                      optionFilterProp="children"
                      loading={loadingModels}
                      style={{ width: '100%' }}
                      dropdownRender={(menu) => (
                        <div>
                          {loadingModels && (
                            <div style={{ padding: 12, textAlign: 'center' }}>
                              <Spin size="small" /> 加载中...
                            </div>
                          )}
                          {menu}
                        </div>
                      )}
                    >
                      {filteredModels.map(renderModelOption)}
                    </Select>
                  </Form.Item>

                  {/* 选中模型详情 */}
                  {settings.defaultModel && (
                    <Card
                      size="small"
                      title="选中模型详情"
                      style={{ marginTop: 16, backgroundColor: '#f6ffed' }}
                    >
                      {(() => {
                        const model = models.find((m) => m.id === settings.defaultModel)
                        if (!model) return null
                        return (
                          <Space direction="vertical" style={{ width: '100%' }}>
                            <Space>
                              <Text strong style={{ fontSize: 16 }}>
                                {model.name}
                              </Text>
                              {model.isPro && <Tag color="gold">Pro</Tag>}
                              <Tag color={categoryColors[model.category]}>
                                {categoryNames[model.category]}
                              </Tag>
                            </Space>
                            <Paragraph type="secondary">{model.description}</Paragraph>
                            <Row gutter={16}>
                              <Col span={8}>
                                <Text type="secondary">模型ID:</Text>
                                <br />
                                <Text copyable>{model.id}</Text>
                              </Col>
                              <Col span={8}>
                                <Text type="secondary">上下文窗口:</Text>
                                <br />
                                <Text>{model.contextWindow.toLocaleString()} tokens</Text>
                              </Col>
                              <Col span={8}>
                                <Text type="secondary">最大输出:</Text>
                                <br />
                                <Text>{model.maxTokens.toLocaleString()} tokens</Text>
                              </Col>
                            </Row>
                            <Divider style={{ margin: '8px 0' }} />
                            <Row gutter={16}>
                              <Col span={12}>
                                <Text type="secondary">
                                  <DollarOutlined /> 输入价格:
                                </Text>
                                <Text> ¥{model.pricing.input}/1K tokens</Text>
                              </Col>
                              <Col span={12}>
                                <Text type="secondary">
                                  <DollarOutlined /> 输出价格:
                                </Text>
                                <Text> ¥{model.pricing.output}/1K tokens</Text>
                              </Col>
                            </Row>
                            <Space style={{ marginTop: 8 }}>
                              {model.capabilities.map((cap) => (
                                <Tag key={cap} color="blue">
                                  {cap}
                                </Tag>
                              ))}
                            </Space>
                          </Space>
                        )
                      })()}
                    </Card>
                  )}
                </>
              )}
            </Card>

            <Card title="生成参数">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Temperature"
                    name={['generationParams', 'temperature']}
                    tooltip="控制输出的随机性，值越高输出越随机"
                  >
                    <InputNumber
                      min={0}
                      max={2}
                      step={0.1}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Max Tokens"
                    name={['generationParams', 'maxTokens']}
                    tooltip="生成文本的最大长度"
                  >
                    <InputNumber min={100} max={8192} step={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item label="Top P" name={['generationParams', 'topP']}>
                    <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Frequency Penalty"
                    name={['generationParams', 'frequencyPenalty']}
                  >
                    <InputNumber min={-2} max={2} step={0.1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* 界面设置 */}
          <TabPane
            tab={
              <span>
                <ThunderboltOutlined />
                界面设置
              </span>
            }
            key="ui"
          >
            <Card title="主题设置">
              <Form.Item label="深色模式" name="darkMode" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="紧凑模式" name="compactMode" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title="语言设置" style={{ marginTop: 24 }}>
              <Form.Item label="界面语言" name="language">
                <Select>
                  <Option value="zh-CN">简体中文</Option>
                  <Option value="en-US">English</Option>
                </Select>
              </Form.Item>
            </Card>
          </TabPane>

          {/* 高级设置 */}
          <TabPane
            tab={
              <span>
                <InfoCircleOutlined />
                高级设置
              </span>
            }
            key="advanced"
          >
            <Card title="模拟设置">
              <Form.Item
                label="默认模拟时长(天)"
                name="defaultSimulationDuration"
                tooltip="创建场景时的默认模拟时长"
              >
                <InputNumber min={365} max={3650} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                label="自动保存"
                name="autoSave"
                valuePropName="checked"
                tooltip="是否自动保存编辑内容"
              >
                <Switch />
              </Form.Item>
            </Card>
          </TabPane>
        </Tabs>

        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" size="large">
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
