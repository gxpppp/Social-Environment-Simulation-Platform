import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, Badge, Space, Typography, Tooltip, Button } from 'antd';
import {
  LineChartOutlined,
  TeamOutlined,
  ShareAltOutlined,
  ThunderboltOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  ReloadOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import * as echarts from 'echarts';

const { Title, Text } = Typography;

// 指标数据接口
interface MetricData {
  timestamp: number;
  value: number;
}

// 仪表盘属性接口
interface DashboardProps {
  supportRate: number;
  opposeRate: number;
  neutralRate: number;
  networkDensity: number;
  avgDegree: number;
  clusteringCoefficient: number;
  agentCount: number;
  edgeCount: number;
  tickCount: number;
  historyData?: {
    support: MetricData[];
    oppose: MetricData[];
    neutral: MetricData[];
    density: MetricData[];
  };
  loading?: boolean;
  onRefresh?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  supportRate,
  opposeRate,
  neutralRate,
  networkDensity,
  avgDegree,
  clusteringCoefficient,
  agentCount,
  edgeCount,
  tickCount,
  historyData,
  loading = false,
  onRefresh,
}) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const chartInstance = React.useRef<echarts.ECharts | null>(null);

  // 初始化趋势图
  useEffect(() => {
    if (!chartRef.current || !historyData) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: '观点演化趋势',
        left: 'center',
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['支持率', '反对率', '中立率'],
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: historyData.support.map((d) => new Date(d.timestamp).toLocaleTimeString()),
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' },
      },
      series: [
        {
          name: '支持率',
          type: 'line',
          smooth: true,
          data: historyData.support.map((d) => d.value),
          itemStyle: { color: '#52c41a' },
          areaStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
              { offset: 1, color: 'rgba(82, 196, 26, 0.05)' },
            ]),
          },
        },
        {
          name: '反对率',
          type: 'line',
          smooth: true,
          data: historyData.oppose.map((d) => d.value),
          itemStyle: { color: '#f5222d' },
          areaStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 34, 45, 0.3)' },
              { offset: 1, color: 'rgba(245, 34, 45, 0.05)' },
            ]),
          },
        },
        {
          name: '中立率',
          type: 'line',
          smooth: true,
          data: historyData.neutral.map((d) => d.value),
          itemStyle: { color: '#faad14' },
          areaStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
              { offset: 1, color: 'rgba(250, 173, 20, 0.05)' },
            ]),
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [historyData]);

  // 计算变化趋势
  const getTrend = (current: number, previous?: number) => {
    if (!previous) return 'stable';
    const diff = current - previous;
    if (Math.abs(diff) < 1) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const renderTrend = (trend: string) => {
    if (trend === 'up') return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    if (trend === 'down') return <ArrowDownOutlined style={{ color: '#f5222d' }} />;
    return <MinusOutlined style={{ color: '#999' }} />;
  };

  return (
    <div>
      {/* 主要指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <TeamOutlined />
                  <span>Agent总数</span>
                </Space>
              }
              value={agentCount}
              suffix="个"
              valueStyle={{ fontSize: 28 }}
            />
            <Progress percent={Math.min((agentCount / 100) * 100, 100)} showInfo={false} strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <ShareAltOutlined />
                  <span>连接总数</span>
                </Space>
              }
              value={edgeCount}
              suffix="条"
              valueStyle={{ fontSize: 28 }}
            />
            <Progress percent={Math.min((edgeCount / 200) * 100, 100)} showInfo={false} strokeColor="#52c41a" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <ThunderboltOutlined />
                  <span>当前Tick</span>
                </Space>
              }
              value={tickCount}
              suffix="/100"
              valueStyle={{ fontSize: 28 }}
            />
            <Progress percent={(tickCount / 100) * 100} showInfo={false} strokeColor="#faad14" />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={
                <Space>
                  <LineChartOutlined />
                  <span>网络密度</span>
                </Space>
              }
              value={networkDensity}
              precision={3}
              valueStyle={{ fontSize: 28 }}
            />
            <Progress percent={networkDensity * 100} showInfo={false} strokeColor="#722ed1" />
          </Card>
        </Col>
      </Row>

      {/* 观点分布和网络指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="观点分布"
            extra={
              <Button icon={<ReloadOutlined />} size="small" onClick={onRefresh} loading={loading}>
                刷新
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={supportRate}
                    strokeColor="#52c41a"
                    format={(percent) => <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{percent}%</span>}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Badge color="#52c41a" text="支持率" />
                    {renderTrend(getTrend(supportRate, supportRate - 2))}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={opposeRate}
                    strokeColor="#f5222d"
                    format={(percent) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{percent}%</span>}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Badge color="#f5222d" text="反对率" />
                    {renderTrend(getTrend(opposeRate, opposeRate + 1))}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={neutralRate}
                    strokeColor="#faad14"
                    format={(percent) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>{percent}%</span>}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Badge color="#faad14" text="中立率" />
                    {renderTrend(getTrend(neutralRate, neutralRate + 1))}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="网络拓扑指标"
            extra={
              <Tooltip title="网络密度 = 实际连接数 / 最大可能连接数">
                <Badge count="?" style={{ backgroundColor: '#1890ff' }} />
              </Tooltip>
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic title="平均度数" value={avgDegree} precision={2} suffix="连接/节点" />
              </Col>
              <Col span={12}>
                <Statistic
                  title="聚类系数"
                  value={clusteringCoefficient}
                  precision={3}
                  suffix=""
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">网络密度说明</Text>
              <Progress
                percent={networkDensity * 100}
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                format={(percent) => `${percent?.toFixed(1)}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 趋势图 */}
      {historyData && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title="历史趋势"
              extra={
                <Button icon={<FullscreenOutlined />} size="small">
                  全屏
                </Button>
              }
            >
              <div ref={chartRef} style={{ width: '100%', height: 400 }} />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Dashboard;
