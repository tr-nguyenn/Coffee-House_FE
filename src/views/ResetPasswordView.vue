<template>
  <div class="auth-page d-flex align-items-center justify-content-center py-5">
    <router-link to="/login" class="back-btn text-decoration-none shadow-sm">
      <i class="bi bi-arrow-left"></i>
      <span class="ms-2 d-none d-md-inline">Trở về</span>
    </router-link>

    <div class="auth-card shadow-2xl rounded-4 overflow-hidden border border-secondary border-opacity-25">
      <div class="p-4 p-md-5 bg-dark-card">
        
        <div class="text-center mb-4">
          <AppLogo size="30" class="justify-content-center mb-3" />
          
          <div class="icon-circle mx-auto mb-3" :class="stepConfig[currentStep].colorClass">
            <i :class="stepConfig[currentStep].icon" class="fs-1" :style="{ color: stepConfig[currentStep].color }"></i>
          </div>
          
          <h4 class="text-white fw-bold letter-spacing-1">{{ stepConfig[currentStep].title }}</h4>
          <p class="text-secondary small mt-2 mb-0">{{ stepConfig[currentStep].desc }}</p>
        </div>

        <div class="progress-wizard-container mb-4">
          <div class="progress-line">
            <div class="progress-line-fill" :style="{ width: progressWidth }"></div>
          </div>
          <div class="progress-steps d-flex justify-content-between position-relative">
            <div class="step-indicator" :class="{ 'active': currentStep >= 1 }">1</div>
            <div class="step-indicator" :class="{ 'active': currentStep >= 2 }">2</div>
            <div class="step-indicator" :class="{ 'active': currentStep >= 3 }">3</div>
          </div>
          <div class="step-labels d-flex justify-content-between mt-2 small text-secondary">
            <span>Nhập Email</span>
            <span>Xác nhận</span>
            <span>Đổi MK</span>
          </div>
        </div>

        <transition name="fade-slide" mode="out-in">
          <form v-if="currentStep === 1" @submit.prevent="handleSendOtp" key="step1">
            <div class="form-group mb-4">
              <label class="text-warning small fw-bold mb-2 uppercase">Địa chỉ Email</label>
              <div class="input-group">
                <span class="input-group-text premium-addon"><i class="bi bi-envelope-fill text-warning"></i></span>
                <input
                  v-model="form.email"
                  type="email"
                  class="form-control premium-input"
                  placeholder="name@email.com"
                  required
                  autofocus
                />
              </div>
            </div>
            <button type="submit" class="btn btn-gold w-100 py-3 fw-bold rounded-3" :disabled="isLoading">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? "ĐANG TÌM TÀI KHOẢN..." : "GỬI MÃ XÁC NHẬN" }}
            </button>
          </form>

        <form v-else-if="currentStep === 2" @submit.prevent="handleVerifyOtp" key="step2">
            <div class="text-center mb-3 small text-a2a3b7">
              Mã 6 số đã được gửi tới <strong class="text-warning">{{ form.email }}</strong>
              <span class="d-block mt-1" style="cursor: pointer; text-decoration: underline;" @click="currentStep = 1">
                (Đổi Email)
              </span>
            </div>

            <div class="form-group mb-4">
              <div class="d-flex justify-content-between gap-1 gap-md-2">
                <input
                  v-for="(_, index) in otp"
                  :key="index"
                  ref="otpInputs"
                  v-model="otp[index]"
                  @input="handleOtpInput(index, $event)"
                  @keydown="handleOtpKeydown(index, $event)"
                  @paste="handleOtpPaste"
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="form-control premium-input text-center fw-bold p-0 mb-0 otp-box"
                />
              </div>
            </div>
            
            <button type="submit" class="btn btn-info w-100 py-3 fw-bold rounded-3 text-dark" :disabled="isLoading || otp.join('').length < 6">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? "ĐANG KIỂM TRA..." : "XÁC NHẬN MÃ" }}
            </button>
            
            <div class="text-center mt-3 small">
              <a href="#" @click.prevent="handleSendOtp" class="text-secondary hover-link">Không nhận được mã? Gửi lại</a>
            </div>
          </form>

        <form v-else-if="currentStep === 3" @submit.prevent="handleResetPassword" key="step3">
            <div class="form-group mb-3 small">
              <label class="text-warning small fw-bold mb-2 uppercase">Mật khẩu mới</label>
              <div class="position-relative">
                <input
                  v-model="form.newPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control premium-input pe-5 w-100"
                  placeholder="Nhập mật khẩu mới..."
                  required
                />
                <span class="password-toggle" @click="showPassword = !showPassword">
                  <i :class="showPassword ? 'bi bi-eye-slash text-white' : 'bi bi-eye'"></i>
                </span>
              </div>
            </div>

            <div class="form-group mb-3 small">
              <label class="text-warning small fw-bold mb-2 uppercase">Xác nhận mật khẩu</label>
              <div class="position-relative">
                <input
                  v-model="confirmPassword"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-control premium-input w-100"
                  placeholder="Nhập lại mật khẩu mới..."
                  required
                />
              </div>
              <div v-if="confirmPassword && form.newPassword !== confirmPassword" class="text-danger mt-1 ms-1" style="font-size: 0.75rem;">
                <i class="bi bi-exclamation-triangle-fill"></i> Mật khẩu xác nhận không khớp
              </div>
            </div>

            <div class="mb-4">
              <div class="d-flex gap-1 mb-2">
                <div class="strength-bar" :class="strengthLevel >= 1 ? strengthColor : ''"></div>
                <div class="strength-bar" :class="strengthLevel >= 2 ? strengthColor : ''"></div>
                <div class="strength-bar" :class="strengthLevel >= 3 ? strengthColor : ''"></div>
                <div class="strength-bar" :class="strengthLevel >= 4 ? strengthColor : ''"></div>
              </div>
            </div>

            <button type="submit" class="btn btn-success w-100 py-3 fw-bold rounded-3" :disabled="isLoading || strengthLevel < 3 || form.newPassword !== confirmPassword">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ isLoading ? "ĐANG LƯU..." : "HOÀN TẤT ĐỔI MẬT KHẨU" }}
            </button>
          </form>
        </transition>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import AppLogo from "@/components/AppLogo.vue";
