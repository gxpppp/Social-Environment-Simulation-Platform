import React, { useState, useEffect } from 'react'
import {
  Card,
  Button,
  Progress,
  Statistic,
  Row,
  Col,
  Tabs,
  Badge,
  Space,
  Typography,
  Slider,
  Switch,
  Tooltip,
} from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  StepForwardOutlined,
  ReloadOutlined,
  SettingOutlined,
  LineChartOutlined,
  HistoryOutlined,
  ShareAltOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { EventTimeline, TimelineEvent, EventType } from '@/components/EventTimeline'
import { NetworkGraph } from '@/components/NetworkGraph'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// 模拟事件数据生成
const generateMockEvents = (count: number): TimelineEvent[] => {
  const events: TimelineEvent[] = []
  const types = Object.values(EventType)
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const tick = Math.floor(Math.random() * 100) + 1
    
    events.push({
      id: `evt-${i}`,
      tick,
      timestamp: dayjs().subtract(Math.random() * 60, 'minutes').toISOString(),
      type,
      source: `Agent ${Math.floor(Math.random() * 50) + 1}`,
      target: Math.random() > 0.5 ? `Agent ${Math.floor(Math.random() * 50) + 1}` : undefined,
      description: generateEventDescription(type),
      impact: (Math.random() - 0.5) * 2 * (Math.random() * 0.5 + 0.1),
      metadata: {
        oldOpinion: Math.random() > 0.5 ? Math.random() * 0.5 : undefined,
        newOpinion: Math.random() > 0.5 ? Math.random() * 0.5 + 0.5 : undefined,
      }
    })
  }
  
  return events.sort((a, b) => b.tick - a.tick)
}

// 生成事件描述
const generateEventDescription = (type: EventType): string => {
  const descriptions: Record<EventType, string[]> = {
    [EventType.OPINION_CHANGE]: [
      '观点发生显著变化，从反对转向支持',
      '受到外部信息影响，态度趋于中立',
      '经过深思熟虑，立场更加坚定',
      '受同伴影响，观点发生转变',
    ],
    [EventType.INTERACTION]: [
      '与邻近Agent进行信息交换',
      '在社交媒体上发布观点',
      '回应了其他Agent的质疑',
      '主动寻求更多信息和观点',
    ],
    [EventType.NETWORK_CHANGE]: [
      '建立了新的社交连接',
      '与意见不合者断开连接',
      '关系强度发生变化',
      '加入了新的社群',
    ],
    [EventType.EXTERNAL_EVENT]: [
      '媒体报道了相关政策',
      '专家发表了权威观点',
      '发生了重大社会事件',
      '新的研究结果发布',
    ],
    [EventType.SYSTEM_EVENT]: [
      '模拟参数调整',
      '数据同步完成',
      '系统状态更新',
      '配置变更生效',
    ],
  }
  
  const list = descriptions[type]
  return list[Math.floor(Math.random() * list.length)]
}

// 模拟网络数据
const generateMockNetworkData = () => {
  const categories = [
    { name: '支持者', itemStyle: { color: '#52c41a' } },
    { name: '反对者', itemStyle: { color: '#f5222d' } },
    { name: '中立者', itemStyle: { color: '#faad14' } },
    { name: '意见领袖', itemStyle: { color: '#1890ff' } },
  ]

  const nodes = Array.from({ length: 30 }, (_, i) => ({
    id: `agent-${i}`,
    name: `Agent ${i + 1}`,
    value: Math.floor(Math.random() * 10) + 1,
    category: Math.floor(Math.random() * 4),
    symbolSize: Math.random() * 20 + 15,
  }))

  const edges = []
  for (let i = 0; i < 50; i++) {
    const source = nodes[Math.floor(Math.random() * nodes.length)].id
    const target = nodes[Math.floor(Math.random() * nodes.length)].id
    if (source !== target) {
      edges.push({
        source,
        target,
        value: Math.random() * 3 + 1,
      })
    }
  }

  return { nodes, edges, categories }
}

