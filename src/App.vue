<script setup>
import { RouterView } from 'vue-router';
</script>
<template>
    <RouterView />
</template>
<style>
body {
    margin: 0;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgb(0, 0, 0);
        border-radius: 10px;
    }

    overflow-x: hidden;
}
</style>
