/* eslint-disable @typescript-eslint/no-non-null-assertion */

export const shuffleArray = <T>(_array: T[], rng: () => number): T[] => {
  const array = [..._array]
  let m = array.length

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    const r = rng()
    const i = Math.floor(r * m--)
    const t = array[m]!
    array[m] = array[i]!
    array[i] = t
  }
  return array
}
