<script setup lang="ts">
import {ref} from "vue";
import AppLogo from "./AppLogo.vue";

const isMenuOpen = ref(false);
const searchQuery = ref("");

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleSearch = () => {
  console.log("Tìm kiếm món:", searchQuery.value);
  // Sau này sẽ điều hướng sang trang Menu và filter theo tên
};
</script>

<template>
  <nav class="navbar navbar-expand-xl navbar-dark bg-dark sticky-top shadow-sm py-4">
    <div class="container-fluid px-lg-5">
      <router-link class="navbar-brand me-4" to="/" @click="closeMenu">
        <AppLogo size="32" />
      </router-link>

      <button class="navbar-toggler" type="button" @click="toggleMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{show: isMenuOpen}">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/" @click="closeMenu">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/menu" @click="closeMenu">Thực đơn</router-link>
          </li>
        </ul>

        <form class="d-flex my-3 my-xl-0 flex-grow-1 justify-content-start justify-content-xl-center" @submit.prevent="handleSearch">
          <div class="input-group search-box w-100 w-xl-75">
            <input v-model="searchQuery" type="text" class="form-control bg-secondary text-white border-0" placeholder="Tìm món bạn thích..." />
            <button class="btn btn-warning" type="submit"><i class="bi bi-search"></i></button>
          </div>
        </form>

        <div class="d-flex align-items-center gap-2 ms-xl-auto">
          <router-link to="/register" class="btn btn-link text-light text-decoration-none px-3" @click="closeMenu"> Đăng ký </router-link>
          <router-link to="/login" class="btn btn-warning px-3 rounded-pill fw-bold" @click="closeMenu"> Đăng nhập </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.search-box {
  max-width: 500px;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.nav-link {
  font-weight: 500;
  transition: 0.3s;
}

.nav-link.router-link-active {
  color: #ffc107 !important;
}

/* Hiệu ứng cho nút Đăng nhập */
.btn-warning {
  transition: transform 0.2s;
}
.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
}
</style>
