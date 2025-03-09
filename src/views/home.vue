<template>
    <div class="header-zone">
        <header class="header">
            <div v-for="item in header" :key="item.id" class="header-font" @click="go(item)"
                :style="{ 'backgroundColor': activeId === item.id ? 'pink' : '' }">{{ item.name }}</div>
        </header>
        <div class="park-line"></div>
    </div>
    <nice-show></nice-show>
    <div class="title">
        xxxxxx
    </div>
    <!-- 图片展示 -->
    <picture-one></picture-one>
</template>
<script setup lang="ts">
import pictureOne from '@/views/picture-one.vue'
import NiceShow from '@/views/NiceShow.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
let activeId = ref(1)
let header = [{ id: 1, name: '探索' }, { id: 2, name: '收藏' }, { id: 3, name: '问问' }, { id: 4, name: '登录' }]
const router = useRouter()
const go = (item: any) => {
    if (item.name === '登录') {
        router.push({ path: '/login' })
    }
    activeId.value = item.id
}
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
            .rem(font-size, 1);

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

.title {
    .rem(font-size, 1.2);
    .rem(margin-top, 0.4);
    text-align: center;
}
</style>