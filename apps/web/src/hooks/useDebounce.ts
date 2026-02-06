import { useCallback, useRef } from 'react'

/**
 * 防抖Hook
 * @param fn 需要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => {
        fn(...args)
      }, delay)
    },
    [fn, delay]
  ) as T

  return debouncedFn
}

/**
 * 节流Hook
 * @param fn 需要节流的函数
 * @param limit 限制时间（毫秒）
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(fn: T, limit: number): T {
  const inThrottleRef = useRef(false)

  const throttledFn = useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottleRef.current) {
        fn(...args)
        inThrottleRef.current = true
        setTimeout(() => {
          inThrottleRef.current = false
        }, limit)
      }
    },
    [fn, limit]
  ) as T

  return throttledFn
}

export default useDebounce
