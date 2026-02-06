import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Card, Row, Col, Space, Typography, Select, Button } from 'antd';
import { PieChartOutlined, BarChartOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// 分布数据接口
interface DistributionData {
  name: string;
  value: number;
  percentage?: number;
}

interface DistributionChartProps {
  data?: DistributionData[];
  height?: number;
  title?: string;
  type?: 'pie' | 'bar';
  onRefresh?: () => void;
  onExport?: () => void;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({
  data,
  height = 350,
  title = '观点分布统计',
  type = 'pie',
  onRefresh,
  onExport,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // 生成模拟数据
  const generateMockData = (): DistributionData[] => [
    { name: '强烈支持', value: 156, percentage: 31.2 },
    { name: '支持', value: 189, percentage: 37.8 },
    { name: '中立', value: 67, percentage: 13.4 },
    { name: '反对', value: 56, percentage: 11.2 },
    { name: '强烈反对', value: 32, percentage: 6.4 },
  ];

  const chartData = data || generateMockData();

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const colors = ['#52c41a', '#95de64', '#faad14', '#ff7875', '#f5222d'];

    const option: echarts.EChartsOption =
      type === 'pie'
        ? {
            title: {
              text: title,
              left: 'center',
              textStyle: { fontSize: 16, fontWeight: 'normal' },
            },
            tooltip: {
              trigger: 'item',
              formatter: (params: any) => {
                return `<div style="font-weight:bold">${params.name}</div>
                        <div>数量: ${params.value}</div>
                        <div>占比: ${params.percent}%</div>`;
              },
            },
            legend: {
              orient: 'vertical',
              left: 'left',
              top: 'center',
            },
            series: [
              {
                name: '观点分布',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                  borderRadius: 10,
                  borderColor: '#fff',
                  borderWidth: 2,
                },
                label: {
                  show: true,
                  formatter: '{b}\n{c} ({d}%)',
                },
                emphasis: {
                  label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold',
                  },
                },
                data: chartData.map((item, index) => ({
                  ...item,
                  itemStyle: { color: colors[index % colors.length] },
                })),
              },
            ],
          }
        : {
            title: {
              text: title,
              left: 'center',
              textStyle: { fontSize: 16, fontWeight: 'normal' },
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'shadow' },
              formatter: (params: any) => {
                const data = params[0];
                return `<div style="font-weight:bold">${data.name}</div>
                        <div>数量: ${data.value}</div>
                        <div>占比: ${data.data.percentage}%</div>`;
              },
            },
            grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true,
            },
            xAxis: {
              type: 'category',
              data: chartData.map((item) => item.name),
              axisTick: { alignWithLabel: true },
            },
            yAxis: {
              type: 'value',
              name: '数量',
            },
            series: [
              {
                name: '观点分布',
                type: 'bar',
                barWidth: '60%',
                data: chartData.map((item, index) => ({
                  value: item.value,
                  percentage: item.percentage,
                  itemStyle: { color: colors[index % colors.length] },
                })),
                label: {
                  show: true,
                  position: 'top',
                  formatter: '{c}',
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
  }, [chartData, title, type]);

  return (
    <Card
      title={
        <Space>
          {type === 'pie' ? <PieChartOutlined /> : <BarChartOutlined />}
          <span>{title}</span>
        </Space>
      }
      extra={
        <Space>
          <Select size="small" defaultValue={type} style={{ width: 100 }}>
            <Option value="pie">饼图</Option>
            <Option value="bar">柱状图</Option>
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
        {chartData.map((item, index) => (
          <Col key={item.name} span={Math.floor(24 / chartData.length)}>
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.name}
              </Text>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>{item.value}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {item.percentage}%
              </Text>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default DistributionChart;
