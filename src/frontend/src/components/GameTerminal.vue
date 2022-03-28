<template>
    <div id="game-terminal" class="flex flex-col w-full bg-black rounded">
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
</template>

<script lang="ts" setup>import { onUnmounted, ref } from '@vue/runtime-dom';
import ClientSocket from '../utils/ClientSocket';

const terminalInput = ref("");

const lines = ref([{ data: "Connexion au serveur...", author: "Game" }]);

const socket = new ClientSocket("localhost", 3001);

socket.eventListener("connect", () => {
    lines.value[0] = { data: "Vous êtes connecté au serveur", author: "Game" };
});

function disconnectSocket() {
    lines.value.push({ data: "Vous êtes à présent déconnecté du serveur", author: "Game" });
    socket.disconnect();

}

function addLine() {
    if (!terminalInput.value) return;
    lines.value.push({ data: terminalInput.value, author: "Vous" });

    if (terminalInput.value.trim().toLowerCase() === "ping")
        socket.send('ping message', terminalInput.value);

    if (terminalInput.value.trim().toLowerCase() === "exit")
        disconnectSocket();

    terminalInput.value = "";
}

socket.eventListener('pong message', (msg) => {
    lines.value.push({ data: msg, author: "Game" });
});

onUnmounted(disconnectSocket);

</script>