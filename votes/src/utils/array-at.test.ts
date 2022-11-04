import { arrayAt } from './array-at'

describe(arrayAt, () => {
  it.each([
    { array: [] },
    { array: [1] },
    { array: [1, 2] },
    { array: [1, 2, 3] },
    { array: [1, 2, 3, 4] },
  ])('%o', ({ array }) => {
    for (let at = -20; at < 20; at++)
      expect(arrayAt(array, at)).toBe(array.at(at))
  })
})
