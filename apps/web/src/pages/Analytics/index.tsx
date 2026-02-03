import React from 'react'
import { Card, Row, Col, Button, DatePicker, Select } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

export const Analytics: React.FC = () => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>分析中心</h1>
        <div>
          <RangePicker style={{ marginRight: 8 }} />
          <Select defaultValue="support" style={{ width: 120, marginRight: 8 }}>
            <Select.Option value="support">支持率</Select.Option>
            <Select.Option value="network">网络密度</Select.Option>
            <Select.Option value="events">事件分布</Select.Option>
          </Select>
          <Button icon={<DownloadOutlined />}>导出报告</Button>
        </div>
      </div>

      {/* 图表区域 */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="观点演化趋势" style={{ height: 400 }}>
            <div style={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f5f5f5',
              borderRadius: 4
            }}>
              图表区域 - 待集成 ECharts
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="影响力排行榜" style={{ height: 400 }}>
            <div style={{ padding: 16 }}>
              <p>1. 王专家 - 影响: 234</p>
              <p>2. 李记者 - 影响: 189</p>
              <p>3. 张博主 - 影响: 156</p>
              <p>4. 陈学者 - 影响: 142</p>
              <p>5. 刘市民 - 影响: 128</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="传播路径分析" style={{ height: 300 }}>
            <div style={{ 
              height: 220, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: '#f5f5f5',
              borderRadius: 4
            }}>
              网络图区域 - 待集成 Cytoscape
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="预测分析" style={{ height: 300 }}>
            <div style={{ padding: 16 }}>
              <p><strong>未来30天预测:</strong></p>
              <p>• 支持率: 67% → 72%</p>
              <p>• 反对率: 23% → 19%</p>
              <p>• 网络密度: 0.34 → 0.38</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
