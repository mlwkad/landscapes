<template>
    <div class="header-zone">
        <header class="header">
            <div v-for="item in header" :key="item.id" class="header-font" @click="go(item)"
                :style="{ 'backgroundColor': activeId === item.id ? 'pink' : '' }">{{ item.name }}</div>
        </header>
        <div class="park-line"></div>
    </div>
    <div v-if="activeId === 1 || activeSecId === 1">
        <!-- <nice-show></nice-show> -->
        <!-- <picture-one></picture-one> -->
        <search></search>
        <picture-pool></picture-pool>
    </div>
    <div v-if="activeId === 2 || activeSecId === 2">
        <treasure></treasure>
    </div>
    <XunFei class="XF-position" v-if="activeId === 3"></XunFei>
    <div class="go-top" v-if="goTopShow" @click="goTop">回到顶部</div>
</template>
<script setup lang="ts">
import pictureOne from '@/views/picture-one.vue'
import NiceShow from '@/views/NiceShow.vue'
import search from './search.vue'
import XunFei from '@/views/XunFei.vue'
import treasure from './treasure.vue'
import PicturePool from '@/views/PicturePool.vue'
import { useRouter } from 'vue-router'
import { onMounted, onUnmounted, ref } from 'vue'
let activeId = ref(1)
let activeSecId = ref(1)
let goTopShow = ref(false)
let header = [{ id: 1, secId: 1, name: '探索' }, { id: 2, secId: 2, name: '收藏' }, { id: 3, name: '问问' }, { id: 4, name: '登录' }]
const router = useRouter()
const go = (item: any) => {
    activeId.value = item.id
    if (item.id === 1) activeSecId.value = item.secId
    if (item.id === 2) activeSecId.value = item.secId
    if (item.id === 4) router.push({ path: '/login' })
}

const goTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
    const handleScroll = () => {
        if (window.scrollY > 3000) goTopShow.value = true
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

            &:last-child {
                font-weight: 550;
                color: white;
                background-color: black;
                border-radius: 12px;
                transition: background-color 0.3s ease, color 0.3s ease;
                .rem(padding, 0.6);
            }

            &:last-child:hover {
                color: black;
                background-color: white;
                opacity: 0.7;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            &:not(:last-child) {
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

.XF-position {
    z-index: 9999;
    position: fixed;
    bottom: 10px;
    right: 10px;
    animation: showWenWen 0.3s linear forwards;
}

@keyframes showWenWen {
    0% {
        opacity: 0.5;
        scale: 0.7;
        transform: translateY(50%);
    }

    100% {
        opacity: 1;
        scale: 1;
        transform: translateX(0);
    }
}

.go-top {
    position: fixed;
    bottom: 0px;
    right: 20px;
    background-color: black;
    color: white;
    .rem(padding, 0.5);
    border-radius: 12px 12px 0 0;
    cursor: pointer;
    animation: goTop 0.7s ease forwards;
}

@keyframes goTop {
    0% {
        transform: translateY(20px);
    }

    100% {
        transform: translateY(0px);
    }
}
</style>