# axios-polling
axios polling request


## 安装 & 使用

### npm & ESM

~~~
yarn add axios-polling
~~~

### introduce。

~~~js
import axios from 'axios'
import { axiosPolling } from 'axios-polling'
// 初始化 axios-polling
axiosPolling(axios, {
  retryLimit: 15
})
// 后续编辑轮询配置
axios.defaults.polling['retryLimit'] = 20

// 创建轮询请求
const { emit, on, off, remove } = axios.poll({
  url: '/message',
  params: { id: 1 }
})
// 发送轮询请求
// emit 配置会与 poll 配置合并, emit 配置优先
emit({ params: { id: 2 } })

// 监听发送请求前
on('request', (config) => {
  console.log(config.polling.count)
})
// 监听发送请求后
on('response', (response) => {
  console.log(response)
})
// 监听请求失败
on('error', (error) => {
  console.log(response)
})
// 关闭轮询请求
off()
// 移除所有 on 监听队列
remove()
~~~

### config。

~~~ts
interface AxiosPollingConfig {
  /** 当前正常轮询的总次数，初始值：0 */
  count: number
  /** 正常轮询时，请求延迟毫秒数，默认：1000毫秒 */
  dalay: number
  /**  轮询请求间隔递增毫秒数，默认：0毫秒（建议不要超过1000） */
  delayGaps: number
  /** 发生错误时，当前已重试的次数，初始值：0 */
  retryCount: number
  /** 当发生错误时请求的最大次数，默认：10次 */
  retryLimit: number
  /** 第一次发送请求毫秒数，默认：1000毫秒 */
  retryAfter: number
}
~~~
