<template>
    <div class="trea-main">
        <el-row :gutter="20">
            <el-col class="trea-img-box" :span="isShowRow" :offset="0" v-for="item in homeShowPictureList">
                <img class="cover-img heart-icon" :src="item.isLiked === 0 ? heart : filledHeart"
                    @click.stop="isliked(item)">
                <img class="cover-img download-icon" :src="download" @click.stop="downloadImage(item.url)">
                <img class="trea-img" :src="item.url" v-lazyimg v-SiHuaJinRu @click="openDrawer(item)">
            </el-col>
        </el-row>

        <!-- 自定义抽屉组件 -->
        <div class="drawer" :class="{ 'drawer-open': drawerVisible }">
            <div class="drawer-content">
                <div class="drawer-header">
                    <button class="close-btn" @click="closeDrawer">×</button>
                </div>
                <div class="drawer-body" v-if="currentImage">
                    <img :src="currentImage.url" class="detail-image">
                    <div class="image-info">
                        <div class="info-row">
                            <span class="info-label">点击数：</span>
                            <span class="info-value">{{ currentImage.clickNum || 0 }}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">收藏数：</span>
                            <span class="info-value">{{ currentImage.treasureNum || 0 }}</span>
                        </div>
                        <div class="action-buttons">
                            <button class="action-btn like-btn" @click="isliked(currentImage)">
                                <img :src="currentImage.isLiked === 0 ? heart : filledHeart" class="btn-icon">
                                {{ currentImage.isLiked === 0 ? '收藏' : '已收藏' }}
                            </button>
                            <button class="action-btn download-btn" @click="downloadImage(currentImage.url)">
                                <img :src="download" class="btn-icon">
                                下载
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="alert" id="alertId">
        收藏成功
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue';
import { homeShowPicture } from '@/utils/api/picture';
import heart from '@/assets/img/heart.svg'
import filledHeart from '@/assets/img/filled-heart.svg'
import download from '@/assets/img/下载.svg'
import { isLiked } from '@/utils/api/picture';

let homeShowPictureList = ref<any>([])
let isShowRow = ref(6)  //一行展示几个
const drawerVisible = ref(false)
const currentImage = ref<any>(null)

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
    if (item.isLiked === 0) {
        showAlert()
    }
    homeShowPictureList.value.forEach((eveitem: any) => {
        if (eveitem.id === item.id) {
            homeShowPictureList.value.splice(homeShowPictureList.value.indexOf(eveitem), 1)
        }
    });
}

const downloadImage = async (url: string) => {
    try {
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = url.split('/').pop() || 'image'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
        console.error('下载失败:', error)
    }
}

const openDrawer = (item: any) => {
    currentImage.value = item
    drawerVisible.value = true
}

const closeDrawer = () => {
    drawerVisible.value = false
    setTimeout(() => {
        currentImage.value = null
    }, 300)
}

const showAlert = () => {
    const alertItem = document.querySelector('.alert')
    alertItem?.classList.add('alert-animation')
    setTimeout(() => {
        alertItem?.classList.remove('alert-animation')
    }, 2000)
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
            width: 24px;
            opacity: 0;
            z-index: 9999;
            transition: opacity 0.5s ease;
            cursor: pointer;
            background-color: rgb(255, 243, 243);
            backdrop-filter: blur(20px);
            border: 1px solid #ffffff;
            padding: 3px;
            border-radius: 12px;
        }

        .heart-icon {
            bottom: 12px;
            right: 12px;
        }

        .download-icon {
            bottom: 12px;
            right: 57px;
        }

        &:hover .cover-img {
            opacity: 1;
            transition: opacity 0.5s ease
        }

        .trea-img {
            width: 100%;
            height: 30vh;
            object-fit: cover;
            border-radius: 12px;
            cursor: pointer;
        }
    }
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

.drawer {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100%;
    z-index: 100000;
    transition: all 0.3s ease-in-out;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.5);

    &.drawer-open {
        right: 0;
        pointer-events: auto;
    }

    .drawer-content {
        position: absolute;
        top: 0;
        right: 0;
        width: 50%;
        height: 100%;
        background-color: #fff;
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        padding: 0 24px;
        overflow-y: auto;

        @media (max-width: 768px) {
            width: 90%;
        }
    }

    .drawer-header {
        display: flex;
        justify-content: flex-end;
        position: sticky;
        top: 0;
        background: #fff;
        padding: 12px 0;
        z-index: 1;

        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
            color: #666;

            &:hover {
                color: #333;
            }
        }
    }

    .drawer-body {
        .detail-image {
            width: 100%;
            max-height: 60vh;
            border-radius: 12px;
            margin-bottom: 24px;
            object-fit: cover;
        }

        .image-info {
            padding: 0 16px;

            .info-row {
                display: flex;
                margin-bottom: 16px;
                align-items: center;

                .info-label {
                    color: #666;
                    width: 80px;
                }

                .info-value {
                    color: #333;
                    font-weight: 500;
                }
            }

            .action-buttons {
                display: flex;
                gap: 16px;
                margin-top: 24px;

                .action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    background-color: #fff;
                    cursor: pointer;
                    transition: all 0.3s;

                    &:hover {
                        background-color: #f5f5f5;
                    }

                    .btn-icon {
                        width: 20px;
                        height: 20px;
                    }
                }

                .like-btn {
                    background-color: #fff3f3;
                    border-color: #ffcdd2;
                    color: #e57373;

                    &:hover {
                        background-color: #ffe6e6;
                    }
                }

                .download-btn {
                    background-color: #f3f8ff;
                    border-color: #bbdefb;
                    color: #64b5f6;

                    &:hover {
                        background-color: #e6f0ff;
                    }
                }
            }
        }
    }
}
</style>