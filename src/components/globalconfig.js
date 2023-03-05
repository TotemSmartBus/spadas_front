// 全局参数和数据区
// 搜索的参数配置和querydata作为全局变量保存

global.config = {
    // 生产环境server
    // url:"http://101.43.173.70:9000/",
    // 开发、测试环境server
    // 本地环境
    // url: "http://localhost:8081/spadas/api/",
    // url: "http://localhost:8080/spadas/api/",
    // url:"http://47.105.33.143:8081/",
    // url:"http://125.220.159.206:8081/",
    // url:"http://10.128.145.123:8081/",
    // 服务器环境
    url: "http://sheng.whu.edu.cn/spadas/api/",
    k:10,
    error:0,
    mode:0,
    preRows:20,
    traNum:200,
    unionIds:[]
}

global.data = {
  querydata:[]
}

// 为Array原型添加contain函数
Array.prototype.contain = function(val)
{
     for (var i = 0; i < this.length; i++)
    {
       if (this[i] == val)
      {
       return true;
      }
    }
     return false;
}
