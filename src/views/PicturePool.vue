<template>
    <div class="picture-pool" ref="picturePool">
        <div class="title-container">
            <h1>{{ t('yijing') }}</h1>
            <div>当前主题为:</div>
            <div class="filter-buttons">
                <button class="filter-btn" :class="{ active: filterType === 'editor' }"
                    @click="changeFilter('editor')">{{ t('jingxuan') }}</button>
                <button class="filter-btn" :class="{ active: filterType === 'newest' }"
                    @click="changeFilter('newest')">{{ t('zuixin') }}</button>
                <button class="filter-btn" :class="{ active: filterType === 'popular' }"
                    @click="changeFilter('popular')">{{ t('remen') }}</button>
            </div>
        </div>
        <div class="waterfall-container" ref="container">
            <div v-for="(column, columnIndex) in columns" :key="columnIndex" class="waterfall-column">
                <div v-for="item in column" :key="item.id" class="waterfall-item">
                    <img class="cover-img" :src="item.isLiked === 0 ? heart : filledHeart" @click.stop="isliked(item)">
                    <img class="download-img" :src="download" @click.stop="downloadImage(item.url)">
                    <img class="waterfall-img" alt="" :src="item.url" v-lazyimg v-SiHuaJinRu
                        :style="{ height: item.height + 'px' }" @click="showImageDetails(item)">
                </div>
            </div>
        </div>
        <div class="loading" ref="loading"></div>
        <div v-if="showPagination" class="pagination">
            <button class="pagination-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
                {{ t('shangyiye') }}
            </button>
            <span class="page-info">{{ t('dian') }} {{ currentPage }} {{ t('ye') }}</span>
            <button class="pagination-btn" :disabled="currentPage >= Math.ceil(totalGroups / groupsPerPage)"
                @click="goToPage(currentPage + 1)">
                {{ t('xiayiye') }}
            </button>
        </div>
    </div>
    <div class="alert" id="alertId">
        收藏成功
    </div>

    <!-- 图片详情抽屉 -->
    <div class="drawer" :class="{ 'drawer-open': isDrawerOpen }">
        <div class="drawer-content">
            <div class="drawer-header">
                <button class="close-btn" @click="closeDrawer">×</button>
            </div>
            <div class="drawer-body" v-if="selectedImage">
                <img :src="selectedImage.url" class="detail-image">
                <div class="image-info">
                    <div class="info-row">
                        <span class="info-label">{{ t('dainjishu') }}：</span>
                        <span class="info-value">{{ selectedImage.clickNum }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">{{ t('shoucangshu') }}：</span>
                        <span class="info-value">{{ selectedImage.treasureNum }}</span>
                    </div>
                    <!-- <div class="info-row">
                        <span class="info-label">发布时间：</span>
                        <span class="info-value">{{ formatTimeAgo(selectedImage.mostNew) }}</span>
                    </div> -->
                    <div class="action-buttons">
                        <button class="action-btn like-btn" @click="isliked(selectedImage)">
                            <img :src="selectedImage.isLiked === 0 ? heart : filledHeart" class="btn-icon">
                            {{ selectedImage.isLiked === 0 ? t('treasure') : t('treasured') }}
                        </button>
                        <button class="action-btn download-btn" @click="downloadImage(selectedImage.url)">
                            <img :src="download" class="btn-icon">
                            {{ t('xiazai') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="js">
import { ref, onMounted, onUnmounted } from 'vue'
import { homeShowPicture, isLiked } from '@/utils/api/picture'
import heart from '@/assets/img/heart.svg'
import filledHeart from '@/assets/img/filled-heart.svg'
import download from '@/assets/img/下载.svg'
import { useI18n } from 'vue-i18n'
import router from '@/router'

const { t } = useI18n()
// 图片数据
const imageList = ref([])
// 分好的瀑布流数组
const columns = ref([])
// 监视宽度引用
const container = ref(null)
// 加载新图片引用
const loading = ref(null)
// 列数
const columnCount = ref(4)
// 筛选类型
const filterType = ref('editor') // 默认为编辑精选
// 分页相关
const currentGroup = ref(1)
const totalGroups = ref(0)
const imagesPerGroup = 20
const showPagination = ref(false)
const allImages = ref([]) // 存储所有图片数据
const groupsPerPage = 5
const currentPage = ref(1)
const loadedGroupsOnCurrentPage = ref(1)
// 原始未排序数据
const originalImages = ref([])
// 视口检测器
let observer = null
// 调整大小监听器
let resizeObserver = null
// 图片池引用(回到顶部)
const picturePool = ref(null)

// 抽屉相关状态
const isDrawerOpen = ref(false)
const selectedImage = ref(null)

// 收藏/取消收藏
const isliked = (item) => {
    // if (localStorage.getItem('qweee-token') === null) {
    //     router.push({ path: '/login' })
    //     return
    // }
    //更新数据库
    isLiked({
        id: item.id,
        isLiked: item.isLiked === 0 ? 1 : 0
    }).then((res) => console.log(res.message))
    //更新页面
    item.isLiked = item.isLiked === 0 ? 1 : 0
    //提示
    let timer
    if (item.isLiked === 1 && !timer) {
        const alertItem = document.querySelector('.alert')
        alertItem.classList.add('alert-animation')
        timer = setTimeout(() => {
            alertItem.classList.remove('alert-animation')
        }, 2000)
    }
}

// 获取图片
const getImages = async () => {
    if (originalImages.value.length === 0) {
        await homeShowPicture().then(res => {
            const tempImages = []
            res.data.forEach(item => {
                item.url.forEach(item0 => {
                    const url = item0.url
                    const height = Math.floor(Math.random() * 200) + 200
                    tempImages.push({
                        height,
                        url,
                        id: item0.id,
                        isLiked: item0.isLiked || 0,
                        treasureNum: item0.treasureNum || 0,
                        mostNew: item0.mostNew || 0,
                        clickNum: item0.clickNum || 0
                    })
                })
            })
            originalImages.value = [...tempImages]
            sortImages()
        })
    } else {
        // 如果已经有原始数据，只需要重新排序
        sortImages()
    }
    // 计算当前组应该显示的图片
    const startIndex = (currentGroup.value - 1) * imagesPerGroup
    const endIndex = startIndex + imagesPerGroup
    const currentImages = allImages.value.slice(startIndex, endIndex)
    // 更新图片列表
    imageList.value = [...imageList.value, ...currentImages]
    reputImages()
}

// 根据当前筛选类型对图片进行排序
const sortImages = () => {
    let sortedImages = [...originalImages.value]
    switch (filterType.value) {
        case 'editor':
            // 按照treasureNum降序排序（编辑精选）
            sortedImages.sort((a, b) => (b.treasureNum || 0) - (a.treasureNum || 0))
            break
        case 'newest':
            // 按照Mostnew升序排序（最新的）
            sortedImages.sort((a, b) => (a.mostNew || 0) - (b.mostNew || 0))
            break
        case 'popular':
            // 按照clickNum降序排序（热门）
            sortedImages.sort((a, b) => (b.clickNum || 0) - (a.clickNum || 0))
            break
        default:
            // 默认按照treasureNum降序排序
            sortedImages.sort((a, b) => (b.treasureNum || 0) - (a.treasureNum || 0))
    }
    allImages.value = sortedImages
    totalGroups.value = Math.ceil(sortedImages.length / imagesPerGroup)
}

// 加载更多图片
const loadMore = () => {
    // 当前页可加载的最大组数
    const pageEndGroup = currentPage.value * groupsPerPage
    // 如果当前组未达到当前页最大组数，且未达到总组数上限，则加载下一组
    if (currentGroup.value < pageEndGroup && currentGroup.value < totalGroups.value) {
        currentGroup.value++
        loadedGroupsOnCurrentPage.value++
        getImages()
        // 检查是否需要显示分页 - 如果已达到当前页面最大组数或已到达末尾
        if (loadedGroupsOnCurrentPage.value >= groupsPerPage || currentGroup.value >= totalGroups.value) {
            showPagination.value = true
        }
    } else {
        // 已加载完本页所有数据或已达到总组数上限，显示分页
        showPagination.value = true
    }
}

// 切换到指定页面
const goToPage = (page) => {
    // 回到顶部
    picturePool.value.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    })
    // 保存当前页面的图片位置
    currentPage.value = page
    // 计算新页面的起始组
    const startGroup = (page - 1) * groupsPerPage + 1
    // 重置图片列表
    imageList.value = []
    columns.value = []
    // 设置当前组和已加载组计数
    currentGroup.value = startGroup
    loadedGroupsOnCurrentPage.value = 1
    // 隐藏分页，显示一组图片，等待滚动加载更多
    showPagination.value = false
    // 加载第一组图片
    getImages()
}

// 修改筛选类型
const changeFilter = (type) => {
    // 如果当前已经是选中状态，不做任何操作
    if (filterType.value === type) return
    filterType.value = type
    currentGroup.value = 1
    currentPage.value = 1
    loadedGroupsOnCurrentPage.value = 1
    showPagination.value = false
    imageList.value = []
    columns.value = []
    getImages()
}

// 完全重排
const reputImages = () => {
    // 初始化数组:长度为列数,每个元素都是[]的数组
    const newColumns = Array(columnCount.value).fill(null).map(() => [])
    // 初始化每列高度,全为0
    const columnHeights = Array(columnCount.value).fill(0)
    // 将图片分配到最短的列
    imageList.value.forEach(item => {
        // 找出高度最小的列
        const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights))
        // 将图片添加到该列
        newColumns[minHeightIndex].push(item)
        // 更新列高度
        columnHeights[minHeightIndex] += item.height + 16 // 16px为间距
    })
    columns.value = newColumns
}

