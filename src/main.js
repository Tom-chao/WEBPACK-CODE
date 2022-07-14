import count from "./js/count";
import sum from "./js/sum";
import { mul } from "./js/math";
//想要webpack打包资源，必须引入该资源
import "./css/iconfont.css";
import "./css/index.css";
import "./less/index.less";
import "./sass/index.sass";
import "./stylus/index.styl";

const result = count(2,1)
console.log(result)
console.log(sum(1,2,3,4,5))
console.log(mul(3,3))

if (module.hot) {
    //判断是否支持热模块替换功能
    module.hot.accept("./js/count")
    module.hot.accept("./js/sum")
}