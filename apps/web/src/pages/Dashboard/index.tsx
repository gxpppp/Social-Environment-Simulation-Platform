import React from 'react'
import { Card, Row, Col, Statistic, Button } from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

export const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div>
      <h1>工作台</h1>
      
      {/* 快速开始 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => navigate('/scenes')}
          >
            <div style={{ textAlign: 'center' }}>
              <PlusOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              <h3>创建场景</h3>
              <p>开始一个新的模拟场景</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => navigate('/simulation')}
          >
            <div style={{ textAlign: 'center' }}>
              <PlayCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              <h3>运行模拟</h3>
              <p>查看正在运行的模拟</p>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => navigate('/analytics')}
          >
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: 48, color: '#faad14' }} />
              <h3>分析报告</h3>
              <p>查看分析结果和报告</p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 统计信息 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="场景总数"
              value={12}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="AI角色"
              value={156}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行中模拟"
              value={3}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成模拟"
              value={28}
              suffix="次"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
