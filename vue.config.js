const isProduction = process.env.NODE_ENV === 'production'
const proCDN = {
  css: [
    'https://cdn.bootcss.com/element-ui/2.13.0/theme-chalk/index.css'
  ],
  js: [
    'https://cdn.bootcss.com/babel-polyfill/6.23.0/polyfill.min.js',
    'https://cdn.bootcss.com/vue/2.6.11/vue.min.js',
    'https://cdn.jsdelivr.net/npm/vue-router@3.1.6/dist/vue-router.min.js',
    'https://cdn.bootcss.com/vuex/3.1.3/vuex.min.js'
  ]
}
const devCDN = {
  css: [
  ],
  js: [
    'https://cdn.bootcss.com/babel-polyfill/6.23.0/polyfill.min.js'
  ]
}
const Version = new Date().getTime()
const path = require('path')
function resolve (dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: './',
  productionSourceMap: !isProduction,
  devServer: {
    open: true,
    hotOnly: true,
    proxy: {
      '/apiPro': {
        target: 'http://localhost:6364',
        ws: true,
        changOrigin: true,
        pathRewrite: {
          '/apiPro': ''
        }
      }
    }
  },
  chainWebpack: config => {
    config.resolve.symlinks(true) // 修复热更新失效
    config.plugin('html')
      .tap(args => {
        args[0].cdn = isProduction ? proCDN : devCDN
        return args
      })
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
    config.resolve.alias.set('@', resolve('src'))
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  },
  configureWebpack: config => {
    config.output.chunkFilename = 'js/[name].[' + Version + '].js' // 这种方式适合设备缓存不严重的
    // config.output.chunkFilename = 'js/[name].js?v=' + Version // 这种是给打包后的chunk文件加版本号。
    if (isProduction) {
      // 用cdn方式引入
      config.externals = {
        vue: 'Vue',
        vuex: 'Vuex',
        'element-ui': 'ELEMENT',
        'vue-router': 'VueRouter'
      }
    }
  },
  css: {
    // 向预处理器 Loader 传递选项
    loaderOptions: {
      scss: {
      // 全局变量
      //   prependData: `
      //   @import "~@/assets/css/index.scss";
      // `
      //   prependData: `
      //   @import '.@/styles/common.scss';
      // `
      },
      postcss: {
        plugins: [
          require('autoprefixer')({
            // browsers: ['last 2 versions']
            overrideBrowserslist: ['last 10 Chrome versions', 'last 5 Firefox versions', 'Safari >= 6', 'ie > 8']
          })
        ]
      }
    }
    // css 生成名称默认配置
    /* extract: {
      filename: `css/[name].[contenthash:8].css`,
      chunkFilename: `css/[name].[contenthash:8].css`
    } */
  },
  // 文件名称不需要hash
  // filenameHashing: false,
  transpileDependencies: [
    'element-ui',
    'vuetify'
  ]
}
