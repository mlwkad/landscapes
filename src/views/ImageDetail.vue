<template>
    <div class="image-detail">
        <!-- Upper section - Image and details -->
        <div class="image-section">
            <div class="image-container">
                <img :src="selectedImage?.url" class="main-image" alt="Image" v-if="selectedImage">
                <div class="image-actions">
                    <button class="action-btn like-btn" @click="isliked(selectedImage)" v-if="selectedImage">
                        <img :src="selectedImage.isLiked === 0 ? heart : filledHeart" class="btn-icon">
                        {{ selectedImage.isLiked === 0 ? t('treasure') : t('treasured') }}
                    </button>
                    <button class="action-btn download-btn" @click="downloadImage(selectedImage?.url)"
                        v-if="selectedImage">
                        <img :src="download" class="btn-icon">
                        {{ t('xiazai') }}
                    </button>
                </div>
            </div>
            <div class="image-info" v-if="selectedImage">
                <div class="info-header">
                    <h2>{{ selectedImage.name || t('imageDetails') }}</h2>
                    <button class="back-btn" @click="goBack">
                        <span>×</span>
                    </button>
                </div>
                <div class="info-stats">
                    <div class="info-item">
                        <span class="info-label">{{ t('dainjishu') }}：</span>
                        <span class="info-value">{{ selectedImage.clickNum || 0 }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">{{ t('shoucangshu') }}：</span>
                        <span class="info-value">{{ selectedImage.treasureNum || 0 }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Lower section - Tags and related images -->
        <div class="related-section">
            <h3>其他图片</h3>

            <!-- Tags section -->
            <div class="tags-section">
                <!-- <h4 class="tags-title">{{ t('selectTag') }}</h4> -->
                <div class="tags-container">
                    <div v-for="(tag, index) in tags" :key="index" class="tag"
                        :class="{ active: activeTagIndex === index }" @click="selectTag(index)">
                        {{ tag }}
                    </div>
                </div>
            </div>

            <!-- Related images waterfall -->
            <div class="related-images">
                <div class="waterfall-container" ref="container">
                    <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="waterfall-column">
                        <div v-for="item in column" :key="item.id" class="waterfall-item">
                            <img class="cover-img" :src="item.isLiked === 0 ? heart : filledHeart"
                                @click.stop="isliked(item)">
                            <img class="download-img" :src="download" @click.stop="downloadImage(item.url)">
                            <img class="waterfall-img" alt="" :src="item.url" v-lazyimg v-SiHuaJinRu
                                :style="{ height: item.height + 'px' }" @click="navigateToImage(item)">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="alert" id="alertId">
        {{ alertMessage }}
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isLiked, addToLikedList, deleteFromLikedList } from '@/utils/api/picture'
import heart from '@/assets/img/heart.svg'
import filledHeart from '@/assets/img/filled-heart.svg'
import download from '@/assets/img/下载.svg'
import { useI18n } from 'vue-i18n'
import { usePictureStore } from '@/stores/picture'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const pictureStore = usePictureStore()

// Current image data
const selectedImage = ref<any>(null)
const imageId = computed(() => route.params.id)

// Tags and related images
const tags = ref([
    t('liming'), t('senlin'), t('meishi'), t('jianzhu'), t('shuiping'), t('shangmai'), t('zhiwu'),
    t('lvxing'), t('chuxuang'), t('keji'),
    t('ziranfengjing'), t('haiyang'), t('shandong'), t('huafei'), t('yejing'), t('dongwu'), t('xingkong')
])
// Original tags mapping for data filtering
const originalTags = [
    '黎明', '森林', '美食', '建筑', '水景', '山脉', '植物',
    '旅行', '抽象', '科技',
    '自然风景', '海岸', '沙漠', '花卉', '夜景', '动物', '星空'
]
const activeTagIndex = ref(-1)
const relatedImages = ref<any[]>([])
const alertMessage = ref('')

// 瀑布流相关变量
const columns = ref([])
const columnCount = ref(4)
const container = ref(null)
let resizeObserver = null

// Fetch the selected image and related images
const fetchImageData = async () => {
    if (!imageId.value) return

    // Load all images if not loaded yet
    if (pictureStore.originalImages.length === 0) {
        await pictureStore.fetchAllImages()
    }

    // Find the selected image
    const allImages = pictureStore.originalImages
    selectedImage.value = allImages.find(img => img.id.toString() === imageId.value)

    if (selectedImage.value) {
        // Update click count (you would normally do this via API)
        selectedImage.value.clickNum = (selectedImage.value.clickNum || 0) + 1

        // Get related images (same tag or random selection)
        loadRelatedImages()
    } else {
        // Image not found, go back
        router.push('/baseshow')
    }
}

// Load related images based on active tag or default selection
const loadRelatedImages = () => {
    const allImages = pictureStore.originalImages

    if (activeTagIndex.value >= 0) {
        // Filter by selected tag
        const selectedTag = originalTags[activeTagIndex.value]
        relatedImages.value = allImages
            .filter(img => img.id !== selectedImage.value.id) // Exclude current image
            .filter(img =>
                img.tags?.includes(selectedTag) ||
                img.name?.includes(selectedTag)
            )
            .slice(0, 100) // Show more images
    } else {
        // Default: show random images
        relatedImages.value = allImages
            .filter(img => img.id !== selectedImage.value.id) // Exclude current image
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 100) // Show more images
    }

    // 给每张图片设置随机高度（也可以根据实际比例设置）
    relatedImages.value = relatedImages.value.map(img => ({
        ...img,
        height: Math.floor(Math.random() * 100) + 200 // 200-300随机高度
    }))

    // 分配图片到瀑布流列
    distributeImages()
}

