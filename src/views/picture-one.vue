<template>
    <div class="picture-main-title">探索<span class="picture-main-title-more">点击查看更多</span></div>
    <div class="picture-main-box">
        <div class="picture-main" v-for="item in homeShowPictureList" :key="item.id" @click="showMore(item)">
            <div class="picture-top">
                <img class="cover-img" :src="item.url[0].isLiked === 0 ? heart : filledHeart"
                    @click.stop="isliked(item.url[0])">
                <img class="picture-top-img" :src="item.url[0].url" v-lazyimg v-SiHuaJinRu style="position: relative;">
            </div>
            <div class="picture-bottom">
                <img class="picture-bottom-img" :src="item.url[i].url" v-for="i in 2" :key="i" v-lazyimg v-SiHuaJinRu>
            </div>
            <div class="picture-main-name" v-SiHuaJinRu>{{ item.name }}</div>
        </div>
    </div>
    <div @click="morePicture" class="more-picture-button">更多</div>
    <div class="alert" id="alertId">
        收藏成功
    </div>
    <div class="picture-main-drawer" v-if="isShowDrawer">
        <div class="drawer-title">
            <div>{{ moreTitle }}</div>
            <div>
                <input type="file" id="file" style="opacity: 0;">
                <img class="drawer-title-download" :src="downLoad" alt="" @click="">
                <img class="drawer-title-close" src="@/assets/img/关闭.svg" alt="" @click="isShowDrawer = false">
            </div>
        </div>
        <div class="drawer-content">
            <div class="drawer-content-img-box" v-for="item in morePictureList">
                <img class="more-cover-img" :src="item.isLiked === 0 ? heart : filledHeart" @click="islikedMore(item)">
                <img class="drawer-content-img" :src="item.url" alt="">
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import heart from '../assets/img/heart.svg'
import filledHeart from '../assets/img/filled-heart.svg'
import downLoad from '../assets/img/下载.svg'
import { onBeforeMount, ref, watch } from 'vue';
import { homeShowPicture, isLiked, upLoadPicture } from '@/utils/api/picture';
let homeShowPictureList = ref<any>([])
let fir = ref(0)
let sec = ref(1)
let thi = ref(2)
let isShowDrawer = ref(false)
let moreTitle = ref('')
let morePictureList = ref<any>([])
let upLoadPic: any = ref(null)
onBeforeMount(() => {
    //获取首页图片
    homeShowPicture().then(res => {
        homeShowPictureList.value.push(res.data[fir.value], res.data[sec.value], res.data[thi.value])
    }).catch(err => { console.log(err); })
})
//获取更多图片
const morePicture = () => {
    homeShowPicture().then(res => {
        fir.value = fir.value + 3
        sec.value = sec.value + 3
        thi.value = thi.value + 3
        homeShowPictureList.value.push(res.data[fir.value], res.data[sec.value], res.data[thi.value])
    }).catch(err => { console.log(err); })
}
//收藏
const isliked = (item: any) => {
    //更新数据库
    isLiked({
        id: item.id,
        isLiked: item.isLiked === 0 ? 1 : 0
    }).then((res: any) => console.log(res.message))
    //更新页面
    homeShowPictureList.value.forEach((eveURL: any) => {
        eveURL.url.forEach((item0: any) => {
            if (item0.id === item.id) {
                item0.isLiked = item0.isLiked === 0 ? 1 : 0
            }
        });
    });
    //提示
    let timer: any
    if (item.isLiked === 1 && !timer) {
        const alertItem = document.querySelector('.alert')
        alertItem.classList.add('alert-animation')
        timer = setTimeout(() => {
            alertItem.classList.remove('alert-animation')
        }, 2000)
    }
}
//显示更多图片
const showMore = (item: any) => {
    morePictureList.value = []
    isShowDrawer.value = true
    moreTitle.value = item.name
    item.url.forEach((item: any) => {
        morePictureList.value.push(item)
    })
}
//收藏更多图片
const islikedMore = (item: any) => {
    //更新数据库
    isLiked({
        id: item.id,
        isLiked: item.isLiked === 0 ? 1 : 0
    }).then((res: any) => console.log(res.message))
    //更新页面
    morePictureList.value.forEach((item0: any) => {
        item0.id === item.id ? item0.isLiked = item0.isLiked === 0 ? 1 : 0 : null
    });
    //提示
    let timer: any
    if (item.isLiked === 1 && !timer) {
        const alertItem = document.querySelector('.alert')
        alertItem.classList.add('alert-animation')
        timer = setTimeout(() => {
            alertItem.classList.remove('alert-animation')
        }, 2000)
    }
}
//上传图片
// const uploadPicture = (title: any) => {
//     const file: any = document.getElementById('file')
//     file.click()
//     file.onchange = () => {
//         console.log(file.files[0])
//         const formData = new FormData()
//         formData.append('image', file.files[0])
//         upLoadPicture({ info: formData, category: title }).then((res: any) => console.log(res.message))
//     }
// }

