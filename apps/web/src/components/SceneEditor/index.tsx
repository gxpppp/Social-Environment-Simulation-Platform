import React, { useState } from 'react'
import { Modal, Steps, Button, Form, message } from 'antd'
import { 
  FileTextOutlined, 
  EnvironmentOutlined, 
  SettingOutlined,
  TeamOutlined,
  EyeOutlined
} from '@ant-design/icons'
import BasicConfig from './BasicConfig'
import { AgentAssignment } from './AgentAssignment'

const { Step } = Steps

interface SceneEditorProps {
  visible: boolean
  onCancel: () => void
  onSave: (sceneData: any) => void
  initialData?: any
}

const defaultBasicConfig = {
  name: '',
  description: '',
  type: 'policy',
  duration: 90,
  timeStep: 'day',
}

const defaultAgentAssignment: Array<{
  agentId: string
  initialStance: number
  role: string
}> = []

export const SceneEditor: React.FC<SceneEditorProps> = ({
  visible,
  onCancel,
  onSave,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [basicConfig, setBasicConfig] = useState(defaultBasicConfig)
  const [agentAssignment, setAgentAssignment] = useState(defaultAgentAssignment)
  const [saving, setSaving] = useState(false)

  const steps = [
    {
      title: '基础配置',
      icon: <FileTextOutlined />,
      content: (
        <BasicConfig
          value={basicConfig}
          onChange={setBasicConfig}
        />
      ),
    },
    {
      title: 'Agent分配',
      icon: <TeamOutlined />,
      content: (
        <AgentAssignment
          value={agentAssignment}
          onChange={setAgentAssignment}
        />
      ),
    },
    {
      title: '预览',
      icon: <EyeOutlined />,
      content: (
        <ScenePreview
          basicConfig={basicConfig}
          agentAssignment={agentAssignment}
        />
      ),
    },
  ]

  const handleNext = () => {
    // 验证当前步骤
    if (currentStep === 0) {
      if (!basicConfig.name.trim()) {
        message.error('请输入场景名称')
        return
      }
      if (!basicConfig.description.trim()) {
        message.error('请输入场景描述')
        return
      }
    }

    if (currentStep === 1) {
      if (agentAssignment.length === 0) {
        message.error('请至少选择一个Agent')
        return
      }
    }

    setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const sceneData = {
        name: basicConfig.name,
        description: basicConfig.description,
        type: basicConfig.type,
        config: {
          duration: basicConfig.duration,
          timeStep: basicConfig.timeStep,
          agents: agentAssignment,
        },
      }
      await onSave(sceneData)
      message.success('场景保存成功')
      handleCancel()
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setCurrentStep(0)
    setBasicConfig(defaultBasicConfig)
    setAgentAssignment(defaultAgentAssignment)
    onCancel()
  }

  return (
    <Modal
      title={initialData ? '编辑场景' : '创建场景'}
      visible={visible}
      onCancel={handleCancel}
      width={1200}
      footer={null}
      destroyOnClose
    >
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step) => (
          <Step key={step.title} title={step.title} icon={step.icon} />
        ))}
      </Steps>

      <div style={{ minHeight: 500 }}>
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
            保存场景
          </Button>
        )}
      </div>
    </Modal>
  )
}

// 场景预览组件
const ScenePreview: React.FC<{
  basicConfig: any
  agentAssignment: any[]
}> = ({ basicConfig, agentAssignment }) => {
  const sceneTypeMap: Record<string, string> = {
    policy: '政策评估',
    opinion: '舆论演化',
    market: '市场分析',
    training: '团队培训',
  }

  const timeStepMap: Record<string, string> = {
    day: '1天',
    week: '1周',
    month: '1月',
  }

  return (
    <div>
      <h3>场景配置预览</h3>
      
      <div style={{ marginBottom: 24 }}>
        <h4>基础信息</h4>
        <p><strong>场景名称：</strong>{basicConfig.name || '未填写'}</p>
        <p><strong>场景描述：</strong>{basicConfig.description || '未填写'}</p>
        <p><strong>场景类型：</strong>{sceneTypeMap[basicConfig.type] || basicConfig.type}</p>
        <p><strong>模拟时长：</strong>{basicConfig.duration} 天</p>
        <p><strong>时间步长：</strong>{timeStepMap[basicConfig.timeStep]}</p>
        <p><strong>预计Tick数：</strong>
          {Math.ceil(basicConfig.duration / (basicConfig.timeStep === 'day' ? 1 : basicConfig.timeStep === 'week' ? 7 : 30))}
        </p>
      </div>

      <div>
        <h4>Agent配置</h4>
        <p><strong>参与Agent数：</strong>{agentAssignment.length} 个</p>
        
        {agentAssignment.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p><strong>立场分布：</strong></p>
            <ul>
              <li>支持：{agentAssignment.filter((a) => a.initialStance > 0.3).length} 个</li>
              <li>中立：{agentAssignment.filter((a) => a.initialStance >= -0.3 && a.initialStance <= 0.3).length} 个</li>
              <li>反对：{agentAssignment.filter((a) => a.initialStance < -0.3).length} 个</li>
            </ul>

            <p style={{ marginTop: 16 }}><strong>角色分布：</strong></p>
            <ul>
              {Object.entries(
                agentAssignment.reduce((acc, a) => {
                  acc[a.role] = (acc[a.role] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([role, count]) => (
                <li key={role}>
                  {getRoleLabel(role as string)}: {count as number} 个
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ marginTop: 24, padding: 16, background: '#f6ffed', borderRadius: 4 }}>
        <p style={{ margin: 0 }}>
          <strong>配置检查：</strong>
          {agentAssignment.length > 0 && basicConfig.name && basicConfig.description
            ? '✅ 配置完整，可以保存'
            : '⚠️ 请完善配置信息'}
        </p>
      </div>
    </div>
  )
}

// 获取角色标签
const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    participant: '普通参与者',
    opinion_leader: '意见领袖',
    expert: '专家',
    media: '媒体',
    official: '官方',
  }
  return roleMap[role] || role
}
