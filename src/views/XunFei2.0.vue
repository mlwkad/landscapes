<template>
    <div class="chat-container">
        <!-- 左侧侧边栏 -->
        <div class="sidebar" v-if="!isFold">
            <div class="user-info">
                <!-- <img :src="logo" alt="User Avatar" class="avatar"> -->
                <div class="logo">PPIXX</div>
                <img :src="isFold ? unfoldIcon : foldIcon" class="icon-attach" style="width: 19px;cursor: pointer;"
                    :style="{ stroke: isFold ? '#1eba13' : 'rgb(202, 202, 202)' }" @click="foldSidebar">
            </div>

            <!-- 新对话 -->
            <button class="new-chat-btn" @mouseenter="isShowMenu = true" @mouseleave="isShowMenu = false;">
                <span class="plus-icon">+</span>
                {{ t('xinhuadonghua') }}
                <span class="shortcut">⌘N</span>
                <div class="menu-items" v-if="isShowMenu">
                    <div class="menu-item" @click="addContent">
                        <img :src="sousuo" alt="搜索" class="icon-search">
                        {{ t('AIsousuo') }}
                    </div>
                    <div class="menu-item" @click="addContent">
                        <img :src="liaotianjilu" alt="聊天记录" class="icon-liaotianjilu">
                        {{ t('AIliaotian') }}
                    </div>
                </div>
            </button>

            <!-- 历史对话 -->
            <div class="history-section">
                <h3>{{ t('lishidihua') }}</h3>
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
                                {{ item.content && item.content.length > 0 ? item.content[0].content :
                                    t('xinhuadonghua') }}
                                <!-- <img :src="edit" alt="编辑" class="edit-icon"
                                    style="width: 16px;transform: translateY(1px);margin-left: 2px;"> -->
                                <img :src="deleteIcon" alt="删除" class="delete-icon"
                                    style="width: 20px;transform: translateY(1px);margin-left: 2px;"
                                    @click.stop="deleteHist(item.id)">
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="sidebar-fold" v-else>
            <img :src="unfoldIcon" alt="收起" class="icon-attach" style="width: 19px;"
                :style="{ stroke: isFold ? '#1eba13' : 'rgb(202, 202, 202)' }" @click="foldSidebar">
        </div>


        <!-- 聊天区域 -->
        <div class="main-content">
            <BaseAIChat :streamMessage="streamMessage" :startOutPut="startOutPut" :id="curID"
                @finishOutPut="finishOutPut" @clearStreamMessage="clearStreamMessage" @updateHistName="updateHistName">
            </BaseAIChat>
            <!-- 搜索框 -->
            <div class="input-area">
                <div class="input-container">
                    <input type="text" :placeholder="t('shishi')" v-model="streamMessage" />
                    <div class="input-actions">
                        <button class="action-btn"
                            :style="{ backgroundColor: isOnline ? '#d4ffcaaf' : '#ffffff', color: isOnline ? '#1eba13' : 'rgb(202, 202, 202)', outline: isOnline ? '1px solid #1eba13' : '1px solid #dddddd' }"
                            @click="changeOnline">
                            <img :src='isOnline ? isOnlineIcon : onlineIcon' class="icon-attach" style="width: 19px;"
                                :style="{ stroke: isOnline ? '#1eba13' : 'rgb(202, 202, 202)' }">
                            {{ t('lianwngsousuo') }}
                        </button>
                    </div>
                    <button style="position: absolute;right:49px;border: none;" class="submit"
                        @click="streamMessage = ''" v-if="streamMessage"><img :src="clearInput"
                            class="clearInput"></button>
                    <!-- <button style="position: absolute;right:50px;" class="submit" @click="clearContent = true"><img
                            :src="clear" class="clear"></button> -->
                    <button style="position: absolute;right:6px;" class="submit" @click="startOutPut = true"><img
                            :src="fasong" class="fasong"></button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import information from '@/assets/img/聊天记录.svg'
// import edit from '@/assets/img/编辑.svg'
import deleteIcon from '@/assets/img/删除.svg'
import fasong from '@/assets/img/fasong1.svg'
import onlineIcon from '@/assets/img/online.svg'
import isOnlineIcon from '@/assets/img/isOnline.svg'
import foldIcon from '@/assets/img/收起.svg'
import unfoldIcon from '@/assets/img/展开.svg'
import sousuo from '@/assets/img/搜索-copy.svg'
import liaotianjilu from '@/assets/img/聊天记录.svg'
// import clear from '@/assets/img/清空.svg'
import clearInput from '@/assets/img/clearInput.svg'
import { ref, onMounted, watch } from 'vue'
import BaseAIChat from '@/views/BaseAIChat.vue'
import { getAllContent, addToAllContent, onlineSearch, deleteContent } from '@/utils/api/xunfei'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

let startOutPut = ref(false)  //传递一次输入内容
const isShowMenu = ref(false)  // 是否显示菜单
let streamMessage = ref('')  // 用户输入

let isFold = ref(false)

// 联网深度思考（默认不选）
let isOnline = ref(false)
let isDeepThink = ref(false)
const changeOnline = () => {
    isOnline.value = !isOnline.value
    onlineSearch(isOnline.value)
}
const changDeepThink = () => { isDeepThink.value = !isDeepThink.value }

// 收起侧边栏
const foldSidebar = () => {
    isFold.value = !isFold.value
}
// 历史对话
let curID = ref(1)
const history = ref<any>([])

// 跳转到具体对话
const goDetail = (id: any) => {
    curID.value = id
}

// 删除对话
const deleteHist = async (id: any) => {
    await deleteContent(id)
    history.value = history.value.filter((item: any) => item.id !== id)
    if (history.value.length == 0) addContent()
    else {
        getAllContent().then((res: any) => {
            history.value = res
            curID.value = res[0].id
        })
    }
}

// 添加对话
const addContent = () => {
    isShowMenu.value = false
    addToAllContent({ id: Number(new Date().getTime().toString().slice(-7)), content: [] }).then(() => {
        getAllContent().then((res: any) => {
            history.value = res
            curID.value = res[0].id
        })
    })

}

// 完成流式输出
const finishOutPut = () => startOutPut.value = false

//清空输入
const clearStreamMessage = () => streamMessage = null

// 更新对话名称
const updateHistName = () => getAllContent().then((res: any) => history.value = res)

onMounted(() => {
    onlineSearch(isOnline.value)
    getAllContent().then((res: any) => {
        if (res.length > 0) {
            history.value = res
            curID.value = res[0].id
        }
        else addContent()
    })
    window.addEventListener('resize', () => {
        if (window.innerWidth < 500) isFold.value = true
        else isFold.value = false
    })
    if (window.innerWidth < 500) isFold.value = true
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
    width: 220px;
    background-color: @sidebar-bg;
    border-right: 1px solid @border-color;
    padding: 16px;
    overflow-y: auto;
    transition: width 0.3s ease;

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
        justify-content: space-between;
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

.sidebar-fold {
    margin-top: 10px;
    margin-left: 10px;
    border: 2px solid rgba(0, 0, 0, 0.385);
    height: fit-content;
    width: fit-content;
    padding: 6px 5px 0px;
    border-radius: 8px;
    cursor: pointer;
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
                width: fit-content;

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