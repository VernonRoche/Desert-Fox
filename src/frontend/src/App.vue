<template>
  <div id="container" class="fullscreen">
    <NavBar class="h-12 mb-2" />
    <main class="restofscreen">
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

.restofscreen {
  height: calc(100vh - calc(3rem + 12px));
}
</style>
