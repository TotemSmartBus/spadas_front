import {atom} from 'jotai'
import './global'

export const rangeQueryModeSate = atom(global.config.rangeQueryMode[0])
export const pointQueryModeSate = atom(global.config.pointQueryMode[0])
export const topKState = atom(global.config.k)