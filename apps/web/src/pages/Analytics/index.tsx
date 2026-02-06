import React, { useState, useEffect } from 'react'
import {
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Button,
  Space,
  Typography,
  Badge,
  Spin,
  Empty,
  message,
} from 'antd'
import {
  BarChartOutlined,
  ShareAltOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { NetworkGraph } from '@/components/NetworkGraph'
import dayjs from 'dayjs'

const { Title } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

// 模拟数据生成
const generateMockNetworkData = () => {
  const categories = [
    { name: '支持者', itemStyle: { color: '#52c41a' } },
    { name: '反对者', itemStyle: { color: '#f5222d' } },
    { name: '中立者', itemStyle: { color: '#faad14' } },
    { name: '意见领袖', itemStyle: { color: '#1890ff' } },
  ]

  const nodes = Array.from({ length: 50 }, (_, i) => ({
    id: `agent-${i}`,
    name: `Agent ${i + 1}`,
    value: Math.floor(Math.random() * 10) + 1,
    category: Math.floor(Math.random() * 4),
    symbolSize: Math.random() * 30 + 20,
  }))

  const edges = []
  for (let i = 0; i < 80; i++) {
    const source = nodes[Math.floor(Math.random() * nodes.length)].id
    const target = nodes[Math.floor(Math.random() * nodes.length)].id
    if (source !== target) {
      edges.push({
        source,
        target,
        value: Math.random() * 5 + 1,
      })
    }
  }

  return { nodes, edges, categories }
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('network')
  const [loading, setLoading] = useState(false)
  const [networkData, setNetworkData] = useState<any>(null)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, 'day'),
    dayjs(),
  ])

  // 加载网络数据
  const loadNetworkData = async () => {
    setLoading(true)
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const data = generateMockNetworkData()
      setNetworkData(data)
    } catch (error) {
      message.error('加载网络数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadNetworkData()
  }, [])

  // 处理节点点击
  const handleNodeClick = (node: any) => {
    message.info(`选中节点: ${node.name}`)
  }

  // 处理边点击
  const handleEdgeClick = (edge: any) => {
    message.info(`选中连接: ${edge.source} → ${edge.target}`)
  }

  // 导出报告
  const handleExportReport = () => {
    message.success('报告导出成功')
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <BarChartOutlined /> 分析中心
      </Title>

      {/* 筛选栏 */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
          />
          <Select defaultValue="all" style={{ width: 120 }}>
            <Option value="all">全部场景</Option>
            <Option value="active">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Button icon={<FilterOutlined />}>筛选</Button>
          <Button icon={<ReloadOutlined />} onClick={loadNetworkData}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportReport}>
            导出报告
          </Button>
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总Agent数"
              value={networkData?.nodes.length || 0}
              prefix={<Badge color="blue" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总连接数"
              value={networkData?.edges.length || 0}
              prefix={<Badge color="green" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="平均度数"
              value={networkData ? ((networkData.edges.length * 2) / networkData.nodes.length).toFixed(2) : 0}
              prefix={<Badge color="orange" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="网络密度"
              value={networkData ? ((networkData.edges.length / ((networkData.nodes.length * (networkData.nodes.length - 1)) / 2)) * 100).toFixed(2) : 0}
              suffix="%"
              prefix={<Badge color="purple" />}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          tab={
            <span>
              <ShareAltOutlined />
              网络关系图
            </span>
          }
          key="network"
        >
          {loading ? (
            <Card style={{ height: 600 }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" tip="加载网络数据中..." />
              </div>
            </Card>
          ) : networkData ? (
            <NetworkGraph
              nodes={networkData.nodes}
              edges={networkData.edges}
              categories={networkData.categories}
              height={600}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
            />
          ) : (
            <Empty description="暂无网络数据" />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <LineChartOutlined />
              趋势分析
            </span>
          }
          key="trends"
        >
          <Card title="观点演化趋势" style={{ height: 600 }}>
            <Empty description="趋势分析功能开发中..." />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <PieChartOutlined />
              分布统计
            </span>
          }
          key="distribution"
        >
          <Card title="观点分布统计" style={{ height: 600 }}>
            <Empty description="分布统计功能开发中..." />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}
