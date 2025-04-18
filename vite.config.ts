// import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'  //8
import path from 'path';
import Components from 'unplugin-vue-components/vite';  //9
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [  // 插件
    //npm install rollup-plugin-visualizer --save-dev
    visualizer({ open: true }),  //打包结果分析
    vue(),
    AutoImport({  //8
      resolvers: [ElementPlusResolver()],  //10.自动导入组件
      imports: ['vue', 'vue-router']  //自动引入核心vue,vue-router的API
    }),
    Components({  //9
      resolvers: [ElementPlusResolver()]  //10.自动按需加载组件
    }),
    compression({
      // npm i vite-plugin-compression -D 对生产环境的文件进行gzip压缩 配合Nginx使用
      //浏览器发送请求时,请求头Accept-Encoding: gzip，表示浏览器支持gzip压缩
      //响应头Content-Encoding: gzip 表示该资源使用了 gzip 压缩,浏览器会自动解压
      threshold: 20480,  // >=20kb的文件进行压缩
      algorithm: 'gzip',
      ext: '.gz'
    }),
  ],
  resolve: {
    alias: {  //别名
      '@': path.resolve(__dirname, './src')
    },
    // extensions:['.js','.css','.ts']  // 后缀名可以省略
  },
  server: {
    // port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },
  build: {
    assetsInlineLimit: 1024,  //大于1KB的静态资源(图片,字体,音视频,json,文本)提取为单独文件，小于1KB的内联到JS中
    rollupOptions: {  // rollup配置
      output: {
        entryFileNames: 'Entry-[hash:6].js',
        chunkFileNames: '[name]-[hash:6].js',
        // 路由懒加载,异步组件...这些组件都会打包成chunk,name是组件名
        manualChunks: {
          //将生产依赖打包到Vendors.js,下次更新时,如果依赖没有变化,则不会重新打包这个文件
          'Vendors': ['vue', 'vue-router', 'pinia', 'element-plus', 'axios', '@vueuse/core', 'vue-i18n']
        },
        // 自定义静态资源输出目录和文件名
        assetFileNames: (assetInfo) => {
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `assets/img/[name]-[hash:6].[ext]`;
          }
          return `assets/[ext]/[name]-[hash:6].[ext]`;
        }
      },
    }
  }
})