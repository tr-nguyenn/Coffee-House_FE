<template>
  <header class="modern-admin-header px-4">
    <div class="header-container h-100 d-flex align-items-center justify-content-between">
      
      <div class="header-left d-flex align-items-center">
        <router-link
          :to="userRole === 'Bếp' ? '/admin/kitchen' : '/admin/dashboard'"
          class="text-decoration-none logo-wrapper"
        >
          <AppLogo size="24" />
        </router-link>
      </div>

      <nav v-if="userRole !== 'Bếp'" class="header-center d-none d-lg-flex align-items-center h-100">
        
        <router-link to="/admin/pos" class="nav-item d-flex align-items-center" :class="{active: isPosActive}">
          <i class="bi bi-shop me-2 fs-5"></i> Bán hàng
        </router-link>
        
        <a href="/customer-display" target="_blank" class="nav-item d-flex align-items-center text-info">
          <i class="bi bi-display me-2 fs-5"></i> Màn hình phụ
        </a>

        <div class="nav-divider mx-3"></div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             @mouseenter="openDropdown = 'menu'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isMenuActive}">
            <i class="bi bi-cup-hot me-2 fs-5"></i> Thực đơn <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-xl" v-show="openDropdown === 'menu'">
              <router-link to="/admin/categories" class="dropdown-item"><i class="bi bi-tags me-3 text-warning"></i> Danh mục</router-link>
              <router-link to="/admin/products" class="dropdown-item"><i class="bi bi-box-seam me-3 text-warning"></i> Sản phẩm</router-link>
            </div>
          </transition>
        </div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             @mouseenter="openDropdown = 'account'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isAccountActive}">
            <i class="bi bi-people me-2 fs-5"></i> Tài khoản <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-xl" v-show="openDropdown === 'account'">
              <router-link to="/admin/users" class="dropdown-item"><i class="bi bi-person-heart me-3 text-primary"></i> Khách hàng</router-link>
              <router-link v-if="userRole !== 'Nhân viên'" to="/admin/staffs" class="dropdown-item"><i class="bi bi-person-badge me-3 text-primary"></i> Nhân viên</router-link>
            </div>
          </transition>
        </div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             @mouseenter="openDropdown = 'system'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isSystemActive}">
            <i class="bi bi-gear me-2 fs-5"></i> Hệ thống <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-xl" v-show="openDropdown === 'system'">
              <router-link to="/admin/areas" class="dropdown-item"><i class="bi bi-map me-3 text-secondary"></i> Quản lý Khu vực</router-link>
              <router-link to="/admin/tables" class="dropdown-item"><i class="bi bi-table me-3 text-secondary"></i> Quản lý Bàn</router-link>
              <router-link to="/admin/invoices" class="dropdown-item"><i class="bi bi-receipt me-3 text-success"></i> Đơn hàng</router-link>
              <router-link to="/admin/vouchers" class="dropdown-item"><i class="bi bi-ticket-perforated me-3 text-warning"></i> Voucher</router-link>
              <router-link to="/admin/kitchen" class="dropdown-item"><i class="bi bi-display me-3 text-danger"></i> Màn hình bếp</router-link>
            </div>
          </transition>
        </div>

        <div class="nav-item-group h-100 position-relative d-flex align-items-center" 
             v-if="userRole !== 'Nhân viên'" 
             @mouseenter="openDropdown = 'operation'" 
             @mouseleave="openDropdown = null">
          <div class="nav-item d-flex align-items-center cursor-pointer" :class="{active: isDashboardActive}">
            <i class="bi bi-graph-up-arrow me-2 fs-5"></i> Thống kê <i class="bi bi-chevron-down ms-1 icon-sm"></i>
          </div>
          <transition name="dropdown-fade">
            <div class="custom-dropdown shadow-xl" v-show="openDropdown === 'operation'">
              <router-link to="/admin/dashboard" class="dropdown-item"><i class="bi bi-speedometer2 me-3 text-info"></i> Tổng quan</router-link>
            </div>
          </transition>
        </div>

      </nav>

      <div class="header-right d-flex align-items-center position-relative">
        <div class="user-dropdown-wrapper" ref="userMenuRef">
          
          <button class="avatar-btn d-flex align-items-center justify-content-center" 
                  @click="toggleUserMenu" 
                  :class="{'active': isUserMenuOpen}">
            <i class="bi bi-person-fill fs-5"></i>
          </button>

          <transition name="dropdown-fade">
            <div class="user-dropdown-menu shadow-xl" v-show="isUserMenuOpen">
              <div class="user-info-box p-3 d-flex align-items-center gap-3">
                
                <div class="user-menu-avatar shadow-sm d-flex align-items-center justify-content-center">
                  <span>{{ userInitial }}</span>
                </div>
                
                <div class="user-profile-info-text overflow-hidden">
                  <div class="fw-bold text-white text-truncate" style="font-size: 1.05rem;">{{ userName }}</div>
                  <div class="badge bg-warning text-dark mt-1 px-2 py-1">{{ userRole }}</div>
                </div>
                
              </div>
              
              <div class="p-2 user-actions-container">
                <router-link to="/" class="dropdown-action-item rounded mb-1" @click="isUserMenuOpen = false">
                  <i class="bi bi-globe me-3 text-info"></i> Xem trang web
                </router-link>
                <button @click="handleLogout" class="dropdown-action-item rounded text-danger w-100 text-start border-0 bg-transparent">
                  <i class="bi bi-box-arrow-left me-3"></i> Đăng xuất
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

