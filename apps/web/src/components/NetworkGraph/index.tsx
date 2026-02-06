import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as echarts from 'echarts'
import { Card, Space, Typography, Badge, Tooltip, Button, Spin, Empty } from 'antd'
import {
  ShareAltOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

// 节点数据接口
interface NetworkNode {
  id: string
  name: string
  value: number
  category: number
  symbolSize?: number
  x?: number
  y?: number
  itemStyle?: {
    color?: string
  }
  label?: {
    show?: boolean
  }
}

// 边数据接口
interface NetworkEdge {
  source: string
  target: string
  value: number
  lineStyle?: {
    width?: number
    color?: string
    curveness?: number
  }
}

// 组件属性接口
interface NetworkGraphProps {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  categories?: { name: string; itemStyle?: { color?: string } }[]
  loading?: boolean
  title?: string
  onNodeClick?: (node: NetworkNode) => void
  onEdgeClick?: (edge: NetworkEdge) => void
  height?: number | string
  showStats?: boolean
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  categories = [],
  loading = false,
  title = '社交网络关系图',
  onNodeClick,
  onEdgeClick,
  height = 600,
  showStats = true,
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 计算网络统计
  const stats = React.useMemo(() => {
    if (!nodes.length) return null

    const nodeCount = nodes.length
    const edgeCount = edges.length
    const avgDegree = nodeCount > 0 ? (edgeCount * 2) / nodeCount : 0
    const density = nodeCount > 1 ? edgeCount / ((nodeCount * (nodeCount - 1)) / 2) : 0

    // 计算连通分量（简化版）
    const visited = new Set<string>()
    let components = 0
    const adjacencyList: Record<string, string[]> = {}

    nodes.forEach((node) => {
      adjacencyList[node.id] = []
    })
    edges.forEach((edge) => {
      if (adjacencyList[edge.source]) {
        adjacencyList[edge.source].push(edge.target)
      }
      if (adjacencyList[edge.target]) {
        adjacencyList[edge.target].push(edge.source)
      }
    })

    nodes.forEach((node) => {
      if (!visited.has(node.id)) {
        components++
        const queue = [node.id]
        visited.add(node.id)
        while (queue.length > 0) {
          const current = queue.shift()!
          adjacencyList[current]?.forEach((neighbor) => {
            if (!visited.has(neighbor)) {
              visited.add(neighbor)
              queue.push(neighbor)
            }
          })
        }
      }
    })

    return {
      nodeCount,
      edgeCount,
      avgDegree: avgDegree.toFixed(2),
      density: (density * 100).toFixed(2),
      components,
    }
  }, [nodes, edges])

  // 初始化图表
  const initChart = useCallback(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.dispose()
    }

    chartInstance.current = echarts.init(chartRef.current)

    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: 'center',
        top: 10,
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            return `
              <div style="padding: 8px;">
                <strong>${params.data.name}</strong><br/>
                ID: ${params.data.id}<br/>
                连接数: ${params.data.value}<br/>
                类别: ${categories[params.data.category]?.name || '未知'}
              </div>
            `
          } else if (params.dataType === 'edge') {
            return `
              <div style="padding: 8px;">
                <strong>连接关系</strong><br/>
                ${params.data.source} → ${params.data.target}<br/>
                权重: ${params.data.value}
              </div>
            `
          }
          return ''
        },
      },
      legend: {
        data: categories.map((c) => c.name),
        orient: 'vertical',
        left: 10,
        top: 60,
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes.map((node) => ({
            ...node,
            symbolSize: node.symbolSize || Math.sqrt(node.value) * 5 + 20,
            label: {
              show: node.value > 2,
              formatter: '{b}',
            },
          })),
          links: edges.map((edge) => ({
            ...edge,
            lineStyle: {
              width: Math.sqrt(edge.value),
              curveness: 0.2,
              ...edge.lineStyle,
            },
          })),
          categories: categories,
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          force: {
            repulsion: 300,
            gravity: 0.1,
            edgeLength: [50, 200],
            layoutAnimation: true,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4,
            },
          },
          lineStyle: {
            color: 'source',
            curveness: 0.2,
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
        },
      ],
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {
            title: '保存图片',
          },
        },
        right: 20,
      },
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
    }

    chartInstance.current.setOption(option as any)

    // 绑定事件
    chartInstance.current.on('click', (params: any) => {
      if (params.dataType === 'node' && onNodeClick) {
        onNodeClick(params.data)
      } else if (params.dataType === 'edge' && onEdgeClick) {
        onEdgeClick(params.data)
      }
    })

    // 响应窗口大小变化
    const handleResize = () => {
      chartInstance.current?.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [nodes, edges, categories, title, onNodeClick, onEdgeClick])

  // 初始化图表
  useEffect(() => {
    const cleanup = initChart()
    return () => {
      cleanup?.()
      chartInstance.current?.dispose()
    }
  }, [initChart])

  // 刷新图表
  const handleRefresh = () => {
    initChart()
  }

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    setTimeout(() => {
      chartInstance.current?.resize()
    }, 100)
  }

  // 放大
  const handleZoomIn = () => {
    const currentOption = chartInstance.current?.getOption()
    if (currentOption) {
      const series = currentOption.series as any[]
      if (series && series[0]) {
        series[0].zoom = (series[0].zoom || 1) * 1.2
        chartInstance.current?.setOption(currentOption)
      }
    }
  }

  // 缩小
  const handleZoomOut = () => {
    const currentOption = chartInstance.current?.getOption()
    if (currentOption) {
      const series = currentOption.series as any[]
      if (series && series[0]) {
        series[0].zoom = (series[0].zoom || 1) / 1.2
        chartInstance.current?.setOption(currentOption)
      }
    }
  }

  // 导出数据
  const handleExport = () => {
    const data = {
      nodes,
      edges,
      categories,
      exportTime: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `network-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card style={{ height }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="large" tip="加载网络数据中..." />
        </div>
      </Card>
    )
  }

  if (!nodes.length) {
    return (
      <Card style={{ height }}>
        <Empty description="暂无网络数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    )
  }

  return (
    <Card
      style={{ height: isFullscreen ? '100vh' : height }}
      bodyStyle={{ padding: 0, height: '100%' }}
      title={
        <Space>
          <ShareAltOutlined />
          <span>{title}</span>
          {showStats && stats && (
            <>
              <Badge count={`${stats.nodeCount} 节点`} style={{ backgroundColor: '#1890ff' }} />
              <Badge count={`${stats.edgeCount} 连接`} style={{ backgroundColor: '#52c41a' }} />
            </>
          )}
        </Space>
      }
      extra={
        <Space>
          <Tooltip title="刷新">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="small" />
          </Tooltip>
          <Tooltip title="放大">
            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
          </Tooltip>
          <Tooltip title="缩小">
            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
          </Tooltip>
          <Tooltip title="全屏">
            <Button icon={<FullscreenOutlined />} onClick={toggleFullscreen} size="small" />
          </Tooltip>
          <Tooltip title="导出数据">
            <Button icon={<DownloadOutlined />} onClick={handleExport} size="small" />
          </Tooltip>
        </Space>
      }
    >
      <div style={{ position: 'relative', height: '100%' }}>
        {/* 统计信息面板 */}
        {showStats && stats && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              padding: 16,
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              maxWidth: 200,
            }}
          >
            <Title level={5} style={{ marginTop: 0, marginBottom: 12 }}>
              网络统计
            </Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">节点数:</Text>
                <Text strong>{stats.nodeCount}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">连接数:</Text>
                <Text strong>{stats.edgeCount}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">平均度数:</Text>
                <Text strong>{stats.avgDegree}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">网络密度:</Text>
                <Text strong>{stats.density}%</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">连通分量:</Text>
                <Text strong>{stats.components}</Text>
              </div>
            </Space>
          </div>
        )}

        {/* 图表容器 */}
        <div
          ref={chartRef}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 400,
          }}
        />
      </div>
    </Card>
  )
}

export default NetworkGraph
