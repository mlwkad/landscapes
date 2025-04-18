<template>
    <div class="search-container">
        <!-- Header section with search functionality embedded -->
        <div class="banner">
            <div class="banner-content">
                <h1 class="title">{{ t('haoliang') }}</h1>

                <!-- Search tabs -->
                <div class="search-tabs">
                    <div v-for="(tab, index) in tabs" :key="index" class="tab"
                        :class="{ active: activeTabIndex === index }" @click="selectTab(index)">
                        {{ tab }}
                    </div>
                </div>

                <!-- Search input box -->
                <div class="search-box">
                    <el-icon class="search-icon">
                        <Search />
                    </el-icon>
                    <input type="text" :placeholder="t('search')" v-model="searchQuery" @keyup.enter="searchByKeyword"
                        @change="searchAll">
                </div>

                <!-- Category tags -->
                <div class="category-tags">
                    <div v-for="(tag, index) in tags" :key="index" class="tag"
                        :class="{ active: activeTagIndex === index }" @click="selectTag(index)">
                        {{ tag }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Alert for like notification -->
        <div class="alert" id="alertId">
            {{ t('treasureSuccess') }}
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Search, Loading, Close } from "@element-plus/icons-vue"
import { homeShowPicture, isLiked } from '@/utils/api/picture'
import heart from '@/assets/img/heart.svg'
import filledHeart from '@/assets/img/filled-heart.svg'
import downloadIcon from '@/assets/img/下载.svg'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import { usePictureStore } from '@/stores/picture' // 导入Pinia store
import { watch } from 'vue'

const { t } = useI18n()
// 引入图片Store
const pictureStore = usePictureStore()

// 搜索输入
const searchQuery = ref('')

// 搜索分类选项
const tabs = [
    '全部', t('ziranfengjing'), t('haiyang'), t('shandong'), t('huafei'), t('yejing'), t('dongwu'), t('jianzhu'), t('xingkong')
]
// 原始搜索分类选项（用于数据匹配）
const originalTabs = [
    '全部', '自然风景', '海岸', '沙漠', '花卉', '夜景', '动物', '建筑', '星空'
]
const activeTabIndex = ref(0)
watch(activeTabIndex, (newVal) => {
    if (newVal === 0) {
        searchQuery.value = ''
        pictureStore.resetFilters() // 重置Store中的筛选条件
    }
})
const selectTab = (index: number) => {
    if (index === 0) {
        activeTabIndex.value = 0
        activeTagIndex.value = -1
        pictureStore.resetFilters() // 重置Store中的筛选条件
    } else if (activeTabIndex.value === index) {
        activeTabIndex.value = 0
        activeTagIndex.value = -1
        pictureStore.resetFilters() // 重置Store中的筛选条件
    } else {
        activeTabIndex.value = index
        activeTagIndex.value = -1
        // 使用选中的tab内容作为selectedTag并显示抽屉
        selectedTag.value = tabs[index]
        currentPage.value = 1 // 重置页码

        // 更新Store中的主题
        pictureStore.setTheme(originalTabs[index])

        // 如果还没有加载过数据，先加载数据
        if (pictureStore.originalImages.length === 0) {
            pictureStore.fetchAllImages().then(() => {
                // 加载标签相关图片
                filterAndDisplayTagImages()
            })
        } else {
            filterAndDisplayTagImages()
        }

        showDrawer.value = true
    }
}

// 搜索所有
const searchAll = () => {
    // if (searchQuery.value === '') {
    //     activeTabIndex.value = 0
    //     pictureStore.resetFilters() // 重置Store中的筛选条件
    // }
}

// 标签选项
const tags = [
    t('liming'), t('senlin'), t('meishi'), t('jianzhu'), t('shuiping'), t('shangmai'), t('zhiwu'),
    t('lvxing'), t('chuxuang'), t('keji')
]
// 添加标签的原始名称映射，用于数据匹配
const originalTags = [
    '黎明', '森林', '美食', '建筑', '水景', '山脉', '植物',
    '旅行', '抽象', '科技'
]
const activeTagIndex = ref(-1) // -1 means no tag selected
const showDrawer = ref(false)
const selectedTag = ref('')
const tagImages = ref<any[]>([]) // 存储当前标签的图片
const currentPage = ref(1)
const itemsPerPage = 10 // 每页显示10张图片
const totalImageCount = ref(0)
const loading = ref(false)