</script>
<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.picture-main-title {
    .rem(font-size, 1.9);
    .rem(margin-bottom, 1);
    font-weight: 600;
    color: #464646;
    margin-left: 3.5vw;
    margin-bottom: 2vw;

    .picture-main-title-more {
        .rem(font-size, 1);
        color: #464646;
        margin-left: 1vw;
    }
}

.picture-main-box {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    margin: 0 auto;
    width: 97vw;

    .picture-main {
        width: 30vw;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        .rem(margin-bottom, 2);
        border-radius: 12px;
        cursor: pointer;

        @media(max-width:900px) {
            width: 45vw;
        }

        .picture-main-name {
            background-image: linear-gradient(to right, rgb(84, 84, 84), rgb(0, 0, 0));
            background-clip: text;
            color: transparent;
            text-shadow: 0 0 20px rgb(255, 216, 216);
            .rem(font-size, 1.5);
            .rem(margin-top, 1);
            font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        }

        .picture-top {
            position: relative;
            .rem(margin-bottom, -0.1);

            @media (min-width: 1200px) {
                .rem(margin-bottom, 0);
            }

            .cover-img {
                position: absolute;
                bottom: 12px;
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

            .picture-top-img {
                border-radius: 12px 12px 0 0;
                width: 100%;
                height: 23vw;
                object-fit: cover;
            }
        }

        .picture-bottom {
            display: flex;
            justify-content: space-between;

            &-img {
                width: 49.56%;
                height: 12vw;
                object-fit: cover;

                &:nth-child(1) {
                    border-radius: 0 0 0 12px;
                }

                &:nth-child(2) {
                    border-radius: 0 0 12px 0;
                }

            }
        }
    }
}

.more-picture-button {
    margin: 0 auto;
    background-color: black;
    color: white;
    width: fit-content;
    .rem(font-size, 1.3);
    .rem(padding-bottom, 0.6);
    .rem(padding-top, 0.6);
    .rem(padding-left, 0.8);
    .rem(padding-right, 0.8);
    border-radius: 12px;
    margin-bottom: 20px;
    cursor: pointer;
}

.alert {
    .rem(padding, 0.5);
    position: fixed;
    z-index: 999999;
    top: 20px;
    left: 50%;
    backdrop-filter: blur(20px);
    font-weight: 600;
    border-radius: 12px;
    .rem(font-size, 1.1);
    border: 1px solid #ffffff;
    transform: translate(-50%, -400%) scale(0.3);
    transition: transform 0.5s ease-in-out;
}

.alert-animation {
    transform: translate(-50%, 100%) scale(1);
    transition: transform 0.7s ease-in-out;
}

.picture-main-drawer {
    outline: 2px solid rgb(162, 162, 162);
    border-radius: 12px;
    background-color: #ffffff;
    width: 95vw;
    height: 99vh;
    position: fixed;
    z-index: 9999;
    bottom: 3px;
    left: 50%;
    transform: translateX(-50%);
    overflow-y: auto;

    .drawer-title {
        .rem(font-size, 1.9);
        font-weight: 600;
        color: #464646;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 97%;
        margin: 0 auto;
        .rem(padding-top, 0.6);
        .rem(padding-bottom, 0.6);
        position: sticky;
        top: 0px;
        background-color: #ffffff;

        .drawer-title-close {
            .rem(max-width, 1.7);
            cursor: pointer;
            opacity: 0.8;

            &:hover {
                animation: rotate 0.3s ease-in-out forwards;
            }

            @keyframes rotate {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    opacity: 1;
                    transform: rotate(180deg);
                }
            }
        }

        .drawer-title-download {
            .rem(max-width, 1.7);
            transform: translateY(-0.15vw);
            cursor: pointer;
            .rem(margin-right, 1.5);
            opacity: 0.8;

            &:hover {
                opacity: 1;
            }
        }
    }

    .drawer-content {
        width: 97%;
        margin: 0 auto;
        .rem(margin-top, 0.5);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;

        .drawer-content-img-box {
            width: 30%;
            .rem(margin-left, 0.5);
            .rem(margin-right, 0.5);
            .rem(margin-bottom, 2);
            .rem(margin-top, 0.0);
            position: relative;

            @media(max-width: 900px) {
                width: 45%;
                .rem(margin-left, 0.2);
                .rem(margin-right, 0.2);
            }

            .more-cover-img {
                position: absolute;
                bottom: 10px;
                right: 10px;
                width: 5vw;
                opacity: 0;
                z-index: 999;
                transition: opacity 0.5s ease;
                cursor: pointer;
            }

            &:hover .more-cover-img {
                opacity: 1;
                transition: opacity 0.5s ease;
            }

            .drawer-content-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 12px;
            }
        }
    }
}
</style>
