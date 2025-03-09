<template>
    <div class="login-zone">
        <div class="login">
            <div class="login-title">登录</div>
            <div class="login-input">
                <el-icon class="login-icon">
                    <User />
                </el-icon>
                <input class="login-input-text" type="text" placeholder="用户名">
            </div>
            <div class="login-input">
                <el-icon class="login-icon">
                    <Key />
                </el-icon>
                <input class="login-input-text" type="text" placeholder="密码">
            </div>
            <el-button class="login-button" @click="gohome">
                <el-icon class="login-icon-animation">
                    <Bicycle />
                </el-icon>
                <span class="button-font-animation">let's go</span>
            </el-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, Key, Loading, Bicycle } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
const router = useRouter()
const gohome = () => {
    const loginIcon = document.querySelector('.login-icon-animation').classList.add('login-icon-animation-go')
    const loginFont = document.querySelector('.button-font-animation').classList.add('button-font-animation-go')
    setTimeout(() => {
        router.push({ path: '/' })
    }, 500);

}

</script>

<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.login-zone {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    background-image: url(https://cdn.pixabay.com/photo/2022/04/08/06/36/rock-7118843_1280.jpg);
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
                color: black;
                font-weight: 600;
                transition: color 0.3s ease-in-out;

                &:focus {
                    color: #ffffff;
                    transition: color 0.3s ease-in-out;
                }

                &::placeholder {
                    color: black;
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
                animation: go 0.5s ease-in-out;
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
