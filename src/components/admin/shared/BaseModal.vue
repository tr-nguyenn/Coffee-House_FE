<template>
  <div class="modal fade" :id="id" tabindex="-1" aria-hidden="true" ref="modalElement">
    <div class="modal-dialog modal-dialog-centered" :class="sizeClass">
      <div class="modal-content custom-modal-content">
        <!-- Header -->
        <div class="modal-header custom-modal-header">
          <h5 class="modal-title custom-modal-title mb-0">
            <slot name="title">{{ title }}</slot>
          </h5>
          <button type="button" class="btn-modal-close" @click="hide" aria-label="Đóng">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body custom-modal-body">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div class="modal-footer custom-modal-footer">
          <button type="button" class="btn-cancel" @click="hide">
            Hủy
          </button>
          <button type="button" class="btn-save" @click="$emit('save')" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Lưu dữ liệu
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";

const props = defineProps({
  id: { type: String, default: "baseModal" },
  title: { type: String, default: "Thông báo" },
  size: { type: String, default: "md" },
  loading: { type: Boolean, default: false },
});

defineEmits(["save", "close"]);
const modalElement = ref<HTMLElement>();
let bsModal: any = null;
const sizeClass = ref(`modal-${props.size}`);

onMounted(() => {
  if (modalElement.value) {
    bsModal = new Modal(modalElement.value);
  }
});

const show = () => bsModal?.show();
const hide = () => bsModal?.hide();
defineExpose({ show, hide });
</script>

<style scoped>
.custom-modal-content {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.custom-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.custom-modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f2937;
}

.btn-modal-close {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  font-size: 0.85rem;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-modal-close:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.custom-modal-body {
  padding: 24px;
  color: #374151;
  font-size: 0.9rem;
}

.custom-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 9px 22px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-cancel:hover {
  background-color: #fee2e2;
  border-color: #f87171;
  color: #b91c1c;
}

.btn-save {
  background-color: #4F46E5;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  padding: 9px 24px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
}
.btn-save:hover:not(:disabled) {
  background-color: #4338CA;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
