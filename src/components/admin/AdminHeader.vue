<template>
  <header class="admin-header px-4 px-md-3 d-flex align-items-center justify-content-between shadow-sm">
    <div class="header-left d-flex align-items-center gap-4 h-100">
      <router-link
        :to="userRole === 'Bếp' ? '/admin/kitchen' : '/admin/dashboard'"
        class="sidebar-brand text-decoration-none d-flex align-items-center mb-0 pb-0"
      >
        <AppLogo size="25" />
      </router-link>

      <nav
        v-if="userRole !== 'Bếp'"
        class="top-nav d-none d-lg-flex align-items-center h-100 gap-1 ms-2 small"
      >
        <div
          class="nav-item position-relative h-100 d-flex align-items-center"
          :class="{active: isOperationActive}"
        >
          <router-link
            to="/admin/pos"
            class="nav-link cursor-pointer d-flex align-items-center gap-2 text-warning fw-bold pe-2 border-end"
          >
            <i class="bi bi-shop fs-5"></i>
            <span class="nav-text letter-spacing-1">Bán hàng</span>
          </router-link>
          
          <a
            href="/customer-display"
            target="_blank"
            class="nav-link cursor-pointer d-flex align-items-center gap-2 text-primary ms-2"
            title="Mở màn hình quét mã khách hàng trên Tab mới"
          >
            <i class="bi bi-display"></i>
            <span class="nav-text" style="font-size: 0.85rem">Màn hình phụ</span>
          </a>
        </div>

        <div
          class="nav-item position-relative h-100 d-flex align-items-center"
          @mouseenter="openDropdown = 'menu'"
          @mouseleave="openDropdown = null"
        >
          <div
            class="nav-link cursor-pointer d-flex align-items-center gap-2"
            :class="{active: isMenuActive}"
          >
            <i class="bi bi-cup-hot fs-6"></i>
            <span class="fw-bold nav-text">Thực đơn</span>
            <i class="bi bi-chevron-down small text-secondary"></i>
          </div>

          <transition name="dropdown-fade">
            <div class="dropdown-menu shadow-lg" v-show="openDropdown === 'menu'">
              <router-link to="/admin/categories" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-tags text-warning"></i> Danh mục
              </router-link>
              <router-link to="/admin/products" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-box-seam text-warning"></i> Sản phẩm
              </router-link>
            </div>
          </transition>
        </div>

        <div
          class="nav-item position-relative h-100 d-flex align-items-center"
          @mouseenter="openDropdown = 'account'"
          @mouseleave="openDropdown = null"
        >
          <div
            class="nav-link cursor-pointer d-flex align-items-center gap-2"
            :class="{active: isAccountActive}"
          >
            <i class="bi bi-people fs-6"></i>
            <span class="fw-bold nav-text">Tài khoản</span>
            <i class="bi bi-chevron-down small text-secondary"></i>
          </div>

          <transition name="dropdown-fade">
            <div class="dropdown-menu shadow-lg" v-show="openDropdown === 'account'">
              <router-link to="/admin/users" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-person-heart text-primary"></i> Khách hàng
              </router-link>
              <router-link
                v-if="userRole !== 'Nhân viên'"
                to="/admin/staffs"
                class="dropdown-item"
                @click="openDropdown = null"
              >
                <i class="bi bi-person-badge text-primary"></i> Nhân viên
              </router-link>
            </div>
          </transition>
        </div>

        <div
          class="nav-item position-relative h-100 d-flex align-items-center"
          @mouseenter="openDropdown = 'system'"
          @mouseleave="openDropdown = null"
        >
          <div
            class="nav-link cursor-pointer d-flex align-items-center gap-2"
            :class="{active: isSystemActive}"
          >
            <i class="bi bi-gear fs-6"></i>
            <span class="fw-bold nav-text">Hệ thống</span>
            <i class="bi bi-chevron-down small text-secondary"></i>
          </div>

          <transition name="dropdown-fade">
            <div class="dropdown-menu shadow-lg" v-show="openDropdown === 'system'">
              <router-link to="/admin/areas" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-map text-secondary"></i> Quản lý Khu vực
              </router-link>
              <router-link to="/admin/tables" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-table text-secondary"></i> Quản lý Bàn
              </router-link>
              <router-link to="/admin/invoices" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-receipt text-success"></i> Đơn hàng
              </router-link>
              <router-link to="/admin/vouchers" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-ticket-perforated text-warning"></i> Voucher
              </router-link>
              <router-link to="/admin/kitchen" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-display text-danger"></i> Màn hình bếp
              </router-link>
            </div>
          </transition>
        </div>

        <div
          class="nav-item position-relative h-100 d-flex align-items-center"
          v-if="userRole !== 'Nhân viên'"
          @mouseenter="openDropdown = 'operation'"
          @mouseleave="openDropdown = null"
        >
          <div
            class="nav-link cursor-pointer d-flex align-items-center gap-2"
            :class="{active: isDashboardActive}"
          >
            <i class="bi-graph-up-arrow fs-6"></i>
            <span class="fw-bold nav-text">Thống kê</span>
            <i class="bi bi-chevron-down small text-secondary"></i>
          </div>

          <transition name="dropdown-fade">
            <div class="dropdown-menu shadow-lg" v-show="openDropdown === 'operation'">
              <router-link to="/admin/dashboard" class="dropdown-item" @click="openDropdown = null">
                <i class="bi bi-speedometer2 text-info"></i> Tổng quan
              </router-link>
            </div>
          </transition>
        </div>
      </nav>
    </div>

    <button
      v-if="userRole !== 'Bếp'"
      class="btn btn-icon d-lg-none rounded-circle d-flex align-items-center justify-content-center"
      @click="showMobileMenu = !showMobileMenu"
    >
      <i class="bi bi-list fs-4"></i>
    </button>

    <div class="header-right d-flex align-items-center gap-3 h-100">
      <div
        class="user-menu position-relative h-100 d-flex align-items-center"
        @mouseenter="openDropdown = 'user'"
        @mouseleave="openDropdown = null"
      >
        <div class="d-flex align-items-center gap-3 cursor-pointer">
          <div class="user-info text-end d-none d-md-block">
            <p class="mb-0 fw-bold user-name">{{ userName }}</p>
            <span class="badge user-role">{{ userRole }}</span>
          </div>
          <div class="avatar shadow-sm position-relative">
            <span>{{ userInitial }}</span>
            <div
              class="active-dot position-absolute top-0 start-100 translate-middle p-1 bg-success border border-2 border-dark rounded-circle"
            ></div>
          </div>
        </div>

        <transition name="dropdown-fade">
          <div
            class="dropdown-menu dropdown-menu-end shadow-lg"
            v-show="openDropdown === 'user'"
            style="right: 0; left: auto; top: 100%"
          >
            <router-link to="/" class="dropdown-item">
              <i class="bi bi-globe text-info"></i> Xem trang web
            </router-link>
            <div class="dropdown-divider my-1 border-secondary border-opacity-25"></div>
            <button
              @click="$emit('logout')"
              class="dropdown-item text-danger border-0 bg-transparent w-100 text-start"
            >
              <i class="bi bi-box-arrow-left"></i> Đăng xuất
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>

  <transition name="dropdown-fade">
    <div
      class="mobile-menu bg-dark px-3 py-3 d-lg-none shadow-lg"
      v-if="showMobileMenu && userRole !== 'Bếp'"
    >
      <router-link
        to="/admin/pos"
        class="mobile-item bg-warning text-dark fw-bold"
        @click="showMobileMenu = false"
      >
        <i class="bi bi-shop"></i> Bán hàng (POS)
      </router-link>

      <div class="text-secondary small fw-bold text-uppercase mb-2 mt-3">⚡ Vận hành</div>
      <router-link
        v-if="userRole !== 'Nhân viên'"
        to="/admin/dashboard"
        class="mobile-item"
        @click="showMobileMenu = false"
        ><i class="bi bi-speedometer2"></i> Tổng quan</router-link
      >
      <router-link to="/admin/orders" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-receipt"></i> Đơn hàng</router-link
      >
      <router-link to="/admin/kitchen" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-display"></i> Màn hình bếp</router-link
      >

      <div class="text-secondary small fw-bold text-uppercase mb-2 mt-3">☕ Thực đơn</div>
      <router-link to="/admin/categories" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-tags"></i> Danh mục</router-link
      >
      <router-link to="/admin/products" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-box-seam"></i> Sản phẩm</router-link
      >

      <div class="text-secondary small fw-bold text-uppercase mb-2 mt-3">👥 Tài khoản</div>
      <router-link to="/admin/users" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-person-heart"></i> Khách hàng</router-link
      >
      <router-link
        v-if="userRole !== 'Nhân viên'"
        to="/admin/staffs"
        class="mobile-item"
        @click="showMobileMenu = false"
        ><i class="bi bi-person-badge"></i> Nhân viên</router-link
      >

      <div class="text-secondary small fw-bold text-uppercase mb-2 mt-3">⚙️ Hệ thống</div>
      <router-link to="/admin/areas" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-map"></i> Khu vực</router-link
      >
      <router-link to="/admin/tables" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-table"></i> Bàn & Sơ đồ</router-link
      >
      <router-link to="/admin/vouchers" class="mobile-item" @click="showMobileMenu = false"
        ><i class="bi bi-ticket-perforated"></i> Voucher</router-link
      >
    </div>
  </transition>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import {useRoute} from "vue-router";
