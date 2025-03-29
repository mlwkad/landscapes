<template>
    <div class="XF-main">
        <div class="XF-chat" ref="chatContainer">
            <div v-for="item in messageList" :key="item.id" :class="item.role === 'user' ? 'user-zone' : 'ai-zone'">
                <div v-if="item.role === 'user'">
                    {{ item.content }}
                </div>
                <div v-else>
                    <pre>{{ item.content }}</pre> <!--pre:保留空格和换行-->
                </div>
            </div>
            <!-- 回复完成之前显示流式,流式回复完成之后隐藏,并将完整回复保存到 messageList,该回复又被显示 -->
            <div v-if="showStream" class="ai-zone">
                <pre>{{ streamResponse }}</pre>
            </div>
        </div>
        <div class="XF-ask">
            <input class="XF-input" v-model="streamMessage" placeholder="随便问哦〃•ω‹〃"
                @keydown.enter="handleChat_Stream" />
            <button class="XF-button" @click="handleChat_Stream">发送</button>
            <button class="XF-button" @click="clearMessage">清空</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { createStreamConnection } from '@/utils/api/xunfei'
const streamMessage = ref('')  // 用户输入
const streamResponse = ref('')  // 流式显示
const showStream = ref(false)  // 流式显示是否开启
let eventSource = null  // 流式连接
let messageList = ref<any>([])  // 消息列表
const chatContainer = ref(null) // 获取滚动区域

//打字机所需:
const currentResponse = ref('')  //当前接收到的回复
const currentTypingIndex = ref(0)  //当前打字索引
let typingInterval = null  //打字机定时器
const isDone = ref(false)  //是否接收完毕

// 监听 streamResponse, messageList 的变化，当有新内容时自动滚动
watch([streamResponse, messageList], () => { scrollToBottom() })

//scrollY 是一个全局属性，表示整个窗口在垂直方向上已滚动的距离,只读
//scrollTop 是某个元素在垂直方向上已滚动的距离，只读
//scrollHeight 是某个元素的实际高度，包括溢出的文本高度只读
// 滚动到底部的函数
const scrollToBottom = () => nextTick(() => chatContainer.value.scrollTop = chatContainer.value.scrollHeight)

//流式聊天
const handleChat_Stream = () => {
    if (streamMessage.value === '') return
    // 流式显示开启
    showStream.value = true
    // 清空之前的响应    
    streamResponse.value = ''
    // 保留用户信息
    saveMessage('user', streamMessage.value)
    // 开启打字机
    writeFontMachine()
    // 创建 EventSource 连接,该API必须搭配get请求
    eventSource = createStreamConnection(streamMessage.value)
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
        currentResponse.value += data.content
    }
    // 处理错误
    eventSource.onerror = () => eventSource.close()
    // 连接打开
    eventSource.onopen = () => []
    // 清空输入
    streamMessage.value = ''
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
const saveMessage = (role: string, content: string) => {
    messageList.value.push({ role: role, content: content })
    localStorage.setItem('messageList', JSON.stringify(messageList.value))
}

//清空消息
const clearMessage = () => {
    messageList.value = []
    localStorage.removeItem('messageList')
}

onMounted(() => {
    messageList.value = JSON.parse(localStorage.getItem('messageList') || '[]')
    // 初始加载时滚动到底部
    scrollToBottom()
})
</script>

<style scoped lang="less">
@import url('@/assets/styles.less');
@import url('@/assets/property.less');

.XF-main {
    position: relative;
    width: 375px;
    height: 88vh;
    background-color: rgb(250, 197, 197);
    border-radius: 12px;
    outline: 3px solid rgb(162, 162, 162);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    @media (max-width:500px) {
        width: 300px;
    }

    .XF-chat {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        position: absolute;
        top: 10px;
        bottom: 70px;
        left: 5px;
        right: 5px;
        width: 100%;
        //不写就不让滚动
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 7px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: rgb(255, 255, 255);
            border-radius: 12px;
            outline: 3px solid rgb(162, 162, 162);
        }

        .user-zone {
            width: fit-content;
            max-width: 80%;
            display: flex;
            align-self: flex-end;
            background-color: rgb(171, 255, 141);
            border-radius: 12px;
            padding: 5px 10px;
            margin: 5px 15px 5px 5px;
            outline: 2px solid rgb(246, 245, 245);
            font-weight: 600;
        }

        .ai-zone {
            max-width: 80%;
            display: flex;
            align-self: flex-start;
            background-color: rgb(255, 255, 255);
            border-radius: 12px;
            padding: 5px 10px;
            margin: 5px 5px 5px 7px;
            outline: 2px solid rgb(255, 255, 255);
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
        }
    }


    .XF-ask {
        position: absolute;
        width: 370px;
        height: 50px;
        display: flex;
        justify-content: space-around;
        bottom: 0;
        right: 0;

        @media(max-width:500px) {
            width: 300px;
        }

        .XF-input {
            translate: 0 2px;
            height: 70%;
            width: 60%;
            border-radius: 12px;
            outline: 3px solid rgb(152, 152, 152);
            border: none;
            .rem(margin-bottom, 0.5);
            padding-left: 10px;

            &:focus {
                color: rgb(150, 26, 26);
                font-weight: 600;
            }

            &::placeholder {
                color: black;
                font-weight: 600;
            }
        }

        .XF-button {
            text-align: center;
            line-height: 40px;
            height: 40px;
            width: 15%;
            border-radius: 10px;
            border: 0px;
            background-color: black;
            color: white;
            .rem(font-size, 1);
            font-weight: 600;
            cursor: pointer;
        }
    }
}
</style>