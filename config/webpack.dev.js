const os = require("os")
const path = require("path") //node.js核心模块，专门用来处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); //自动引入
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const threads = os.cpus().length
module.exports = {
    //入口
    entry: "./src/main.js", //相对路径 
    //输出
    output: {
        //所有文件输出路径
        //__dirname nodejs的变量，代表当前文件的文件目录
        //开发模式没有输出，因为配置了webpack-dev-server，都是在内存中编译打包的
        path: undefined,
        //入口文件打包输出的文件名
        filename: "static/js/main.js",
        //自动清空上次打包的内容
        //原理：在打包前，将path整个目录内容清空，再进行打包
        // clean:true,
    },
    //加载器
    module: {
        rules: [
            //loader的配置
            {
                oneOf: [{
                    test: /\.css$/, //只检测css文件
                    use: [
                        //执行顺序，从右往左（从下往上）
                        MiniCssExtractPlugin.loader,
                        'css-loader' //将css资源编译成commonjs
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader, // creates style nodes from JS strings  
                        "css-loader", // translates CSS into CommonJS
                        "less-loader" // compiles Less to CSS
                    ]
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        MiniCssExtractPlugin.loader, // 将 JS 字符串生成为 style 节点
                        "css-loader", // 将 CSS 转化成 CommonJS 模块
                        "sass-loader" // 将 Sass 编译成 CSS
                    ]
                },
                {
                    test: /\.styl$/,
                    use: [
                        MiniCssExtractPlugin.loader, // 将 JS 字符串生成为 style 节点
                        "css-loader", // 将 CSS 转化成 CommonJS 模块
                        "stylus-loader" // 将 Sass 编译成 CSS
                    ]
                },
                {
                    test: /\.(png|jpe?g|gif|webp|svg)$/,
                    type: 'asset',
                    parser: {
                        dataUrlCondition: {
                            //小于10KB的图片转化为base64
                            //优点：减少请求数量  缺点：体积会更大
                            maxSize: 10 * 1024 // 10kb
                        }
                    },
                    generator: {
                        //输出图片的名称
                        //[hash:10]hash值取前十位
                        filename: 'static/images/[hash:10][ext][query]'
                    }
                },
                {
                    test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
                    type: 'asset/resource',
                    parser: {
                        dataUrlCondition: {
                            //小于10KB的图片转化为base64
                            //优点：减少请求数量  缺点：体积会更大
                            maxSize: 10 * 1024 // 10kb
                        }
                    },
                    generator: {
                        //输出图片的名称
                        //[hash:10]hash值取前十位
                        filename: 'static/media/[hash:10][ext][query]'
                    }
                },
                {
                    test: /\.js$/,
                    // exclude: /node_modules/,//排除node_modules下的文件，其他文件都处理
                    include: path.resolve(__dirname, "../src"),//只处理src下的文件，其他文件不处理
                    use: [
                        {
                            loader: 'thread-loader',//开启多进程
                            options: {
                                works: threads,//进程数量

                            }
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                cacheDirectory: true,//开启babel缓存
                                cacheCompression: false,//关闭缓存文件压缩
                                plugins: ['@babel/plugin-transform-runtime'],//减少代码体积
                            }
                        }
                    ]
                },
                ]
            }
        ]
    },
    //插件
    plugins: [
        //plugins的配置
        new ESLintPlugin({
            //检测哪些文件
            context: path.resolve(__dirname, "../src"),
            exclude: "node_modules",//默认
            cache: true,//开启缓存
            cacheLocation: path.resolve(__dirname, "../node_modules/.cache/eslintcache"),
            threads,//开启多进程
        }),
        //HTML的配置
        new HtmlWebpackPlugin({
            //模板：以public/index.html文件创建新的HTML文件
            //新的HTML文件特点：1.结构和原来一致  2.自动引入打包的资源
            template: path.resolve(__dirname, "../public/index.html"),
        }),
        new MiniCssExtractPlugin()
    ],
    //开发服务器
    devServer: {
        host: "localhost", //启动服务器域名
        port: "3000", //启动服务器端口号
        open: true, //是否自动打开浏览器
        hot: true, //开启HMR（热重载）
    },
    //模式
    mode: "development",
    devtool: "cheap-module-source-map", //原始源代码（仅限行）
}