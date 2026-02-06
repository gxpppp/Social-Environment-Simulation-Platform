import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, Typography, Badge, Space } from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  DashboardOutlined,
  TeamOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Dashboard as DashboardComponent } from '@/components/Dashboard'

const { Title, Text } = Typography

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [metrics, setMetrics] = useState({
    supportRate: 67,
    opposeRate: 23,
    neutralRate: 10,
    networkDensity: 0.34,
    avgDegree: 3.2,
    clusteringCoefficient: 0.45,
    agentCount: 50,
    edgeCount: 80,
    tickCount: 67,
  })

  // 生成历史数据
  const generateHistoryData = () => {
    const support = []
    const oppose = []
    const neutral = []
    const density = []

    for (let i = 0; i < 20; i++) {
      const timestamp = Date.now() - (19 - i) * 60000
      support.push({
        timestamp,
        value: 60 + Math.sin(i / 3) * 10 + Math.random() * 5,
      })
      oppose.push({
        timestamp,
        value: 25 + Math.cos(i / 4) * 5 + Math.random() * 3,
      })
      neutral.push({
        timestamp,
        value: 15 + Math.sin(i / 5) * 3 + Math.random() * 2,
      })
      density.push({
        timestamp,
        value: 0.3 + Math.sin(i / 6) * 0.05,
      })
    }

    return { support, oppose, neutral, density }
  }

  const [historyData] = useState(generateHistoryData())

  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        supportRate: Math.min(100, Math.max(0, prev.supportRate + (Math.random() - 0.5) * 2)),
        opposeRate: Math.min(100, Math.max(0, prev.opposeRate + (Math.random() - 0.5) * 2)),
        neutralRate: Math.min(100, Math.max(0, prev.neutralRate + (Math.random() - 0.5) * 2)),
        tickCount: prev.tickCount < 100 ? prev.tickCount + 1 : prev.tickCount,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <DashboardOutlined /> 工作台
      </Title>

      {/* 快速开始 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/scenes')}
            style={{ textAlign: 'center', height: '100%' }}
          >
            <PlusOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0 }}>创建场景</Title>
            <Text type="secondary">开始一个新的模拟场景</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/agents')}
            style={{ textAlign: 'center', height: '100%' }}
          >
            <TeamOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0 }}>管理角色</Title>
            <Text type="secondary">创建和配置AI角色</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/simulation')}
            style={{ textAlign: 'center', height: '100%' }}
          >
            <PlayCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0 }}>运行模拟</Title>
            <Text type="secondary">查看正在运行的模拟</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            onClick={() => navigate('/analytics')}
            style={{ textAlign: 'center', height: '100%' }}
          >
            <FileTextOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
            <Title level={4} style={{ margin: 0 }}>分析报告</Title>
            <Text type="secondary">查看分析结果和报告</Text>
          </Card>
        </Col>
      </Row>

      {/* 实时指标仪表盘 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined />
            <span>实时指标</span>
            <Badge status="processing" text="实时更新" />
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <DashboardComponent
          supportRate={metrics.supportRate}
          opposeRate={metrics.opposeRate}
          neutralRate={metrics.neutralRate}
          networkDensity={metrics.networkDensity}
          avgDegree={metrics.avgDegree}
          clusteringCoefficient={metrics.clusteringCoefficient}
          agentCount={metrics.agentCount}
          edgeCount={metrics.edgeCount}
          tickCount={metrics.tickCount}
          historyData={historyData}
        />
      </Card>

      {/* 统计信息 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <ExperimentOutlined />
                  <span>场景总数</span>
                </Space>
              }
              value={12}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <TeamOutlined />
                  <span>AI角色</span>
                </Space>
              }
              value={156}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <PlayCircleOutlined />
                  <span>运行中</span>
                </Space>
              }
              value={3}
              suffix="个"
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined />
                  <span>已完成</span>
                </Space>
              }
              value={28}
              suffix="次"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
