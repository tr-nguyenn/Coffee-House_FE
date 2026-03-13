<template>
  <div class="admin-layout d-flex">
    <AdminSidebar :is-collapsed="isSidebarCollapsed" @logout="handleLogout" />

    <div class="main-wrapper flex-grow-1 d-flex flex-column bg-light">
      <AdminHeader :pageTitle="currentPageTitle" @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />

      <main class="content-area p-4 overflow-auto">
        <router-view v-slot="{Component}">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import AdminSidebar from "@/components/admin/AdminSidebar.vue";
import AdminHeader from "@/components/admin/AdminHeader.vue";

const route = useRoute();
const router = useRouter();
const isSidebarCollapsed = ref(false);

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    "admin-tables": "Sơ đồ bàn & Trạng thái",
    "admin-orders": "Quản lý Đơn hàng",
    "admin-products": "Thực đơn đồ uống",
    "admin-vouchers": "Chương trình khuyến mãi",
    "admin-users": "Danh sách khách hàng",
  };
  return titles[route.name as string] || "Dashboard";
});

const handleLogout = () => {
  // Logic xóa token ở đây
  router.push("/login");
};
</script>

<style>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}
.main-wrapper {
  height: 100vh;
  overflow-y: auto;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
