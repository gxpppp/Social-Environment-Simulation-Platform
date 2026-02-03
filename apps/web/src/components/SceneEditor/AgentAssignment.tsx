import React, { useState, useEffect } from 'react'
import { Card, Transfer, Slider, Tag, Typography, Row, Col, Button, message } from 'antd'
import { UserOutlined, TeamOutlined, PlusOutlined } from '@ant-design/icons'
import api from '@/services/api'

const { Text } = Typography

interface Agent {
  id: string
  name: string
  description: string
  attributes: {
    personality: {
      openness: number
      conscientiousness: number
      extraversion: number
      agreeableness: number
      neuroticism: number
    }
    behavior: {
      decisionStyle: string
      influence: string
    }
  }
}

interface AssignedAgent {
  agentId: string
  initialStance: number
  role: string
}

interface AgentAssignmentProps {
  value: AssignedAgent[]
  onChange: (value: AssignedAgent[]) => void
}

// 角色类型
const roleTypes = [
  { value: 'participant', label: '普通参与者', color: 'blue' },
  { value: 'opinion_leader', label: '意见领袖', color: 'red' },
  { value: 'expert', label: '专家', color: 'purple' },
  { value: 'media', label: '媒体', color: 'orange' },
  { value: 'official', label: '官方', color: 'green' },
]

