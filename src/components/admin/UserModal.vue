<template>
  <BaseModal
    ref="baseModalRef"
    :title="isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'"
    :loading="submitting"
    @save="handleSave"
  >
    <div class="user-form">
      <div class="mb-4">
        <label class="form-label-custom">Tên khách hàng <span class="text-danger">*</span></label>
        <input
          v-model="form.fullName"
          type="text"
          class="form-control premium-input"
          placeholder="VD: Nguyễn Văn A..."
          :class="{ 'is-invalid': errors.fullName }"
        />
        <div class="invalid-feedback" v-if="errors.fullName">{{ errors.fullName }}</div>
      </div>

      <div class="mb-4">
        <label class="form-label-custom">Số điện thoại <span class="text-danger">*</span></label>
        <input
          v-model="form.phoneNumber"
          type="tel"
          class="form-control premium-input"
          placeholder="VD: 0912345678"
          :class="{ 'is-invalid': errors.phoneNumber }"
        />
        <div class="invalid-feedback" v-if="errors.phoneNumber">{{ errors.phoneNumber }}</div>
      </div>

      <div class="mb-2" v-if="isEdit">
        <label class="form-label-custom">Điểm thưởng hiện có</label>
        <input
          v-model.number="form.rewardPoints"
          type="number"
          class="form-control premium-input fw-bold"
          disabled
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import BaseModal from "./shared/BaseModal.vue";
import { userService } from "@/services/UserService";
import type { User } from "@/models/User";
import { toast } from "@/utils/toast";

const emit = defineEmits(["saved"]);

const baseModalRef = ref();
const isEdit = ref(false);
const submitting = ref(false);
const errors = reactive({ fullName: "", phoneNumber: "" });

const form = reactive<User>({
  id: undefined,
  fullName: "",
  phoneNumber: "",
  rewardPoints: 0,
});

const show = (item?: User) => {
  errors.fullName = "";
  errors.phoneNumber = "";

  if (item) {
    isEdit.value = true;
    Object.assign(form, { ...item });
  } else {
    isEdit.value = false;
    form.id = undefined;
    form.fullName = "";
    form.phoneNumber = "";
    form.rewardPoints = 0;
  }
  baseModalRef.value?.show();
};

const handleSave = async () => {
  let hasError = false;

  // 1. Validate Tên
  if (!form.fullName.trim()) {
    errors.fullName = "Tên khách hàng không được để trống";
    hasError = true;
  } else {
    errors.fullName = "";
  }

  // 2. Validate SĐT chuẩn Việt Nam (10 số, bắt đầu 03,05,07,08,09)
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!form.phoneNumber.trim()) {
    errors.phoneNumber = "Số điện thoại không được để trống";
    hasError = true;
  } else if (!phoneRegex.test(form.phoneNumber)) {
    errors.phoneNumber = "Số điện thoại không hợp lệ (VD: 0912345678)";
    hasError = true;
  } else {
    errors.phoneNumber = "";
  }

  if (hasError) return;

  submitting.value = true;
  try {
    if (isEdit.value && form.id) {
      await userService.update(form.id, form);
      toast.success("Cập nhật khách hàng thành công!");
    } else {
      await userService.create(form);
      toast.success("Thêm khách hàng mới thành công!");
    }
    emit("saved");
    baseModalRef.value?.hide();
  } catch (error: any) {
    console.error("Lỗi khi lưu khách hàng:", error);
    // Bắt câu lỗi ném ra từ C# (Ví dụ: "Số điện thoại này đã đăng ký...")
    const msg = error.response?.data?.message || "Hệ thống đang bận. Vui lòng thử lại!";
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