// 计算总页数
const totalPages = computed(() => {
    return Math.ceil(totalImageCount.value / itemsPerPage)
})

// 选择标签
const selectTag = (index: number) => {
    // 选择新标签或取消已选标签
    if (activeTagIndex.value === index) {
        activeTabIndex.value = 0
        activeTagIndex.value = -1
        pictureStore.resetFilters() // 重置Store中的筛选条件
        closeDrawer()
    } else {
        activeTabIndex.value = -1
        activeTagIndex.value = index
        selectedTag.value = tags[index]
        currentPage.value = 1 // 重置页码

        // 更新Store中的主题
        pictureStore.setTheme(originalTags[index])

        // 如果还没有加载过数据，先加载数据
        if (pictureStore.originalImages.length === 0) {
            pictureStore.fetchAllImages().then(() => {
                filterAndDisplayTagImages()
            })
        } else {
            filterAndDisplayTagImages()
        }

        showDrawer.value = true
    }
}

// 通过搜索框搜索
const searchByKeyword = () => {
    if (!searchQuery.value.trim()) return

    // 重置分页
    currentPage.value = 1

    // 查找标签是否匹配搜索词
    const tagIndex = tags.findIndex(tag =>
        tag.toLowerCase().includes(searchQuery.value.toLowerCase())
    )

    // 查找分类选项是否匹配
    const tabIndex = tabs.findIndex(tab =>
        tab.toLowerCase().includes(searchQuery.value.toLowerCase())
    )

    // 如果匹配标签，选择该标签
    if (tagIndex >= 0) {
        activeTagIndex.value = tagIndex
        selectedTag.value = tags[tagIndex]
        pictureStore.setTheme(originalTags[tagIndex])
        activeTabIndex.value = -1
    }
    // 如果匹配分类，选择该分类
    else if (tabIndex >= 0) {
        activeTabIndex.value = tabIndex
        selectedTag.value = tabs[tabIndex]
        pictureStore.setTheme(originalTabs[tabIndex])
        activeTagIndex.value = -1
    }
    // 否则直接使用搜索词
    else {
        activeTagIndex.value = -1 // 清除已选标签
        selectedTag.value = searchQuery.value
        pictureStore.setTheme(searchQuery.value)
    }

    // 如果还没有加载过数据，先加载数据
    if (pictureStore.originalImages.length === 0) {
        pictureStore.fetchAllImages().then(() => {
            filterAndDisplayTagImages()
        })
    } else {
        filterAndDisplayTagImages()
    }

    showDrawer.value = true
}

// 关闭抽屉
const closeDrawer = () => {
    showDrawer.value = false
    // 保持一些延迟后再清空数据
    setTimeout(() => {
        // 如果不是选择新标签操作，则重置activeTagIndex
        if (!showDrawer.value) {
            activeTagIndex.value = -1
        }
    }, 300)
}

// 根据选中的标签过滤并显示图片
const filterAndDisplayTagImages = () => {
    if (!selectedTag.value) return

    // 使用Store中的过滤后图片
    const filteredImages = pictureStore.filteredImages

    if (filteredImages.length > 0) {
        // 存储总图片数量
        totalImageCount.value = filteredImages.length

        // 计算当前页应该显示的图片
        const startIdx = (currentPage.value - 1) * itemsPerPage
        const endIdx = Math.min(startIdx + itemsPerPage, filteredImages.length)

        // 获取当前页的图片
        const pageImages = filteredImages.slice(startIdx, endIdx)

        // 设置图片统一高度
        tagImages.value = pageImages.map(img => ({
            ...img,
            isLiked: img.isLiked || false,
            height: 250 // 统一高度
        }))
    } else {
        // 如果仍然没有找到匹配的图片
        tagImages.value = []
        totalImageCount.value = 0

        // 显示没有找到相关主题的提示
        showNoResultsAlert()
    }
}

// 显示没有找到相关主题的提示
const showNoResultsAlert = () => {
    const alertElement = document.getElementById('alertId')
    if (alertElement) {
        alertElement.textContent = t('noResults')
        alertElement.classList.add('alert-animation')
        setTimeout(() => {
            alertElement.classList.remove('alert-animation')
            closeDrawer() // 关闭抽屉，因为没有内容
        }, 1500)
    }
}

// 翻页功能
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
        filterAndDisplayTagImages()
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
        filterAndDisplayTagImages()
    }
}

