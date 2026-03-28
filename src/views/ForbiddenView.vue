<template>
  <div class="vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="text-center p-5 bg-white shadow-sm rounded-4 border border-1 border-light">
      <div class="mb-4">
        <i class="bi bi-shield-lock-fill text-danger" style="font-size: 5rem;"></i>
      </div>
      <h1 class="display-5 fw-bold text-dark mb-2">403 - Lỗi Truy Cập</h1>
      <h2 class="h5 text-secondary mb-4">Bạn không có quyền xem trang này!</h2>
      <p class="text-muted mb-4 px-md-4">
        Tài khoản của bạn hiện tại không được cấp phép để thực hiện thao tác này hoặc truy cập vào khu vực này.<br>
        Vui lòng liên hệ với quản trị viên hệ thống nếu bạn tin rằng đây là sự nhầm lẫn.
      </p>
      <div class="d-flex justify-content-center gap-3 mt-4">
        <button @click="goBack" class="btn btn-outline-secondary px-4 rounded-pill fw-medium">
          <i class="bi bi-arrow-left me-2"></i>Quay lại
        </button>
        <router-link to="/" class="btn btn-warning px-4 rounded-pill fw-bold text-dark">
          <i class="bi bi-house-door-fill me-2"></i>Về trang chủ
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  if (window.history.length > 2) {
    router.back();
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
.btn {
  transition: all 0.2s ease;
}
.btn:hover {
  transform: translateY(-2px);
}
</style>
