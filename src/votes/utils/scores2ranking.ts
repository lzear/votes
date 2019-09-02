export default (rankinput: (string | string[])[]) =>
  rankinput.map(rank => (typeof rank === 'string' ? [rank] : rank))
