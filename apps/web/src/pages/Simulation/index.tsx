import React from 'react'
import { Card, Button, Progress, Statistic, Row, Col, Timeline } from 'antd'
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StopOutlined,
  StepForwardOutlined,
} from '@ant-design/icons'

export const Simulation: React.FC = () => {
  return (
    <div>
      <h1>模拟控制</h1>

      {/* 控制面板 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={12}>
            <Progress percent={67} status="active" />
            <div style={{ marginTop: 8 }}>
              Tick: 67/100 | 模拟时间: 第67天
            </div>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button icon={<PlayCircleOutlined />} style={{ marginRight: 8 }}>
              继续
            </Button>
            <Button icon={<PauseCircleOutlined />} style={{ marginRight: 8 }}>
              暂停
            </Button>
            <Button icon={<StepForwardOutlined />} style={{ marginRight: 8 }}>
              单步
            </Button>
            <Button danger icon={<StopOutlined />}>
              停止
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 实时指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="支持率" value={67} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="反对率" value={23} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="中立率" value={10} suffix="%" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="网络密度" value={0.34} />
          </Card>
        </Col>
      </Row>

      {/* 事件时间轴 */}
      <Card title="最近事件">
        <Timeline
          items={[
            {
              children: 'Agent #45 发布了反对观点',
            },
            {
              children: 'Agent #12 影响了 Agent #34，态度转变: 中立 → 支持',
            },
            {
              children: '外部事件: 媒体报道政策细节',
            },
          ]}
        />
      </Card>
    </div>
  )
}
