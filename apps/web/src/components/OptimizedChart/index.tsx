import React, { useEffect, useRef, useCallback, useState } from 'react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { useDebounce } from '@/hooks/useDebounce'

interface OptimizedChartProps {
  option: EChartsOption
  height?: number | string
  width?: number | string
  theme?: string
  onChartReady?: (chart: echarts.ECharts) => void
  onEvents?: Record<string, (params: any) => void>
  /** 数据采样阈值，超过此值进行采样 */
  samplingThreshold?: number
  /** 启用数据缩放 */
  enableDataZoom?: boolean
  /** 启用懒加载 */
  lazyLoad?: boolean
  /** 懒加载偏移量 */
  lazyOffset?: number
}

/**
 * 高性能图表组件
 * 特性：
 * 1. 自动数据采样 - 大数据量时自动降采样
 * 2. 防抖resize - 避免频繁重绘
 * 3. 懒加载 - 进入视口才渲染
 * 4. 自动内存管理 - 组件卸载时清理
 */
export const OptimizedChart: React.FC<OptimizedChartProps> = ({
  option,
  height = 400,
  width = '100%',
  theme,
  onChartReady,
  onEvents,
  samplingThreshold = 5000,
  enableDataZoom = true,
  lazyLoad = false,
  lazyOffset = 100,
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [isInViewport, setIsInViewport] = useState(!lazyLoad)
  const [isLoading, setIsLoading] = useState(true)

  // 数据采样
  const sampleData = useCallback(
    (data: any[]): any[] => {
      if (data.length <= samplingThreshold) return data

      const step = Math.ceil(data.length / samplingThreshold)
      return data.filter((_, index) => index % step === 0)
    },
    [samplingThreshold]
  )

  // 处理选项，应用采样
  const processedOption = React.useMemo(() => {
    const newOption = { ...option }
    if (newOption.series && Array.isArray(newOption.series)) {
      newOption.series = newOption.series.map((s: any) => {
        if (s.data && Array.isArray(s.data) && s.data.length > samplingThreshold) {
          return {
            ...s,
            data: sampleData(s.data),
            // 启用大数据优化
            large: true,
            largeThreshold: 500,
            progressive: 500,
            progressiveThreshold: 2000,
          }
        }
        return s
      })
    }

    // 添加数据缩放
    if (enableDataZoom && !newOption.dataZoom) {
      newOption.dataZoom = [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 100,
          height: 20,
          bottom: 0,
        },
      ]
    }

    return newOption
  }, [option, samplingThreshold, enableDataZoom, sampleData])

  // 防抖resize
  const debouncedResize = useDebounce(() => {
    chartInstance.current?.resize()
  }, 200)

  // 懒加载检测
  useEffect(() => {
    if (!lazyLoad || !chartRef.current) {
      setIsInViewport(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: `${lazyOffset}px`,
      }
    )

    observer.observe(chartRef.current)
    return () => observer.disconnect()
  }, [lazyLoad, lazyOffset])

  // 初始化图表
  useEffect(() => {
    if (!chartRef.current || !isInViewport) return

    // 延迟初始化，避免阻塞主线程
    const timer = setTimeout(() => {
      chartInstance.current = echarts.init(chartRef.current!, theme)
      chartInstance.current.setOption(processedOption as any, true)
      setIsLoading(false)

      // 绑定事件
      if (onEvents) {
        Object.entries(onEvents).forEach(([event, handler]) => {
          chartInstance.current?.on(event, handler)
        })
      }

      onChartReady?.(chartInstance.current)
    }, 0)

    return () => {
      clearTimeout(timer)
    }
  }, [isInViewport, theme, processedOption, onChartReady, onEvents])

  // 更新选项
  useEffect(() => {
    if (!chartInstance.current || isLoading) return
    chartInstance.current.setOption(processedOption as any, true)
  }, [processedOption, isLoading])

  // 监听resize
  useEffect(() => {
    if (!chartInstance.current) return

    const handleResize = () => debouncedResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [debouncedResize])

  // 清理
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [])

  if (!isInViewport) {
    return (
      <div
        ref={chartRef}
        style={{
          width,
          height,
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#999' }}>图表加载中...</span>
      </div>
    )
  }

  return (
    <div
      ref={chartRef}
      style={{
        width,
        height,
        opacity: isLoading ? 0 : 1,
        transition: 'opacity 0.3s',
      }}
    />
  )
}

export default OptimizedChart
