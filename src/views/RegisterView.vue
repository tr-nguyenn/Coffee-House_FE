<template>
  <div class="register-page d-flex align-items-center justify-content-center">
    <router-link to="/" class="back-home-btn text-decoration-none shadow-sm">
      <i class="bi bi-arrow-left"></i>
      <span class="ms-2 d-none d-md-inline">Trang chủ</span>
    </router-link>
    <div class="register-card m-5 shadow-2xl rounded-4 overflow-hidden border border-secondary border-opacity-25">
      <div class="p-2 p-md-4 bg-dark-card">
        <div class="text-center mb-2">
          <AppLogo size="33" class="justify-content-center mb-4" />
          <h5 class="text-white fw-bold letter-spacing-1">ĐĂNG KÍ TÀI KHOẢN</h5>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="form-group mb-4 small">
            <label class="text-warning small fw-bold mb-2 uppercase">Họ và tên</label>
            <input v-model="form.fullName" type="text" class="form-control premium-input" placeholder="Nguyễn Văn A" required />
          </div>

          <div class="form-group mb-4 small">
            <label class="text-warning small fw-bold mb-2 uppercase">Email liên hệ</label>
            <input v-model="form.email" type="email" class="form-control premium-input" placeholder="name@coffee.com" required />
          </div>

          <div class="form-group mb-4 small">
            <label class="text-warning small fw-bold mb-2 uppercase">Số điện thoại</label>
            <input v-model="form.phoneNumber" type="tel" class="form-control premium-input" placeholder="09xxxxxxxx" required />
          </div>

          <div class="row g-3 mb-4 small">
            <div class="col-md-6">
              <label class="text-warning small fw-bold mb-2 uppercase">Mật khẩu</label>
              <div class="position-relative">
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control premium-input pe-5"
                  placeholder="••••••••"
                  required
                />
                <span class="password-toggle" @click="showPassword = !showPassword">
                  <i :class="showPassword ? 'bi bi-eye-slash text-white' : 'bi bi-eye'"></i>
                </span>
              </div>
            </div>

            <div class="col-md-6">
              <label class="text-warning small fw-bold mb-2 uppercase">Xác nhận</label>
              <div class="position-relative">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  class="form-control premium-input pe-5"
                  placeholder="••••••••"
                  required
                />
                <span class="password-toggle" @click="showConfirmPassword = !showConfirmPassword">
                  <i :class="showConfirmPassword ? 'bi bi-eye-slash text-white' : 'bi bi-eye'"></i>
                </span>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-gold btn-sm w-100 py-3 fw-bold rounded-3 shadow-sm">TẠO TÀI KHOẢN NGAY</button>

          <div class="text-center mt-2 pt-2">
            <span class="text-secondary small">Bạn đã là thành viên? </span>
            <router-link to="/login" class="text-warning fw-bold small text-decoration-none hover-link"> Đăng nhập ngay </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref} from "vue";
import AppLogo from "@/components/AppLogo.vue";

const form = reactive({
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const handleRegister = () => {
  if (form.password !== form.confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }
  console.log("Submit:", form);
};
</script>

<style scoped>
.back-home-btn {
  position: absolute;
  top: 30px;
  left: 30px;
  color: #a2a3b7; /* Màu xám nhạt */
  background: rgba(255, 255, 255, 0.05); /* Nền mờ ảo */
  padding: 10px 18px;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  z-index: 100;
}

.back-home-btn:hover {
  color: #ffc107; /* Đổi sang màu vàng khi hover */
  background: rgba(255, 193, 7, 0.1);
  border-color: #ffc107;
  transform: translateX(-5px); /* Hiệu ứng lướt sang trái khi hover vào mũi tên */
}

/* Trên mobile thì thu nhỏ lại cho gọn */
@media (max-width: 768px) {
  .back-home-btn {
    top: 15px;
    left: 15px;
    padding: 8px 12px;
  }
}

.register-page {
  min-height: 100vh;
  background-color: #121212;
}

.register-card {
  width: 100%;
  max-width: 500px;
  background-color: #1e1e1e;
}

.bg-dark-card {
  background-color: #1e1e1e;
}

.uppercase {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.premium-input {
  background-color: #2a2a2a !important;
  border: 1px solid #3d3d3d;
  color: #ffffff !important;
  padding: 9px 15px;
  border-radius: 8px;
  transition: all 0.3s;
}

.premium-input::placeholder {
  color: #666;
}

.premium-input:focus {
  border-color: #ffc107;
  box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.15);
  background-color: #2a2a2a;
}

.btn-gold {
  background-color: #ffc107;
  color: #121212;
  border: none;
  transition: all 0.3s;
  letter-spacing: 1px;
}

.btn-gold:hover {
  background-color: #e5ac00;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 193, 7, 0.2);
}

.hover-link:hover {
  text-decoration: underline !important;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.pe-5 {
  padding-right: 3rem !important;
}

.password-toggle {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
  z-index: 10;
  display: flex;
  align-items: center;
}

.password-toggle:hover {
  color: #ffc107;
}

.premium-input {
  background-color: #2a2a2a !important;
  border: 1px solid #3d3d3d;
  color: #ffffff !important;
  padding: 12px 15px;
  border-radius: 8px;
}
</style>
