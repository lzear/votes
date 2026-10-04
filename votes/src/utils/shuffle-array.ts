/* eslint-disable @typescript-eslint/no-non-null-assertion */

export const shuffleArray = <T>(_array: T[], rng: () => number): T[] => {
  const array = [..._array]
  let m = array.length

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element… the last one when `rng()` gives 1.
    const i = Math.min(Math.floor(rng() * m), m - 1)
    m--
    const t = array[m]!
    array[m] = array[i]!
    array[i] = t
  }
  return array
}