import AppLogo from "@/components/AppLogo.vue";

defineProps<{pageTitle: string}>();
defineEmits(["logout"]);

const route = useRoute();
const openDropdown = ref<string | null>(null);
const showMobileMenu = ref(false);

const userName = ref("Người dùng");
const userRole = ref("Nhân viên");
const userInitial = computed(() => {
  if (!userName.value) return "U";
  const parts = userName.value.trim().split(" ");
  const lastPart = parts[parts.length - 1];
  return lastPart ? lastPart.charAt(0).toUpperCase() : "U";
});

onMounted(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const base64Url = token.split(".")[1] as string;
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      const payload = JSON.parse(jsonPayload);

      let role =
        payload["role"] ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        "Nhân viên";

      if (role === "Admin") userRole.value = "Quản trị viên";
      else if (role === "Staff") userRole.value = "Nhân viên";
      else if (role === "Kitchen") userRole.value = "Bếp";
      else userRole.value = role;

      userName.value =
        payload["unique_name"] ||
        payload["name"] ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        "Người dùng";
    } catch (e) {
      console.error("Invalid token format", e);
    }
  }
});

// Cập nhật lại logic active cho từng nhóm
const isOperationActive = computed(() => {
  return ["admin-dashboard"].includes(route.name as string);
});