// 设置无限滚动
const widthScrollObserver = () => {
    // 清除旧的observer
    if (observer) {
        observer.disconnect()
    }
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // 仅当未达到当前页面最大组数时加载更多
            const pageEndGroup = currentPage.value * groupsPerPage
            if (currentGroup.value < pageEndGroup && currentGroup.value < totalGroups.value) {
                loadMore()
            } else {
                // 已加载完本页所有数据或已达到总组数上限
                showPagination.value = true
            }
        }
    }, {
        threshold: 0.1,
        rootMargin: '700px'
    })
    if (loading.value) {
        observer.observe(loading.value)
    }

    resizeObserver = new ResizeObserver((entries) => {
        columnCount.value = Math.floor(window.innerWidth / 330)
        reputImages()
    })
    resizeObserver.observe(container.value)
}

// 下载图片
const downloadImage = (url) => {
    // if (localStorage.getItem('qweee-token') === null) {
    //     router.push({ path: '/login' })
    //     return
    // }
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            // 从URL中提取文件名
            const fileName = url.substring(url.lastIndexOf('/') + 1)
            link.download = fileName || 'image.jpg'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })
        .catch(error => console.error('下载失败:', error))
}

// 显示图片详情
const showImageDetails = (item) => {
    selectedImage.value = item
    isDrawerOpen.value = true
}

