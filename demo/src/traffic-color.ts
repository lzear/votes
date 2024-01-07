import { Hsluv } from 'hsluv'
import _ from 'lodash-es'

const hsluvToHex = ([h, s, l]: [h: number, s: number, l: number]): string => {
  const hsluv = new Hsluv()
  hsluv.hsluv_h = h
  hsluv.hsluv_s = s
  hsluv.hsluv_l = l
  hsluv.hsluvToHex()
  return hsluv.hex
}

export const trafficColor = (score: number, s: number, l: number): string => {
  const hsluv = new Hsluv()
  hsluv.hsluv_h = score * 150
  hsluv.hsluv_s = s
  hsluv.hsluv_l = l
  hsluv.hsluvToHex()
  return hsluvToHex([score * 150, s, l])
}

export const rainbow = (count: number, s: number, l: number): string[] =>
  _.range(count).map((v) => hsluvToHex([(360 * v) / count, s, l]))
