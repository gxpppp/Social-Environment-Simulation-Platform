import React, { useState, useEffect } from 'react'
import { Card, Button, Table, Avatar, Tag, Space, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { AgentEditor } from '@/components/AgentEditor'
import { ImportButton } from '@/components/ImportButton'
import { BatchOperations } from '@/components/BatchOperations'
import api from '@/services/api'

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
  }
  status: string
  createdAt: string
}

// 根据人格特质生成标签
const generatePersonalityTags = (personality: Agent['attributes']['personality']): string[] => {
  const tags: string[] = []
  if (personality.openness > 0.7) tags.push('富有创造力')
  else if (personality.openness < 0.3) tags.push('传统稳重')
  
  if (personality.extraversion > 0.7) tags.push('外向活跃')
  else if (personality.extraversion < 0.3) tags.push('内向沉稳')
  
  if (personality.conscientiousness > 0.7) tags.push('高度自律')
  
  if (personality.agreeableness > 0.7) tags.push('友善合作')
  
  return tags
}

export const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  // 加载角色列表
  const loadAgents = async () => {
    try {
      setLoading(true)
      const data = await api.get('/agents') as Agent[]
      setAgents(data)
    } catch (error) {
      message.error('加载角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  // 创建角色
  const handleCreate = () => {
    setEditingAgent(null)
    setEditorVisible(true)
  }

  // 编辑角色
  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setEditorVisible(true)
  }

  // 保存角色
  const handleSave = async (agentData: any) => {
    try {
      if (editingAgent) {
        await api.put(`/agents/${editingAgent.id}`, agentData)
        message.success('角色更新成功')
      } else {
        await api.post('/agents', agentData)
        message.success('角色创建成功')
      }
      loadAgents()
      setEditorVisible(false)
    } catch (error) {
      message.error('保存失败')
    }
  }

  // 删除角色
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/agents/${id}`)
      message.success('角色删除成功')
      loadAgents()
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 批量导入成功回调
  const handleImportSuccess = (data: any[]) => {
    message.success(`成功导入 ${data.length} 个角色`)
    loadAgents()
  }

  // 批量删除
  const handleBatchDelete = async (keys: React.Key[]) => {
    await Promise.all(keys.map((key) => api.delete(`/agents/${key}`)))
    loadAgents()
    setSelectedRowKeys([])
  }

  // 批量复制
  const handleBatchCopy = async (keys: React.Key[]) => {
    const agentsToCopy = agents.filter((a) => keys.includes(a.id))
    await Promise.all(
      agentsToCopy.map((agent) =>
        api.post('/agents', {
          ...agent,
          name: `${agent.name} (复制)`,
          id: undefined,
          createdAt: undefined,
        })
      )
    )
    loadAgents()
    setSelectedRowKeys([])
  }

  const columns = [
    {
      title: '头像',
      key: 'avatar',
      width: 80,
      render: (_: any, record: Agent) => (
        <Avatar size="large" style={{ backgroundColor: getAvatarColor(record.name) }}>
          {record.name.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '人格特质',
      key: 'personality',
      width: 200,
      render: (_: any, record: Agent) => {
        const tags = generatePersonalityTags(record.attributes.personality)
        return (
          <div>
            {tags.map((tag) => (
              <Tag key={tag} style={{ margin: '2px 4px 2px 0', fontSize: 12 }}>
                {tag}
              </Tag>
            ))}
          </div>
        )
      },
    },
    {
      title: '决策风格',
      key: 'decisionStyle',
      width: 100,
      render: (_: any, record: Agent) => {
        const styleMap: Record<string, string> = {
          rational: '理性型',
          intuitive: '直觉型',
          dependent: '依赖型',
        }
        return <Tag color="blue">{styleMap[record.attributes.behavior.decisionStyle]}</Tag>
      },
    },
    {
      title: '影响力',
      key: 'influence',
      width: 100,
      render: (_: any, record: Agent) => {
        const influenceMap: Record<string, { label: string; color: string }> = {
          local: { label: '本地', color: 'green' },
          regional: { label: '区域', color: 'blue' },
          national: { label: '全国', color: 'red' },
        }
        const info = influenceMap[record.attributes.behavior.influence]
        return <Tag color={info.color}>{info.label}</Tag>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '活跃' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Agent) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 根据名称生成头像颜色
  const getAvatarColor = (name: string): string => {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2']
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>角色管理</h1>
        <BatchOperations
          selectedKeys={selectedRowKeys}
          onClearSelection={() => setSelectedRowKeys([])}
          onDelete={handleBatchDelete}
          onCopy={handleBatchCopy}
          entityName="角色"
        >
          <ImportButton type="agents" onSuccess={handleImportSuccess} />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            创建角色
          </Button>
        </BatchOperations>
      </div>
      <Card>
        <Table
          dataSource={agents}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </Card>

      <AgentEditor
        visible={editorVisible}
        onCancel={() => setEditorVisible(false)}
        onSave={handleSave}
        initialData={editingAgent}
      />
    </div>
  )
}
