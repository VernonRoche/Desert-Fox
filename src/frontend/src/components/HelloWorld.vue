<template>
  <h1>{{ message + "I am bidule" }}</h1>
  <h3>Bienvenue dans l'appli, j'ai reçu de mon parent {{ props.i }}</h3>
</template>

<script lang="ts" setup>
import { defineProps } from "@vue/runtime-core";
const props = defineProps<{
  i: number;
}>();

const message = 'Hello World!';
</script>