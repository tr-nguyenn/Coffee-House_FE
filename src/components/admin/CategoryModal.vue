<template>
  <BaseModal ref="baseModalRef" :title="isEdit ? 'Cập nhật loại sản phẩm' : 'Thêm loại sản phẩm mới'" :loading="submitting" @save="handleSave">
    <div class="category-form">
      <div class="mb-4">
        <label class="form-label-custom">Tên loại sản phẩm <span class="text-danger">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-control premium-input"
          placeholder="VD: Cà phê pha máy, Trà trái cây..."
          :class="{'is-invalid': errors.name}"
        />
        <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
      </div>

      <div class="mb-2">
        <label class="form-label-custom">Mô tả chi tiết</label>
        <textarea
          v-model="form.description"
          class="form-control premium-input"
          rows="4"
          placeholder="Mô tả ngắn gọn về nhóm sản phẩm này..."
        ></textarea>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {ref, reactive} from "vue";
import BaseModal from "./shared/BaseModal.vue";
import {categoryService} from "@/services/CategoryService";
import type {Category} from "@/models/Category";
import {toast} from "@/utils/toast";

const emit = defineEmits(["saved"]);

const baseModalRef = ref();
const isEdit = ref(false);
const submitting = ref(false);
const errors = reactive({name: ""});
const form = reactive<Category>({
  id: undefined,
  name: "",
  description: "",
});

const show = (item?: Category) => {
  errors.name = "";
  if (item) {
    isEdit.value = true;
    Object.assign(form, {...item});
  } else {
    isEdit.value = false;
    form.id = undefined;
    form.name = "";
    form.description = "";
  }
  baseModalRef.value?.show();
};

const handleSave = async () => {
  if (!form.name.trim()) {
    errors.name = "Tên loại sản phẩm không được để trống";
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value && form.id) {
      await categoryService.update(form.id, form);
      toast.success("Sửa loại sản phẩm thành công");
    } else {
      await categoryService.create(form);
      toast.success("Thêm loại sản phẩm thành công");
    }
    emit("saved");
    baseModalRef.value?.hide();
  } catch (error: any) {
    const message = error.response?.data?.message;
    toast.error("Có lỗi xảy ra: " + (message || "Vui lòng thử lại"));
  } finally {
    submitting.value = false;
  }
};

defineExpose({show});
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
  border-color: #4f46e5 !important;
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
