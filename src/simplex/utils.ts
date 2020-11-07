export const matrixString = (matrix: number[][]) => {
  const size = 6

  return (
    '\n' +
    matrix
      .map((r) =>
        r
          .map((c) =>
            (Math.round(c * 1000) / 1000)
              .toString()
              .padStart(size, ' ')
              .substr(0, size),
          )
          .join(' '),
      )
      .join('\n')
  )
}
