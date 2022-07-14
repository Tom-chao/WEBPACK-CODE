const os = require("os")
const path = require("path")//node.js核心模块，专门用来处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');//自动引入
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");//压缩图片
const threads = os.cpus().length
//封装loader函数,用来获取处理样式的loader
function getStyleLoader(pre) {
    return [
        //执行顺序，从右往左（从下往上）
        MiniCssExtractPlugin.loader,
        'css-loader', //将css资源编译成commonjs
        {
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                    plugins: [
                        [
                            "postcss-preset-env"
                        ],
                    ],
                },
            },
        },
        pre
    ].filter(Boolean)
}
module.exports = {
    //入口
    entry: "./src/main.js",//相对路径 
    //输出
    output: {
        //所有文件输出路径
        //__dirname nodejs的变量，代表当前文件的文件目录
        path: path.resolve(__dirname, "../dist"),//绝对路径
        //入口文件打包输出的文件名
        filename: "static/js/main.js",
        //自动清空上次打包的内容
        //原理：在打包前，将path整个目录内容清空，再进行打包
        clean: true,
    },
    //加载器
    module: {
        rules: [
            //loader的配置
            {
                oneOf: [//提升打包速度oneOf
                    {
                        test: /\.css$/,//只检测css文件
                        use: getStyleLoader()
                    },
                    {
                        test: /\.less$/,
                        use: getStyleLoader("less-loader")
                    },
                    {
                        test: /\.styl$/,
                        use: getStyleLoader("stylus-loader")
                    },
                    {
                        test: /\.s[ac]ss$/,
                        use: getStyleLoader("sass-loader")
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
                    }
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
        new MiniCssExtractPlugin({
            filename: "static/css/main.css"
        }),
        
        // new TerserWebpackPlugin({
        //     parallel: threads,//开启多进程和设置进程数量
        // }),
        // new CssMinimizerPlugin({})
    ],
    //开发服务器,用来自动化，也就是更新代码同步到页面
    // devServer: {
    //     host: "localhost",//启动服务器域名
    //     port: "3000",//启动服务器端口号
    //     open: true,//是否自动打开浏览器
    // },
    //模式
    optimization: {
        //压缩的操作
        minimizer: [
            //压缩js
            new TerserWebpackPlugin({
                parallel: threads,//开启多进程和设置进程数量
            }),
            //压缩css
            new CssMinimizerPlugin({}),
            //压缩图片
        new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            // Lossless optimization with custom option
            // Feel free to experiment with options for better result for you
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              // Svgo configuration here https://github.com/svg/svgo#configuration
              [
                "svgo",
                {
                  plugins: extendDefaultPlugins([
                    {
                      name: "removeViewBox",
                      active: false,
                    },
                    {
                      name: "addAttributesToSVGElement",
                      params: {
                        attributes: [{ xmlns: "http://www.w3.org/2000/svg" }],
                      },
                    },
                  ]),
                },
              ],
            ],
          },
        },
      }),
        ]
    },
    mode: "production",
    devtool: "source-map",//原始源代码
}