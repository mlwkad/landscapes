import { fileURLToPath, URL } from 'node:url'
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
  plugins: [
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
    compression({  // npm i vite-plugin-compression -D 对生产环境的文件进行gzip压缩 配合Nginx使用
      //浏览器发送请求时,请求头Accept-Encoding: gzip，表示浏览器支持gzip压缩
      //响应头Content-Encoding: gzip 表示该资源使用了 gzip 压缩,浏览器会自动解压
      threshold: 10240,  // >=10kb的文件进行压缩
      algorithm: 'gzip'
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        //   manualChunks(id) {
        //     if (id.includes('src')) {
        //       return 'business'
        //     }
        //     else {
        //       console.log(id)  //其他默认打包到
        //     }
        //   },
        manualChunks: {  //将生产依赖打包到chunk-vendors.js,下次更新时,如果依赖没有变化,则不会重新打包这个文件
          'chunk-vendors': ['vue', 'vue-router', 'pinia', 'axios', 'element-plus', '@vueuse/core', 'vue-i18n']
        }
      }
    }
  }
})