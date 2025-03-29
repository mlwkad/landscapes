<template>
    <div class="trea-main">
        <el-row :gutter="20">
            <el-col class="trea-img-box" :span="isShowRow" :offset="0" v-for="item in homeShowPictureList">
                <img class="cover-img" :src="item.isLiked === 0 ? heart : filledHeart" @click="isliked(item)">
                <img class="trea-img" :src="item.url" v-lazyimg v-SiHuaJinRu>
            </el-col>
        </el-row>
    </div>
</template>
<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import { homeShowPicture } from '@/utils/api/picture';
import heart from '@/assets/img/heart.svg'
import filledHeart from '@/assets/img/filled-heart.svg'
import { isLiked } from '@/utils/api/picture';
let homeShowPictureList = ref<any>([])
let isShowRow = ref(6)  //一行展示几个
onBeforeMount(() => {
    homeShowPicture().then(res => {
        res.data.forEach((item: any) => {
            item.url.forEach((item0: any) => {
                if (item0.isLiked === 1) {
                    homeShowPictureList.value.push(item0)
                }
            })
        })
    }).catch(err => { console.log(err); })
})

onMounted(() => {
    if (window.innerWidth < 900) isShowRow.value = 12
    window.onresize = () => isShowRow.value = window.innerWidth < 900 ? 12 : 6
})

const isliked = (item: any) => {
    isLiked({
        id: item.id,
        isLiked: item.isLiked === 0 ? 1 : 0
    })
    homeShowPictureList.value.forEach((eveitem: any) => {
        if (eveitem.id === item.id) {
            homeShowPictureList.value.splice(homeShowPictureList.value.indexOf(eveitem), 1)
        }
    });
}
</script>
<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.trea-main {
    width: 95vw;
    margin: 0 auto;
    .trea-img-box {
        .rem(margin-bottom, 0.5);
        .rem(margin-top, .5);
        position: relative;

        .cover-img {
            position: absolute;
            bottom: 2px;
            right: 12px;
            width: 5vw;
            opacity: 0;
            z-index: 9999;
            transition: opacity 0.5s ease;
            cursor: pointer;
        }

        &:hover .cover-img {
            opacity: 1;
            transition: opacity 0.5s ease
        }

        .trea-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 12px;
        }
    }
}
</style>