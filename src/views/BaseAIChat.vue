<template>
    <div class="XF-chat" ref="chatContainer">
        <div v-for="item in messageList" :key="item.id" :class="item.role === 'user' ? 'user-zone' : 'ai-zone'">
            <div v-if="item.role === 'user'" style="position: relative;">
                {{ item.content }}
                <img :src="copy" alt="复制" class="copy-btn" @click="copyContent(item.content)">
                <img :src="retry" alt="重试" class="retry-btn" @click="retryContent(item.content)">
            </div>
            <div v-else-if="item.role === 'online'" class="online-detail">
                <div class="online-alert">{{ t('AI') }}</div>
                <div v-for="info, index in item.content" style="margin: 10px 0 2px;">
                    {{ index + 1 }} . <a :href="info.url" target="_blank">{{ info.title }}</a>
                </div>
            </div>
            <div v-else style="position: relative;">
                <pre v-html="item.content"></pre> <!--直接显示已处理过的内容-->
                <img :src="copy" alt="复制" class="copy-btn" @click="copyContent(item.content)">
            </div>
        </div>
        <!-- 回复完成之前显示流式,流式回复完成之后隐藏,并将完整回复保存到 messageList,该回复又被显示 -->
        <div v-if="showStream" class="ai-zone">
            <pre v-html="formatAIResponse(streamResponse)"></pre>
        </div>
    </div>
</template>
<script setup lang="ts">
import copy from '@/assets/img/复制.svg'
import retry from '@/assets/img/重试.svg'
import { ref, watch, onMounted, nextTick } from 'vue'
import { createStreamConnection } from '@/utils/api/xunfei'
import { updateContent, getContent, getAllContent } from '@/utils/api/xunfei'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// 流式聊天
let retryCon = ref('')  //重新问话
const streamResponse = ref('')  // 流式显示对话结果
const streamRespOnline = ref([])  // 当前问题的联网信息
const showStream = ref(false)  // 流式显示是否开启
let eventSource = null  // 流式连接
let messageList = ref<any>([])  // 消息列表
const chatContainer = ref(null) // 获取滚动区域

//打字机所需:
const currentResponse = ref('')  //当前接收到的回复
const currentTypingIndex = ref(0)  //当前打字索引
let typingInterval = null  //打字机定时器
const isDone = ref(false)  //是否接收完毕

// props
const props = defineProps({
    streamMessage: { type: String, default: '' },
    startOutPut: { type: Boolean, default: false },
    id: { type: Number, default: 0 }, // 当前对话id
})

// emit
const emit = defineEmits(['retryContent', 'finishOutPut', 'clearStreamMessage', 'clearCon', 'updateHistName'])
// 成功启动流式输出
const finishOutPut = () => emit('finishOutPut')
//清空输入
const clearStreamMessage = () => emit('clearStreamMessage')
// 更新对话名称
const updateHistName = () => emit('updateHistName')

// 监听 streamResponse, messageList 的变化，当有新内容时自动滚动
watch([streamResponse, messageList], () => { scrollToBottom() })
watch(() => props.id, (newVal) => { if (newVal) getContent(newVal).then((res: any) => messageList.value = res.content) })
watch(() => props.startOutPut, (newVal) => { if (newVal && props.streamMessage) handleChat_Stream() })

//scrollY 是一个全局属性，表示整个窗口在垂直方向上已滚动的距离,只读
//scrollTop 是某个元素在垂直方向上已滚动的距离，只读
//scrollHeight 是某个元素的实际高度，包括溢出的文本高度,只读
//滚动到底部的函数
const scrollToBottom = () => nextTick(() => chatContainer.value.scrollTop = chatContainer.value.scrollHeight)