// 收藏/取消收藏图片
const likeImage = (item: any) => {
    // if (localStorage.getItem('qweee-token') === null) {
    //     router.push({ path: '/login' })
    //     return
    // }
    isLiked({
        id: item.id,
        isLiked: item.isLiked ? 0 : 1
    }).then(() => {
        item.isLiked = !item.isLiked
        // 显示收藏成功提示
        showAlert(item.isLiked ? t('treasureSuccess') : t('cancelTreasure'))
    }).catch(error => {
        console.error('收藏操作失败:', error)
    })
}

// 下载图片
const downloadImage = (item: any) => {
    // if (localStorage.getItem('qweee-token') === null) {
    //     router.push({ path: '/login' })
    //     return
    // }
    // 创建临时链接
    const link = document.createElement('a')
    link.href = item.url

    // 生成文件名：使用原始文件名或从URL生成
    const fileName = item.name || `image-${Date.now()}.jpg`
    link.download = fileName

    // 触发下载
    document.body.appendChild(link)
    link.click()

    // 移除临时链接
    document.body.removeChild(link)

    // 显示下载成功提示
    showAlert(t('downloadSuccess'))
}

// 显示提示信息
const showAlert = (message: string) => {
    const alertElement = document.getElementById('alertId')
    if (alertElement) {
        alertElement.textContent = message
        alertElement.classList.add('alert-animation')
        setTimeout(() => {
            alertElement.classList.remove('alert-animation')
        }, 1500)
    }
}

// 图片数据
const imageList = ref<any[]>([])
const loadMoreRef = ref(null)
let observer: IntersectionObserver | null = null

// 设置无限滚动
const setupInfiniteScroll = () => {
    if ('IntersectionObserver' in window && loadMoreRef.value) {
        observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loading.value) {
                // 这里暂时不需要处理，因为我们使用分页
            }
        }, {
            threshold: 0.1,
            rootMargin: '200px' // 提前200px触发
        })

        observer.observe(loadMoreRef.value)
    }
}

onMounted(() => {
    // 初始加载所有图片数据
    pictureStore.fetchAllImages()
    // 设置无限滚动
    setupInfiniteScroll()
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
        observer = null
    }
})

// 图片详情抽屉状态
const isImageDetailDrawerOpen = ref(false)
const selectedDetailImage = ref(null)

// 显示图片详情
const showImageDetails = (item: any) => {
    selectedDetailImage.value = item
    isImageDetailDrawerOpen.value = true
}

// 关闭图片详情抽屉
const closeImageDetailDrawer = () => {
    isImageDetailDrawerOpen.value = false
    setTimeout(() => {
        selectedDetailImage.value = null
    }, 300) // 等待动画结束后再清空数据
}
</script>

