<template>
  <BaseModal
    ref="baseModalRef"
    :title="isEdit ? 'Cập nhật Voucher' : 'Tạo Voucher mới'"
    :loading="submitting"
    @save="handleSave"
  >
    <div class="voucher-form">
      <!-- Mã Voucher -->
      <div class="mb-3">
        <label class="form-label-custom">Mã Voucher <span class="text-danger">*</span></label>
        <input
          v-model="form.code"
          type="text"
          class="form-control premium-input text-uppercase fw-bold"
          placeholder="VD: SALE50, MUNG8THANG3"
          :class="{'is-invalid': errors.code}"
          @input="form.code = form.code.toUpperCase()"
        />
        <div class="invalid-feedback" v-if="errors.code">{{ errors.code }}</div>
      </div>

      <!-- Mô tả -->
      <div class="mb-3">
        <label class="form-label-custom">Mô tả</label>
        <input
          v-model="form.description"
          type="text"
          class="form-control premium-input"
          placeholder="VD: Giảm 50k cho đơn từ 200k"
        />
      </div>

      <!-- Loại giảm giá + Giá trị -->
      <div class="row mb-3">
        <div class="col-6">
          <label class="form-label-custom">Loại giảm giá <span class="text-danger">*</span></label>
          <select v-model.number="form.discountType" class="form-select premium-input">
            <option :value="1">Giảm thẳng tiền (VNĐ)</option>
            <option :value="2">Giảm theo %</option>
          </select>
        </div>
        <div class="col-6">
          <label class="form-label-custom">
            Giá trị giảm <span class="text-danger">*</span>
            <span class="text-muted ms-1" style="font-weight: 400">
              {{ form.discountType === 2 ? '(%)' : '(VNĐ)' }}
            </span>
          </label>
          <input
            v-model.number="form.discountValue"
            type="number"
            min="0"
            class="form-control premium-input"
            :class="{'is-invalid': errors.discountValue}"
            placeholder="0"
          />
          <div class="invalid-feedback" v-if="errors.discountValue">{{ errors.discountValue }}</div>
        </div>
      </div>

      <!-- Giảm tối đa (chỉ hiện khi chọn %) + Đơn tối thiểu -->
      <div class="row mb-3">
        <div class="col-6" v-if="form.discountType === 2">
          <label class="form-label-custom">Giảm tối đa (VNĐ)</label>
          <input
            v-model.number="form.maxDiscountAmount"
            type="number"
            min="0"
            class="form-control premium-input"
            placeholder="VD: 50000"
          />
        </div>
        <div :class="form.discountType === 2 ? 'col-6' : 'col-12'">
          <label class="form-label-custom">Đơn tối thiểu (VNĐ)</label>
          <input
            v-model.number="form.minOrderAmount"
            type="number"
            min="0"
            class="form-control premium-input"
            placeholder="0"
          />
        </div>
      </div>

      <!-- Thời hạn -->
      <div class="row mb-3">
        <div class="col-6">
          <label class="form-label-custom">Ngày bắt đầu <span class="text-danger">*</span></label>
          <input
            v-model="form.startDate"
            type="date"
            class="form-control premium-input"
            :class="{'is-invalid': errors.startDate}"
          />
          <div class="invalid-feedback" v-if="errors.startDate">{{ errors.startDate }}</div>
        </div>
        <div class="col-6">
          <label class="form-label-custom">Ngày hết hạn <span class="text-danger">*</span></label>
          <input
            v-model="form.expiryDate"
            type="date"
            class="form-control premium-input"
            :class="{'is-invalid': errors.expiryDate}"
          />
          <div class="invalid-feedback" v-if="errors.expiryDate">{{ errors.expiryDate }}</div>
        </div>
      </div>

      <!-- Số lượng phát hành -->
      <div class="mb-2">
        <label class="form-label-custom">Tổng lượt sử dụng tối đa</label>
        <input
          v-model.number="form.usageLimit"
          type="number"
          min="1"
          class="form-control premium-input"
          placeholder="100"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import {ref, reactive} from "vue";
import BaseModal from "./shared/BaseModal.vue";
import {voucherService} from "@/services/VoucherService";
import type {VoucherDto} from "@/services/VoucherService";
import {toast} from "@/utils/toast";

const emit = defineEmits(["saved"]);

const baseModalRef = ref();
const isEdit = ref(false);
const submitting = ref(false);

const errors = reactive({
  code: "",
  discountValue: "",
  startDate: "",
  expiryDate: "",
});

const defaultForm = () => ({
  id: undefined as string | undefined,
  code: "",
  description: "",
  discountType: 1,
  discountValue: 0,
  maxDiscountAmount: null as number | null,
  minOrderAmount: 0,
  startDate: "",
  expiryDate: "",
  usageLimit: 100,
});

const form = reactive(defaultForm());

const resetForm = () => {
  Object.assign(form, defaultForm());
  errors.code = "";
  errors.discountValue = "";
  errors.startDate = "";
  errors.expiryDate = "";
};

const show = (item?: VoucherDto) => {
  resetForm();
  if (item) {
    isEdit.value = true;
    form.id = item.id;
    form.code = item.code;
    form.description = item.description;
    form.discountType = item.discountType === "Percentage" ? 2 : 1;
    form.discountValue = item.discountValue;
    form.maxDiscountAmount = item.maxDiscountAmount ?? null;
    form.minOrderAmount = item.minOrderAmount;
    form.startDate = item.startDate?.substring(0, 10) || "";
    form.expiryDate = item.expiryDate?.substring(0, 10) || "";
    form.usageLimit = item.usageLimit;
  } else {
    isEdit.value = false;
  }
  baseModalRef.value?.show();
};

const validate = (): boolean => {
  let valid = true;
  errors.code = "";
  errors.discountValue = "";
  errors.startDate = "";
  errors.expiryDate = "";

  if (!form.code.trim()) {
    errors.code = "Mã voucher không được để trống";
    valid = false;
  }
  if (!form.discountValue || form.discountValue <= 0) {
    errors.discountValue = "Giá trị giảm phải lớn hơn 0";
    valid = false;
  }
  if (form.discountType === 2 && form.discountValue > 100) {
    errors.discountValue = "Phần trăm giảm không được vượt quá 100%";
    valid = false;
  }
  if (!form.startDate) {
    errors.startDate = "Chọn ngày bắt đầu";
    valid = false;
  }
  if (!form.expiryDate) {
    errors.expiryDate = "Chọn ngày hết hạn";
    valid = false;
  }
  if (form.startDate && form.expiryDate && form.startDate > form.expiryDate) {
    errors.expiryDate = "Ngày hết hạn phải sau ngày bắt đầu";
    valid = false;
  }
  return valid;
};

const handleSave = async () => {
  if (!validate()) return;

  submitting.value = true;
  try {
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description,
      discountType: form.discountType,
      discountValue: form.discountValue,
      maxDiscountAmount: form.discountType === 2 ? form.maxDiscountAmount : null,
      minOrderAmount: form.minOrderAmount || 0,
      startDate: form.startDate,
      expiryDate: form.expiryDate,
      usageLimit: form.usageLimit || 100,
    };

    if (isEdit.value && form.id) {
      await voucherService.update(form.id, payload as any);
      toast.success("Cập nhật voucher thành công");
    } else {
      await voucherService.create(payload as any);
      toast.success("Tạo voucher thành công");
    }
    emit("saved");
    baseModalRef.value?.hide();
  } catch (error: any) {
    const msg = error.response?.data?.message || "Có lỗi xảy ra";
    toast.error(msg);
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
