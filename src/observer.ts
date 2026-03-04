import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { nanoid } from 'nanoid'

export interface ObserverStacks {
  request: ((config: AxiosRequestConfig) => void)[]
  response: ((response: AxiosResponse) => void)[]
  error: ((error: AxiosError) => void)[]
}
export interface LoopWatcher {
  (event: 'request', callback: (config: AxiosRequestConfig) => void): void
  <T = any>(event: 'response', callback: (response: AxiosResponse<T>) => void): void
  (event: 'error', callback: (error: AxiosError) => void): void
}

export class LoopObserver {
  constructor(
    public id = nanoid(10),
    public loop = true,
    public stacks: ObserverStacks = { request: [], response: [], error: [] },
  ) {}

  remove(): void {
    this.stacks.error = []
    this.stacks.request = []
    this.stacks.response = []
  }

  off(): void {
    this.loop = false
  }

  on: LoopWatcher = (event: 'request' | 'response' | 'error', callback: any) => {
    this.stacks[event].push(callback)
  }
}