<style scoped lang="less">
.search-container {
    margin: 0 auto;
    padding: 20px;

    .banner {
        background: url('https://cdn.pixabay.com/photo/2022/06/30/02/00/mountains-7292778_1280.jpg') center/cover;
        height: 70vh;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        margin-bottom: 20px;
        position: relative;

        &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 12px;
        }

        .banner-content {
            width: 85%;
            max-width: 800px;
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .title {
            color: white;
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
            padding: 0 15px;

            @media (max-width: 768px) {
                font-size: 22px;
            }
        }
    }

    .search-tabs {
        display: flex;
        overflow-x: auto;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 20px;
        padding-bottom: 5px;
        -ms-overflow-style: none;
        scrollbar-width: none;
        justify-content: center;

        &::-webkit-scrollbar {
            display: none;
        }

        .tab {
            white-space: nowrap;
            padding: 8px 16px;
            border-radius: 20px;
            backdrop-filter: blur(20px);
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            cursor: pointer;
            font-weight: 550;
            transition: all 0.3s ease;
            color: white;

            &.active {
                background-color: white;
                color: black;
            }

            &:hover:not(.active) {
                color: black;
                background-color: rgba(255, 255, 255, 1);
            }
        }
    }

    .search-box {
        position: relative;
        margin-bottom: 20px;
        width: 100%;
        display: flex;
        justify-content: center;

        input {
            width: 90%;
            padding: 15px 15px 15px 45px;
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            font-size: 16px;
            background-color: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);

            &:focus {
                outline: none;
                color: white;
                transition: color 0.3s linear;
                border-color: rgba(255, 255, 255, 0.5);
                font-weight: 600;
            }

            &::placeholder {
                color: white;
                font-weight: 600;
            }
        }

        .search-icon {
            position: absolute;
            left: 3%;
            top: 50%;
            transform: translateY(-50%);
            color: white;
            z-index: 3;
        }
    }

    .category-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
        margin-bottom: 10px;
        padding-bottom: 10px;
        -ms-overflow-style: none;
        scrollbar-width: none;

        &::-webkit-scrollbar {
            display: none;
        }

        .tag {
            padding: 8px 16px;
            backdrop-filter: blur(20px);
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            font-weight: 600;

            &.active {
                background-color: white;
                color: black;
            }

            &:hover:not(.active) {
                background-color: rgba(255, 255, 255, 1);
                color: black;
            }

            &:last-child {
                font-weight: bold;
            }
        }
    }

    /* Tag drawer styles */
    .tag-drawer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 90vh;
        background-color: white;
        z-index: 9999;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
        transform: translateY(100%);
        transition: transform 0.3s cubic-bezier(0.215, 0.610, 0.355, 1);
        overflow: hidden;

        &.drawer-open {
            transform: translateY(0);
        }

        .drawer-header {
            padding: 16px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
            position: sticky;
            top: 0;
            background-color: white;
            z-index: 10;

            .drawer-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }

            .close-icon {
                font-size: 24px;
                cursor: pointer;
                color: #666;

                &:hover {
                    color: #333;
                }
            }
        }

        .drawer-content {
            height: calc(100% - 60px);
            overflow-y: auto;
            padding: 16px;

            &::-webkit-scrollbar {
                width: 5px;
            }

            &::-webkit-scrollbar-thumb {
                background: rgb(0, 0, 0);
                border-radius: 10px;
            }

            .waterfall-container {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 16px;
                grid-auto-flow: dense;

                .waterfall-item {
                    break-inside: avoid;
                    margin-bottom: 16px;
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
                        background-color: rgb(255, 243, 243);
                        backdrop-filter: blur(20px);
                        border: 1px solid #ffffff;
                        padding: 3px;
                        border-radius: 12px;
                    }

                    .download-img {
                        position: absolute;
                        bottom: 12px;
                        right: 60px;
                        width: 24px;
                        opacity: 0;
                        z-index: 9999;
                        transition: opacity 0.5s ease;
                        cursor: pointer;
                        background-color: rgb(243, 249, 255);
                        backdrop-filter: blur(20px);
                        border: 1px solid #ffffff;
                        padding: 3px;
                        border-radius: 12px;
                    }

                    &:hover .cover-img,
                    &:hover .download-img {
                        opacity: 1;
                        transition: opacity 0.5s ease;
                    }

                    .waterfall-img {
                        width: 100%;
                        height: 250px;
                        /* 统一高度 */
                        object-fit: cover;
                        border-radius: 8px;
                        transition: transform 0.3s;

                        &:hover {
                            transform: scale(1.02);
                        }
                    }
                }
            }

            .pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-top: 24px;
                padding: 16px 0;

                .pagination-btn {
                    padding: 8px 16px;
                    background-color: #f5f5f5;
                    border: none;
                    border-radius: 24px;
                    border: 1px solid #bcbcbc;
                    cursor: pointer;
                    font-weight: 500;
                    font-weight: 600;

                    &:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }

                    &:hover:not(:disabled) {
                        background-color: #e0e0e0;
                    }
                }

                .page-info {
                    margin: 0 16px;
                    font-size: 14px;
                    color: #666;
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

    .image-detail-drawer {
        position: fixed;
        top: 0;
        right: -100%;
        width: 100%;
        height: 100%;
        z-index: 100000;
        transition: all 0.3s ease-in-out;
        pointer-events: none;

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
                border-radius: 12px;
                margin-bottom: 24px;
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
}

// 响应式调整
@media (max-width: 768px) {
    .search-container {
        padding: 15px;

        .banner {
            min-height: 350px;
        }

        .search-tabs .tab {
            padding: 6px 12px;
            font-size: 14px;
        }

        .category-tags .tag {
            padding: 6px 12px;
            font-size: 14px;
        }

        .search-box input {
            padding: 12px 12px 12px 40px;
            font-size: 14px;
        }

        .tag-drawer {
            height: 90vh;

            .drawer-content .waterfall-container {
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 10px;
            }
        }
    }
}

@media (max-width: 480px) {
    .search-container {
        padding: 10px;

        .banner {
            min-height: 300px;
            margin-bottom: 15px;
        }

        .tag-drawer {
            height: 95vh;

            .drawer-content .waterfall-container {
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
        }
    }
}
</style>
