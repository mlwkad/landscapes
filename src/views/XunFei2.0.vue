<template>
    <div class="chat-container">
        <!-- 左侧侧边栏 -->
        <div class="sidebar">
            <div class="user-info">
                <!-- <img :src="logo" alt="User Avatar" class="avatar"> -->
                <div class="logo">PPPIX</div>
                <!-- <span>豆包</span> -->
            </div>

            <!-- 新对话 -->
            <button class="new-chat-btn" @click="isShowMenu = !isShowMenu">
                <span class="plus-icon">+</span>
                新对话
                <span class="shortcut">⌘N</span>
                <div class="menu-items" v-if="isShowMenu">
                    <div class="menu-item">
                        <img :src="sousuo" alt="搜索" class="icon-search" @click.stop="isShowMenu = false, addContent()">
                        AI 搜索
                    </div>
                    <div class="menu-item">
                        <img :src="liaotianjilu" alt="聊天记录" class="icon-liaotianjilu"
                            @click.stop="isShowMenu = false, addContent()">
                        AI 对话
                    </div>
                </div>
            </button>

            <!-- 历史对话 -->
            <div class="history-section">
                <h3>历史对话</h3>
                <div class="history-items">
                    <!-- Add history items here -->
                    <div class="history-item" v-for="item in history" :key="item.id">
                        <div class="history-item-content">
                            <span class="history-item-content-text" @click="goDetail(item.id)" :style="{
                                backgroundColor: item.id === curID ? 'white' : '',
                                boxShadow: item.id === curID ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : ''
                            }">
                                <img :src="information" alt="User Avatar" class="avatar"
                                    style="width: 14px;transform: translateY(1px);margin-right: 2px;">
                                {{ item.content }}
                                <img :src="edit" alt="编辑" class="edit-icon"
                                    style="width: 16px;transform: translateY(1px);margin-left: 2px;">
                                <img :src="deleteIcon" alt="删除" class="delete-icon"
                                    style="width: 20px;transform: translateY(1px);margin-left: 2px;">
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 聊天区域 -->
        <div class="main-content">
            <BaseAIChat :streamMessage="streamMessage" :startOutPut="startOutPut" :clearContent="clearContent"
                :id="curID" @finishOutPut="finishOutPut" @clearStreamMessage="clearStreamMessage" @clearCon="clearCon">
            </BaseAIChat>
            <!-- 搜索框 -->
            <div class="input-area">
                <div class="input-container">
                    <input type="text" placeholder="试试 ‘冰岛蓝冰洞’ 或 ‘新西兰萤火虫洞’" v-model="streamMessage" />
                    <div class="input-actions">
                        <button class="action-btn"
                            :style="{ backgroundColor: isOnline ? '#d4ffcaaf' : '#ffffff', color: isOnline ? '#1eba13' : 'rgb(202, 202, 202)', outline: isOnline ? '1px solid #1eba13' : '1px solid #dddddd' }"
                            @click="changeOnline">
                            <img :src="online" class="icon-attach" style="width: 16px;"
                                :style="{ stroke: isOnline ? '#1eba13' : 'rgb(202, 202, 202)' }">
                            联网搜索
                        </button>
                        <!-- <button class="action-btn"
                            :style="{ backgroundColor: isDeepThink ? '#d4ffcaaf' : '#ffffff', color: isDeepThink ? '#1eba13' : 'rgb(202, 202, 202)', outline: isDeepThink ? '1px solid #1eba13' : '1px solid #dddddd' }"
                            @click="changDeepThink">
                            <img :src="deepThink" class="icon-deep" style="width: 16px;"
                                :style="{ stroke: isDeepThink ? '#1eba13' : 'rgb(202, 202, 202)' }">
                            深度思考
                        </button> -->
                    </div>
                    <button style="position: absolute;right:92px;border: none;" class="submit"
                        @click="streamMessage = ''" v-if="streamMessage"><img :src="clearInput"
                            class="clearInput"></button>
                    <button style="position: absolute;right:50px;" class="submit" @click="clearContent = true"><img
                            :src="clear" class="clear"></button>
                    <button style="position: absolute;right:6px;" class="submit" @click="startOutPut = true"><img
                            :src="fasong" class="fasong"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import information from '@/assets/img/聊天记录.svg'
