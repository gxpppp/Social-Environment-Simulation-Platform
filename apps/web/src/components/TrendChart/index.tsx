import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, Space, Typography, DatePicker, Select, Button, Row, Col } from 'antd';
import { LineChartOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 趋势数据接口
interface TrendData {
  timestamp: number;
  supportRate: number;
  opposeRate: number;
  neutralRate: number;
  networkDensity: number;
  avgOpinion: number;
}

interface TrendChartProps {
  data?: TrendData[];
  height?: number;
  title?: string;
  onRefresh?: () => void;
  onExport?: () => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = 400,
  title = '观点演化趋势',
  onRefresh,
  onExport,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 生成模拟数据
  const generateMockData = (): TrendData[] => {
    const data: TrendData[] = [];
    const now = Date.now();
    for (let i = 0; i < 50; i++) {
      const timestamp = now - (49 - i) * 3600000; // 每小时一个点
      const supportRate = 60 + Math.sin(i / 5) * 15 + Math.random() * 5;
      const opposeRate = 25 + Math.cos(i / 7) * 8 + Math.random() * 3;
      const neutralRate = 100 - supportRate - opposeRate;
      data.push({
        timestamp,
        supportRate: Math.max(0, Math.min(100, supportRate)),
        opposeRate: Math.max(0, Math.min(100, opposeRate)),
        neutralRate: Math.max(0, Math.min(100, neutralRate)),
        networkDensity: 0.3 + Math.sin(i / 10) * 0.1,
        avgOpinion: supportRate / 100,
      });
    }
    return data;
  };

  const chartData = data || generateMockData();

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'normal' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: any) => {
          const time = new Date(params[0].value[0]).toLocaleString();
          let html = `<div style="font-weight:bold;margin-bottom:5px">${time}</div>`;
          params.forEach((param: any) => {
            html += `<div style="display:flex;align-items:center;margin:3px 0">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${param.color};margin-right:8px"></span>
              <span>${param.seriesName}: ${param.value[1].toFixed(1)}%</span>
            </div>`;
          });
          return html;
        },
      },
      legend: {
        data: ['支持率', '反对率', '中立率', '网络密度'],
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
        type: 'time',
        boundaryGap: false,
        axisLabel: {
          formatter: (value: number) => {
            return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          },
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '观点比例 (%)',
          min: 0,
          max: 100,
          position: 'left',
          axisLabel: { formatter: '{value}%' },
        },
        {
          type: 'value',
          name: '网络密度',
          min: 0,
          max: 1,
          position: 'right',
          axisLabel: { formatter: '{value}' },
        },
      ],
      series: [
        {
          name: '支持率',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: chartData.map((d) => [d.timestamp, d.supportRate]),
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
          symbol: 'none',
          data: chartData.map((d) => [d.timestamp, d.opposeRate]),
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
          symbol: 'none',
          data: chartData.map((d) => [d.timestamp, d.neutralRate]),
          itemStyle: { color: '#faad14' },
          areaStyle: {
            color: new (echarts as any).graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(250, 173, 20, 0.3)' },
              { offset: 1, color: 'rgba(250, 173, 20, 0.05)' },
            ]),
          },
        },
        {
          name: '网络密度',
          type: 'line',
          smooth: true,
          symbol: 'none',
          yAxisIndex: 1,
          data: chartData.map((d) => [d.timestamp, d.networkDensity]),
          itemStyle: { color: '#1890ff' },
          lineStyle: { type: 'dashed' },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
          height: 20,
          bottom: 40,
        },
      ],
      animation: true,
      animationDuration: 1000,
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [chartData, title]);

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined />
          <span>{title}</span>
        </Space>
      }
      extra={
        <Space>
          <RangePicker
            size="small"
            showTime
            defaultValue={[dayjs().subtract(1, 'day'), dayjs()]}
          />
          <Select size="small" defaultValue="hour" style={{ width: 100 }}>
            <Option value="minute">分钟</Option>
            <Option value="hour">小时</Option>
            <Option value="day">天</Option>
          </Select>
          <Button icon={<ReloadOutlined />} size="small" onClick={onRefresh}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} size="small" onClick={onExport}>
            导出
          </Button>
        </Space>
      }
    >
      <div ref={chartRef} style={{ width: '100%', height }} />
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Text type="secondary">支持率趋势</Text>
          <div style={{ color: '#52c41a', fontSize: 20, fontWeight: 'bold' }}>
            +12.5%
          </div>
        </Col>
        <Col span={8}>
          <Text type="secondary">反对率趋势</Text>
          <div style={{ color: '#f5222d', fontSize: 20, fontWeight: 'bold' }}>
            -8.3%
          </div>
        </Col>
        <Col span={8}>
          <Text type="secondary">网络密度变化</Text>
          <div style={{ color: '#1890ff', fontSize: 20, fontWeight: 'bold' }}>
            +0.05
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TrendChart;