// 关闭抽屉
const closeDrawer = () => {
    isDrawerOpen.value = false
    setTimeout(() => {
        selectedImage.value = null
    }, 300) // 等待动画结束后再清空数据
}

// 格式化时间
const formatTimeAgo = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 30) return `${days}天前`
    if (days < 365) return `${Math.floor(days / 30)}个月前`
    return `${Math.floor(days / 365)}年前`
}

onMounted(() => {
    getImages()  // 加载初始数据
    widthScrollObserver()  // 监听宽度,是否滚动到底部
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
        observer = null
    }
    if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
    }
    // 清空图片数据，防止内存泄漏
    imageList.value = []
    columns.value = []
})
</script>

<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.picture-pool {
    padding: 16px;
    // padding-top: 5.5vw;

    .title-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        h1 {
            font-size: 22px;
            font-weight: 600;
            color: #333;
            margin: 0;

            @media (max-width: 800px) {
                display: none;
            }
        }

        .filter-buttons {
            @media (max-width: 800px) {
                width: 80%;
                margin: 0 auto;
            }

            display: flex;
            gap: 5px;
            background-color: rgb(226, 225, 225);
            border-radius: 24px;
            padding: 3px;
            justify-content: space-around;

            .filter-btn {
                @media (max-width: 800px) {
                    width: 33%;
                }

                padding: 6px 12px;
                border-radius: 20px;
                border: 1px solid #eee;
                background-color: #fff;
                .rem(font-size, 1);
                cursor: pointer;
                transition: all 0.3s;
                white-space: nowrap;
                font-weight: 600;
                color: rgb(144, 143, 143);

                &.active {
                    background-color: #f9f9f9;
                    border-color: #ddd;
                    font-weight: 600;
                    color: black;
                }

                &:hover {
                    background-color: #f9f9f9;
                }
            }
        }
    }

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
                    transition: opacity 0.5s ease
                }

                .waterfall-img {
                    border-radius: 12px;
                    width: 100%;
                    object-fit: cover;
                    cursor: pointer;
                }
            }
        }
    }

    .loading {
        width: 100%;
        height: 50px;
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

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-top: 20px;
    padding: 20px 0;

    .pagination-btn {
        padding: 8px 16px;
        border-radius: 20px;
        border: 1px solid #ddd;
        background-color: #fff;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 600;

        &:hover:not(:disabled) {
            background-color: #f5f5f5;
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    .page-info {
        font-size: 16px;
        color: #666;
    }
}

.drawer {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100%;
    z-index: 100000;
    transition: all 0.3s ease-in-out;
    pointer-events: none; // 默认不接受点击事件，避免遮挡底层内容

    &.drawer-open {
        right: 0;
        pointer-events: auto; // 打开时接受点击事件
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