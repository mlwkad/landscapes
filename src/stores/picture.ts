import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { homeShowPicture } from '@/utils/api/picture'

export const usePictureStore = defineStore('picture', () => {
    // 状态
    const originalImages = ref([]) // 所有未过滤的原始图片
    const filterType = ref('editor') // 默认筛选类型：editor, newest, popular
    const searchQuery = ref('') // 搜索关键词
    const currentTheme = ref('') // 当前主题，如 "森林", "海洋" 等
    const isLoading = ref(false) // 加载状态

    // 计算属性：根据当前筛选条件过滤后的图片
    const filteredImages = computed(() => {
        let result = [...originalImages.value]

        // 如果有主题筛选，应用主题过滤
        if (currentTheme.value) {
            result = result.filter(item =>
                // 搜索图片的主题标签或相关属性，根据实际数据结构调整
                item.name?.includes(currentTheme.value) ||
                item.tags?.includes(currentTheme.value) ||
                item.description?.includes(currentTheme.value)
            )
        }

        // 应用排序
        switch (filterType.value) {
            case 'editor': // 编辑精选
                result.sort((a, b) => (b.treasureNum || 0) - (a.treasureNum || 0))
                break
            case 'newest': // 最新
                result.sort((a, b) => (a.mostNew || 0) - (b.mostNew || 0))
                break
            case 'popular': // 热门
                result.sort((a, b) => (b.clickNum || 0) - (a.clickNum || 0))
                break
        }

        return result
    })

    // 异步方法：获取所有图片
    const fetchAllImages = async () => {
        if (isLoading.value || originalImages.value.length > 0) return

        isLoading.value = true
        try {
            const res = await homeShowPicture()
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
                        clickNum: item0.clickNum || 0,
                        name: item.name || '',
                        tags: item.tags || []
                    })
                })
            })
            originalImages.value = tempImages
        } catch (error) {
            console.error('获取图片失败:', error)
        } finally {
            isLoading.value = false
        }
    }

    // 设置筛选类型
    const setFilterType = (type) => {
        filterType.value = type
    }

    // 设置主题
    const setTheme = (theme) => {
        currentTheme.value = theme
    }

    // 重置筛选
    const resetFilters = () => {
        currentTheme.value = ''
        filterType.value = 'editor'
    }

    return {
        originalImages,
        filteredImages,
        filterType,
        currentTheme,
        isLoading,
        fetchAllImages,
        setFilterType,
        setTheme,
        resetFilters
    }
})

