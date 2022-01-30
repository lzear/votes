// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript

/* tslint:disable:no-bitwise */

const xmur3 = (str: string): (() => number) => {
  let h = 1_779_033_703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    const code = str.codePointAt(i)
    if (code === undefined) continue
    h = Math.imul(h ^ code, 3_432_918_353)
    h = (h << 13) | (h >>> 19)
  }
  return (): number => {
    h = Math.imul(h ^ (h >>> 16), 2_246_822_507)
    h = Math.imul(h ^ (h >>> 13), 3_266_489_909)
    return (h ^= h >>> 16) >>> 0
  }
}

const mulberry32 = (a: number) => () => {
  // tslint:disable-next-line
  let t = (a += 0x6d_2b_79_f5)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
}

export const rngGenerator: (seedStr: string) => () => number = (
  seedStr: string,
) => mulberry32(xmur3(seedStr)())
