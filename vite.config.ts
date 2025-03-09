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
    compression({  //npm i vite-plugin-compression --save-dev  gzip压缩
      threshold: 10240,  //10kb
      algorithm: 'gzip'
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  //代理设置
  //npm install -g surge
  //1.surge login 350221...  @@@hat...
  //2.npm run build
  //3.surge dist components3502219532.surge.sh
  //4.surge logout 后 重复1
  //surge .                    为更新操作(surge自动分配域名 )
  //surge . 新域名.surge.sh    为更新操作(自设域名)
  server: {
    proxy: {
      '/api': 'http://testapi.xuexiluxian.cn'  //其他请求为/api/...时,被代理成http://testapi.xuexiluxian.cn/api/...
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