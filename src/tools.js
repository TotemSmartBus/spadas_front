/**
 * At each level, geographical distance for each pixel.
 * You can convert zoom level by dataset distribution.
 *
 * ref: https://docs.mapbox.com/help/glossary/zoom-level/
 *
 * @type {number[]}
 */

const levelMap = [
    78271.484,
    39135.742,
    19567.871,
    9783.936,
    4891.968,
    2445.984,
    1222.992,
    611.496,
    305.748,
    152.874,
    76.437,
    38.218,
    19.109,
    9.555,
    4.777,
    2.389,
    1.194,
    0.597,
    0.299,
]

/**
 * assume that map has 1400 pixels in one row
 * */
const resolution = 1400

const DEFAULT_LEVEL = 8


//进行经纬度转换为距离的计算
function Rad(d) {
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
}

//计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
export function GetDistance(lat1, lng1, lat2, lng2) {
    let radLat1 = Rad(lat1);
    let radLat2 = Rad(lat2);
    let a = radLat1 - radLat2;
    let b = Rad(lng1) - Rad(lng2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;// EARTH_RADIUS;
    s = Math.round(s * 1000); //输出为m
    return s;
}

export function convertToZoomLevel(radius) {
    let meterPerPixel = radius * 2 / resolution
    for (let i = 0; i < levelMap.length; i++) {
        if (meterPerPixel > levelMap[i]) {
            return i
        }
    }
    return DEFAULT_LEVEL
}