import { getMedian } from '.'

describe(getMedian, function () {
  it('returns 0 for 0 filled array', () => {
    expect(getMedian([])).toBe(-1)
    expect(getMedian([0])).toBe(-1)
    expect(getMedian([0, 0])).toBe(-1)
    expect(getMedian([0, 0, 0])).toBe(-1)
    expect(getMedian([0, 0, 0, 0])).toBe(-1)
    expect(getMedian([0, 0, 0, 0, 0])).toBe(-1)
    expect(getMedian([0, 0, 0, 0, 0, 0])).toBe(-1)
  })
  it('returns last idx', () => {
    expect(getMedian([1])).toBe(0)
    expect(getMedian([0, 1])).toBe(1)
    expect(getMedian([0, 0, 1])).toBe(2)
    expect(getMedian([0, 0, 0, 1])).toBe(3)
    expect(getMedian([0, 0, 0, 0, 1])).toBe(4)
    expect(getMedian([0, 0, 0, 0, 0, 1])).toBe(5)
    expect(getMedian([0, 0, 0, 0, 0, 0, 1])).toBe(6)
  })
  it('returns middle idx', () => {
    expect(getMedian([1, 1])).toBe(0.5)
    expect(getMedian([1, 0, 1])).toBe(1)
    expect(getMedian([1, 0, 0, 1])).toBe(1.5)
    expect(getMedian([1, 0, 0, 0, 1])).toBe(2)
    expect(getMedian([1, 0, 0, 0, 0, 1])).toBe(2.5)
    expect(getMedian([1, 0, 0, 0, 0, 0, 1])).toBe(3)
  })
  it('returns first idx', () => {
    expect(getMedian([1, 0])).toBe(0)
    expect(getMedian([1, 0, 0])).toBe(0)
    expect(getMedian([1, 0, 0, 0])).toBe(0)
    expect(getMedian([1, 0, 0, 0, 0])).toBe(0)
    expect(getMedian([1, 0, 0, 0, 0, 0])).toBe(0)
  })
})
