<template>
  <div class="admin-layout d-flex flex-column">
    <AdminHeader :pageTitle="currentPageTitle" @logout="handleLogout" />

    <div class="main-wrapper flex-grow-1 d-flex flex-column bg-light">
      <main class="content-area p-4 overflow-auto h-100">
        <router-view v-slot="{Component}">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    <TheToast />
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";
import AdminHeader from "@/components/admin/AdminHeader.vue";
import TheToast from "@/components/shared/TheToast.vue";

const route = useRoute();
const router = useRouter();

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    "admin-dashboard": "Tổng quan Dashboard",
    "admin-categories": "Loại sản phẩm",
    "admin-tables": "Sơ đồ bàn & Trạng thái",
    "admin-orders": "Quản lý Đơn hàng",
    "admin-products": "Thực đơn đồ uống",
    "admin-vouchers": "Chương trình khuyến mãi",
    "admin-areas": "Quản lý khu vực",
    "admin-users": "Danh sách khách hàng",
    "admin-staffs": "Quản lý nhân viên",
    "admin-kitchen": "Màn hình bếp",
  };
  return titles[route.name as string] || "Dashboard";
});

const handleLogout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};
</script>

<style>
.admin-layout {
  height: 100vh;
  overflow: hidden;
  background-color: #f4f7fa;
}

.main-wrapper {
  background-color: #f4f7fa !important;
  height: calc(100vh - 70px);
  overflow-y: auto;
}

.content-area {
  flex: 1;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease-out;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Global scrollbar for the layout */
.main-wrapper::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.main-wrapper::-webkit-scrollbar-thumb,
.content-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
.main-wrapper::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: transparent;
}
</style>
