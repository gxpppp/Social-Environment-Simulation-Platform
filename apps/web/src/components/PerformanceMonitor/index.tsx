import React, { useEffect, useState, useRef } from 'react';
import { Card, Row, Col, Statistic, Progress, Badge, Space, Typography, Alert, Button } from 'antd';
import {
  DashboardOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  WifiOutlined,
  ReloadOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

// 性能指标接口
interface PerformanceMetrics {
  // 内存使用 (MB)
  memory: number;
  memoryLimit: number;
  // CPU使用率 (%)
  cpu: number;
  // 帧率 (FPS)
  fps: number;
  // 网络延迟 (ms)
  latency: number;
  // 页面加载时间 (ms)
  loadTime: number;
  // DOM节点数
  domNodes: number;
  // 资源加载数
  resources: number;
  // 最后更新时间
  lastUpdate: string;
}

// 性能监控组件
export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memory: 0,
    memoryLimit: 0,
    cpu: 0,
    fps: 60,
    latency: 0,
    loadTime: 0,
    domNodes: 0,
    resources: 0,
    lastUpdate: new Date().toLocaleTimeString(),
  });
  
  const [isMonitoring, setIsMonitoring] = useState(true);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  // 收集性能数据
  const collectMetrics = () => {
    const newMetrics: Partial<PerformanceMetrics> = {
      lastUpdate: new Date().toLocaleTimeString(),
    };

    // 内存信息
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      newMetrics.memory = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      newMetrics.memoryLimit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
    }

    // DOM节点数
    newMetrics.domNodes = document.getElementsByTagName('*').length;

    // 资源数
    newMetrics.resources = performance.getEntriesByType('resource').length;

    // 页面加载时间
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      newMetrics.loadTime = Math.round(navigation.loadEventEnd - navigation.startTime);
    }

    setMetrics(prev => ({ ...prev, ...newMetrics }));
  };

  // 计算FPS
  const calculateFPS = () => {
    const now = performance.now();
    frameCount.current++;
    
    if (now - lastTime.current >= 1000) {
      setMetrics(prev => ({
        ...prev,
        fps: frameCount.current,
      }));
      frameCount.current = 0;
      lastTime.current = now;
    }
    
    if (isMonitoring) {
      requestAnimationFrame(calculateFPS);
    }
  };

  // 监控网络延迟
  const checkLatency = async () => {
    try {
      const start = performance.now();
      await fetch('/api/health', { method: 'HEAD' });
      const latency = Math.round(performance.now() - start);
      setMetrics(prev => ({ ...prev, latency }));
    } catch {
      setMetrics(prev => ({ ...prev, latency: -1 }));
    }
  };

  useEffect(() => {
    if (!isMonitoring) return;

    // 启动FPS计算
    requestAnimationFrame(calculateFPS);

    // 定期收集指标
    const interval = setInterval(() => {
      collectMetrics();
      checkLatency();
    }, 2000);

    // 初始收集
    collectMetrics();

    return () => {
      clearInterval(interval);
    };
  }, [isMonitoring]);

  // 获取状态颜色
  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return '#52c41a';
    if (value < thresholds[1]) return '#faad14';
    return '#f5222d';
  };

  // 获取状态图标
  const getStatusIcon = (value: number, thresholds: [number, number]) => {
    if (value < thresholds[0]) return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (value < thresholds[1]) return <WarningOutlined style={{ color: '#faad14' }} />;
    return <WarningOutlined style={{ color: '#f5222d' }} />;
  };

  return (
    <Card
      title={
        <Space>
          <DashboardOutlined />
          <span>系统性能监控</span>
          <Badge
            status={isMonitoring ? 'processing' : 'default'}
            text={isMonitoring ? '监控中' : '已停止'}
          />
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          size="small"
          onClick={() => {
            setIsMonitoring(!isMonitoring);
            if (!isMonitoring) {
              lastTime.current = performance.now();
              frameCount.current = 0;
            }
          }}
        >
          {isMonitoring ? '停止' : '开始'}
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        {/* FPS */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="帧率 (FPS)"
              value={metrics.fps}
              suffix="fps"
              valueStyle={{ color: getStatusColor(60 - metrics.fps, [10, 30]) }}
              prefix={getStatusIcon(60 - metrics.fps, [10, 30])}
            />
            <Progress
              percent={Math.min((metrics.fps / 60) * 100, 100)}
              strokeColor={getStatusColor(60 - metrics.fps, [10, 30])}
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 内存 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="内存使用"
              value={metrics.memory}
              suffix="MB"
              valueStyle={{ 
                color: metrics.memoryLimit > 0 
                  ? getStatusColor((metrics.memory / metrics.memoryLimit) * 100, [50, 80])
                  : '#1890ff'
              }}
              prefix={<DatabaseOutlined />}
            />
            {metrics.memoryLimit > 0 && (
              <Progress
                percent={Math.round((metrics.memory / metrics.memoryLimit) * 100)}
                strokeColor={getStatusColor((metrics.memory / metrics.memoryLimit) * 100, [50, 80])}
                size="small"
              />
            )}
          </Card>
        </Col>

        {/* 网络延迟 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="网络延迟"
              value={metrics.latency === -1 ? 'N/A' : metrics.latency}
              suffix={metrics.latency === -1 ? '' : 'ms'}
              valueStyle={{ 
                color: metrics.latency === -1 
                  ? '#f5222d' 
                  : getStatusColor(metrics.latency, [100, 300])
              }}
              prefix={<WifiOutlined />}
            />
            <Progress
              percent={metrics.latency === -1 ? 100 : Math.min((metrics.latency / 500) * 100, 100)}
              strokeColor={metrics.latency === -1 ? '#f5222d' : getStatusColor(metrics.latency, [100, 300])}
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 页面加载时间 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="页面加载时间"
              value={metrics.loadTime}
              suffix="ms"
              valueStyle={{ color: getStatusColor(metrics.loadTime, [1000, 3000]) }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>

        {/* DOM节点数 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="DOM节点数"
              value={metrics.domNodes}
              valueStyle={{ color: getStatusColor(metrics.domNodes, [1000, 3000]) }}
            />
          </Card>
        </Col>

        {/* 资源数 */}
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title="资源加载数"
              value={metrics.resources}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 性能警告 */}
      {metrics.fps < 30 && (
        <Alert
          message="性能警告"
          description="帧率较低，建议优化页面性能"
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
      {metrics.memory > 0 && metrics.memoryLimit > 0 && (metrics.memory / metrics.memoryLimit) > 0.8 && (
        <Alert
          message="内存警告"
          description="内存使用率高，建议清理缓存"
          type="warning"
          showIcon
          style={{ marginTop: 8 }}
        />
      )}

      <Text type="secondary" style={{ display: 'block', marginTop: 16, textAlign: 'right' }}>
        最后更新: {metrics.lastUpdate}
      </Text>
    </Card>
  );
};

export default PerformanceMonitor;
