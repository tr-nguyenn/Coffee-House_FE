<template >
  <nav class=" navbar navbar-expand-xl navbar-dark bg-dark sticky-top shadow-sm py-3">
    <div class="container">
      <router-link class="navbar-brand me-4" to="/" @click="closeMenu">
        <AppLogo size="30" />
      </router-link>

      <button class="navbar-toggler" type="button" @click="toggleMenu">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{show: isMenuOpen}">
        <ul v-if="userRole !== 'Kitchen'" class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/" @click="closeMenu">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/menu" @click="closeMenu">Thực đơn</router-link>
          </li>
        </ul>

        <form
          v-if="userRole !== 'Kitchen'"
          class="d-flex my-3 my-xl-0 flex-grow-1 justify-content-start justify-content-xl-center"
          @submit.prevent="handleSearch"
        >
          <div class="input-group search-box w-100 w-xl-75">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control bg-secondary text-white border-0"
              placeholder="Tìm món bạn thích..."
            />
            <button class="btn btn-warning" type="submit">
              <i class="bi bi-search"></i>
            </button>
          </div>
        </form>

        <div class="d-flex align-items-center gap-2 ms-xl-auto">
          <template v-if="!isLoggedIn">
            <router-link
              to="/register"
              class="btn btn-link text-light text-decoration-none px-3"
              @click="closeMenu"
            >
              Đăng ký
            </router-link>
            <router-link to="/login" class="btn btn-warning px-3 rounded-pill fw-bold" @click="closeMenu">
              Đăng nhập
            </router-link>
          </template>

          <template v-else>
            <div class="user-dropdown">
              <button class="avatar-btn d-flex align-items-center gap-2" @click="toggleDropdown">
                <div class="avatar-circle">
                  <span>{{ avatarLetter }}</span>
                </div>
                <i class="bi bi-chevron-down chevron-icon" :class="{rotated: isDropdownOpen}"></i>
              </button>

              <div v-if="isDropdownOpen" class="dropdown-backdrop" @click="closeDropdown"></div>

              <Transition name="dropdown">
                <div v-if="isDropdownOpen" class="dropdown-menu-custom shadow">
                  <div class="px-4 py-3 border-bottom border-secondary">
                    <div class="d-flex align-items-center gap-3">
                      <div class="avatar-circle avatar-lg">
                        <span>{{ avatarLetter }}</span>
                      </div>
                      <div class="overflow-hidden">
                        <div class="text-white fw-bold small text-truncate">
                          {{ userDisplay }}
                        </div>
                        <div class="text-warning" style="font-size: 0.7rem">{{ roleDisplay }}</div>
                      </div>
                    </div>
                  </div>

                  <ul class="list-unstyled mb-0 py-2">
                    <template v-if="['Admin', 'Staff'].includes(userRole)">
                      <li>
                        <router-link
                          :to="adminRoute"
                          class="dropdown-item-custom text-info fw-bold"
                          @click="closeDropdown"
                        >
                          <i class="bi bi-speedometer2 me-2"></i>
                          Trang quản trị
                        </router-link>
                      </li>
                      <li><hr class="dropdown-divider border-secondary mx-3 my-1" /></li>
                    </template>
                    <template v-else-if="userRole === 'Kitchen'">
                      <li>
                        <router-link
                          to="/admin/kitchen"
                          class="dropdown-item-custom text-info fw-bold"
                          @click="closeDropdown"
                        >
                          <i class="bi bi-display me-2"></i>
                          Màn hình bếp
                        </router-link>
                      </li>
                      <li><hr class="dropdown-divider border-secondary mx-3 my-1" /></li>
                    </template>

                    <template v-if="userRole !== 'Kitchen'">
                      <li>
                        <router-link to="/profile" class="dropdown-item-custom" @click="closeDropdown">
                          <i class="bi bi-person-fill me-2 text-warning"></i>
                          Trang cá nhân
                        </router-link>
                      </li>
                      <li>
                        <router-link to="/orders" class="dropdown-item-custom" @click="closeDropdown">
                          <i class="bi bi-bag-heart-fill me-2 text-warning"></i>
                          Đơn hàng của tôi
                        </router-link>
                      </li>
                      <li>
                        <router-link to="/favorites" class="dropdown-item-custom" @click="closeDropdown">
                          <i class="bi bi-heart-fill me-2 text-warning"></i>
                          Yêu thích
                        </router-link>
                      </li>
                    </template>
                    <li><hr class="dropdown-divider border-secondary mx-3 my-1" /></li>
                    <li>
                      <button class="dropdown-item-custom logout-btn w-100 text-start" @click="handleLogout">
                        <i class="bi bi-box-arrow-right me-2"></i>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import {useRouter} from "vue-router";