// 将图片分配到瀑布流列
const distributeImages = () => {
    // 初始化数组:长度为列数,每个元素都是[]的数组
    const newColumns = Array(columnCount.value).fill(null).map(() => [])
    // 初始化每列高度,全为0
    const columnHeights = Array(columnCount.value).fill(0)

    // 将图片分配到最短的列
    relatedImages.value.forEach(item => {
        // 找出高度最小的列
        const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
        // 将图片添加到该列
        newColumns[minHeightIndex].push(item)
        // 更新列高度
        columnHeights[minHeightIndex] += item.height + 16 // 16px为间距
    })

    columns.value = newColumns
}

// 设置瀑布流布局的监听器
const setupResizeObserver = () => {
    if (resizeObserver) {
        resizeObserver.disconnect()
    }

    resizeObserver = new ResizeObserver(() => {
        // 根据窗口宽度动态调整列数
        columnCount.value = Math.floor(window.innerWidth / 330)
        if (columnCount.value < 2) columnCount.value = 2
        distributeImages()
    })

    if (container.value) {
        resizeObserver.observe(container.value)
    }
}

// Tag selection
const selectTag = (index: number) => {
    if (activeTagIndex.value === index) {
        activeTagIndex.value = -1
    } else {
        activeTagIndex.value = index
    }
    loadRelatedImages()

    // Scroll to related images after a short delay
    setTimeout(() => {
        const relatedImagesSection = document.querySelector('.related-images')
        if (relatedImagesSection) {
            // relatedImagesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, 100)
}

// Navigate to another image
const navigateToImage = (item: any) => {
    // 如果是同一张图片，不执行任何操作
    if (item.id.toString() === imageId.value) return

    // 使用replace而不是push来避免堆积历史记录
    router.replace(`/image/${item.id}`).then(() => {
        // 刷新数据并滚动到顶部
        fetchImageData()
        window.scrollTo(0, 0)
    })
}

// Like/unlike an image
const isliked = (item: any) => {
    if (!item) return
    if (item.isLiked === 0) {
        addToLikedList({
            id: item.id,
            url: item.url,
            date: new Date().toLocaleDateString()// 精确到日
        })
    } else {
        deleteFromLikedList({
            id: item.id,
        })
    }
    isLiked({
        id: item.id,
        isLiked: item.isLiked === 0 ? 1 : 0
    })

    item.isLiked = item.isLiked === 0 ? 1 : 0

    // Show notification
    if (item.isLiked === 1) {
        showAlert(t('treasureSuccess'))
    } else {
        showAlert(t('cancelTreasure'))
    }
}

// Download image
const downloadImage = (url: string) => {
    if (!url) return

    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            const fileName = url.substring(url.lastIndexOf('/') + 1)
            link.download = fileName || 'image.jpg'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            showAlert('下载成功')
        })
        .catch(error => {
            console.error('下载失败:', error)
            showAlert('下载失败')
        })
}

// Show alert notification
const showAlert = (message: string) => {
    alertMessage.value = message
    let timer: NodeJS.Timeout
    const alertElement = document.getElementById('alertId')
    if (alertElement && !timer) {
        alertElement.classList.add('alert-animation')
        timer = setTimeout(() => {
            alertElement.classList.remove('alert-animation')
        }, 2000)
    }
}

// Go back to previous page
const goBack = () => {
    if (sessionStorage.getItem('activeId') === '1' || sessionStorage.getItem('activeId') === null) {
        router.push('/baseshow')
    }
    if (sessionStorage.getItem('activeId') === '2') {
        router.push('/treasure')
    }
    if (sessionStorage.getItem('activeId') === '3') {
        router.push('/xunfei')
    }
}

onMounted(() => {
    fetchImageData()
    window.scrollTo(0, 0)
    setupResizeObserver() // 添加瀑布流布局监听
})

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
})
</script>

