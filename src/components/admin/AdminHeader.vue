<template>
  <header class="modern-admin-header shadow-sm px-4">
    <div class="header-container h-100 d-flex align-items-center justify-content-between">
      
      <div class="header-left d-flex align-items-center">
        <router-link
          :to="userRole === 'Bếp' ? '/admin/kitchen' : '/admin/dashboard'"
          class="text-decoration-none"
        >
          <AppLogo size="22" />
        </router-link>
      </div>

      <nav v-if="userRole !== 'Bếp'" class="header-center d-none d-lg-flex align-items-center h-100">
        
        <router-link to="/admin/pos" class="nav-item d-flex align-items-center" :class="{active: isPosActive}">
          <i class="bi bi-shop me-2"></i> Bán hàng
        </router-link>
        
        <a href="/customer-display" target="_blank" class="nav-item d-flex align-items-center text-info">
          <i class="bi bi-display me-2"></i> Màn hình phụ
        </a>

        <div class="nav-divider mx-2"></div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             @mouseenter="openDropdown = 'menu'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isMenuActive}">
            <i class="bi bi-cup-hot me-2"></i> Thực đơn <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-lg" v-show="openDropdown === 'menu'">
              <router-link to="/admin/categories" class="dropdown-item"><i class="bi bi-tags me-2 text-warning"></i> Danh mục</router-link>
              <router-link to="/admin/products" class="dropdown-item"><i class="bi bi-box-seam me-2 text-warning"></i> Sản phẩm</router-link>
            </div>
          </transition>
        </div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             @mouseenter="openDropdown = 'account'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isAccountActive}">
            <i class="bi bi-people me-2"></i> Tài khoản <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-lg" v-show="openDropdown === 'account'">
              <router-link to="/admin/users" class="dropdown-item"><i class="bi bi-person-heart me-2 text-primary"></i> Khách hàng</router-link>
              <router-link v-if="userRole !== 'Nhân viên'" to="/admin/staffs" class="dropdown-item"><i class="bi bi-person-badge me-2 text-primary"></i> Nhân viên</router-link>
            </div>
          </transition>
        </div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             @mouseenter="openDropdown = 'system'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isSystemActive}">
            <i class="bi bi-gear me-2"></i> Hệ thống <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-lg" v-show="openDropdown === 'system'">
              <router-link to="/admin/areas" class="dropdown-item"><i class="bi bi-map me-2 text-secondary"></i> Quản lý Khu vực</router-link>
              <router-link to="/admin/tables" class="dropdown-item"><i class="bi bi-table me-2 text-secondary"></i> Quản lý Bàn</router-link>
              <router-link to="/admin/invoices" class="dropdown-item"><i class="bi bi-receipt me-2 text-success"></i> Đơn hàng</router-link>
              <router-link to="/admin/vouchers" class="dropdown-item"><i class="bi bi-ticket-perforated me-2 text-warning"></i> Voucher</router-link>
              <router-link to="/admin/kitchen" class="dropdown-item"><i class="bi bi-display me-2 text-danger"></i> Màn hình bếp</router-link>
            </div>
          </transition>
        </div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             v-if="userRole !== 'Nhân viên'" 
             @mouseenter="openDropdown = 'operation'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isDashboardActive}">
            <i class="bi bi-graph-up-arrow me-2"></i> Thống kê <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-lg" v-show="openDropdown === 'operation'">
              <router-link to="/admin/dashboard" class="dropdown-item"><i class="bi bi-speedometer2 me-2 text-info"></i> Tổng quan</router-link>
            </div>
          </transition>
        </div>

      </nav>

      <div class="header-right d-flex align-items-center position-relative">
        <div class="user-dropdown-wrapper" ref="userMenuRef">
          <button class="avatar-btn d-flex align-items-center justify-content-center" 
                  @click="toggleUserMenu" 
                  :class="{'active': isUserMenuOpen}">
            {{ userInitial }}
          </button>

          <transition name="dropdown-fade">
            <div class="user-dropdown-menu shadow-lg" v-show="isUserMenuOpen">
              <div class="user-info-box border-bottom border-secondary border-opacity-25 p-3">
                <div class="fw-bold text-white mb-1">{{ userName }}</div>
                <div class="badge bg-warning text-dark">{{ userRole }}</div>
              </div>
              <div class="p-2">
                <router-link to="/" class="dropdown-action-item rounded" @click="isUserMenuOpen = false">
                  <i class="bi bi-globe me-2 text-info"></i> Xem trang web
                </router-link>
                <button @click="handleLogout" class="dropdown-action-item rounded text-danger w-100 text-start mt-1 border-0 bg-transparent">
                  <i class="bi bi-box-arrow-left me-2"></i> Đăng xuất
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>

    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import AppLogo from "@/components/AppLogo.vue";

