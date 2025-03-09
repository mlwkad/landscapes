<template>
    <div>
        <div class='picture-header'>
            <img class="picture-content" :src='item.src' alt="" v-for="item in showing" :key="item.id">
        </div>
    </div>
</template>
<script setup lang="ts">
let showing = [
    { 'src': '', 'id': 1 },
    { 'src': '', 'id': 2 },
    { 'src': '', 'id': 3 },
    { 'src': '', 'id': 4 },
    { 'src': '', 'id': 5 },
    { 'src': '', 'id': 6 },
    { 'src': '', 'id': 7 },
    { 'src': '', 'id': 8 },
    { 'src': '', 'id': 9 },
    { 'src': '', 'id': 10 }]
</script>
<style scoped lang="less">
@import '@/assets/styles.less';
@import '@/assets/property.less';

.picture-header {
    // width: 91vw;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
    align-items: center;

    .picture-content {
        border-radius: 12px;
        .rem(width, 11);
        .rem(height, 11);
        .rem(margin-top, 1);
        .rem(margin-bottom, 0.49);
    }
}
</style>
