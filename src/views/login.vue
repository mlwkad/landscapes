<template>
    <div class="login-zone">
        <div class="login">
            <div class="login-title">登录</div>
            <div class="login-input">
                <el-icon class="login-icon">
                    <User />
                </el-icon>
                <input class="login-input-text" type="text" placeholder="用户名" v-model="username">
            </div>
            <div class="login-input">
                <el-icon class="login-icon">
                    <Key />
                </el-icon>
                <input class="login-input-text" type="text" placeholder="密码" v-model="password">
            </div>
            <el-button class="login-button" @click="gohome">
                <el-icon class="login-icon-animation">
                    <Bicycle />
                </el-icon>
                <span class="button-font-animation">let's go</span>
            </el-button>
        </div>
    </div>
    <div class="alert" id="alertId">
        {{ alert }}
    </div>
</template>

<script setup lang="ts">
import { User, Key, Loading, Bicycle } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import login from '@/utils/api/login'
import { useLoginStore } from '@/stores/login'
import { set } from '@vueuse/core'

const router = useRouter()
let username = ref('')
let password = ref('')
let alert = ref('666')
const gohome = () => {
    login({
        username: username.value,
        password: password.value
    }).then((res: any) => {
        console.log('token:',res.token);
        const loginIcon = document.querySelector('.login-icon-animation').classList.add('login-icon-animation-go')
        const loginFont = document.querySelector('.button-font-animation').classList.add('button-font-animation-go')
        const alertItem = document.querySelector('.alert')
        alertItem.classList.add('alert-animation')
        alert.value = '登录成功'
        setTimeout(() => {
            router.push({ path: '/' })
        }, 1000);
    }).catch((err: any) => {
        alert.value = '账号或密码错误'
        const alertItem = document.querySelector('.alert')
        alertItem.classList.add('alert-animation')
        username.value = ''
        password.value = ''
        setTimeout(() => {
            alertItem.classList.remove('alert-animation')
        }, 2000)
    })
}

</script>

<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.alert {
    .rem(padding, 0.5);
    position: fixed;
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

.login-zone {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-image: url(https://cdn.pixabay.com/photo/2018/07/18/20/25/channel-3547224_1280.jpg);
    background-size: cover;

    .login {

        //媒体查询管自己
        @media(min-width:1100px) {}

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(20px); // 毛玻璃
        // background-color: aliceblue;
        .rem(padding-top, 1.5);
        .rem(padding-bottom, 1.5);
        .rem(padding-left, 4);
        .rem(padding-right, 4);
        border-radius: 12px;
        border: 1px solid #fffefe;

        &-title {
            .rem(font-size, 1.2);
        }

        &-input {
            display: flex;
            align-items: center;
            justify-content: center;
            .rem(margin-top, 1);
            .rem(margin-bottom, 1);
            .rem(padding, 0.3);
            border-bottom: 1px solid black;
            backdrop-filter: blur(20px);

            .login-icon {
                font-size: 20px;
                .rem(margin-right, 0.6);
                .rem(margin-left, 0.6)
            }

            &-text {
                border: none;
                outline: none;
                .rem(font-size, 1);
                .rem(padding, 0.6);
                position: relative;
                background-color: transparent;
                color: rgb(0, 0, 0);
                font-weight: 600;
                transition: color 0.3s ease-in-out;

                &:focus {
                    color: #ffffff;
                    transition: color 0.3s ease-in-out;
                }

                &::placeholder {
                    color: rgb(0, 0, 0);
                }
            }
        }

        &-button {
            width: 40%;
            .rem(margin-top, 0.6);
            color: white;
            background-color: black;
            border: 1px solid black;
            border-radius: 10px;
            .rem(font-size, 1);
            .rem(height, 2.5);

            .button-font-animation-go {
                opacity: 0;
                transition: opacity 0.2s ease-in-out;
            }

            .login-icon-animation {
                margin-right: 10px;
                .rem(size, 2);
            }

            .login-icon-animation-go {
                animation: go 1s ease-in-out;
            }

            @keyframes go {
                0% {
                    opacity: 1;
                }

                60% {
                    opacity: 0.9;
                }

                100% {
                    transform: translateX(400%);
                    opacity: 0;
                }
            }
        }
    }
}
</style>