const props = defineProps<{ pageTitle: string }>();
const emit = defineEmits(["logout"]);

const route = useRoute();
const openDropdown = ref<string | null>(null);
const isUserMenuOpen = ref(false);

const userName = ref("Người dùng");
const userRole = ref("Nhân viên");
const userInitial = computed(() => {
  if (!userName.value) return "U";
  const parts = userName.value.trim().split(" ");
  const lastPart = parts[parts.length - 1];
  return lastPart ? lastPart.charAt(0).toUpperCase() : "U";
});

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value;
};

const closeUserMenuOnClickOutside = (e: Event) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.user-dropdown-wrapper')) {
    isUserMenuOpen.value = false;
  }
};

const handleLogout = () => {
  isUserMenuOpen.value = false;
  emit('logout');
};

onMounted(() => {
  document.addEventListener('click', closeUserMenuOnClickOutside);
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const base64Url = token.split(".")[1] as string;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
      const payload = JSON.parse(jsonPayload);

      let role = payload["role"] || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "Nhân viên";
      if (role === "Admin") userRole.value = "Quản trị viên";
      else if (role === "Staff") userRole.value = "Nhân viên";
      else if (role === "Kitchen") userRole.value = "Bếp";
      else userRole.value = role;

      userName.value = payload["unique_name"] || payload["name"] || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Người dùng";
    } catch (e) { console.error("Invalid token format", e); }
  }
});

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenuOnClickOutside);
});

// Logic trạng thái Active
const isPosActive = computed(() => route.name === "admin-pos");
const isDashboardActive = computed(() => ["admin-dashboard"].includes(route.name as string));
const isMenuActive = computed(() => ["admin-categories", "admin-products"].includes(route.name as string));
const isAccountActive = computed(() => ["admin-users", "admin-staffs"].includes(route.name as string));
const isSystemActive = computed(() => ["admin-areas", "admin-tables", "admin-invoices", "admin-vouchers", "admin-kitchen"].includes(route.name as string));
</script>

<style scoped>
/* KIẾN TRÚC HEADER 1 TẦNG */
.modern-admin-header {
  height: 64px;
  background-color: #1e1e2d; /* Màu nền Dark Theme chuẩn */
  border-bottom: 1px solid #2b2b40;
  position: relative;
  z-index: 1050;
}

.header-container {
  max-width: 100%;
}

/* KHU VỰC ĐIỀU HƯỚNG TRUNG TÂM */
.nav-divider {
  width: 1px;
  height: 24px;
  background-color: #2b2b40;
}

.nav-item {
  color: #a2a3b7;
  font-size: 14.5px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s ease;
  height: 40px; /* Cố định chiều cao nút để ko bị rung */
  margin: 0 4px;
}

.nav-item:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
}

.icon-sm {
  font-size: 11px;
  opacity: 0.7;
}

.cursor-pointer {
  cursor: pointer;
}

/* MENU XỔ XUỐNG DÀNH CHO NAV (SẠCH, GỌN) */
.custom-dropdown {
  position: absolute;
  top: calc(100% + 5px); /* Cách thanh nav 5px */
  left: 50%;
  transform: translateX(-50%); /* Căn giữa hoàn hảo so với nút bấm */
  min-width: 200px;
  background-color: #1e1e2d;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  padding: 8px 0;
  z-index: 1060;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #a2a3b7;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  background: transparent;
}

.dropdown-item:hover, .dropdown-item.router-link-active {
  background-color: rgba(255, 193, 7, 0.08);
  color: #ffc107;
}

/* AVATAR & USER MENU BÊN PHẢI */
.avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffc107, #d4a000);
  color: #121212;
  font-weight: 800;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.avatar-btn:hover, .avatar-btn.active {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 193, 7, 0.4);
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 250px;
  background-color: #1e1e2d;
  border: 1px solid #2b2b40;
  border-radius: 10px;
  z-index: 1060;
}

.dropdown-action-item {
  display: block;
  padding: 10px 15px;
  color: #a2a3b7;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-action-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
}

/* HIỆU ỨNG ANIMATION XỔ MENU */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>