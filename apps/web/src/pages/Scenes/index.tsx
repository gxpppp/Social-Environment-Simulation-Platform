import React, { useState, useEffect } from 'react'
import { Card, Button, Table, Tag, Space, message, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, PlayCircleOutlined, DeleteOutlined } from '@ant-design/icons'
import { SceneEditor } from '@/components/SceneEditor'
import api from '@/services/api'

interface Scene {
  id: string
  name: string
  description: string
  type: string
  status: string
  config: {
    duration: number
    timeStep: string
    agents: Array<{
      agentId: string
      initialStance: number
      role: string
    }>
  }
  createdAt: string
}

// 场景类型映射
const sceneTypeMap: Record<string, { label: string; color: string; icon: string }> = {
  policy: { label: '政策评估', color: 'blue', icon: '📋' },
  opinion: { label: '舆论演化', color: 'green', icon: '💬' },
  market: { label: '市场分析', color: 'orange', icon: '📊' },
  training: { label: '团队培训', color: 'purple', icon: '🎓' },
}

// 状态映射
const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  ready: { label: '就绪', color: 'processing' },
  running: { label: '运行中', color: 'blue' },
  completed: { label: '已完成', color: 'green' },
}

export const Scenes: React.FC = () => {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(false)
  const [editorVisible, setEditorVisible] = useState(false)
  const [editingScene, setEditingScene] = useState<Scene | null>(null)

  // 加载场景列表
  const loadScenes = async () => {
    try {
      setLoading(true)
      const data = await api.get('/scenes')
      setScenes(data)
    } catch (error) {
      message.error('加载场景列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScenes()
  }, [])

  // 创建场景
  const handleCreate = () => {
    setEditingScene(null)
    setEditorVisible(true)
  }

  // 编辑场景
  const handleEdit = (scene: Scene) => {
    setEditingScene(scene)
    setEditorVisible(true)
  }

  // 保存场景
  const handleSave = async (sceneData: any) => {
    try {
      if (editingScene) {
        await api.put(`/scenes/${editingScene.id}`, sceneData)
        message.success('场景更新成功')
      } else {
        await api.post('/scenes', sceneData)
        message.success('场景创建成功')
      }
      loadScenes()
      setEditorVisible(false)
    } catch (error) {
      message.error('保存失败')
    }
  }

  // 删除场景
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/scenes/${id}`)
      message.success('场景删除成功')
      loadScenes()
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 运行场景
  const handleRun = async (scene: Scene) => {
    try {
      await api.post('/simulations', {
        sceneId: scene.id,
        config: scene.config,
      })
      message.success('模拟启动成功')
    } catch (error) {
      message.error('启动失败')
    }
  }

  const columns = [
    {
      title: '场景名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Scene) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const info = sceneTypeMap[type] || { label: type, color: 'default', icon: '' }
        return (
          <Tag color={info.color}>
            {info.icon} {info.label}
          </Tag>
        )
      },
    },
    {
      title: 'Agent数',
      key: 'agentCount',
      width: 100,
      render: (_: any, record: Scene) => record.config?.agents?.length || 0,
    },
    {
      title: '时长',
      key: 'duration',
      width: 100,
      render: (_: any, record: Scene) => `${record.config?.duration || 0}天`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = statusMap[status] || { label: status, color: 'default' }
        return <Tag color={info.color}>{info.label}</Tag>
      },
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
      width: 200,
      render: (_: any, record: Scene) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            icon={<PlayCircleOutlined />}
            size="small"
            onClick={() => handleRun(record)}
            disabled={record.status === 'running'}
          >
            运行
          </Button>
          <Popconfirm
            title="确定要删除这个场景吗？"
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>场景管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建场景
        </Button>
      </div>
      <Card>
        <Table
          dataSource={scenes}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <SceneEditor
        visible={editorVisible}
        onCancel={() => setEditorVisible(false)}
        onSave={handleSave}
        initialData={editingScene}
      />
    </div>
  )
}
