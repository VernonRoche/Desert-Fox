<template>
  <div id="container" class="fullscreen flex flex-col">
    <main class="h-full">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.fullscreen {
  @apply h-screen w-screen;
}
</style>
