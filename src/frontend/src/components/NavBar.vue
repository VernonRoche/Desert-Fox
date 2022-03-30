<template>
  <nav class="flex gap-1 justify-around w-screen pt-1">
    <router-link
      v-for="route in routes"
      :key="route.path"
      class="px-4 py-2 bg-black rounded text-white w-full text-center hover:font-bold transition-all hover:opacity-90"
      :to="route.path"
    >
      {{ route.name }}
    </router-link>
  </nav>
</template>

<script setup lang="ts">
const routes = [
    {
        path: "/",
        name: "Accueil"
    },
    {
        path: "/game",
        name: "Jeu"
    },
];
</script>