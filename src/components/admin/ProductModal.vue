<template>
  <BaseModal ref="baseModalRef" :title="isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'" :loading="submitting" @save="handleSave">
    <div class="product-form row text-start">
      <div class="col-md-8 mb-4">
        <label class="form-label-custom">TÊN SẢN PHẨM <span class="text-danger">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-control premium-input"
          placeholder="VD: Cà phê sữa đá..."
          :class="{'is-invalid': errors.name}"
        />
        <div class="invalid-feedback" v-if="errors.name">{{ errors.name }}</div>
      </div>

      <div class="col-md-4 mb-4">
        <label class="form-label-custom">GIÁ BÁN (VNĐ) <span class="text-danger">*</span></label>
        <input
          v-model.number="form.price"
          type="number"
          class="form-control premium-input"
          placeholder="0"
          min="0"
          :class="{'is-invalid': errors.price}"
        />
        <div class="invalid-feedback" v-if="errors.price">{{ errors.price }}</div>
      </div>

      <div class="col-md-6 mb-4">
        <label class="form-label-custom">LOẠI SẢN PHẨM <span class="text-danger">*</span></label>
        <select v-model="form.categoryId" class="form-select premium-input" :class="{'is-invalid': errors.categoryId}">
          <option :value="0" disabled>Chọn danh mục</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <div class="invalid-feedback" v-if="errors.categoryId">{{ errors.categoryId }}</div>
      </div>

      <div class="col-md-6 mb-4 d-flex align-items-end">
        <div class="form-check form-switch mb-2">
          <input v-model="form.isAvailable" class="form-check-input custom-switch" type="checkbox" id="isAvailableSwitch" />
          <label class="form-check-label ms-2 fw-bold text-dark" for="isAvailableSwitch"> Đang mở bán </label>
        </div>
      </div>

      <div class="col-12 mb-4">
        <label class="form-label-custom">HÌNH ẢNH SẢN PHẨM</label>
        <div
          class="upload-zone rounded-3 d-flex flex-column align-items-center justify-content-center transition-all"
          :class="{'border-danger': errors.imageFile}"
          @click="triggerFileInput"
        >
          <input type="file" ref="fileInput" class="d-none" accept="image/png, image/jpeg, image/jpg" @change="onFileChange" />

          <div v-if="imagePreview" class="w-100 h-100 position-relative text-center p-2">
            <img :src="imagePreview" alt="Preview" class="img-fluid rounded object-fit-contain" style="max-height: 160px" />
            <div class="mt-2 text-primary fw-bold small"><i class="bi bi-pencil-square me-1"></i> Bấm để đổi ảnh khác</div>
          </div>

          <div v-else class="text-center py-4 text-muted">
            <i class="bi bi-cloud-arrow-up display-4 text-indigo mb-2 d-block"></i>
            <span class="fw-bold text-dark d-block mb-1">Click vào đây để tải ảnh lên</span>
            <small>Định dạng hỗ trợ: JPG, PNG. Tối đa 5MB.</small>
          </div>
        </div>
        <div class="text-danger small mt-1" v-if="errors.imageFile">{{ errors.imageFile }}</div>
      </div>

      <div class="col-12 mb-2">
        <label class="form-label-custom">MÔ TẢ CHI TIẾT</label>
        <textarea v-model="form.description" class="form-control premium-input" rows="3" placeholder="Mô tả ngắn gọn về sản phẩm này..."></textarea>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from "vue";
import BaseModal from "./shared/BaseModal.vue";
import {productService} from "@/services/ProductService";
import {categoryService} from "@/services/CategoryService";
import type {Product} from "@/models/Product";
import type {Category} from "@/models/Category";
import {toast} from "@/utils/toast";

const emit = defineEmits(["saved"]);
const baseModalRef = ref();

const fileInput = ref<HTMLInputElement | null>(null);
const isEdit = ref(false);
const submitting = ref(false);
const errors = reactive({name: "", price: "", categoryId: "", imageFile: ""});
const categories = ref<Category[]>([]);
const imagePreview = ref<string | null>(null);

const form = reactive<Product>({
  id: undefined,
  name: "",
  description: "",
  price: 0,
  categoryId: 0,
  isAvailable: true,
  imageFile: null,
});

const loadCategories = async () => {
  try {
    const res = await categoryService.getAll({pageSize: 100});
    const data = res.data || res;
    categories.value = data.items || [];
  } catch (error) {
    console.error("Lỗi khi load danh mục:", error);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const onFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files.item(0);
    if (file && file.size > 5 * 1024 * 1024) {
      errors.imageFile = "Kích thước ảnh không được vượt quá 5MB";
      return;
    }

    if (file) {
      errors.imageFile = "";
      form.imageFile = file;
      imagePreview.value = URL.createObjectURL(file);
    }
  }
};

const show = (item?: Product) => {
  errors.name = "";
  errors.price = "";
  errors.categoryId = "";
  errors.imageFile = "";

  if (imagePreview.value && imagePreview.value.startsWith("blob:")) {
    URL.revokeObjectURL(imagePreview.value);
  }
  imagePreview.value = null;
  form.imageFile = null;

  if (item) {
    isEdit.value = true;
    Object.assign(form, {...item});

    if (item.imageUrl) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      imagePreview.value = `${baseUrl}/${item.imageUrl}`;
    }
  } else {
    isEdit.value = false;
    form.id = undefined;
    form.name = "";
    form.description = "";
    form.price = 0;
    form.categoryId = 0;
    form.isAvailable = true;
  }

  if (categories.value.length === 0) {
    loadCategories();
  }

  baseModalRef.value?.show();
};

const handleSave = async () => {
  let isValid = true;

  if (!form.name.trim()) {
    errors.name = "Tên sản phẩm không được để trống";
    isValid = false;
  } else {
    errors.name = "";
  }

  if (form.price <= 0) {
    errors.price = "Giá bán phải lớn hơn 0";
    isValid = false;
  } else {
    errors.price = "";
  }

  if (!form.categoryId || form.categoryId === 0) {
    errors.categoryId = "Vui lòng chọn danh mục";
    isValid = false;
  } else {
    errors.categoryId = "";
  }

  if (!isValid) return;

  submitting.value = true;
  try {
    if (isEdit.value && form.id) {
      await productService.update(form.id, form);
      toast.success("Cập nhật sản phẩm thành công");
    } else {
      await productService.create(form);
      toast.success("Thêm sản phẩm thành công");
    }
    emit("saved");
    baseModalRef.value?.hide();
  } catch (error: any) {
    console.error("Lỗi khi lưu sản phẩm:", error);
    toast.error("Có lỗi xảy ra: " + (error.response?.data?.message || "Vui lòng thử lại"));
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadCategories();
});

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

.upload-zone {
  border: 2px dashed #cbd5e1;
  background-color: #f8fafc;
  min-height: 160px;
  cursor: pointer;
}

.upload-zone:hover {
  border-color: #4f46e5;
  background-color: #eff6ff;
}

.text-indigo {
  color: #4f46e5;
}

.transition-all {
  transition: all 0.3s ease;
}

.is-invalid {
  border-color: #ef4444 !important;
}
.invalid-feedback {
  font-size: 0.78rem;
  color: #ef4444;
  margin-top: 4px;
}
.custom-switch {
  width: 45px !important;
  height: 22px !important;
  cursor: pointer;
}
.custom-switch:checked {
  background-color: #4f46e5;
  border-color: #4f46e5;
}
.custom-switch:focus {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}
</style>
