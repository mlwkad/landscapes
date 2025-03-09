import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'
//npm install @vueuse/core
import { useIntersectionObserver } from '@vueuse/core'
import USEI18N from '@/utils/i18n/language'
import '@/assets/styles.less'
import '@/assets/property.less'
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(USEI18N)
app.mount('#app')

//app.directive('xx',{生命周期(){}})
// 懒加载图片
app.directive('lazyimg', {  //创建 v-lazyimg 指令
    mounted(el) {  //指令在元素挂载后执行,el就是被绑定的元素
        //1.缓存图片的网址
        const originsrc = el.src
        //2.使用占位图(先不向真正的图片网址发起请求,防止过多请求)
        el.src = "#"
        //3.监视元素
        const { stop } = useIntersectionObserver(el, ([{ isIntersecting }]) => {
            if (isIntersecting) {
                //图片可见时,还原网址,发出请求
                el.src = originsrc
                console.log('图片出来了')
                stop()  //停止监视
                //每多一张图片可见,才多一次请求,表示成功实现
            }
        })
    }
})
// 淡入动画
app.directive('SiHuaJinRu', {
    mounted(el) {
        const { stop } = useIntersectionObserver(el, ([{ isIntersecting }]) => {  //元素每次将要显示或者被隐藏时触发
            //stop()//停止监视元素(只监视一次),不写就是一直监视元素
            if (isIntersecting) {
                el.classList.add('fade-in-animation')  //该样式只写在 使用该指令的组件里
                // element.classList.remove('fade-out-animation')
            }
            else {  //视为不显示时
                // element.classList.add('fade-out-animation')
                el.classList.remove('fade-in-animation')
                el.style.opacity = '0'  //关键:设为透明防频闪
            }
        }, { threshold: 0.15 })  //显示元素的百分之多少时,视为组件将要显示
    }
})