import { accountService } from "@/services/AccountService";
import { toast } from "@/utils/toast";

const router = useRouter();

// --- STATE QUẢN LÝ ---
const currentStep = ref(1);
const isLoading = ref(false);

const form = reactive({
  email: "",
  newPassword: "",
});

const otp = ref<string[]>(Array(6).fill(""));
const confirmPassword = ref("");
const otpInputs = ref<HTMLInputElement[]>([]);
const showPassword = ref(false);

// --- CONFIG UI CHO TỪNG BƯỚC ---
const stepConfig: Record<number, any> = {
  1: { title: "QUÊN MẬT KHẨU", desc: "Nhập email đã đăng ký tài khoản của bạn", icon: "bi bi-envelope-at-fill", color: "#ffc107", colorClass: "glow-warning" },
  2: { title: "XÁC NHẬN OTP", desc: "Nhập mã 6 số chúng tôi vừa gửi cho bạn", icon: "bi bi-shield-lock-fill", color: "#0dcaf0", colorClass: "glow-info" },
  3: { title: "ĐẶT LẠI MẬT KHẨU", desc: "Tạo mật khẩu mới an toàn cho tài khoản", icon: "bi bi-key-fill", color: "#198754", colorClass: "glow-success" }
};

const progressWidth = computed(() => {
  if (currentStep.value === 1) return "0%";
  if (currentStep.value === 2) return "50%";
  return "100%";
});

// --- LOGIC BƯỚC 1: GỬI OTP ---
const handleSendOtp = async () => {
  if (!form.email) return;
  isLoading.value = true;
  try {
    // Gọi API kiểm tra Email và gửi OTP
    await accountService.forgotPassword(form.email);
    toast.success("Mã xác nhận đã được gửi đến Email của bạn!");
    currentStep.value = 2; // Chuyển sang bước 2
    
    // Tự động focus vào ô OTP đầu tiên sau khi chuyển UI
    nextTick(() => {
      if (otpInputs.value[0]) otpInputs.value[0].focus();
    });
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Email không tồn tại trong hệ thống.");
  } finally {
    isLoading.value = false;
  }
};

// --- LOGIC BƯỚC 2: KIỂM TRA OTP ---
const handleVerifyOtp = async () => {
  const fullOtp = otp.value.join("");
  if (fullOtp.length < 6) return;
  
  // MÔ PHỎNG KIỂM TRA OTP (Tùy thuộc API Back-end của mi có tách bước verify riêng không)
  // Nếu Back-end gộp chung đổi pass mới verify, mi chỉ cần chuyển Step 3 luôn.
  // Ở đây tau giả lập chuyển sang Step 3.
  currentStep.value = 3;
};

// Quản lý gõ OTP (Chuyển ô, Paste)
const handleOtpInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  if (!/^\d*$/.test(val)) { otp.value[index] = ""; return; }
  if (val !== "" && index < 5) otpInputs.value[index + 1]?.focus();
};

const handleOtpKeydown = (index: number, event: KeyboardEvent) => {
  if (event.key === "Backspace" && otp.value[index] === "" && index > 0) {
    otpInputs.value[index - 1]?.focus();
  }
};

const handleOtpPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData("text") || "";
  const match = pastedData.replace(/\D/g, "").slice(0, 6);
  if (match) {
    for (let i = 0; i < match.length; i++) { otp.value[i] = match[i] || ""; }
    otpInputs.value[Math.min(match.length, 5)]?.focus();
  }
};

