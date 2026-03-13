<template>
  <aside class="admin-sidebar shadow" :class="{collapsed: isCollapsed}">
    <div class="sidebar-brand py-4 px-4 text-center">
      <AppLogo size="26" v-if="!isCollapsed" />
      <span v-else class="text-warning fw-bold fs-4">CH</span>
    </div>

    <div class="sidebar-menu flex-grow-1 overflow-hidden">
      <div class="menu-label px-4 mt-3" v-if="!isCollapsed">Vận hành</div>
      <router-link to="/admin/tables" class="menu-item" title="Sơ đồ bàn">
        <i class="bi bi-grid-3x3-gap"></i>
        <span v-if="!isCollapsed">Sơ đồ bàn</span>
      </router-link>
      <router-link to="/admin/orders" class="menu-item" title="Đơn hàng">
        <i class="bi bi-receipt"></i>
        <span v-if="!isCollapsed">Đơn hàng</span>
      </router-link>

      <div class="menu-label px-4 mt-4" v-if="!isCollapsed">Quản lý hệ thống</div>
      <router-link to="/admin/products" class="menu-item" title="Sản phẩm">
        <i class="bi bi-cup-hot"></i>
        <span v-if="!isCollapsed">Sản phẩm</span>
      </router-link>
      <router-link to="/admin/categories" class="menu-item" title="Danh mục">
        <i class="bi bi-tags"></i>
        <span v-if="!isCollapsed">Danh mục</span>
      </router-link>
      <router-link to="/admin/vouchers" class="menu-item" title="Khuyến mãi">
        <i class="bi bi-ticket-perforated"></i>
        <span v-if="!isCollapsed">Khuyến mãi</span>
      </router-link>
    </div>

    <div class="sidebar-footer p-3 border-top border-secondary border-opacity-25">
      <router-link to="/" class="btn btn-outline-info w-100 mb-2 btn-sm d-flex align-items-center justify-content-center gap-2">
        <i class="bi bi-globe"></i>
        <span v-if="!isCollapsed">Xem trang web</span>
      </router-link>

      <button @click="$emit('logout')" class="btn btn-danger w-100 btn-sm d-flex align-items-center justify-content-center gap-2">
        <i class="bi bi-box-arrow-left"></i>
        <span v-if="!isCollapsed">Đăng xuất</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import AppLogo from "@/components/AppLogo.vue";
defineProps<{isCollapsed: boolean}>();
defineEmits(["logout"]);
</script>

<style scoped>
.admin-sidebar {
  width: 260px; /* Chiều rộng lúc mở */
  background: #1e1e2d;
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #a2a3b7;
  transition: all 0.3s ease; /* Hiệu ứng mượt mà */
}

/* LÚC THU NHỎ */
.admin-sidebar.collapsed {
  width: 80px; /* Chiều rộng lúc thu nhỏ */
}

.admin-sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 12px 0;
}

.menu-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #494b74;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #a2a3b7;
  text-decoration: none;
  transition: all 0.3s;
  gap: 12px;
  white-space: nowrap; /* Không cho chữ xuống dòng khi đang thu nhỏ */
}
.menu-item i {
  font-size: 1.2rem;
}
.menu-item:hover,
.menu-item.router-link-active {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}
.menu-item.router-link-active {
  border-right: 3px solid #ffc107;
}
</style>