const isPosActive = computed(() => route.name === "admin-pos");
const isDashboardActive = computed(() => ["admin-dashboard"].includes(route.name as string));
const isMenuActive = computed(() => ["admin-categories", "admin-products"].includes(route.name as string));
const isAccountActive = computed(() => ["admin-users", "admin-staffs"].includes(route.name as string));
const isSystemActive = computed(() => ["admin-areas", "admin-tables", "admin-invoices", "admin-vouchers", "admin-kitchen"].includes(route.name as string));
</script>

<style scoped>
.modern-admin-header {
  height: 68px;
  background-color: #151521;
  border-bottom: 1px solid #2b2b40;
  position: relative;
  z-index: 1050;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.header-container {
  max-width: 100%;
}

.logo-wrapper {
  transition: transform 0.2s ease;
  display: inline-block;
}
.logo-wrapper:hover {
  transform: scale(1.02);
}

.nav-divider {
  width: 1px;
  height: 24px;
  background-color: #2b2b40;
  border-radius: 1px;
}

.nav-item {
  color: #a2a3b7;
  font-size: 0.95rem;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 18px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  height: 42px;
  margin: 0 4px;
  user-select: none;
}

.nav-item:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 193, 7, 0.2);
}

.icon-sm {
  font-size: 10px;
  opacity: 0.6;
  margin-top: 2px;
  transition: transform 0.2s ease;
}

.nav-item-group:hover .icon-sm {
  transform: rotate(180deg);
}

.cursor-pointer {
  cursor: pointer;
}

.custom-dropdown {
  position: absolute;
  top: calc(100% + 8px); 
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  background-color: #1e1e2d;
  border: 1px solid #2b2b40;
  border-radius: 12px;
  padding: 8px;
  z-index: 1060;
}

.custom-dropdown::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background-color: #1e1e2d;
  border-left: 1px solid #2b2b40;
  border-top: 1px solid #2b2b40;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #a2a3b7;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  background: transparent;
}

.dropdown-item:hover, .dropdown-item.router-link-active {
  background-color: rgba(255, 193, 7, 0.08);
  color: #ffc107;
  transform: translateX(4px);
}

.avatar-btn {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffc107, #d4a000);
  color: #151521;
  font-weight: 800;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
}

.avatar-btn:hover, .avatar-btn.active {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 15px rgba(255, 193, 7, 0.5);
}

.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  width: 280px;
  background-color: #1e1e2d;
  border: 1px solid #2b2b40;
  border-radius: 14px;
  z-index: 1060;
  overflow: hidden;
}

/* Box thông tin tài khoản */
.user-info-box {
  background-color: rgba(0,0,0,0.15);
  border-bottom: 1px solid #2b2b40;
}

.user-menu-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffc107, #e0a800);
  color: #151521;
  font-size: 1.3rem;
  font-weight: 900;
  flex-shrink: 0;
}

.user-actions-container {
  background-color: #1e1e2d;
}

.dropdown-action-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #a2a3b7;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.dropdown-action-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.dropdown-action-item.text-danger:hover {
  background-color: rgba(220, 53, 69, 0.1);
  color: #ff6b6b !important;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
.shadow-xl {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
}
</style>