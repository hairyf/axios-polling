import type { AxiosInstance, AxiosResponse } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { axiosPolling, createPolling } from '../src/index'

describe('createPolling', () => {
  let mockRequest: ReturnType<typeof vi.fn>
  let mockInstance: AxiosInstance

  beforeEach(() => {
    vi.useFakeTimers()
    mockRequest = vi.fn()
    mockInstance = Object.assign(mockRequest, {
      request: mockRequest,
      defaults: { poling: { retryAfter: 100 } },
    }) as unknown as AxiosInstance
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a create function', () => {
    const create = createPolling(mockInstance)

    expect(typeof create).toBe('function')
  })

  it('create should return emit, remove, on, off', () => {
    const create = createPolling(mockInstance)
    const result = create()

    expect(result).toHaveProperty('emit')
    expect(result).toHaveProperty('remove')
    expect(result).toHaveProperty('on')
    expect(result).toHaveProperty('off')
    expect(typeof result.emit).toBe('function')
    expect(typeof result.remove).toBe('function')
    expect(typeof result.on).toBe('function')
    expect(typeof result.off).toBe('function')
  })

  it('emit should trigger request with merged config', async () => {
    const response: AxiosResponse = {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        poling: {
          count: 0,
          delay: 1000,
          delayGaps: 0,
          retryCount: 0,
          retryLimit: 10,
          retryAfter: 100,
        },
      },
    } as AxiosResponse

    mockRequest.mockResolvedValue(response)

    const create = createPolling(mockInstance)
    const { emit } = create({ url: '/api' })

    emit({ url: '/poll' })

    await vi.advanceTimersByTimeAsync(100)

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/poll' }),
    )
  })

  it('on response: should call response callback when request succeeds', async () => {
    const response: AxiosResponse = {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        poling: {
          count: 0,
          delay: 1000,
          delayGaps: 0,
          retryCount: 0,
          retryLimit: 10,
          retryAfter: 50,
        },
      },
    } as AxiosResponse

    mockRequest.mockResolvedValue(response)

    const create = createPolling(mockInstance)
    const { emit, on } = create()
    const responseCb = vi.fn()

    on('response', responseCb)
    emit({ poling: { retryAfter: 50 } })

    await vi.advanceTimersByTimeAsync(50)

    expect(responseCb).toHaveBeenCalledWith(response)
  })

  it('on error: should call error callback when request fails', async () => {
    const error = {
      config: {
        poling: {
          count: 0,
          delay: 1000,
          delayGaps: 0,
          retryCount: 0,
          retryLimit: 10,
          retryAfter: 50,
        },
      },
      isAxiosError: true,
    }

    mockRequest.mockRejectedValue(error)

    const create = createPolling(mockInstance)
    const { emit, on } = create()
    const errorCb = vi.fn()

    on('error', errorCb)
    emit({ poling: { retryAfter: 50 } })

    await vi.advanceTimersByTimeAsync(50)

    expect(errorCb).toHaveBeenCalledWith(error)
  })

  it('off: should stop loop when called', async () => {
    const response: AxiosResponse = {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        poling: {
          count: 0,
          delay: 100,
          delayGaps: 0,
          retryCount: 0,
          retryLimit: 10,
          retryAfter: 50,
        },
      },
    } as AxiosResponse

    mockRequest.mockResolvedValue(response)

    const create = createPolling(mockInstance)
    const { emit, on, off } = create()
    const responseCb = vi.fn()

    on('response', responseCb)
    emit({ poling: { retryAfter: 50 } })

    await vi.advanceTimersByTimeAsync(50)
    expect(responseCb).toHaveBeenCalledTimes(1)

    off()

    await vi.advanceTimersByTimeAsync(200)
    expect(responseCb).toHaveBeenCalledTimes(1)
  })
})

describe('axiosPolling', () => {
  it('should set axios.defaults.poling and axios.poll', () => {
    const axios = {
      defaults: {} as any,
      poll: null as any,
    }

    axiosPolling(axios as any, { delay: 2000 })

    expect(axios.defaults.poling).toBeDefined()
    expect(axios.defaults.poling.delay).toBe(2000)
    expect(axios.defaults.poling.count).toBe(0)
    expect(axios.defaults.poling.retryLimit).toBe(10)
    expect(axios.poll).toBeDefined()
    expect(typeof axios.poll).toBe('function')
  })

  it('should use default config when no config provided', () => {
    const axios = {
      defaults: {} as any,
      poll: null as any,
    }

    axiosPolling(axios as any)

    expect(axios.defaults.poling).toEqual(
      expect.objectContaining({
        count: 0,
        delay: 1000,
        delayGaps: 0,
        retryCount: 0,
        retryLimit: 10,
        retryAfter: 1000,
      }),
    )
  })
})
