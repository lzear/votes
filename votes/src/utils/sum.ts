export const sum = (values: readonly number[]): number =>
  values.reduce((acc, v) => acc + v, 0)
