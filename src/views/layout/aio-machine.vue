<script setup lang='ts'>
defineOptions({
    name: 'aioMachine'
})
import menuView from './components/menu-view.vue';
</script>

<template>
    <div class="container">
        <div class="container-detail"></div>
        <div class="container-meau">
            <menuView />
        </div>
    </div>
</template>

<style lang='scss' scoped>
.container {
    display: grid;
    grid-template-columns: 1fr 400px;
    height: 100vh;

    .container-detail,
    .container-meau {
        padding: 20px;
    }

    .container-detail {
        background-color: bisque;

    }

    .container-meau {
        background-color: darkgray;
    }
}
</style>
