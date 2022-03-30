<template>
  <NavBar />
  <main class="fullscreen">
    <h1 class="text-center">
      Bienvenue sur le frontend de Desert Fox
    </h1>
    <router-view />
  </main>
</template>

<script lang="ts" setup>
import NavBar from './components/NavBar.vue';
</script>



<style scoped>
nav a.router-link-exact-active {
  @apply underline;
}

.fullscreen {
  @apply h-screen w-screen;
}
</style>
