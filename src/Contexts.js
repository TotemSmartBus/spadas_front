import {createContext} from 'react'

export const queryConfig = createContext({
    rangeQueryMode: config.rangeQueryMode[0],
    pointQueryMode: config.pointQueryMode[0],
    topK: 5,

})