import hsluv from 'hsluv'
import _ from 'lodash'

export const trafficColor = (score: number, s: number, l: number): string => {
  return hsluv.hsluvToHex([score * 150, s, l])
}

export const rainbow = (count: number, s: number, l: number): string[] =>
  _.range(count).map((v) => hsluv.hsluvToHex([(360 * v) / count, s, l]))
