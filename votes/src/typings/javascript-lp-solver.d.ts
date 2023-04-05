declare module 'javascript-lp-solver' {
  interface Model {
    optimize: string
    opType: string
    constraints: Record<string, { min?: number; max?: number }>
    variables: Record<string, Record<string, number>>
    ints?: Record<string, number>
  }

  export function Solve(model: Model): Record<string, number>
}
