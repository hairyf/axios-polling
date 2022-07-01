# axios-polling
axios polling request


## Install & use

### npm & ESM

~~~
yarn add axios-polling
~~~

### introduce。

~~~js
import axios from 'axios'
import { axiosPolling } from 'axios-polling'
// init axios-polling
axiosPolling(axios, {
  retryLimit: 15
})
// edit config
axios.defaults.polling['retryLimit'] = 20

// create polling
const { emit, on, off, remove } = axios.poll({
  url: '/message',
  params: { id: 1 }
})
// send polling
// Transmit config will be merged with poll config, transmit config takes precedence
emit({ params: { id: 2 } })

// watch request
on('request', (config) => {
  console.log(config.polling.count)
})
// watch response
on('response', (response) => {
  console.log(response)
})
// watch error
on('error', (error) => {
  console.log(response)
})
// close polling
off()
// remove all on
remove()
~~~

### config。

~~~ts
interface AxiosPollingConfig {
  /** The total number of previous normal polls, initial value: 0 */
  count: number
  /** When polling normally, the request delay in milliseconds, default: 1000 milliseconds */
  dalay: number
  /**  Polling request interval increments in milliseconds, default: 0 milliseconds (recommended not to exceed 1000) */
  delayGaps: number
  /** When an error occurs, the current number of retries, initial value: 0 */
  retryCount: number
  /** The maximum number of requests when an error occurs, default: 10 */
  retryLimit: number
  /** The number of milliseconds to send the first request, default: 1000 milliseconds */
  retryAfter: number
}
~~~
