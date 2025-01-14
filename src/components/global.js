// 全局参数和数据区
// 搜索的参数配置和querydata作为全局变量保存
global.config = {
    rangeQueryMode: ['IA', 'GBO'],
    pointQueryMode: ['Haus', 'IA', 'GBO', 'EMD'],
    // 试试将url参数抽取到命令行中作为参数
    url: process.env.REACT_APP_BACKEND_URL,
    topK: 5,
    previewLimit: 20,
    map: {
        defaultCenter: [40.713922, -73.956008],
        defaultZoom: 4,
    },
    colors: ['#ce5242',
        '#f6ad49',
        '#f5e56b',
        '#68be8d',
        '#2ca9e1',
        '#4c6cb3',
        '#9079ad',
        '#b4866b',
        '#783c1d',
        '#180614',
    ],
}

export default global