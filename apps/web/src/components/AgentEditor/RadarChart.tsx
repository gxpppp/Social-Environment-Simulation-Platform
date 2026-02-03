import React, { useMemo } from 'react'
import { Tooltip } from 'antd'

interface RadarChartProps {
  data: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  size?: number
  showLabels?: boolean
  interactive?: boolean
  onChange?: (dimension: string, value: number) => void
}

const dimensions = [
  { key: 'openness', label: '开放性', color: '#1890ff', description: '好奇心、创造力、对新经验的接受度' },
  { key: 'conscientiousness', label: '尽责性', color: '#52c41a', description: '组织性、自律性、可靠性' },
  { key: 'extraversion', label: '外向性', color: '#faad14', description: '社交性、活跃度、寻求刺激' },
  { key: 'agreeableness', label: '宜人性', color: '#eb2f96', description: '合作性、信任度、利他主义' },
  { key: 'neuroticism', label: '神经质', color: '#f5222d', description: '情绪稳定性、焦虑倾向、压力反应' },
]

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 300,
  showLabels = true,
  interactive = false,
  onChange,
}) => {
  const center = size / 2
  const radius = size * 0.35
  const angleStep = (Math.PI * 2) / 5

  // 计算多边形顶点
  const points = useMemo(() => {
    return dimensions.map((dim, index) => {
      const angle = index * angleStep - Math.PI / 2
      const value = data[dim.key as keyof typeof data] || 0.5
      const r = radius * value
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        value,
        ...dim,
      }
    })
  }, [data, center, radius, angleStep])

  // 计算标签位置
  const labels = useMemo(() => {
    return dimensions.map((dim, index) => {
      const angle = index * angleStep - Math.PI / 2
      const labelRadius = radius + 30
      return {
        x: center + labelRadius * Math.cos(angle),
        y: center + labelRadius * Math.sin(angle),
        ...dim,
      }
    })
  }, [center, radius, angleStep])

  // 生成多边形路径
  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  // 生成网格线
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]
  const gridPolygons = gridLevels.map((level) => {
    const gridPoints = dimensions.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2
      const r = radius * level
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      }
    })
    return gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  })

  // 处理拖拽
  const handleMouseDown = (dimKey: string) => (e: React.MouseEvent) => {
    if (!interactive || !onChange) return

    const svg = e.currentTarget.closest('svg')
    if (!svg) return

    const rect = svg.getBoundingClientRect()

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.clientX - rect.left - center
      const y = moveEvent.clientY - rect.top - center

      // 计算角度和距离
      const angle = Math.atan2(y, x)
      const dimIndex = dimensions.findIndex((d) => d.key === dimKey)
      const targetAngle = dimIndex * angleStep - Math.PI / 2

      // 计算距离中心的比例
      const distance = Math.sqrt(x * x + y * y)
      let value = distance / radius
      value = Math.max(0, Math.min(1, value))

      onChange(dimKey, Math.round(value * 100) / 100)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      {/* 背景网格 */}
      {gridPolygons.map((path, i) => (
        <path
          key={i}
          d={path}
          fill="none"
          stroke="#e8e8e8"
          strokeWidth={1}
          strokeDasharray={i === gridLevels.length - 1 ? undefined : '4 4'}
        />
      ))}

      {/* 轴线 */}
      {dimensions.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="#e8e8e8"
            strokeWidth={1}
          />
        )
      })}

      {/* 数据多边形 */}
      <path
        d={polygonPath}
        fill="rgba(24, 144, 255, 0.2)"
        stroke="#1890ff"
        strokeWidth={2}
      />

      {/* 数据点 */}
      {points.map((point, index) => (
        <Tooltip
          key={point.key}
          title={`${point.label}: ${(point.value * 100).toFixed(0)}%`}
        >
          <circle
            cx={point.x}
            cy={point.y}
            r={interactive ? 8 : 5}
            fill={point.color}
            stroke="#fff"
            strokeWidth={2}
            style={{
              cursor: interactive ? 'move' : 'default',
              transition: 'all 0.2s ease',
            }}
            onMouseDown={handleMouseDown(point.key)}
          />
        </Tooltip>
      ))}

      {/* 标签 */}
      {showLabels &&
        labels.map((label) => (
          <text
            key={label.key}
            x={label.x}
            y={label.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fill="#666"
            style={{ fontWeight: 500 }}
          >
            {label.label}
          </text>
        ))}

      {/* 中心点 */}
      <circle cx={center} cy={center} r={3} fill="#999" />
    </svg>
  )
}
