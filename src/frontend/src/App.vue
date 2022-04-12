<template>
  <div id="container" class="fullscreen flex flex-col">
    <main class="h-full">
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
