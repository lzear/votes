interface Point {
  x: number
  y: number
}

interface PointLink {
  weight: number
  source: Point
  target: Point
}

export const curvedPath = (
  link: PointLink,
  [padding1, padding2]: [number, number],
  curve: number,
): string | null => {
  const dx = link.target.x - link.source.x
  const dy = link.target.y - link.source.y
  const dr = Math.sqrt(dx * dx + dy * dy)

  if (!dr) return `M${0},${0}Q${0},${0},${0},${0}`
  const normal = [dy / dr, -dx / dr]
  const qx = dx / 2 + dr * curve * normal[0]
  const qy = dy / 2 + dr * curve * normal[1]
  const qx1 = -dx / 2 + dr * curve * normal[0]
  const qy2 = -dy / 2 + dr * curve * normal[1]
  const qr = Math.sqrt(qx * qx + qy * qy)

  const Qx = link.source.x + qx
  const Qy = link.source.y + qy
  const start = [
    link.source.x + (padding1 * qx) / qr,
    link.source.y + (padding1 * qy) / qr,
  ]

  const end = [
    link.target.x + (padding2 * qx1) / qr,
    link.target.y + (padding2 * qy2) / qr,
  ]

  return `M${Math.round(start[0])},${Math.round(start[1])}Q${Math.round(
    Qx,
  )},${Math.round(Qy)},${Math.round(end[0])},${Math.round(end[1])}`
}
