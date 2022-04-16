const moveTo = (
  buckets: { id: string; elements: number[] }[],
  item: number,
  oldRank: number,
  newRank: number,
) =>
  buckets.map((b, i) => {
    if (i === oldRank)
      return {
        id: b.id,
        elements: b.elements.filter((itm) => itm !== item),
      }
    if (i === newRank)
      return {
        id: b.id,
        elements: [...b.elements, item],
      }
    return b
  })

const removeEmptySeqs = (buckets: { id: string; elements: number[] }[]) =>
  buckets.filter(
    (b, idx, ar) =>
      b.elements.length > 0 ||
      !(
        (ar[idx + 1] &&
          ar[idx + 1].elements.length === 0 &&
          ar[idx + 2] &&
          ar[idx + 2].elements.length === 0) ||
        (ar[idx - 1] &&
          ar[idx - 1].elements.length === 0 &&
          ar[idx - 2] &&
          ar[idx - 2].elements.length === 0)
      ),
  )

const rString = (): string => Math.random().toString(36).slice(2)

const emptBB = (): { id: string; elements: number[] } => ({
  id: rString(),
  elements: [],
})

const insetEmpties = (buckets: { id: string; elements: number[] }[]) => {
  const ra: { id: string; elements: number[] }[] = []
  return buckets.reduce((p, el, idx, sss) => {
    if (sss[idx].elements.length === 0) return [...p, el]
    const r = idx === 0 ? [emptBB()] : p
    if (
      idx === sss.length - 1 ||
      (sss[idx + 1] && sss[idx + 1].elements.length > 0)
    )
      return [...r, el, emptBB()]
    return [...r, el]
  }, ra)
}

export const updateBuckets = (
  buckets: { id: string; elements: number[] }[],
  item: number,
  newRank: number,
) => {
  const oldRank = buckets.findIndex((b) => b.elements.includes(item))
  if (oldRank === newRank) return buckets
  let r
  if (newRank % 2) {
    // newRank has elements
    r = moveTo(buckets, item, oldRank, newRank)
  } else {
    // newRank has no elements
    if (
      buckets[oldRank].elements.length === 1 &&
      Math.abs(oldRank - newRank) < 2
    )
      return buckets
    r = moveTo(buckets, item, oldRank, newRank)
  }
  return insetEmpties(removeEmptySeqs(r))
}
