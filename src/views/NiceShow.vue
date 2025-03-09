<template>
    <div class="niceShowZone">
        <div class="niceShowZone-content">
            <img class="niceShowZone-content-img" :id=item.id :src="item.src" alt="" v-for="item in imgList"
                :key="item.id">
            <div class="niceShowZone-content-font">
                <span class="niceShowZone-content-font1">enjoy </span>
                <span class="niceShowZone-content-font1">fantastic </span>
                <span class="niceShowZone-content-font1">landscapes</span>
                <img src="@/assets/img/箭头.svg" class="niceShowZone-content-svg" alt="">
            </div>
            <img class="niceShowZone-content-img" :id=item.id :src="item.src" alt="" v-for="item in imgList1"
                :key="item.id">
        </div>
    </div>
</template>

<script setup lang="js">
import { onMounted } from 'vue'

const imgList = [{ id: 'img1', left: 0.1, top: 0.18, src: 'https://cdn.pixabay.com/photo/2022/03/09/07/12/nature-7057191_1280.jpg', delayPlace: 1 },
{ id: 'img2', left: 0.13, top: 0, src: 'https://cdn.pixabay.com/photo/2019/05/29/14/30/cinque-terre-4237666_1280.jpg', delayPlace: 1.3 },
{ id: 'img3', left: -0.06, top: 0.09, src: 'https://cdn.pixabay.com/photo/2024/01/05/14/00/ship-8489583_1280.jpg', delayPlace: 1.6 },
{ id: 'img4', left: -0.1, top: 0.18, src: 'https://cdn.pixabay.com/photo/2023/12/09/14/43/iceland-8439504_1280.jpg', delayPlace: 1.9 },
]
const imgList1 = [{ id: 'img5', left: 0.16, top: -0.2, src: 'https://cdn.pixabay.com/photo/2023/01/14/05/34/street-7717463_1280.jpg', delayPlace: 2.2 },
{ id: 'img6', left: 0.04, top: -0.1, src: 'https://cdn.pixabay.com/photo/2013/04/04/12/34/mountains-100367_1280.jpg', delayPlace: 2.5 },
{ id: 'img7', left: -0.1, top: -0.28, src: 'https://cdn.pixabay.com/photo/2023/03/06/17/02/ship-7833921_1280.jpg', delayPlace: 2.8 },
{ id: 'img8', left: -0.13, top: -0.16, src: 'https://cdn.pixabay.com/photo/2014/10/07/13/48/mountain-477832_1280.jpg', delayPlace: 3.1 }]

onMounted(() => {
    const allImgList = [imgList, imgList1]
    window.onscroll = () => allImgList.forEach(item => item.forEach(item => scrollAnimation(item.id, { left: item.left, top: item.top }, item.delayPlace)));
    window.onresize = () => allImgList.forEach(item => item.forEach(item => scrollAnimation(item.id, { left: item.left, top: item.top }, item.delayPlace)));
});

const scrollAnimation = (id, multiple, delayPlace) => {
    const item = document.getElementById(id)
    // Math.min(window.scrollY / (3 * window.innerHeight), 1) === [0,1]
    const scrollMultiple = Math.min(window.scrollY / (window.innerHeight * delayPlace), 1)  // delayPlace越大,越晚完全出现
    const X = scrollMultiple * multiple.left * window.innerWidth
    const Y = scrollMultiple * multiple.top * window.innerHeight
    item.style.opacity = scrollMultiple;  // Y轴高度/N倍当前视口高度
    item.style.scale = scrollMultiple
    // item.style.transform = `scale(${scrollMultiple}) translate(${X}px,${Y}px)`
};
</script>

<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.niceShowZone {
    width: 100%;
    height: 450vh;
    // background-color: grey;

    &-content {
        height: 100vh;
        position: sticky;
        top: 70px;
        display: flex;
        align-content: flex-start;
        justify-content: space-around;
        flex-wrap: wrap;

        &-img {
            width: 20vw;
            height: 30vh;
            object-fit: cover;
            opacity: 0;
            border-radius: 12px;
            .rem(margin-top, 2);
            .rem(margin-bottom, 2);

            @media (max-width: 1100px) {
                width: 35vw;
                height: 20vh;
                .rem(margin-top, 0.5);
                .rem(margin-bottom, 0.5);
            }
        }

        &-font {
            width: 90vw;
            display: flex;
            justify-content: space-around;
            align-items: baseline;
            z-index: 100;
            /* 调整透视效果 */
            perspective: 800px;
            /* 启用 3D 变换 */
            transform-style: preserve-3d;

            @media (max-width: 1100px) {
                order: -1;
            }

            &1 {
                background-image: linear-gradient(to right, rgb(255, 136, 136),rgb(255, 0, 111), rgb(110, 13, 13),rgb(8, 12, 15));
                /* -webkit-:以支持 Safari 和旧版 Chrome 将背景图像裁剪到文本*/
                background-clip: text;
                /* 关键: 使文本透明，显示背景渐变 */
                color: transparent;

                text-shadow: 0 0 20px rgb(255, 216, 216);
                .vw(font-size, 4.5);
                margin-right: 20px;
                margin-left: 20px;
                font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
            }

            .niceShowZone-content-svg {
                width: 5vw;
                // transform: translate(10vw, 5vw);

                @media (min-width: 880px) {
                    // transform: translate(0vw, 10vw);
                    width: 4vw;
                }

                @media (min-width: 1200px) {
                    // transform: translate(3vw, 10vw);
                    width: 3vw;
                }

                animation: rotateAndBounce 2s linear infinite;

                @keyframes rotateAndBounce {
                    0% {
                        transform: rotateY(0deg) translateY(3px);
                    }

                    50% {
                        transform: rotateY(180deg) translateY(10px);
                    }

                    100% {
                        transform: rotateY(360deg) translateY(3px);
                    }
                }
            }
        }
    }
}
</style>
