// 全局参数和数据区
// 搜索的参数配置和querydata作为全局变量保存

global.config = {
    // 生产环境server
    // url:"http://101.43.173.70:9000/",
    // 开发、测试环境server
    url: "http://localhost:9000/",
    k:10,
    error:0,
    mode:0,
    preRows:10,
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