const isPosActive = computed(() => {
  return route.name === "admin-pos";
});

const isDashboardActive = computed(() => {
  return ["admin-dashboard"].includes(route.name as string);
});

const isMenuActive = computed(() => {
  return ["admin-categories", "admin-products"].includes(route.name as string);
});

const isAccountActive = computed(() => {
  return ["admin-users", "admin-staffs"].includes(route.name as string);
});

const isSystemActive = computed(() => {
  return ["admin-areas", "admin-tables", "admin-vouchers"].includes(route.name as string);
});
</script>

<style scoped>
.admin-header {
  height: 70px;
  min-height: 70px;
  background-color: #1e1e2d;
  border-bottom: 1px solid #2b2b40;
  position: relative;
  z-index: 1050;
}

.sidebar-brand {
  padding-right: 20px;
  border-right: 1px solid #2b2b40;
}

.btn-icon {
  width: 40px;
  height: 40px;
  color: #a1a5b7;
  background-color: transparent;
  border: none;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
}

.nav-item {
  height: 100%;
}

.nav-link {
  color: #a2a3b7;
  padding: 0 16px;
  height: 100%;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
  font-size: 14px;
}

.nav-link:hover {
  color: #ffc107;
  background-color: rgba(255, 193, 7, 0.05);
}

.nav-link.active {
  color: #ffc107;
  border-bottom: 3px solid #ffc107;
  background-color: rgba(255, 193, 7, 0.1);
}

/* Style riêng cho nút POS để nó xịn xò hơn */
.pos-btn {
  background: rgba(255, 193, 7, 0.1);
  border-radius: 6px;
  height: 70% !important; /* Lùn hơn xíu cho giống button */
  margin-top: 10px;
  padding: 0 20px !important;
  border: 1px solid rgba(255, 193, 7, 0.3) !important;
}

.pos-btn:hover {
  background: #ffc107 !important;
  color: #121212 !important;
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
}

.uppercase {
  text-transform: uppercase;
}
.letter-spacing-1 {
  letter-spacing: 0.5px;
}

.dropdown-menu {
  display: block;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background-color: #1e1e2d;
  border: 1px solid #2b2b40;
  border-radius: 8px;
  padding: 8px 0;
  margin-top: -1px;
  z-index: 1060;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: #a2a3b7;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;
  text-decoration: none;
}

.dropdown-item i {
  font-size: 1.1rem;
}

.dropdown-item:hover,
.dropdown-item.router-link-active {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.mobile-menu {
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  z-index: 1040;
  border-bottom: 1px solid #2b2b40;
}

.mobile-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  color: #a2a3b7;
  text-decoration: none;
  border-radius: 6px;
  margin-bottom: 5px;
}
.mobile-item:hover,
.mobile-item.router-link-active {
  background-color: rgba(255, 193, 7, 0.1);
  color: #ffc107;
}

.user-menu {
  height: 100%;
}

.header-title {
  color: #fff;
  letter-spacing: 0.5px;
}

.user-name {
  color: #e4e6ef;
  font-size: 0.95rem;
}

.user-role {
  background-color: rgba(255, 193, 7, 0.1) !important;
  color: #ffc107 !important;
  border: 1px solid rgba(255, 193, 7, 0.2);
  font-weight: 500;
  padding: 0.35em 0.65em;
  border-radius: 6px;
}

.avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #ffc107, #e5ac00);
  color: #121212;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 800;
  font-size: 1.1rem;
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.05);
}

.cursor-pointer {
  cursor: pointer;
}

/* Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
