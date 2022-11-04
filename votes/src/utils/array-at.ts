export const arrayAt = <T>(array: T[], at: number): T =>
  array[at < 0 ? array.length + at : at]
