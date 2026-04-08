<template>
  <div class="profile-container bg-light min-vh-100 py-5">
    <div class="container">
      <div class="row g-4 justify-content-center">
        <!-- Cột trái: Thông tin tổng quan -->
        <div class="col-lg-4">
          <div class="card border-0 rounded-4 shadow-sm text-center p-4 sticky-top" style="top: 80px;">
            <div class="avatar-wrapper mb-3 mx-auto">
              <div class="avatar-circle display-4 shadow-sm">
                {{ avatarLetter }}
              </div>
            </div>
            
            <h4 class="fw-bold mb-1 text-dark">{{ profile.fullName || 'Đang tải...' }}</h4>
            <p class="text-secondary mb-3">{{ profile.email }}</p>
            
            <div class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill mb-4 fs-6">
              {{ displayRole }}
            </div>
            
            <!-- Dành cho Khách hàng -->
            <div v-if="profile.role === 'Customer'" class="card bg-warning bg-opacity-10 border-warning border-opacity-25 rounded-3 p-3">
              <div class="text-warning small fw-bold text-uppercase mb-1">Điểm Tích Luỹ</div>
              <div class="fs-2 fw-bold text-dark d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-star-fill text-warning"></i> {{ profile.rewardPoints || 0 }}
              </div>
            </div>

            <!-- Dành cho Nhân viên -->
            <div v-if="profile.role === 'Staff' || profile.role === 'Kitchen'" class="card bg-info bg-opacity-10 border-info border-opacity-25 rounded-3 p-3 text-start">
              <div class="text-info small fw-bold text-uppercase mb-1">Ngày Vào Làm</div>
              <div class="fs-5 fw-bold text-dark">
                <i class="bi bi-calendar-check text-info me-2"></i> {{ formatDate(profile.hireDate) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Cột phải: Form cập nhật -->
        <div class="col-lg-8">
          <!-- Card: Thông tin cơ bản -->
          <div class="card border-0 rounded-4 shadow-sm mb-4">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h5 class="fw-bold text-dark"><i class="bi bi-person-lines-fill text-primary me-2"></i> Thông Tin Cơ Bản</h5>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="handleUpdateProfile">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-medium text-secondary">Họ và tên</label>
                    <input type="text" v-model="profileForm.fullName" class="form-control form-control-lg bg-light border-0" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-medium text-secondary">Số điện thoại</label>
                    <input type="text" v-model="profileForm.phoneNumber" class="form-control form-control-lg bg-light border-0" required />
                  </div>
                </div>
                <div class="mt-4 text-end">
                  <button type="submit" class="btn btn-primary px-4 py-2 shadow-sm rounded-3 fw-bold" :disabled="isUpdatingProfile">
                    <span v-if="isUpdatingProfile" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-save me-2"></i> Lưu Thông Tin
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Card: Bảo mật (Đổi Mật Khẩu) -->
          <div class="card border-0 rounded-4 shadow-sm">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h5 class="fw-bold text-dark"><i class="bi bi-shield-lock-fill text-danger me-2"></i> Bảo Mật & Mật Khẩu</h5>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="handleChangePassword">
                <div class="mb-3">
                  <label class="form-label fw-medium text-secondary">Mật khẩu hiện tại</label>
                  <div class="input-group">
                    <input :type="showPasswords ? 'text' : 'password'" v-model="passwordForm.currentPassword" class="form-control form-control-lg bg-light border-0" placeholder="Nhập mật khẩu hiện tại..." required minlength="6" />
                    <button class="btn btn-light border-0 bg-light" type="button" @click="showPasswords = !showPasswords">
                      <i class="bi text-secondary" :class="showPasswords ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-medium text-secondary">Mật khẩu mới</label>
                  <div class="input-group">
                    <input :type="showPasswords ? 'text' : 'password'" v-model="passwordForm.newPassword" class="form-control form-control-lg bg-light border-0" placeholder="Nhập mật khẩu mới..." required minlength="6" />
                    <button class="btn btn-light border-0 bg-light" type="button" @click="showPasswords = !showPasswords">
                      <i class="bi text-secondary" :class="showPasswords ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                </div>
                <div class="mb-4">
                  <label class="form-label fw-medium text-secondary">Xác nhận mật khẩu mới</label>
                  <div class="input-group">
                    <input :type="showPasswords ? 'text' : 'password'" v-model="passwordForm.confirmPassword" class="form-control form-control-lg bg-light border-0" placeholder="Nhập lại mật khẩu mới..." required minlength="6" />
                    <button class="btn btn-light border-0 bg-light" type="button" @click="showPasswords = !showPasswords">
                      <i class="bi text-secondary" :class="showPasswords ? 'bi-eye-slash' : 'bi-eye'"></i>
                    </button>
                  </div>
                  <div v-if="passwordError" class="text-danger small mt-1"><i class="bi bi-exclamation-circle"></i> {{ passwordError }}</div>
                </div>

                <div class="text-end">
                  <button type="submit" class="btn btn-danger px-4 py-2 shadow-sm rounded-3 fw-bold" :disabled="isChangingPassword">
                    <span v-if="isChangingPassword" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-key me-2"></i> Đổi Mật Khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { accountService } from '@/services/AccountService';
import { toast } from '@/utils/toast';

const profile = ref<any>({});
const isUpdatingProfile = ref(false);
const isChangingPassword = ref(false);
const showPasswords = ref(false);

const profileForm = reactive({
  fullName: '',
  phoneNumber: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const passwordError = ref('');

const avatarLetter = computed(() => {
  if (profile.value.fullName) return profile.value.fullName.charAt(0).toUpperCase();
  if (profile.value.email) return profile.value.email.charAt(0).toUpperCase();
  return 'U';
});

const displayRole = computed(() => {
  switch (profile.value.role) {
    case 'Admin': return 'Quản trị viên';
    case 'Staff': return 'Thu ngân';
    case 'Kitchen': return 'Bếp / Pha chế';
    case 'Customer': return 'Khách hàng thành viên';
    default: return profile.value.role || 'Thành viên';
  }
});

const loadProfile = async () => {
  try {
    const data = await accountService.getProfile();
    profile.value = data;
    profileForm.fullName = data.fullName;
    profileForm.phoneNumber = data.phoneNumber;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Không thể tải thông tin cá nhân.');
  }
};

const handleUpdateProfile = async () => {
  isUpdatingProfile.value = true;
  try {
    const res = await accountService.updateProfile({
      fullName: profileForm.fullName,
      phoneNumber: profileForm.phoneNumber
    });
    toast.success(res.message || 'Cập nhật thông tin thành công!');
    // Cập nhật lại view
    profile.value.fullName = profileForm.fullName;
    profile.value.phoneNumber = profileForm.phoneNumber;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Cập nhật thất bại.');
  } finally {
    isUpdatingProfile.value = false;
  }
};

const handleChangePassword = async () => {
  passwordError.value = '';
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Mật khẩu xác nhận không khớp!';
    return;
  }

  isChangingPassword.value = true;
  try {
    const res = await accountService.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
    toast.success(res.message || 'Đổi mật khẩu thành công!');
    
    // Reset form
    passwordForm.currentPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
    showPasswords.value = false;
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
  } finally {
    isChangingPassword.value = false;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return '---';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
}

onMounted(() => {
  loadProfile();
});
</script>

<style scoped>
.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffc107, #ff8c00);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #fff;
  border: 4px solid #fff;
}
.form-control:focus {
  box-shadow: none;
  background-color: #fff !important;
  border: 1px solid #ffc107 !important;
}
.input-group .btn-light {
  border: 1px solid transparent;
}
.input-group:focus-within .form-control {
  background-color: #fff !important;
}
.input-group:focus-within .btn-light {
  background-color: #fff !important;
}
</style>
