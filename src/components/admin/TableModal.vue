<template>
  <BaseModal
    ref="baseModalRef"
    :title="isEdit ? 'Cập nhật bàn' : 'Thêm bàn mới'"
    :loading="submitting"
    @save="handleSave"
  >
    <div class="table-form">
      <!-- Khu vực -->
      <div class="mb-4">
        <label class="form-label-custom">Khu vực <span class="text-danger">*</span></label>
        <select
          v-model="form.areaId"
          class="form-select premium-input"
          :class="{ 'is-invalid': errors.areaId }"
        >
          <option value="" disabled>-- Chọn khu vực --</option>
          <option v-for="area in areas" :key="area.id" :value="area.id">
            {{ area.name }}
          </option>
        </select>
        <div class="invalid-feedback" v-if="errors.areaId">{{ errors.areaId }}</div>
      </div>

      <!-- Tên bàn -->
      <div class="mb-4">
        <label class="form-label-custom">Tên bàn <span class="text-danger">*</span></label>
        <input
          v-model="form.name"
          type="text"
          class="form-control premium-input"
          placeholder="VD: Bàn 1, Bàn 2..."
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
          placeholder="VD: 1, 2, 3..."
          min="0"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import BaseModal from "./shared/BaseModal.vue";
import { tableService } from "@/services/TableService";
import { areaService } from "@/services/AreaService";
import type { Table } from "@/models/Table";
import type { Area } from "@/models/Area";
import { toast } from "@/utils/toast";

const emit = defineEmits(["saved"]);

const baseModalRef = ref();
const isEdit = ref(false);
const submitting = ref(false);
const errors = reactive({ name: "", areaId: "" });
const areas = ref<Area[]>([]);

const form = reactive<Table>({
  id: undefined,
  name: "",
  areaId: "",
  displayOrder: 0,
});

const fetchAreas = async () => {
  try {
    const result = await areaService.getAll({ pageNumber: 1, pageSize: 100 });
    const data = result.data || result;
    areas.value = data.items || [];
  } catch (error) {
    console.error("Lỗi khi lấy danh sách khu vực:", error);
  }
};

onMounted(() => {
  fetchAreas();
});

const show = (item?: Table) => {
  errors.name = "";
  errors.areaId = "";
  
  if (areas.value.length === 0) {
    fetchAreas(); // retry fetch if missing
  }

  if (item) {
    isEdit.value = true;
    Object.assign(form, { ...item });
  } else {
    isEdit.value = false;
    form.id = undefined;
    form.name = "";
    form.areaId = "";
    form.displayOrder = 0;
  }
  baseModalRef.value?.show();
};

const handleSave = async () => {
  let hasError = false;
  
  if (!form.areaId) {
    errors.areaId = "Vui lòng chọn khu vực";
    hasError = true;
  } else {
    errors.areaId = "";
  }
  
  if (!form.name.trim()) {
    errors.name = "Tên bàn không được để trống";
    hasError = true;
  } else {
    errors.name = "";
  }

  if (hasError) return;

  submitting.value = true;
  try {
    if (isEdit.value && form.id) {
      await tableService.update(form.id, form);
      toast.success("Cập nhật bàn thành công!");
    } else {
      await tableService.create(form);
      toast.success("Thêm bàn mới thành công!");
    }
    emit("saved");
    baseModalRef.value?.hide();
  } catch (error: any) {
    console.error("Lỗi khi lưu bàn:", error);
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
