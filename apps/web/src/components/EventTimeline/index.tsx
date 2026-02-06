import React, { useState, useRef, useEffect } from 'react';
import { Timeline, Card, Tag, Typography, Space, Button, Spin, Empty, Tooltip, Badge, Select } from 'antd';
import { 
  ClockCircleOutlined, 
  InteractionOutlined, 
  SwapOutlined, 
  MessageOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { Option } = Select;

// 事件类型定义
export enum EventType {
  OPINION_CHANGE = 'opinion_change',
  INTERACTION = 'interaction',
  NETWORK_CHANGE = 'network_change',
  EXTERNAL_EVENT = 'external_event',
  SYSTEM_EVENT = 'system_event'
}

// 事件数据接口
export interface TimelineEvent {
  id: string;
  tick: number;
  timestamp: string;
  type: EventType;
  source: string;
  target?: string;
  description: string;
  impact: number;
  metadata?: Record<string, any>;
}

// 组件属性接口
interface EventTimelineProps {
  events: TimelineEvent[];
  loading?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  height?: number | string;
  showFilters?: boolean;
  title?: string;
}

// 事件类型配置
const eventTypeConfig: Record<EventType, { 
  color: string; 
  icon: React.ReactNode; 
  label: string;
}> = {
  [EventType.OPINION_CHANGE]: {
    color: 'blue',
    icon: <SwapOutlined />,
    label: '观点变化'
  },
  [EventType.INTERACTION]: {
    color: 'green',
    icon: <InteractionOutlined />,
    label: '交互事件'
  },
  [EventType.NETWORK_CHANGE]: {
    color: 'purple',
    icon: <GlobalOutlined />,
    label: '网络变化'
  },
  [EventType.EXTERNAL_EVENT]: {
    color: 'orange',
    icon: <MessageOutlined />,
    label: '外部事件'
  },
  [EventType.SYSTEM_EVENT]: {
    color: 'gray',
    icon: <ClockCircleOutlined />,
    label: '系统事件'
  }
};

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  loading = false,
  onEventClick,
  onLoadMore,
  hasMore = false,
  height = 600,
  showFilters = true,
  title = '事件时间轴'
}) => {
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const timelineRef = useRef<HTMLDivElement>(null);

  // 过滤事件
  const filteredEvents = React.useMemo(() => {
    return events.filter(event => {
      // 类型过滤
      if (selectedTypes.length > 0 && !selectedTypes.includes(event.type)) {
        return false;
      }
      // 影响程度过滤
      if (selectedImpact !== 'all') {
        const impact = Math.abs(event.impact);
        switch (selectedImpact) {
          case 'high':
            return impact >= 0.5;
          case 'medium':
            return impact >= 0.2 && impact < 0.5;
          case 'low':
            return impact < 0.2;
          default:
            return true;
        }
      }
      return true;
    });
  }, [events, selectedTypes, selectedImpact]);

  // 按Tick分组事件
  const groupedEvents = React.useMemo(() => {
    const groups: Record<number, TimelineEvent[]> = {};
    filteredEvents.forEach(event => {
      if (!groups[event.tick]) {
        groups[event.tick] = [];
      }
      groups[event.tick].push(event);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([tick, tickEvents]) => ({
        tick: Number(tick),
        events: tickEvents
      }));
  }, [filteredEvents]);

  // 处理类型筛选
  const handleTypeToggle = (type: EventType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 导出事件数据
  const handleExport = () => {
    const data = {
      events: filteredEvents,
      exportTime: new Date().toISOString(),
      totalCount: filteredEvents.length
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 渲染事件项
  const renderEventItem = (event: TimelineEvent) => {
    const config = eventTypeConfig[event.type];
    
    return (
      <Timeline.Item
        key={event.id}
        dot={
          <Tooltip title={config.label}>
            <div style={{ 
              color: config.color,
              fontSize: 16,
              background: '#fff',
              borderRadius: '50%',
              padding: 4,
              border: `2px solid ${config.color}`
            }}>
              {config.icon}
            </div>
          </Tooltip>
        }
      >
        <Card 
          size="small" 
          onClick={() => onEventClick?.(event)}
          style={{ 
            marginBottom: 8,
            borderLeft: `3px solid ${config.color}`,
            background: event.impact > 0.3 ? '#fff7e6' : '#fff',
            cursor: onEventClick ? 'pointer' : 'default'
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size={4}>
            <Space>
              <Tag color={config.color}>{config.label}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tick {event.tick}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(event.timestamp).format('HH:mm:ss')}
              </Text>
            </Space>
            
            <Text>{event.description}</Text>
            
            <Space>
              <Text type="secondary" style={{ fontSize: 12 }}>
                来源: <Text strong>{event.source}</Text>
              </Text>
              {event.target && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  → 目标: <Text strong>{event.target}</Text>
                </Text>
              )}
              <Badge 
                count={`影响: ${(event.impact * 100).toFixed(0)}%`}
                style={{ 
                  backgroundColor: event.impact > 0 ? '#52c41a' : '#f5222d',
                  fontSize: 10
                }}
              />
            </Space>

            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <Space wrap style={{ marginTop: 4 }}>
                {Object.entries(event.metadata).map(([key, value]) => (
                  <Tag key={key} style={{ fontSize: 11 }}>
                    {key}: {String(value).substring(0, 20)}
                  </Tag>
                ))}
              </Space>
            )}
          </Space>
        </Card>
      </Timeline.Item>
    );
  };

  if (loading) {
    return (
      <Card style={{ height }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" tip="加载事件数据..." />
        </div>
      </Card>
    );
  }

  if (!events.length) {
    return (
      <Card style={{ height }}>
        <Empty description="暂无事件数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  return (
    <Card
      style={{ height }}
      bodyStyle={{ padding: 16, height: '100%', overflow: 'auto' }}
      title={
        <Space>
          <ClockCircleOutlined />
          <span>{title}</span>
          <Badge count={filteredEvents.length} style={{ backgroundColor: '#1890ff' }} />
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} size="small" onClick={() => window.location.reload()}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} size="small" onClick={handleExport}>
            导出
          </Button>
        </Space>
      }
    >
      {/* 过滤器 */}
      {showFilters && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <div>
              <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>事件类型:</Text>
              <Space wrap>
                {Object.entries(eventTypeConfig).map(([type, config]) => (
                  <Tag
                    key={type}
                    color={selectedTypes.includes(type as EventType) ? config.color : undefined}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTypeToggle(type as EventType)}
                  >
                    {config.icon} {config.label}
                  </Tag>
                ))}
              </Space>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12, marginRight: 8 }}>影响程度:</Text>
              <Select
                value={selectedImpact}
                onChange={setSelectedImpact}
                style={{ width: 120 }}
                size="small"
              >
                <Option value="all">全部</Option>
                <Option value="high">高 (&gt;50%)</Option>
                <Option value="medium">中 (20-50%)</Option>
                <Option value="low">低 (&lt;20%)</Option>
              </Select>
            </div>
          </Space>
        </div>
      )}

      {/* 时间轴 */}
      <div ref={timelineRef}>
        {groupedEvents.map(({ tick, events: tickEvents }) => (
          <div key={tick} style={{ marginBottom: 24 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: 12,
              padding: '8px 12px',
              background: '#e6f7ff',
              borderRadius: 4
            }}>
              <Title level={5} style={{ margin: 0, marginRight: 12 }}>
                Tick {tick}
              </Title>
              <Badge count={tickEvents.length} style={{ backgroundColor: '#1890ff' }} />
            </div>
            <Timeline>
              {tickEvents.map(renderEventItem)}
            </Timeline>
          </div>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={onLoadMore} loading={loading}>
            加载更多
          </Button>
        </div>
      )}
    </Card>
  );
};

export default EventTimeline;
