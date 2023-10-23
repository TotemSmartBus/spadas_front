import React, {useContext} from 'react'
import {PointQueryModeContext, RangeQueryModeContext} from '../../OptionPanel/OptionPanel'
import SearchDetail from './SearchDetail'

export const SearchDetailWithContext = (SearchDetail) => {
    return (props) => {
        const rangeQueryMode = useContext(RangeQueryModeContext)
        const pointQueryMode = useContext(PointQueryModeContext)
        return <SearchDetail rangeQueryMode={rangeQueryMode} pointQueryMode={pointQueryMode} {...props} />
    }
}