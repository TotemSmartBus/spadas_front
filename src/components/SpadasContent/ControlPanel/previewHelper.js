// 保留小数位数的方法
import {Avatar, Tooltip} from 'antd'

(function () {
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number}      The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === "undefined" || +exp === 0) {
            return Math[type](value)
        }
        value = +value
        exp = +exp
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === "number" && exp % 1 === 0)) {
            return NaN
        }
        // Shift
        value = value.toString().split("e")
        value = Math[type](+(value[0] + "e" + (value[1] ? +value[1] - exp : -exp)))
        // Shift back
        value = value.toString().split("e")
        return +(value[0] + "e" + (value[1] ? +value[1] + exp : exp))
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust("round", value, exp)
        }
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust("floor", value, exp)
        }
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust("ceil", value, exp)
        }
    }
})()

export const FindRoadTableHeaders = [
    {
        title: 'Point',
        dataIndex: 'point',
        key: 'pointLocation',
        render: (_, i) => {
            let p = i.point
            return '[' + Math.round10(p[0], -4) + ',' + Math.round10(p[1], -4) + ']'
        },
    }, {
        title: 'Road ID',
        dataIndex: 'roadID',
        key: 'roadID',
    }, {
        title: 'Distance',
        dataIndex: 'distance',
        key: 'distance',
        render: (dist) => {
            if (typeof dist === 'number') {
                return (
                    <Tooltip title={dist}>
                        {dist < 0.01 ? '<0.01' : dist.toFixed(2)}
                    </Tooltip>
                )
            }
            return dist
        },
    }, {
        title: 'Road Points',
        dataIndex: 'roadPoints',
        key: 'roadPoints',
        render: (ps) => {
            if (ps == null) {
                return '/'
            }
            let fullList = ps.map(p => '[' + p[0] + ',' + p[1] + ']')
            let shortList = ps.map(p => '[' + Math.round10(p[0], -4) + ',' + Math.round10(p[1], -4) + ']')
            let shortContent = ''
            switch (shortList.length) {
                case 0:
                    shortContent = '[]';
                    break;
                case 1:
                    shortContent = shortList[0];
                    break;
                case 2:
                    shortContent = shortList[0] + ',' + shortList[1];
                    break;
                default:
                    shortContent = shortList[0] + ',...(' + (ps.length - 2) + ')...,' + shortList[shortList.length - 1]
            }
            let fullContent = ''
            for (let i = 0; i < fullList.length; i++) {
                fullContent += fullList[i] + '\n';
            }
            return (
                <p>
                    <Tooltip title={fullContent}>
                        {shortContent}
                    </Tooltip>
                </p>
            )
        },
    }]


// TODO SORTER
export const JoinTableHeaders = [
    {
        title: 'Query Point ID',
        dataIndex: 'id',
        key: 'queryPointID',
        render: (_, i) => {
            return (
                <Avatar style={{backgroundColor: '#1677ff'}}>{i.queryPoint.id}</Avatar>
            )
        },
    },
    {
        title: 'Query Point Location',
        dataIndex: 'queryLoc',
        key: 'queryPointLocation',
        render: (_, i) => {
            let p = i.targetPoint.location
            let full = '[' + p[0] + ',' + p[1] + ']'
            let short = '[' + Math.round10(p[0], -4) + ',' + Math.round10(p[1], -4) + ']'
            return (
                <Tooltip title={full}>
                    {short}
                </Tooltip>
            )
        },
    },
    {
        title: 'Distance(km)',
        dataIndex: 'distance',
        key: 'distance',
        render: (dist) => {
            if (typeof dist === 'number') {
                return (
                    <Tooltip title={dist}>
                        {dist < 0.01 ? '<0.01' : dist.toFixed(2)}
                    </Tooltip>
                )
            }
            return dist
        },
    },
    {
        title: 'Target Point ID',
        dataIndex: 'id',
        key: 'queryPointID',
        render: (_, i) => {
            return (
                <Avatar style={{backgroundColor: '#EC360F'}}>{i.targetPoint.id}</Avatar>
            )
        },
    },
    {
        title: 'Target Point Location',
        dataIndex: 'targetLoc',
        key: 'targetPointID',
        render: (_, i) => {
            let p = i.targetPoint.location
            let full = '[' + p[0] + ',' + p[1] + ']'
            let short = '[' + Math.round10(p[0], -4) + ',' + Math.round10(p[1], -4) + ']'
            return (
                <Tooltip title={full}>
                    {short}
                </Tooltip>
            )
        },
    },
]


export const UnionTableHeaders = [
    {
        title: 'Point ID',
        key: 'pointID',
        render: (_, i) => {
            if (i.isQuery) {
                return (
                    <Avatar style={{backgroundColor: '#EC360F'}}>{i.id}</Avatar>
                )
            } else {
                return (
                    <Avatar style={{backgroundColor: '#1677ff'}}>{i.id}</Avatar>
                )
            }
        },
    },
    {
        title: 'Longitude',
        dataIndex: 'lng',
        key: 'longitude',
        render: (i) => {
            return (
                <Tooltip title={i}>
                    {Math.round10(i, -4)}
                </Tooltip>
            )
        },
    },
    {
        title: 'Latitude',
        dataIndex: 'lat',
        key: 'latitude',
        render: (i) => {
            return (
                <Tooltip title={i}>
                    {Math.round10(i, -4)}
                </Tooltip>

            )
        },
    },
]
export const previewMode = {
    view: 'view',
    road: 'road',
    join: 'join',
    union: 'union',
}