<template>
  <div class="app-logo d-flex align-items-center" :style="{fontSize: size + 'px'}">
    <span class="fw-bold text-warning text-uppercase">Coffee</span>
    <span class="fw-light text-white ms-1 text-uppercase">House</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  size: {
    type: [Number, String],
    default: 24,
  },
});
</script>

<style scoped>
.app-logo {
  line-height: 1;
  letter-spacing: 1px;
  cursor: pointer;
  user-select: none;
}
</style>
