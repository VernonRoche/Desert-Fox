<template>
    <div id="game" class="flex flex-col gap-5 w-full">
        <div id="showGame" class="flex gap-1">
            <div id="game-screen">
                <div
                    class="h-64 aspect-video bg-black text-white flex justify-center items-center text-4xl font-bold rounded"
                >Ecran du jeu</div>
            </div>
            <div id="game-terminal" class="flex flex-col w-full h-64 bg-black rounded">
                <div id="terminal" class="text-white overflow-y-scroll h-full">
                    <!-- Besoin de changer le v-scroll-to mais fonctionne pour l'instant -->
                    <p v-scroll-to class="pl-4" v-for="(line, index) in lines" :key="index">
                        <span class="font-bold">{{ line.author }}</span>
                        - {{ line.data }}
                    </p>
                </div>
                <form
                    @submit.prevent="addLine"
                    class="border bg-transparent p-2 w-full pl-4 rounded text-white flex gap-1"
                >
                    <span>></span>
                    <input
                        id="commandInput"
                        placeholder="Commande"
                        type="text"
                        v-model="terminalInput"
                        minlength="1"
                        class="bg-transparent w-full"
                    />
                </form>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from '@vue/runtime-dom';

const terminalInput = ref("");
const lines = ref([{ data: "Bienvenue sur Desert Fox!", author: "Game" }]);

function addLine() {
    if (!terminalInput.value) return;
    lines.value.push({ data: terminalInput.value, author: "Vous" });
    terminalInput.value = "";
}
</script>

<style scoped>
input:focus {
    outline: none;
}
</style>