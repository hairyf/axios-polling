import type { AxiosInstance, AxiosRequestConfig, AxiosStatic } from 'axios'
import axios from 'axios'

import assign from 'lodash/assign'
import { createLooper } from './looper'
import { LoopObserver } from './observer'

declare module 'axios' {
  interface AxiosRequestConfig {
    poling?: Partial<AxiosPollingConfig>
  }
  interface AxiosInstance {
    poll: ReturnType<typeof createPolling>
  }
}

export interface AxiosPollingConfig {
  /** The total number of previous normal polls, initial value: 0 */
  count: number
  /** When polling normally, the request delay in milliseconds, default: 1000 milliseconds */
  delay: number
  /**  Polling request interval increments in milliseconds, default: 0 milliseconds (recommended not to exceed 1000) */
  delayGaps: number
  /** When an error occurs, the current number of retries, initial value: 0 */
  retryCount: number
  /** The maximum number of requests when an error occurs, default: 10 */
  retryLimit: number
  /** The number of milliseconds to send the first request, default: 1000 milliseconds */
  retryAfter: number
}

export function createPolling(instance = axios as AxiosStatic | AxiosInstance) {
  function emit(observer: LoopObserver, config: AxiosRequestConfig) {
    const loop = createLooper(async () => {
      try {
        // 当前监视者循环调用关闭时, 阻止 loop
        if (!observer.loop)
          return undefined
        // 再次发送请求
        const response = await instance(config || {})
        // 调用当前监视者请求完毕堆栈
        observer.stacks.response.forEach(fn => fn(response))
        // 记录请求长度
        const poling = response.config.poling as AxiosPollingConfig
        poling.delayGaps += poling.delayGaps
        poling.count += 1
        // 再次进入 loop
        loop(poling.delay + poling.delayGaps)
      }
      catch (error: any) {
        const poling = error.config.poling as AxiosPollingConfig
        // 调用当前监视者失败堆栈
        observer.stacks.error.forEach(fn => fn(error))
        // 当错误超出限制, 阻止 loop
        if (poling.retryCount >= poling.retryLimit)
          return
        // 记录失败请求长度
        poling.delayGaps += poling.delayGaps
        poling.retryCount += 1
        config.poling = poling
        // 再次进入 loop
        loop(poling.delay + poling.delayGaps)
      }
    })
    // 初次调用循环请求
    loop(config?.poling?.retryAfter || instance.defaults.poling?.retryAfter)
  }

  function create(createConfig: AxiosRequestConfig = {}) {
    const observer = new LoopObserver()

    function _emit(config: AxiosRequestConfig = {}) {
      emit(observer, assign(createConfig, config))
    }

    return {
      emit: _emit,
      remove: observer.remove,
      on: observer.on,
      off: observer.off,
    }
  }

  return create
}

export function axiosPolling(axios: AxiosStatic | AxiosInstance, config?: Partial<AxiosPollingConfig>) {
  const defaultConfig = {
    count: 0,
    delay: 1000,
    delayGaps: 0,
    retryCount: 0,
    retryLimit: 10,
    retryAfter: 1000,
  }
  axios.defaults.poling = assign({ ...defaultConfig }, config)
  axios.poll = createPolling(axios)
}