<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.image-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;

    // Upper section with main image and details
    .image-section {
        display: flex;
        gap: 20px;
        margin-bottom: 40px;

        @media (max-width: 768px) {
            flex-direction: column;
        }

        .image-container {
            flex: 3;

            .main-image {
                width: 100%;
                border-radius: 12px;
                object-fit: cover;
                max-height: 70vh;
            }

            .image-actions {
                display: flex;
                gap: 16px;
                margin-top: 16px;

                .action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #000000;
                    // background-color: #945e5e;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-weight: 500;

                    &:hover {
                        background-color: #5b5b5b;
                    }

                    .btn-icon {
                        width: 20px;
                        height: 20px;
                    }
                }

                .like-btn {
                    background-color: #000000e1;
                    border-color: #ffffff;
                    color: #fee5e5;

                    &:hover {
                        cursor: pointer;
                    }
                }

                .download-btn {
                    background-color: #000000e5;
                    border-color: #bbdefb;
                    color: #ffffff;

                    &:hover {
                        cursor: pointer;
                    }
                }
            }
        }

        .image-info {
            flex: 1;
            padding: 20px;
            border-radius: 12px;
            background-color: #f9f9f9;
            width: fit-content;
            height: fit-content;

            .info-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;

                h2 {
                    margin: 0;
                    font-size: 22px;
                    color: #333;
                }

                .back-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    background-color: #0000005f;
                    margin-left: 5px;

                    span {
                        font-size: 20px;
                        line-height: 1;
                    }

                    &:hover {
                        background-color: #ddd;
                    }
                }
            }

            .info-stats {
                .info-item {
                    display: flex;
                    margin-bottom: 16px;

                    .info-label {
                        color: #666;
                        width: 80px;
                    }

                    .info-value {
                        color: #333;
                        font-weight: 500;
                    }
                }
            }
        }
    }

    // Lower section with tags and related images
    .related-section {
        h3 {
            margin-bottom: 16px;
            color: #333;
        }

        .tags-section {
            margin-bottom: 20px;

            .tags-title {
                margin-bottom: 12px;
                font-size: 16px;
                color: #666;
            }
        }

        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
            max-width: 100%;
            overflow-x: hidden;

            .tag {
                padding: 8px 16px;
                background-color: #f5f5f5;
                border: 1px solid #eee;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 8px;

                &.active {
                    background-color: #333;
                    color: white;
                    border-color: #333;
                }

                &:hover:not(.active) {
                    background-color: #eee;
                }
            }
        }

        .related-images {
            .waterfall-container {
                display: flex;
                width: 100%;
                gap: 16px; //主轴间距

                .waterfall-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 13px; //交叉(主)轴间距

                    .waterfall-item {
                        width: 100%;
                        overflow: hidden;
                        position: relative;

                        .cover-img {
                            position: absolute;
                            bottom: 12px;
                            right: 12px;
                            width: 24px;
                            opacity: 0;
                            z-index: 9999;
                            transition: opacity 0.5s ease;
                            cursor: pointer;
                            background-color: rgba(255, 243, 243, 0.155);
                            backdrop-filter: blur(20px);
                            border: 2px solid #ffffff;
                            padding: 3px;
                            border-radius: 12px;
                        }

                        .download-img {
                            position: absolute;
                            bottom: 12px;
                            right: 57px;
                            width: 24px;
                            opacity: 0;
                            z-index: 9999;
                            transition: opacity 0.5s ease;
                            cursor: pointer;
                            background-color: rgba(255, 243, 243, 0.155);
                            backdrop-filter: blur(20px);
                            border: 2px solid #ffffff;
                            padding: 3px;
                            border-radius: 12px;
                        }

                        &:hover .cover-img,
                        &:hover .download-img {
                            opacity: 1;
                            transition: opacity 0.5s ease;
                        }

                        .waterfall-img {
                            border-radius: 12px;
                            width: 100%;
                            object-fit: cover;
                            cursor: pointer;
                            transition: transform 0.3s;

                            &:hover {
                                transform: scale(1.02);
                            }
                        }
                    }
                }
            }
        }
    }
}

.alert {
    padding: 10px 20px;
    position: fixed;
    z-index: 999999;
    top: 20px;
    left: 50%;
    backdrop-filter: blur(20px);
    font-weight: 600;
    border-radius: 12px;
    font-size: 14px;
    border: 1px solid #ffffff;
    transform: translate(-50%, -400%) scale(0.3);
    transition: transform 0.5s ease-in-out;
}

.alert-animation {
    transform: translate(-50%, 100%) scale(1);
    transition: transform 0.7s ease-in-out;
}

// 这里删除所有动画相关样式</style>