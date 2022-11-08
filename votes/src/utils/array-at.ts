/**
 * Replacement for `Array.at`. Should have the exact same behaviour.
 */
export const arrayAt = <T>(array: T[], at: number): T =>
  array[at < 0 ? array.length + at : at]
