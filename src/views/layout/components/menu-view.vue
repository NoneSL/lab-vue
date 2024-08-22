<script setup lang='ts'>
import { ref } from 'vue';

defineOptions({
    name: 'menuView'
})
const activeKey = ref('3');
const menu = ref([
    {
        menu: 'tab1',
        key: "3",
        children: [
            { text: "1" },
            { text: "1" },
            { text: "1" },
            { text: "1" }
        ]
    },
    {
        menu: 'tab2',
        key: "4",

        children: [
            { text: "1" }
        ]
    },
])
</script>

<template>
    <div>
        <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane :key="item.key" v-for="item in menu" :tab="item.menu">
                <div class="container-icon">
                    <div v-for="icon in item.children">{{ icon.text }}</div>
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<style lang='scss' scoped>
.container-icon {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    height: 100%;

    div {
        width: 100px;
        height: 100px;
        border: 1px solid #000;
        margin: 10px;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
