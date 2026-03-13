<template>
  <header class="admin-header px-4 d-flex align-items-center justify-content-between shadow-sm bg-white">
    <div class="header-left d-flex align-items-center">
      <button class="btn btn-light btn-sm rounded-circle me-3" @click="$emit('toggleSidebar')">
        <i class="bi bi-list fs-5"></i>
      </button>
      <h5 class="mb-0 fw-bold text-dark">{{ pageTitle }}</h5>
    </div>

    <div class="header-right d-flex align-items-center gap-3">
      <div class="user-info text-end d-none d-md-block">
        <p class="mb-0 fw-bold small text-dark">Nguyễn Trung Nguyên</p>
        <span class="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Quản trị viên</span>
      </div>
      <div class="avatar shadow-sm">N</div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{pageTitle: string}>();
defineEmits(["toggleSidebar"]);
</script>

<style scoped>
.admin-header {
  height: 70px;
}
.avatar {
  width: 42px;
  height: 42px;
  background: #ffc107;
  color: #212529;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 800;
}
</style>
