<template>
  <BaseModal
    ref="baseModalRef"
    :title="isEdit ? 'Cập nhật khu vực' : 'Thêm khu vực mới'"
    :loading="submitting"
    @save="handleSave"
  >
    <div class="area-form">
      <!-- Tên khu vực -->
      <div class="mb-4">
        <label class="form-label-custom">Tên khu vực <span class="text-danger">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-control premium-input"
          placeholder="VD: Tầng 1, Khu VIP, Sân thượng..."
          :class="{ 'is-invalid': errors.name }"
        />
        <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
      </div>

      <!-- Thứ tự hiển thị -->
      <div class="mb-2">
        <label class="form-label-custom">Thứ tự hiển thị</label>
        <input
          v-model.number="form.displayOrder"
          type="number"
          class="form-control premium-input"
          placeholder="VD: 1, 2, 3... (số nhỏ hơn hiển thị trước)"
          min="0"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import BaseModal from "./shared/BaseModal.vue";
import { areaService } from "@/services/AreaService";
import type { Area } from "@/models/Area";
import { toast } from "@/utils/toast";

const emit = defineEmits(["saved"]);

const baseModalRef = ref();
const isEdit = ref(false);
const submitting = ref(false);
const errors = reactive({ name: "" });

const form = reactive<Area>({
  id: undefined,
  name: "",
  displayOrder: 0,
});

const show = (item?: Area) => {
  errors.name = "";
  if (item) {
    isEdit.value = true;
    Object.assign(form, { ...item });
  } else {
    isEdit.value = false;
    form.id = undefined;
    form.name = "";
    form.displayOrder = 0;
  }
  baseModalRef.value?.show();
};

const handleSave = async () => {
  if (!form.name.trim()) {
    errors.name = "Tên khu vực không được để trống";
    return;
  }
  errors.name = "";

  submitting.value = true;
  try {
    if (isEdit.value && form.id) {
      await areaService.update(form.id, form);
      toast.success("Cập nhật khu vực thành công!");
    } else {
      await areaService.create(form);
      toast.success("Thêm khu vực mới thành công!");
    }
    emit("saved");
    baseModalRef.value?.hide();
  } catch (error: any) {
    console.error("Lỗi khi lưu khu vực:", error);
    const msg = error.response?.data?.message || error.message || "Vui lòng thử lại";
    toast.error("Có lỗi xảy ra: " + msg);
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
