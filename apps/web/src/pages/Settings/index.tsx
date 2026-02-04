import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Select, Switch, message, List, Tag, Spin, Space } from 'antd'
import { useSettingsStore } from '@/stores/settings.store'
import { modelApi, ModelInfo } from '@/services/model.service'
import { KeyOutlined, RobotOutlined, DollarOutlined } from '@ant-design/icons'

const { Option } = Select

export const Settings: React.FC = () => {
  const [form] = Form.useForm()
  const [apiForm] = Form.useForm()
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<string>('')

  const {
    siliconFlowApiKey,
    defaultModel,
    setSiliconFlowApiKey,
    setDefaultModel,
  } = useSettingsStore()

  // 加载可用模型
  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setLoading(true)
      const data = await modelApi.getAvailableModels()
      setModels(data)
    } catch (error) {
      message.error('加载模型列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存API设置
  const handleSaveApiSettings = (values: { apiKey: string; defaultModel: string }) => {
    setSiliconFlowApiKey(values.apiKey)
    setDefaultModel(values.defaultModel)
    message.success('API设置已保存')
  }

  // 测试模型调用
  const handleTestModel = async () => {
    const apiKey = apiForm.getFieldValue('apiKey')
    const model = apiForm.getFieldValue('defaultModel')

    if (!apiKey) {
      message.error('请先输入API Key')
      return
    }

    try {
      setTestLoading(true)
      const result = await modelApi.testModel(model, '你好，请介绍一下自己')
      setTestResult(result.content)
      message.success('测试成功')
    } catch (error: any) {
      message.error(`测试失败: ${error.message || '未知错误'}`)
      setTestResult('')
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div>
      <h1>系统设置</h1>

      {/* API设置 */}
      <Card 
        title={<><KeyOutlined /> Silicon Flow API设置</>} 
        style={{ marginBottom: 24 }}
      >
        <Form
          form={apiForm}
          layout="vertical"
          style={{ maxWidth: 600 }}
          initialValues={{
            apiKey: siliconFlowApiKey,
            defaultModel: defaultModel,
          }}
          onFinish={handleSaveApiSettings}
        >
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[{ required: true, message: '请输入API Key' }]}
            extra="您的API Key仅存储在本地浏览器中，不会上传到服务器"
          >
            <Input.Password 
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              prefix={<KeyOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="默认模型"
            name="defaultModel"
            rules={[{ required: true, message: '请选择默认模型' }]}
          >
            <Select 
              placeholder="选择默认模型"
              loading={loading}
              prefix={<RobotOutlined />}
            >
              {models.map((model) => (
                <Option key={model.id} value={model.id}>
                  <div>
                    <strong>{model.name}</strong>
                    <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                      {model.description}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>
              <Button 
                onClick={handleTestModel} 
                loading={testLoading}
                disabled={!apiForm.getFieldValue('apiKey')}
              >
                测试连接
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {testResult && (
          <Card 
            type="inner" 
            title="测试结果" 
            style={{ marginTop: 16, background: '#f6ffed' }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{testResult}</pre>
          </Card>
        )}
      </Card>

      {/* 模型信息 */}
      <Card title={<><RobotOutlined /> 可用模型</>} style={{ marginBottom: 24 }}>
        <Spin spinning={loading}>
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={models}
            renderItem={(model) => (
              <List.Item>
                <Card 
                  size="small" 
                  title={model.name}
                  extra={
                    <Tag color="blue">
                      <DollarOutlined /> {model.pricing.input}/{model.pricing.output}
                    </Tag>
                  }
                >
                  <p>{model.description}</p>
                  <div>
                    <Tag>上下文: {model.contextWindow.toLocaleString()}</Tag>
                    <Tag>最大输出: {model.maxTokens.toLocaleString()}</Tag>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {model.capabilities.map((cap) => (
                      <Tag key={cap} size="small">{cap}</Tag>
                    ))}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      </Card>

      {/* 个人设置 */}
      <Card title="个人设置">
        <Form layout="vertical" style={{ maxWidth: 600 }}>
          <Form.Item label="用户名">
            <Input defaultValue="张研究员" />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input defaultValue="researcher@example.com" />
          </Form.Item>
          <Form.Item label="主题">
            <Select defaultValue="system">
              <Option value="light">浅色</Option>
              <Option value="dark">深色</Option>
              <Option value="system">跟随系统</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary">保存个人设置</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
