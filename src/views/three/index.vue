<script setup lang='ts'>
defineOptions({
    name: 'Three'
})
import { onMounted, ref } from 'vue';
import { core } from './helper/core';
const container = ref();
onMounted(() => {
    const three = new core(container.value);
    three.render();
});
</script>

<template>
    <div ref="container" style="width: 100%; height: 100%;"></div>
</template>

<style lang='scss' scoped></style>
