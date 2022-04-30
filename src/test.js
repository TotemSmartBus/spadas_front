/**
 * 
 * @param {2-d array,lat&lon&time} data 
 * select the first vehicle path to be exhibited
 */
function getMainPath(data){
    result = []
    var pre=0.0
    for(var i=0;i<data.length;i++){
        line = data[i]
        if(line[2]!=pre){
            result.push(line)
        }
        pre = line[2]
    }
    return result
}



u = new Map()
arr1 = [1,2]
arr2 = [1,3]
u.set(1,arr1)
arr1.push(4)
console.log(u);