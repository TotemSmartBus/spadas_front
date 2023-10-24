// 全局参数和数据区
// 搜索的参数配置和querydata作为全局变量保存
global.config = {
    rangeQueryMode: ['IA', 'GBO'],
    pointQueryMode: ['Haus', 'IA', 'GBO'],
    // 试试将url参数抽取到命令行中作为参数
    url: process.env.REACT_APP_BACKEND_URL,
    k: 5,
    error: 0,
    examplarMode: 0,
    rangeMode: 1,
    preRows: 20,
    unionIds: [],
    colors: ['#ce5242',
        '#f6ad49',
        '#fbd26b',
        '#68be8d',
        '#2ca9e1',
        '#4c6cb3',
        '#9079ad',
        '#b4866b'
    ]
}

global.data = {
    querydata: [],
}

// 为Array原型添加contain函数
Array.prototype.contain = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === val) {
            return true;
        }
    }
    return false;
}

export default global