import edit from '@/assets/img/编辑.svg'
import deleteIcon from '@/assets/img/删除.svg'
import fasong from '@/assets/img/fasong1.svg'
import online from '@/assets/img/earth.svg'
import deepThink from '@/assets/img/深度思考.svg'
import sousuo from '@/assets/img/搜索-copy.svg'
import liaotianjilu from '@/assets/img/聊天记录.svg'
import clear from '@/assets/img/清空.svg'
import clearInput from '@/assets/img/clearInput.svg'
import { ref, onMounted } from 'vue'
import BaseAIChat from '@/views/BaseAIChat.vue'
import { getAllContent, addToAllContent, onlineSearch } from '@/utils/api/xunfei'
import { id } from 'element-plus/es/locale'

let startOutPut = ref(false)  //传递一次输入内容
let clearContent = ref(false)  //清空对话内容
const isShowMenu = ref(false)  // 是否显示菜单
let streamMessage = ref('')  // 用户输入

// 联网深度思考（默认不选）
let isOnline = ref(false)
let isDeepThink = ref(false)
const changeOnline = () => {
    isOnline.value = !isOnline.value
    onlineSearch(isOnline.value)
}
const changDeepThink = () => { isDeepThink.value = !isDeepThink.value }

// 历史对话
let curID = ref(1)
const history = ref([{
    id: 1,
    content: '早上好，有什么我能帮你的吗？有什么我能帮你的吗？',
}, {
    id: 2,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 3,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 4,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 5,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 6,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 3,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 4,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 5,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 3,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 4,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 5,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 3,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 4,
    content: '早上好，有什么我能帮你的吗？',
}, {
    id: 5,
    content: '早上好，有什么我能帮你的吗？',
}])

// 跳转到具体对话
const goDetail = (id: any) => curID.value = id

// 添加对话
const addContent = () => {
    addToAllContent({ id: Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000, content: '' })
    getAllContent().then((res: any) => {
        history.value = res.data
    })
}

// 完成流式输出
const finishOutPut = () => startOutPut.value = false

//清空输入
const clearStreamMessage = () => streamMessage = null

//清空对话
const clearCon = () => clearContent.value = false

onMounted(() => {
    onlineSearch(isOnline.value)
    getAllContent().then((res: any) => {
        history.value = res.data
    })
})
</script>

<style scoped lang="less">
// Variables
@primary-color: #1a73e8;
@background-color: #fff;
@sidebar-bg: #f7f7f8;
@border-color: #e5e5e5;
@text-gray: #666;
@text-light: #999;
@hover-bg: #eee;

// Mixins
.flex-center {
    display: flex;
    align-items: center;
}

.flex-column {
    display: flex;
    flex-direction: column;
}

.clickable {
    cursor: pointer;

    &:hover {
        background-color: @hover-bg;
    }
}

// Styles
.chat-container {
    display: flex;
    height: 90vh;
    background-color: @background-color;
    overflow-y: auto;
}

