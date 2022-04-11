<template>
  <div id="container" class="fullscreen flex flex-col">
    <NavBar class="h-12 mb-2" />
    <main class="h-full w-full">
      <router-view />
    </main>
  </div>
</template>

<script lang="ts" setup>
import NavBar from "./components/NavBar.vue";
</script>

<style scoped>
nav a.router-link-exact-active {
  @apply underline;
}

.fullscreen {
  @apply h-screen w-screen;
}
</style>
