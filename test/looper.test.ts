import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLooper } from '../src/looper'

describe('createLooper', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return a function that schedules callback with setTimeout', () => {
    const fn = vi.fn()
    const loop = createLooper(fn)

    expect(typeof loop).toBe('function')
    loop(1000)

    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should use default 1000ms when no time provided', () => {
    const fn = vi.fn()
    const loop = createLooper(fn)

    loop()

    vi.advanceTimersByTime(999)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should return a value from setTimeout', () => {
    const fn = vi.fn()
    const loop = createLooper(fn)

    const result = loop(500)

    expect(result).toBeDefined()
  })
})
