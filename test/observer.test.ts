import { describe, expect, it, vi } from 'vitest'
import { LoopObserver } from '../src/observer'

describe('loopObserver', () => {
  it('should create with default id, loop=true, and empty stacks', () => {
    const observer = new LoopObserver()

    expect(observer.id).toBeDefined()
    expect(observer.id.length).toBe(10)
    expect(observer.loop).toBe(true)
    expect(observer.stacks.request).toEqual([])
    expect(observer.stacks.response).toEqual([])
    expect(observer.stacks.error).toEqual([])
  })

  it('should accept custom id and loop', () => {
    const observer = new LoopObserver('custom-id', false)

    expect(observer.id).toBe('custom-id')
    expect(observer.loop).toBe(false)
  })

  it('on: should register callbacks for request event', () => {
    const observer = new LoopObserver()
    const cb = vi.fn()

    observer.on('request', cb)

    expect(observer.stacks.request).toHaveLength(1)
    expect(observer.stacks.request[0]).toBe(cb)
  })

  it('on: should register callbacks for response event', () => {
    const observer = new LoopObserver()
    const cb = vi.fn()

    observer.on('response', cb)

    expect(observer.stacks.response).toHaveLength(1)
    expect(observer.stacks.response[0]).toBe(cb)
  })

  it('on: should register callbacks for error event', () => {
    const observer = new LoopObserver()
    const cb = vi.fn()

    observer.on('error', cb)

    expect(observer.stacks.error).toHaveLength(1)
    expect(observer.stacks.error[0]).toBe(cb)
  })

  it('remove: should clear all stacks', () => {
    const observer = new LoopObserver()
    observer.on('request', vi.fn())
    observer.on('response', vi.fn())
    observer.on('error', vi.fn())

    observer.remove()

    expect(observer.stacks.request).toEqual([])
    expect(observer.stacks.response).toEqual([])
    expect(observer.stacks.error).toEqual([])
  })

  it('off: should set loop to false', () => {
    const observer = new LoopObserver()

    expect(observer.loop).toBe(true)
    observer.off()
    expect(observer.loop).toBe(false)
  })
})
