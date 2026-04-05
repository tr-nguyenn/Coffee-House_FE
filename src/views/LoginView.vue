<template>
  <div class="login-page d-flex align-items-center justify-content-center">
    <router-link to="/" class="back-home-btn text-decoration-none shadow-sm">
      <i class="bi bi-arrow-left"></i>
      <span class="ms-2 d-none d-md-inline">Trang chủ</span>
    </router-link>
    <div class="login-card m-5 shadow-2xl rounded-4 overflow-hidden border border-secondary border-opacity-25">
      <div class="p-4 p-md-5 bg-dark-card">
        <div class="text-center mb-4">
          <AppLogo size="33" class="justify-content-center mb-3" />
          <h5 class="text-white fw-bold letter-spacing-1 text-uppercase">Chào mừng trở lại</h5>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group mb-4 small">
            <label class="text-warning small fw-bold mb-2 uppercase">Email hoặc Tên đăng nhập</label>
            <input v-model="form.userNameOrEmail" type="text" class="form-control premium-input" placeholder="nguyen123 hoặc name@coffee.com" />
          </div>

          <div class="form-group mb-3 small">
            <label class="text-warning small fw-bold mb-2 uppercase">Mật khẩu</label>
            <div class="position-relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control premium-input pe-5"
                placeholder="••••••••"
              />
              <span class="password-toggle" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash text-white' : 'bi bi-eye'"></i>
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="form-check">
              <input class="form-check-input custom-check" type="checkbox" id="rememberMe" v-model="form.rememberMe" />
              <label class="form-check-label text-secondary small" for="rememberMe"> Ghi nhớ tôi </label>
            </div>
            <router-link to="/reset-password" class="text-warning small text-decoration-none hover-link">Quên mật khẩu?</router-link>
          </div>

          <button type="submit" class="btn btn-gold w-100 py-3 fw-bold rounded-3 shadow-sm" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP NGAY" }}
          </button>

          <div class="text-center mt-2 pt-2">
            <span class="text-secondary small">Chưa có tài khoản? </span>
            <router-link to="/register" class="text-warning fw-bold small text-decoration-none hover-link"> Tạo tài khoản mới </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppLogo from "@/components/AppLogo.vue";
import { accountService } from "@/services/AccountService";
import { toast } from "@/utils/toast";

const router = useRouter();

const form = reactive({
  userNameOrEmail: "", 
  password: "",
  rememberMe: false,
});

const showPassword = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
  if (!form.userNameOrEmail || !form.password) {
    toast.warning("Vui lòng nhập đầy đủ email và mật khẩu.");
    return;
  }

  isLoading.value = true;
  try {
    const token = await accountService.login({
      userNameOrEmail: form.userNameOrEmail,
      password: form.password,
    });

    // Lưu token vào localStorage
    localStorage.setItem("token", token);
    toast.success("Đăng nhập thành công! Chào mừng bạn trở lại ☕");

    // 👉 ĐỌC TOKEN ĐỂ BIẾT CHUYỂN HƯỚNG VỀ ĐÂU
    const payload = JSON.parse(atob(token.split(".")[1] as string));
    const role = payload["role"] || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    console.log(role);
    setTimeout(() => {
      if (role === 'Admin') {
        router.push("/admin/dashboard");
      } else if (role === 'Staff') {
        router.push("/admin/pos");
      } else if (role === 'Kitchen') { // 👉 Thêm nhánh chuyển hướng cho Bếp
        router.push("/admin/kitchen");
      } else {
        router.push("/");
      }
    }, 800);

  } catch (error: any) {
    const msg =
      error?.response?.data?.message ||
      "Email hoặc mật khẩu không chính xác.";
    toast.error(msg);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* 👉 NHỚ GIỮ LẠI PHẦN STYLE CŨ CỦA MI Ở ĐÂY NHA, TAU BỎ QUA CHO ĐỠ DÀI TIN NHẮN */
.login-page { min-height: 100vh; background-color: #121212; }
.login-card { width: 100%; max-width: 450px; background-color: #1e1e1e; }
.back-home-btn { position: absolute; top: 30px; left: 30px; color: #a2a3b7; background: rgba(255, 255, 255, 0.05); padding: 10px 18px; border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.1); transition: all 0.3s ease; backdrop-filter: blur(5px); z-index: 100; }
.back-home-btn:hover { color: #ffc107; background: rgba(255, 193, 7, 0.1); border-color: #ffc107; transform: translateX(-5px); }
@media (max-width: 768px) { .back-home-btn { top: 15px; left: 15px; padding: 8px 12px; } }
.bg-dark-card { background-color: #1e1e1e; }
.uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
.premium-input { background-color: #2a2a2a !important; border: 1px solid #3d3d3d; color: #ffffff !important; padding: 12px 15px; border-radius: 8px; transition: all 0.3s; }
.premium-input:focus { border-color: #ffc107; box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.15); }
.custom-check { background-color: #2a2a2a; border-color: #3d3d3d; }
.custom-check:checked { background-color: #ffc107; border-color: #ffc107; }
.btn-gold { background-color: #ffc107; color: #121212; border: none; transition: all 0.3s; letter-spacing: 1px; }
.btn-gold:hover { background-color: #e5ac00; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(255, 193, 7, 0.2); }
.password-toggle { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #666; z-index: 10; }
.hover-link:hover { text-decoration: underline !important; }
.letter-spacing-1 { letter-spacing: 1px; }
</style>