export const AgentAssignment: React.FC<AgentAssignmentProps> = ({
  value,
  onChange,
}) => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 加载Agent列表
  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const data = await api.get('/agents')
      setAgents(data)
    } catch (error) {
      message.error('加载角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理Transfer变化
  const handleTransferChange = (nextTargetKeys: string[]) => {
    const newAssignments: AssignedAgent[] = nextTargetKeys.map((agentId) => {
      const existing = value.find((a) => a.agentId === agentId)
      return (
        existing || {
          agentId,
          initialStance: 0,
          role: 'participant',
        }
      )
    })
    onChange(newAssignments)
  }

  // 更新Agent配置
  const updateAgentConfig = (agentId: string, updates: Partial<AssignedAgent>) => {
    const newValue = value.map((agent) =>
      agent.agentId === agentId ? { ...agent, ...updates } : agent
    )
    onChange(newValue)
  }

  // 渲染Transfer列表项
  const renderItem = (item: Agent) => ({
    key: item.id,
    title: item.name,
    description: item.description,
    disabled: false,
  })

  // 获取已选Agent的详细信息
  const getSelectedAgents = (): Agent[] => {
    return agents.filter((agent) => value.some((a) => a.agentId === agent.id))
  }

  // 生成Agent标签
  const generateAgentTags = (agent: Agent): string[] => {
    const tags: string[] = []
    const { personality, behavior } = agent.attributes

    if (personality.openness > 0.7) tags.push('创新者')
    if (personality.extraversion > 0.7) tags.push('社交达人')
    if (personality.conscientiousness > 0.7) tags.push('可靠')
    if (personality.agreeableness > 0.7) tags.push('友善')

    if (behavior.influence === 'national') tags.push('大V')
    else if (behavior.influence === 'regional') tags.push('KOL')

    return tags
  }

  const selectedAgents = getSelectedAgents()

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Agent选择 */}
        <Col span={24}>
          <Card title="选择参与Agent" bordered={false}>
            <Transfer
              dataSource={agents.map(renderItem)}
              titles={['可用角色', '已选角色']}
              targetKeys={value.map((a) => a.agentId)}
              onChange={handleTransferChange}
              render={(item) => (
                <div>
                  <Text strong>{item.title}</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                    {item.description?.substring(0, 30)}...
                  </Text>
                </div>
              )}
              listStyle={{
                width: '45%',
                height: 400,
              }}
              loading={loading}
            />
          </Card>
        </Col>

        {/* 已选Agent配置 */}
        {selectedAgents.length > 0 && (
          <Col span={24}>
            <Card title={`已选Agent配置 (${selectedAgents.length}个)`} bordered={false}>
              <Row gutter={[16, 16]}>
                {selectedAgents.map((agent) => {
                  const assignment = value.find((a) => a.agentId === agent.id)!
                  const tags = generateAgentTags(agent)

                  return (
                    <Col span={12} key={agent.id}>
                      <Card size="small" title={agent.name}>
                        <div style={{ marginBottom: 12 }}>
                          {tags.map((tag) => (
                            <Tag key={tag} size="small" style={{ margin: '2px 4px 2px 0' }}>
                              {tag}
                            </Tag>
                          ))}
                        </div>

                        {/* 初始立场 */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text strong>初始立场</Text>
                            <Tag color={getStanceColor(assignment.initialStance)}>
                              {getStanceLabel(assignment.initialStance)}
                            </Tag>
                          </div>
                          <Slider
                            value={assignment.initialStance}
                            onChange={(val) => updateAgentConfig(agent.id, { initialStance: val })}
                            min={-1}
                            max={1}
                            step={0.1}
                            marks={{
                              '-1': '反对',
                              '0': '中立',
                              '1': '支持',
                            }}
                          />
                        </div>

                        {/* 角色类型 */}
                        <div>
                          <Text strong style={{ display: 'block', marginBottom: 8 }}>
                            角色类型
                          </Text>
                          <div>
                            {roleTypes.map((role) => (
                              <Tag
                                key={role.value}
                                color={assignment.role === role.value ? role.color : 'default'}
                                style={{ cursor: 'pointer', margin: '2px 4px 2px 0' }}
                                onClick={() =>
                                  updateAgentConfig(agent.id, { role: role.value })
                                }
                              >
                                {role.label}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      </Card>
                    </Col>
                  )
                })}
              </Row>
            </Card>
          </Col>
        )}

        {/* 配置摘要 */}
        <Col span={24}>
          <Card title="Agent配置摘要" bordered={false}>
            <AgentAssignmentSummary selectedAgents={selectedAgents} assignments={value} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

// 获取立场颜色
const getStanceColor = (stance: number): string => {
  if (stance < -0.3) return 'red'
  if (stance > 0.3) return 'green'
  return 'default'
}

// 获取立场标签
const getStanceLabel = (stance: number): string => {
  if (stance < -0.3) return '反对'
  if (stance > 0.3) return '支持'
  return '中立'
}

// 配置摘要组件
const AgentAssignmentSummary: React.FC<{
  selectedAgents: Agent[]
  assignments: AssignedAgent[]
}> = ({ selectedAgents, assignments }) => {
  if (selectedAgents.length === 0) {
    return <Text type="secondary">请至少选择一个Agent参与模拟</Text>
  }

  // 统计立场分布
  const stanceDistribution = {
    support: assignments.filter((a) => a.initialStance > 0.3).length,
    oppose: assignments.filter((a) => a.initialStance < -0.3).length,
    neutral: assignments.filter((a) => a.initialStance >= -0.3 && a.initialStance <= 0.3).length,
  }

  // 统计角色分布
  const roleDistribution: Record<string, number> = {}
  assignments.forEach((a) => {
    roleDistribution[a.role] = (roleDistribution[a.role] || 0) + 1
  })

  return (
    <div>
      <Row gutter={[24, 16]}>
        <Col span={8}>
          <Text strong>Agent总数：</Text>
          <span style={{ marginLeft: 8 }}>{selectedAgents.length} 个</span>
        </Col>
        <Col span={8}>
          <Text strong>意见领袖：</Text>
          <span style={{ marginLeft: 8 }}>
            {assignments.filter((a) => a.role === 'opinion_leader').length} 个
          </span>
        </Col>
        <Col span={8}>
          <Text strong>专家：</Text>
          <span style={{ marginLeft: 8 }}>
            {assignments.filter((a) => a.role === 'expert').length} 个
          </span>
        </Col>
      </Row>

      <div style={{ marginTop: 16 }}>
        <Text strong>初始立场分布：</Text>
        <div style={{ marginTop: 8 }}>
          <Tag color="green">支持: {stanceDistribution.support}</Tag>
          <Tag color="default">中立: {stanceDistribution.neutral}</Tag>
          <Tag color="red">反对: {stanceDistribution.oppose}</Tag>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary">
          已配置 {selectedAgents.length} 个Agent参与模拟，
          其中 {stanceDistribution.support} 个初始支持，
          {stanceDistribution.oppose} 个初始反对，
          {stanceDistribution.neutral} 个持中立态度。
        </Text>
      </div>
    </div>
  )
}
