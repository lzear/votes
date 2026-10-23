/**
`value` frozen, with every array and object it holds: a cached result,
which callers then can't change for the next call.
*/
export const deepFreeze = <T>(value: T): T => {
  if (typeof value === 'object' && value !== null) {
    Object.freeze(value)
    for (const v of Object.values(value)) deepFreeze(v)
  }
  return value
}
