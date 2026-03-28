<template>
  <BaseModal
    ref="baseModalRef"
    :title="isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'"
    :loading="submitting"
    @save="handleSave"
  >
    <div class="staff-form">
      <!-- Email (readonly if editing as username cannot be changed typically, or handled via update) -->
      <div class="mb-4">
        <label class="form-label-custom">EMAIL <span class="text-danger">*</span></label>
        <input
          v-model="form.email"
          type="email"
          class="form-control premium-input"
          placeholder="VD: nv1@coffee.com..."
          :class="{ 'is-invalid': errors.email }"
          :disabled="isEdit"
        />
        <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
      </div>

      <!-- Mật khẩu (Chỉ bắt buộc khi thêm mới) -->
      <div class="mb-4" v-if="!isEdit">
        <label class="form-label-custom">MẬT KHẨU <span class="text-danger">*</span></label>
        <input
          v-model="form.password"
          type="password"
          class="form-control premium-input"
          placeholder="Nhập mật khẩu..."
          :class="{ 'is-invalid': errors.password }"
        />
        <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
      </div>

      <!-- Tên nhân viên -->
      <div class="mb-4">
        <label class="form-label-custom">TÊN NHÂN VIÊN <span class="text-danger">*</span></label>
        <input
          v-model="form.fullName"
          type="text"
          class="form-control premium-input"
          placeholder="VD: Nguyễn Văn A..."
          :class="{ 'is-invalid': errors.fullName }"
        />
        <div class="invalid-feedback" v-if="errors.fullName">{{ errors.fullName }}</div>
      </div>

      <!-- Số điện thoại -->
      <div class="mb-4">
        <label class="form-label-custom">SỐ ĐIỆN THOẠI <span class="text-danger">*</span></label>
        <input
          v-model="form.phoneNumber"
          type="text"
          class="form-control premium-input"
          placeholder="VD: 0912345678..."
          :class="{ 'is-invalid': errors.phoneNumber }"
        />
        <div class="invalid-feedback" v-if="errors.phoneNumber">{{ errors.phoneNumber }}</div>
      </div>

      <!-- Quyền / Role -->
      <div class="mb-2">
        <label class="form-label-custom">QUYỀN (ROLE) <span class="text-danger">*</span></label>
        <select
          v-model="form.role"
          class="form-select premium-input"
          :class="{ 'is-invalid': errors.role }"
        >
          <option value="" disabled>-- Chọn quyền --</option>
          <option value="Admin">Admin</option>
          <option value="Staff">Nhân viên (Staff)</option>
          <option value="Kitchen">Bếp (Kitchen)</option>
        </select>
        <div class="invalid-feedback" v-if="errors.role">{{ errors.role }}</div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import BaseModal from "./shared/BaseModal.vue";
import { staffService } from "@/services/StaffService";
import type { Staff } from "@/models/Staff";
import { toast } from "@/utils/toast";

const emit = defineEmits(["saved"]);

const baseModalRef = ref();
const isEdit = ref(false);
const submitting = ref(false);
const errors = reactive({ email: "", password: "", fullName: "", phoneNumber: "", role: "" });

const form = reactive<Staff>({
  id: undefined,
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  role: "", // Used for create/update DTO
  roles: [],
});

const show = (item?: Staff) => {
  errors.email = "";
  errors.password = "";
  errors.fullName = "";
  errors.phoneNumber = "";
  errors.role = "";

  if (item) {
    isEdit.value = true;
    Object.assign(form, { ...item });
    // Assuming the API returns a list of roles, use the first one for the dropdown
    form.role = item.roles && item.roles.length > 0 ? item.roles[0] : "Staff";
  } else {
    isEdit.value = false;
    form.id = undefined;
    form.email = "";
    form.password = "";
    form.fullName = "";
    form.phoneNumber = "";
    form.role = "";
    form.roles = [];
  }
  baseModalRef.value?.show();
};

const handleSave = async () => {
  let hasError = false;

  if (!form.email.trim()) {
    errors.email = "Email không được để trống";
    hasError = true;
  } else {
    errors.email = "";
  }

  if (!isEdit.value && (!form.password || !form.password.trim())) {
    errors.password = "Mật khẩu không được để trống";
    hasError = true;
  } else {
    errors.password = "";
  }

  if (!form.fullName.trim()) {
    errors.fullName = "Tên nhân viên không được để trống";
    hasError = true;
  } else {
    errors.fullName = "";
  }

  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Số điện thoại không được để trống";
    hasError = true;
  } else {
    errors.phoneNumber = "";
  }

  if (!form.role) {
    errors.role = "Vui lòng chọn quyền";
    hasError = true;
  } else {
    errors.role = "";
  }

  if (hasError) return;

  submitting.value = true;
  try {
    if (isEdit.value && form.id) {
      await staffService.update(form.id, form);
      toast.success("Cập nhật nhân viên thành công!");
    } else {
      await staffService.create(form);
      toast.success("Thêm nhân viên thành công!");
    }
    emit("saved");
    baseModalRef.value?.hide();
  } catch (error: any) {
    console.error("Lỗi khi lưu nhân viên:", error);
    const msg = error.response?.data?.message || error.message || "Vui lòng thử lại";
    toast.error(msg);
  } finally {
    submitting.value = false;
  }
};

defineExpose({ show });
</script>

<style scoped>
.form-label-custom {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.premium-input {
  background-color: #f9fafb !important;
  border: 1px solid #e5e7eb !important;
  color: #111827 !important;
  padding: 10px 14px;
  border-radius: 9px;
  font-size: 0.9rem;
  transition: all 0.25s ease;
}

.premium-input > option {
  background-color: #ffffff;
  color: #111827;
}

.premium-input:focus {
  background-color: #ffffff !important;
  border-color: #4F46E5 !important;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12) !important;
  outline: none;
}

.premium-input:disabled {
  background-color: #f3f4f6 !important;
  color: #6b7280 !important;
  cursor: not-allowed;
}

.premium-input::placeholder {
  color: #9ca3af;
  font-size: 0.88rem;
}

.is-invalid {
  border-color: #ef4444 !important;
}

.invalid-feedback {
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 4px;
}
</style>