// --- LOGIC BƯỚC 3: ĐỔI MẬT KHẨU ---
const rules = computed(() => ({
  minLength: form.newPassword.length >= 6,
  hasUpper: /[A-Z]/.test(form.newPassword),
  hasDigit: /[0-9]/.test(form.newPassword),
  hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.newPassword),
}));

const strengthLevel = computed(() => {
  let level = 0;
  if (rules.value.minLength) level++;
  if (rules.value.hasUpper) level++;
  if (rules.value.hasDigit) level++;
  if (rules.value.hasSpecial) level++;
  return level;
});

const strengthColor = computed(() => {
  if (strengthLevel.value <= 1) return "bg-danger";
  if (strengthLevel.value === 2) return "bg-warning";
  if (strengthLevel.value === 3) return "bg-info";
  return "bg-success";
});

const handleResetPassword = async () => {
  isLoading.value = true;
  try {
    const fullOtp = otp.value.join("");
    // GỌI API CHÍNH THỨC
    await accountService.resetPassword({
      email: form.email,
      otpCode: fullOtp,
      newPassword: form.newPassword,
    });
    toast.success("Tuyệt vời! Mật khẩu đã được thay đổi thành công.");
    setTimeout(() => router.push("/login"), 1500);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Lỗi xác thực, vui lòng làm lại từ đầu.");
    currentStep.value = 1; // Quay lại bước 1 nếu lỗi bảo mật
    otp.value = Array(6).fill("");
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-page { min-height: 100vh; background-color: #121212; }
.auth-card { width: 100%; max-width: 460px; background-color: #1e1e2d; }
.bg-dark-card { background-color: #1e1e2d; }

.text-a2a3b7 { color: #a2a3b7; }

/* Nút Back */
.back-btn {
  position: absolute; top: 30px; left: 30px; color: #a2a3b7;
  background: rgba(255, 255, 255, 0.05); padding: 10px 18px;
  border-radius: 50px; border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease; backdrop-filter: blur(5px); z-index: 100;
}
.back-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.1); transform: translateX(-5px); }

/* Icons */
.icon-circle {
  width: 70px; height: 70px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.5s ease;
}
.glow-warning { background: rgba(255, 193, 7, 0.1); border: 2px solid rgba(255, 193, 7, 0.3); box-shadow: 0 0 15px rgba(255, 193, 7, 0.2); }
.glow-info { background: rgba(13, 202, 240, 0.1); border: 2px solid rgba(13, 202, 240, 0.3); box-shadow: 0 0 15px rgba(13, 202, 240, 0.2); }
.glow-success { background: rgba(25, 135, 84, 0.1); border: 2px solid rgba(25, 135, 84, 0.3); box-shadow: 0 0 15px rgba(25, 135, 84, 0.2); }

/* Progress Bar */
.progress-wizard-container { width: 80%; margin: 0 auto; }
.progress-line {
  position: relative; height: 3px; background-color: #3d3d4d;
  margin: 0 10px; top: 16px; z-index: 1; border-radius: 2px;
}
.progress-line-fill {
  position: absolute; height: 100%; background-color: #ffc107;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.step-indicator {
  width: 32px; height: 32px; border-radius: 50%;
  background-color: #1e1e2d; border: 2px solid #3d3d4d;
  color: #a2a3b7; display: flex; align-items: center; justify-content: center;
  font-weight: bold; font-size: 0.85rem; z-index: 2; transition: all 0.3s;
}
.step-indicator.active {
  background-color: #ffc107; border-color: #ffc107; color: #121212;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.4);
}
.step-labels span { flex: 1; text-align: center; font-size: 0.75rem; }

/* Form Inputs */
.uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
.premium-input {
  background-color: #2a2a3a !important; border: 1px solid #3d3d4d;
  color: #ffffff !important; padding: 12px 15px; border-radius: 0 8px 8px 0;
}
.premium-input:focus { border-color: #ffc107; box-shadow: 0 0 0 0.2rem rgba(255, 193, 7, 0.15); }
.premium-addon {
  background-color: #2a2a3a; border: 1px solid #3d3d4d; border-right: none;
  border-radius: 8px 0 0 8px;
}

/* OTP Boxes */
.otp-box { height: 55px; font-size: 1.5rem; border-radius: 8px !important; flex: 1; max-width: 55px; }

/* Strength Bar */
.strength-bar { flex: 1; height: 4px; border-radius: 2px; background-color: #3d3d4d; transition: all 0.3s; }

/* Buttons */
.btn-gold { background-color: #ffc107; color: #121212; }
.btn-gold:hover:not(:disabled) { background-color: #e5ac00; transform: translateY(-2px); }

/* Transitions */
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.3s ease; }
.fade-slide-enter-from { opacity: 0; transform: translateX(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-20px); }

.password-toggle {
  position: absolute; right: 15px; top: 50%;
  transform: translateY(-50%); cursor: pointer; z-index: 10;
}
.hover-link:hover { text-decoration: underline !important; color: #ffc107 !important; }
</style>