.sidebar {
    width: 260px;
    background-color: @sidebar-bg;
    border-right: 1px solid @border-color;
    padding: 16px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #000000af;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
        background-color: #b2b2b227;
    }

    .flex-column();

    .user-info {
        .flex-center();
        gap: 12px;
        padding: 8px;

        .avatar {
            width: 40px;
            border-radius: 50%;
            object-fit: cover;
        }

        .logo {
            font-size: 24px;
            font-weight: 600;
            // color: #000;
            font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
            letter-spacing: 1px;
            background-image: linear-gradient(to right, rgb(255, 136, 136), rgb(255, 0, 111), rgb(110, 13, 13), rgb(8, 12, 15));
            background-clip: text;
            color: transparent;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
    }

    .new-chat-btn {
        position: relative;
        .flex-center();
        gap: 8px;
        background-color: @background-color;
        border: 1px solid @border-color;
        border-radius: 8px;
        padding: 8px 16px;
        margin: 16px 0;
        .clickable();

        .plus-icon {
            font-size: 18px;
        }

        .shortcut {
            margin-left: auto;
            color: @text-light;
            font-size: 12px;
        }
    }

    .menu-items {
        position: absolute;
        top: 37px;
        left: 0;
        .flex-column();
        gap: 1px;
        background-color: white;
        border-radius: 8px;
        padding: 8px 16px;
        border: 1px solid @border-color;
        z-index: 1000;
    }

    .history-section {
        .flex-column();
        width: 100%;

        .history-items {
            .flex-column();
            gap: 5px;

            .history-item {
                .history-item-content {
                    .history-item-content-text {
                        position: relative;
                        display: inline-block;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        width: 90%;
                        font-size: 13px;
                        color: #666;
                        // background-color: #ffffff;
                        padding: 8px 8px;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        &:hover {
                            background-color: #ececec;
                        }

                        .delete-icon {
                            display: none;
                        }

                        .edit-icon {
                            display: none;
                        }

                        &:hover {
                            .delete-icon {
                                position: absolute;
                                right: 8px;
                                top: 12%;
                                // transform: translateY(-50%);
                                display: block;
                                background-color: #ffffff;
                                border: 1px solid rgb(157, 157, 157);
                                border-radius: 4px;
                                padding: 2px 2px 2px 2px;
                            }

                            .edit-icon {
                                position: absolute;
                                right: 37px;
                                top: 12%;
                                display: block;
                                background-color: #ffffff;
                                border: 1px solid rgb(142, 142, 142);
                                border-radius: 4px;
                                padding: 4px 4px;
                            }
                        }
                    }
                }
            }
        }
    }

    .menu-item {
        .flex-center();
        gap: 8px;
        padding: 8px 20px;
        border-radius: 6px;
        .clickable();

        .icon-search {
            width: 20px;
        }

        .icon-liaotianjilu {
            width: 15px;
            margin-right: 4px;
        }
    }

    .beta-tag {
        font-size: 12px;
        color: #1eba13;
        background-color: #d4ffcaaf;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: auto;
    }
}

.main-content {
    flex: 1;
    .flex-column();
    padding: 24px 24px 0;
    overflow-y: hidden;
    position: relative;
    width: 100%;

    .input-area {
        margin-top: auto;
        padding: 16px 0 0 0;

        .input-container {
            .flex-center();
            gap: 8px;
            border: 1px solid @border-color;
            border-radius: 8px;
            padding: 8px 16px;
            position: relative;

            input {
                flex: 1;
                border: none;
                outline: none;
                font-size: 14px;
                padding-left: 90px;
                padding-top: 6px;
                padding-bottom: 6px;

                ::placeholder {
                    color: @text-gray;
                }
            }

            .input-actions {
                .flex-center();
                gap: 8px;
                position: absolute;
                left: 10px;
                width: 200px;

                .action-btn {
                    .flex-center();
                    gap: 4px;
                    padding: 6px 3px;
                    border: none;
                    background: none;
                    color: rgb(202, 202, 202);
                    background-color: #ffffff;
                    outline: 1px solid #dddddd;
                    border-radius: 12px;
                    .clickable();
                    transition: all 0.3s ease;
                }
            }

            .submit {
                height: 30px;
                border: 2px solid rgb(177, 177, 177);
                border-radius: 12px;
                background: white;
                cursor: pointer;

                .fasong {
                    width: 24px;
                }

                .clear {
                    width: 22px;
                }

                .clearInput {
                    width: 22px;
                    transform: translateY(1.6px);
                }
            }
        }
    }
}
</style>