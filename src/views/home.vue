<template>
    <div class="header-zone">
        <header class="header">
            <div v-for="item in header" :key="item.id" class="header-font" @click="go(item)"
                :style="{ 'backgroundColor': (activeId === item.id) && item.id !== 4 ? 'pink' : '' }">
                {{ item.id !== 4 ? item.name : '' }}
            </div>
        </header>
        <div class="park-line"></div>
    </div>
    <RouterView />
    <div class="go-top" v-if="goTopShow" @click="goTop">{{ t('huidaodingbu') }}</div>
</template>
<script setup lang="ts">
import { useRouter, RouterView } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
let activeId = ref(1)
let goTopShow = ref(false)
let curLanguage = ref(localStorage.getItem('qweee-language') === 'zh' ? '中' : 'En')
let header = [{ id: 1, name: t('explore') }, { id: 2, name: t('treasure') }, { id: 3, name: t('wenwen') }, { id: 4, name: localStorage.getItem('qweee-token') ? t('loginOut') : t('login') }, { id: 5, name: curLanguage.value }]
//动态引入 --> 分隔代码
// const treasure = defineAsyncComponent(() => import('@/views/treasure.vue'))
const router = useRouter()
const go = (item: any) => {
    activeId.value = item.id
    if (item.id != 4 && item.id != 5) sessionStorage.setItem('activeId', item.id)
    if (item.id === 1) router.push({ path: '/baseshow' })
    if (item.id === 2) router.push({ path: '/treasure' })
    if (item.id === 3) router.push({ path: '/xunfei' })
    if (item.id === 4) {
        activeId.value = Number(sessionStorage.getItem('activeId'))
        //     if (localStorage.getItem('qweee-token') === null) router.push({ path: '/login' })
        //     else {
        //         localStorage.removeItem('qweee-token')
        //         window.location.reload()  //刷新当前页面
        //     }
    }
    if (item.id === 5) {
        localStorage.setItem('qweee-language', localStorage.getItem('qweee-language') === 'zh' ? 'en' : 'zh')
        window.location.reload()  //刷新当前页面
    }
}

const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
    if (sessionStorage.getItem('activeId') === '1' || sessionStorage.getItem('activeId') === null) {
        activeId.value = 1
        router.push({ path: '/baseshow' })
    }
    if (sessionStorage.getItem('activeId') === '2') {
        activeId.value = 2
        router.push({ path: '/treasure' })
    }
    if (sessionStorage.getItem('activeId') === '3') {
        activeId.value = 3
        router.push({ path: '/xunfei' })
    }
    const handleScroll = () => {
        if (window.scrollY > 800) goTopShow.value = true
        else goTopShow.value = false
    }
    window.addEventListener('scroll', handleScroll)
    onUnmounted(() => window.removeEventListener('scroll', handleScroll))
})

</script>
<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.header-zone {
    background-color: white;
    // backdrop-filter: blur(20px);
    z-index: 999;
    position: sticky;
    top: 0;

    .header {
        display: flex;
        justify-content: space-around;
        align-items: baseline;
        .rem(padding-top, 0.4);
        cursor: pointer;

        &-font {
            .rem(font-size, 1.1);

            @media(min-width:600px) {
                .rem(font-size, 1.3);
            }

            &:nth-child(5) {
                font-weight: 550;
                color: rgb(0, 0, 0);
                background-color: rgb(255, 255, 255);
                border: 2px solid rgb(68, 68, 68);
                border-radius: 30%;
                transition: background-color 0.3s ease, color 0.3s ease;
                .rem(padding, 0.2);
            }

            &:last-child:hover {
                color: rgb(255, 255, 255);
                background-color: rgb(0, 0, 0);
                border: 2px solid black;
                opacity: 0.7;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            &:not(:nth-child(5)) {
                font-weight: 800;
                color: rgb(77, 77, 77);
                background-color: white;
                transition: color 0.3s ease, background-color 0.3s ease;
                .rem(padding, 0.6);
                border-radius: 12px;
            }

            &:not(:last-child):hover {
                background-color: black;
                color: white;
                transition: background-color 0.3s ease, color 0.3s ease;
            }

            &:nth-child(4) {
                background-color: none;
            }

            &:nth-child(4):hover {
                background-color: white;
            }
        }
    }

    .park-line {
        width: 95%;
        margin: 0 auto;
        height: 1px;
        background-color: #000000;
        .rem(margin-top, 0.4);
    }
}

.go-top {
    position: fixed;
    bottom: 0;
    right: 20px;
    background-color: #000000;
    color: white;
    border-radius: 12px 12px 0 0;
    .rem(padding, 0.5);
    z-index: 999999;
    cursor: pointer;
}
</style>