import AppLogo from "./AppLogo.vue";

const router = useRouter();
const isMenuOpen = ref(false);
const searchQuery = ref("");
const isDropdownOpen = ref(false);

const token = ref<string | null>(null);

const isLoggedIn = computed(() => !!token.value);

// Bóc tách Payload 1 lần
const decodedPayload = computed(() => {
  if (!token.value) return null;
  try {
    const base64Url = token.value.split(".")[1] ?? "";
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
});

const userDisplay = computed(() => {
  if (!decodedPayload.value) return "Tài khoản";
  return (
    decodedPayload.value["email"] ||
    decodedPayload.value["unique_name"] ||
    decodedPayload.value["name"] ||
    "Tài khoản"
  );
});

// Lấy Role từ Token
const userRole = computed(() => {
  if (!decodedPayload.value) return "Customer";
  return (
    decodedPayload.value["role"] ||
    decodedPayload.value["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    "Customer"
  );
});

// Hiển thị chức danh tiếng Việt trên Header Dropdown
const roleDisplay = computed(() => {
  switch (userRole.value) {
    case "Admin":
      return "Quản trị viên";
    case "Staff":
      return "Thu ngân";
    case "Kitchen":
      return "Bếp / Pha chế";
    default:
      return "Thành viên";
  }
});

// Chữ cái đầu làm avatar
const avatarLetter = computed(() => userDisplay.value.charAt(0).toUpperCase() || "U");

// Đường dẫn động theo Role
const adminRoute = computed(() => {
  if (userRole.value === "Admin") return "/admin/dashboard";
  if (userRole.value === "Staff") return "/admin/pos";
  if (userRole.value === "Kitchen") return "/admin/kitchen"; // 👉 Thêm đường dẫn tới Bếp
  return "/";
});

onMounted(() => {
  token.value = localStorage.getItem("token");
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
const closeMenu = () => {
  isMenuOpen.value = false;
};
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};
const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/menu', query: { q: searchQuery.value.trim() } });
  } else {
    router.push({ path: '/menu' });
  }
  closeMenu();
};

const handleLogout = () => {
  localStorage.removeItem("token");
  token.value = null;
  isDropdownOpen.value = false;
  closeMenu();
  router.push("/login");
};
</script>

<style scoped>
.search-box {
  max-width: 350px;
}
.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}
.nav-link {
  font-weight: 500;
  transition: 0.3s;
}
.nav-link.router-link-exact-active {
  color: #ffc107 !important;
}
.btn-warning {
  transition: transform 0.2s;
}
.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
}
.avatar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 50px;
  transition: background 0.2s;
}
.avatar-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}
.avatar-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffc107, #ff8c00);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #121212;
  flex-shrink: 0;
  border: 2px solid rgba(255, 193, 7, 0.4);
  box-shadow: 0 0 12px rgba(255, 193, 7, 0.25);
}
.avatar-circle.avatar-lg {
  width: 46px;
  height: 46px;
  font-size: 1.2rem;
}
.chevron-icon {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  transition: transform 0.3s ease;
}
.chevron-icon.rotated {
  transform: rotate(180deg);
}
.user-dropdown {
  position: relative;
}
.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: 998;
}
.dropdown-menu-custom {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 240px;
  background: #1e1e1e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  overflow: hidden;
  z-index: 999;
}
.dropdown-item-custom {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.88rem;
  text-decoration: none;
  transition:
    background 0.2s,
    color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
}
.dropdown-item-custom:hover {
  background: rgba(255, 193, 7, 0.08);
  color: #ffc107;
}
.logout-btn {
  color: #ff6b6b;
}
.logout-btn:hover {
  background: rgba(255, 107, 107, 0.08);
  color: #ff4444;
}
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
