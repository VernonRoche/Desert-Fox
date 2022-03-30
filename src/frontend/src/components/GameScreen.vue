<template>
    <div id="gamescreen" ref="screen" class="border-2 border-black"></div>
</template>

<script lang="ts" setup>
import Two from "two.js";
import { onMounted, ref } from "vue";
import drawEverything from "../utils/twoMap";
const screen = ref<null | HTMLDivElement>(null);

onMounted(() => {
    if (!screen.value) {
        console.error("No gamescreen found");
        return;
    }
    const two = new Two().appendTo(screen.value);
    drawEverything(two);

})
</script>