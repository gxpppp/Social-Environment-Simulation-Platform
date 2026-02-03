import React, { useState } from 'react'
import { Modal, Steps, Button, Form, Input, message, Row, Col } from 'antd'
import { UserOutlined, BulbOutlined, BookOutlined, SettingOutlined, EyeOutlined } from '@ant-design/icons'
import { PersonalityEditor } from './PersonalityEditor'
import { KnowledgeConfig } from './KnowledgeConfig'
import { BehaviorSettings } from './BehaviorSettings'
import { AIGenerator } from './AIGenerator'

const { Step } = Steps
const { TextArea } = Input

interface AgentEditorProps {
  visible: boolean
  onCancel: () => void
  onSave: (agentData: any) => void
  initialData?: any
}

const defaultPersonality = {
  openness: 0.5,
  conscientiousness: 0.5,
  extraversion: 0.5,
  agreeableness: 0.5,
  neuroticism: 0.5,
}

const defaultKnowledge = {
  domains: [],
  depth: 0.5,
  sources: [],
}

const defaultBehavior = {
  decisionStyle: 'rational' as const,
  riskTolerance: 0.5,
  socialOrientation: 0.5,
  influence: 'local' as const,
}

export const AgentEditor: React.FC<AgentEditorProps> = ({
  visible,
  onCancel,
  onSave,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()
  const [personality, setPersonality] = useState(defaultPersonality)
  const [knowledge, setKnowledge] = useState(defaultKnowledge)
  const [behavior, setBehavior] = useState(defaultBehavior)
  const [saving, setSaving] = useState(false)

  const steps = [
    {
      title: '基础信息',
      icon: <UserOutlined />,
      content: (
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="例如：李明" />
          </Form.Item>
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <TextArea
              rows={4}
              placeholder="描述角色的背景、职业、性格特点等..."
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <AIGenerator
                onGenerate={(attributes) => {
                  setPersonality(attributes.personality)
                  setKnowledge(attributes.knowledge)
                  setBehavior(attributes.behavior)
                  message.success('AI生成的属性已应用')
                }}
              />
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      title: '人格特质',
      icon: <BulbOutlined />,
      content: (
        <PersonalityEditor
          value={personality}
          onChange={setPersonality}
        />
      ),
    },
    {
      title: '知识背景',
      icon: <BookOutlined />,
      content: (
        <KnowledgeConfig
          value={knowledge}
          onChange={setKnowledge}
        />
      ),
    },
    {
      title: '行为模式',
      icon: <SettingOutlined />,
      content: (
        <BehaviorSettings
          value={behavior}
          onChange={setBehavior}
        />
      ),
    },
    {
      title: '预览',
      icon: <EyeOutlined />,
      content: (
        <AgentPreview
          basicInfo={form.getFieldsValue()}
          personality={personality}
          knowledge={knowledge}
          behavior={behavior}
        />
      ),
    },
  ]

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields()
        setCurrentStep(currentStep + 1)
      } catch (error) {
        // 验证失败
      }
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const basicInfo = await form.validateFields()
      const agentData = {
        ...basicInfo,
        attributes: {
          personality,
          knowledge,
          behavior,
        },
      }
      await onSave(agentData)
      message.success('角色保存成功')
      handleCancel()
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setCurrentStep(0)
    form.resetFields()
    setPersonality(defaultPersonality)
    setKnowledge(defaultKnowledge)
    setBehavior(defaultBehavior)
    onCancel()
  }

  return (
    <Modal
      title={initialData ? '编辑角色' : '创建角色'}
      visible={visible}
      onCancel={handleCancel}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step) => (
          <Step key={step.title} title={step.title} icon={step.icon} />
        ))}
      </Steps>

      <div style={{ minHeight: 400 }}>
        {steps[currentStep].content}
      </div>

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        {currentStep > 0 && (
          <Button style={{ marginRight: 8 }} onClick={handlePrev}>
            上一步
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={handleNext}>
            下一步
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" loading={saving} onClick={handleSave}>
            保存角色
          </Button>
        )}
      </div>
    </Modal>
  )
}

// 预览组件
const AgentPreview: React.FC<{
  basicInfo: any
  personality: any
  knowledge: any
  behavior: any
}> = ({ basicInfo, personality, knowledge, behavior }) => {
  return (
    <div>
      <h3>角色预览</h3>
      <p><strong>名称：</strong>{basicInfo.name || '未填写'}</p>
      <p><strong>描述：</strong>{basicInfo.description || '未填写'}</p>
      <p><strong>人格特质：</strong></p>
      <ul>
        <li>开放性：{(personality.openness * 100).toFixed(0)}%</li>
        <li>尽责性：{(personality.conscientiousness * 100).toFixed(0)}%</li>
        <li>外向性：{(personality.extraversion * 100).toFixed(0)}%</li>
        <li>宜人性：{(personality.agreeableness * 100).toFixed(0)}%</li>
        <li>神经质：{(personality.neuroticism * 100).toFixed(0)}%</li>
      </ul>
      <p><strong>知识领域：</strong>{knowledge.domains.join(', ') || '未选择'}</p>
      <p><strong>知识深度：</strong>{(knowledge.depth * 100).toFixed(0)}%</p>
      <p><strong>决策风格：</strong>{behavior.decisionStyle}</p>
      <p><strong>影响力：</strong>{behavior.influence}</p>
    </div>
  )
}
