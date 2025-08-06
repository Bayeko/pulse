import { describe, it, expect } from 'vitest'
import { withRetry } from './retry'

describe('withRetry', () => {
  it('stops after the specified number of retries', async () => {
    let calls = 0
    const failingFn = async () => {
      calls++
      return { error: new Error('fail') }
    }

    const result = await withRetry(failingFn, 3, 0)
    expect(calls).toBe(3)
    expect(result.error).toBeInstanceOf(Error)
  })
})
