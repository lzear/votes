import { totalWeight } from './generate-ballots'

type WithWeights = { weight: number; id: string }

export type Scale = { [id: string]: { offset: number; width: number } }

export const scaling = ({
  array: _array,
  paddingInner,
  domain = [0, 1],
}: {
  array: (WithWeights | string | number)[]
  paddingInner: number
  domain?: [number, number]
}): { [id: string]: { offset: number; width: number } } => {
  const array = _array.map((id) =>
    typeof id === 'string' || typeof id === 'number'
      ? { id: id.toString(), weight: 1 }
      : id,
  )
  const tot = totalWeight(array)
  const cols: {
    [id: string]: {
      offset: number
      width: number
    }
  } = {}
  const gutter = array.length > 1 ? paddingInner / (array.length - 1) : 0
  let offset = 0 // domain[0]
  const step = array.length > 1 ? (1 - paddingInner) / tot : 1 / tot
  for (const item of array) {
    const width = step * item.weight
    cols[item.id] = {
      offset: domain[0] + offset * (domain[1] - domain[0]),
      width: width * (domain[1] - domain[0]),
    }
    offset += gutter + width
  }
  return cols
}