export const Simulation: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTick, setCurrentTick] = useState(67)
  const [totalTicks, setTotalTicks] = useState(100)
  const [speed, setSpeed] = useState(1)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [networkData, setNetworkData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('events')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 初始加载
  useEffect(() => {
    setEvents(generateMockEvents(20))
    setNetworkData(generateMockNetworkData())
  }, [])

  // 模拟运行效果
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && currentTick < totalTicks) {
      interval = setInterval(() => {
        setCurrentTick(prev => {
          const next = prev + 1
          if (next >= totalTicks) {
            setIsRunning(false)
          }
          // 随机添加新事件
          if (Math.random() > 0.7 && autoRefresh) {
            const newEvents = generateMockEvents(1)
            newEvents[0].tick = next
            setEvents(prevEvents => [newEvents[0], ...prevEvents].slice(0, 50))
          }
          return next
        })
      }, 1000 / speed)
    }
    return () => clearInterval(interval)
  }, [isRunning, currentTick, totalTicks, speed, autoRefresh])

  // 控制操作
  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleStop = () => {
    setIsRunning(false)
    setCurrentTick(0)
  }
  const handleStep = () => {
    if (currentTick < totalTicks) {
      setCurrentTick(prev => prev + 1)
    }
  }
  const handleReset = () => {
    setIsRunning(false)
    setCurrentTick(0)
    setEvents(generateMockEvents(20))
  }

  // 处理事件点击
  const handleEventClick = (event: TimelineEvent) => {
    console.log('Event clicked:', event)
  }

  // 处理节点点击
  const handleNodeClick = (node: any) => {
    console.log('Node clicked:', node)
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <ThunderboltOutlined /> 模拟控制
      </Title>

      {/* 主控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={12}>
            <Progress 
              percent={Math.round((currentTick / totalTicks) * 100)} 
              status={isRunning ? "active" : "normal"}
              strokeColor={{ from: '#108ee9', to: '#87d068' }}
            />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <Text>Tick: <Text strong>{currentTick}</Text> / {totalTicks}</Text>
              <Text>模拟时间: 第{currentTick}天</Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              {!isRunning ? (
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  onClick={handleStart}
                  disabled={currentTick >= totalTicks}
                >
                  开始
                </Button>
              ) : (
                <Button 
                  icon={<PauseCircleOutlined />} 
                  onClick={handlePause}
                >
                  暂停
                </Button>
              )}
              <Button 
                icon={<StepForwardOutlined />} 
                onClick={handleStep}
                disabled={isRunning || currentTick >= totalTicks}
              >
                单步
              </Button>
              <Button 
                danger 
                icon={<StopOutlined />}
                onClick={handleStop}
              >
                停止
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 速度控制 */}
        <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
          <Row align="middle">
            <Col xs={24} md={8}>
              <Text type="secondary">模拟速度: {speed}x</Text>
              <Slider
                min={0.5}
                max={5}
                step={0.5}
                value={speed}
                onChange={setSpeed}
                marks={{ 0.5: '0.5x', 1: '1x', 2.5: '2.5x', 5: '5x' }}
              />
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="自动刷新"
                unCheckedChildren="手动刷新"
              />
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <Badge 
                status={isRunning ? "processing" : "default"} 
                text={isRunning ? "运行中" : "已暂停"}
              />
            </Col>
          </Row>
        </div>
      </Card>

      {/* 实时指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="支持率" 
              value={67 + Math.sin(currentTick / 10) * 10} 
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="反对率" 
              value={23 + Math.cos(currentTick / 10) * 5} 
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="中立率" 
              value={10 - Math.sin(currentTick / 10) * 5} 
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic 
              title="网络密度" 
              value={0.34 + Math.sin(currentTick / 20) * 0.1}
              precision={3}
            />
          </Card>
        </Col>
      </Row>

      {/* 可视化标签页 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane
          tab={
            <span>
              <HistoryOutlined />
              事件流
            </span>
          }
          key="events"
        >
          <EventTimeline
            events={events}
            height={600}
            onEventClick={handleEventClick}
          />
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <ShareAltOutlined />
              网络视图
            </span>
          }
          key="network"
        >
          {networkData && (
            <NetworkGraph
              nodes={networkData.nodes}
              edges={networkData.edges}
              categories={networkData.categories}
              height={600}
              onNodeClick={handleNodeClick}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <LineChartOutlined />
              趋势图
            </span>
          }
          key="trends"
        >
          <Card title="观点演化趋势" style={{ height: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Text type="secondary">趋势图表功能开发中...</Text>
            </div>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane
          tab={
            <span>
              <SettingOutlined />
              配置
            </span>
          }
          key="config"
        >
          <Card title="模拟配置">
            <div style={{ padding: 24 }}>
              <Text>当前Tick: {currentTick}</Text>
              <br />
              <Text>总Ticks: {totalTicks}</Text>
              <br />
              <Text>进度: {((currentTick / totalTicks) * 100).toFixed(1)}%</Text>
              <br />
              <Text>运行状态: {isRunning ? '运行中' : '已暂停'}</Text>
            </div>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default Simulation