// 格式化AI回复，将[^1^]等引用转换为可点击的链接
const formatAIResponse = (text: string) => {
    if (!text) return text
    // 先移除 * 和 # 符号
    text = text.replace(/[*#《》]/g, '')
    // 替换引用标记为HTML链接
    return text.replace(/\[\^(\d+)\^\]/g, (match, index) => {  // match:符合正则的完整字符串,eg：[^4^], (\d+)捕获内容, index:对应的内容,但是是字符串，eg："4"
        const infoIndex = parseInt(index) - 1
        if (streamRespOnline.value && infoIndex >= 0 && infoIndex < streamRespOnline.value.length) {
            return `<a href="${streamRespOnline.value[infoIndex].url}" target="_blank" class="reference-link">${index}</a>`
        }
        return match
    })
}

//流式聊天
const handleChat_Stream = () => {
    // 成功启动流式输出
    finishOutPut()
    // 流式显示开启
    showStream.value = true
    // 清空之前的响应    
    streamResponse.value = ''
    // 清空之前的联网信息
    streamRespOnline.value = []
    // 保留用户信息
    saveMessage('user', props.streamMessage || retryCon.value)
    // 开启打字机
    writeFontMachine()
    // 创建 EventSource 连接,该API必须搭配get请求
    if (props.streamMessage) eventSource = createStreamConnection(props.streamMessage)
    else if (retryCon.value) eventSource = createStreamConnection(retryCon.value)
    // 接收消息
    eventSource.onmessage = (event: any) => {
        // 先检查是否是结束
        if (event.data === '[DONE]') {
            // 接收完毕
            isDone.value = true
            // 关闭流式连接
            eventSource.close()
            return
        }
        // 后解析 JSON 数据
        const data = JSON.parse(event.data)
        // 不断获取内容 
        if (data.onlineInfo) {
            streamRespOnline.value = data.onlineInfo  // 保留当前问题的联网信息
            saveMessage('online', data.onlineInfo)
        }
        else { currentResponse.value += data.content }
    }
    // 处理错误
    eventSource.onerror = () => eventSource.close()
    // 连接打开
    eventSource.onopen = () => []
    //清空
    clearStreamMessage()
}

// 打字机效果
const writeFontMachine = () => {
    // 打字机开启
    isDone.value = false
    // 清空currentResponse回复
    currentResponse.value = ''
    // 初始化打字索引
    currentTypingIndex.value = 0
    // 创建一个新的定时器，持续运行直到打字完成
    typingInterval = setInterval(() => {
        // 如果当前打字索引小于接收到的信息的长度,那就每30ms多显示一个字
        if (currentTypingIndex.value < currentResponse.value.length) {
            streamResponse.value = currentResponse.value.slice(0, currentTypingIndex.value + 1)  //索引:[0,当前打字索引+1)的元素
            currentTypingIndex.value++
        } else {
            // isDone很关键,某一时刻打字索引可能追上当前接收内容的长度,导致走到else直接清除了循环器
            // 有了isDone,就不会立即清除循环器,而是有一个字打一个字
            console.log('被追上了')
            if (isDone.value) {
                // 完成打字，清除定时器
                clearInterval(typingInterval)
                typingInterval = null
                // 打字完毕,流式显示关闭
                showStream.value = false
                // 保留AI信息 - 使用完整响应
                saveMessage('ai', currentResponse.value)
            }
        }
    }, 33) // 每33毫秒显示一个字
}

//保留用户/AI信息
const saveMessage = async (role: string, content: string) => {
    let finalContent = content
    // AI回复且有联网信息，则格式化后再存入
    if (role === 'ai' && streamRespOnline.value && streamRespOnline.value.length > 0) finalContent = formatAIResponse(content)
    await messageList.value.push({ role: role, content: finalContent })
    updateContent({ id: props.id, content: messageList.value })
    updateHistName()
}

//复制内容
const copyContent = (content: string) => navigator.clipboard.writeText(content)

//重试内容
const retryContent = (content: string) => {
    retryCon.value = content
    handleChat_Stream()
}

onMounted(() => {
    getAllContent().then((res: any) => getContent(res[0].id).then((res: any) => messageList.value = res.content))
    // 初始加载时滚动到底部
    scrollToBottom()
})
</script>

<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.XF-chat {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    gap: 35px;
    //不写就不让滚动
    overflow-y: auto;
    padding-bottom: 40px;

    &::-webkit-scrollbar {
        width: 7px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgb(255, 255, 255);
        border-radius: 12px;
        outline: 2px solid rgb(0, 0, 0);
    }

    .user-zone {
        width: fit-content;
        max-width: 80%;
        display: flex;
        align-self: flex-end;
        background-color: rgb(0, 0, 0);
        color: white;
        border-radius: 12px;
        padding: 5px 10px;
        margin: 5px 15px 5px 5px;
        outline: 2px solid rgb(246, 245, 245);
        font-weight: 600;
        // word-wrap: break-word;
        // white-space: pre-wrap;

        .copy-btn {
            position: absolute;
            left: -18px;
            bottom: 0;
            transform: translateY(160%);
            color: black;
            border-radius: 12px;
            padding: 5px 7px;
            margin: 5px 15px 5px 5px;
            width: 15px;
            cursor: pointer;
            white-space: nowrap;

            &:hover {
                background-color: #ececec;
            }
        }

        .retry-btn {
            position: absolute;
            left: 7px;
            bottom: 0;
            transform: translateY(160%);
            color: black;
            border-radius: 12px;
            padding: 5px 7px;
            margin: 5px 15px 5px 5px;
            width: 15px;
            cursor: pointer;
            white-space: nowrap;

            &:hover {
                background-color: #ececec;
            }
        }
    }

    .ai-zone {
        max-width: 80%;
        display: flex;
        align-self: flex-start;
        background-color: rgb(255, 255, 255);
        color: black;
        border-radius: 12px;
        padding: 5px 10px;
        margin: 5px 5px 5px 7px;
        outline: 2px solid rgb(0, 0, 0);
        font-weight: 600;

        pre {
            white-space: pre-wrap;
            /* 保留空白符并允许换行 */
            word-wrap: break-word;
            /* 允许长单词换行 */
            margin: 0;
            /* 移除默认边距 */
            font-family: inherit;
            /* 使用父元素的字体 */
            font-size: inherit;
            /* 使用父元素的字体大小 */
            font-weight: inherit;
            /* 使用父元素的字体粗细 */
        }

        // 如果设置了scoped，使用:deep()选择器确保动态插入的内容也能被样式影响
        :deep(.reference-link) {
            text-decoration: none;
            color: rgb(255, 255, 255);
            font-weight: bold;
            cursor: pointer;
            padding: 0 3px;
            background-color: rgb(0, 0, 0);
            border-radius: 9px;
            margin-left: 3px;
            transition: color 0.3s ease, background-color 0.3s ease;

            &:hover {
                text-decoration: none;
                background-color: rgb(255, 255, 255);
                color: rgb(0, 0, 0);
                border-radius: 9px;
                border: 2px solid rgb(118, 118, 118);
            }
        }

        .copy-btn {
            position: absolute;
            right: -30px;
            bottom: 0;
            transform: translateY(160%);
            color: black;
            border-radius: 12px;
            padding: 5px 7px;
            margin: 5px 15px 5px 5px;
            width: 15px;
            cursor: pointer;
            white-space: nowrap;

            &:hover {
                background-color: #ececec;
            }
        }

        .online-alert {
            font-size: 20px;
            color: black;
            // background: linear-gradient(to right, rgb(236, 99, 99), rgb(255, 0, 111), rgb(110, 13, 13), rgb(0, 0, 0));
            // background-clip: text;
            // width: fit-content;
        }

        .online-detail {
            position: relative;

            a {
                text-decoration: none;
                color: transparent;
                background: linear-gradient(to right, rgb(236, 99, 99), rgb(255, 0, 111), rgb(110, 13, 13), rgb(0, 0, 0));
                background-clip: text;
                width: fit-content;

                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}
</style>