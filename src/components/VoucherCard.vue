<script setup lang="ts">
import { toast } from '@/utils/toast';

const props = defineProps<{
  title: string;
  description: string;
  code: string;
  discount: string;
  validUntil?: string;
}>();

const copyCode = () => {
  navigator.clipboard.writeText(props.code);
  toast.success(`Đã copy mã: ${props.code}`);
};
</script>

<template>
  <div class="voucher-card p-3 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-between position-relative overflow-hidden">
    <div class="voucher-bg position-absolute top-0 start-0 w-100 h-100"></div>
    <div class="position-relative z-1">
      <div class="d-flex align-items-center mb-3">
        <div class="voucher-icon bg-warning text-dark flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center me-3 shadow" style="width: 48px; height: 48px;">
          <i class="bi bi-ticket-perforated-fill fs-4"></i>
        </div>
        <div>
          <h5 class="fw-bold text-white mb-1">{{ title }}</h5>
          <span class="badge bg-danger">Giảm {{ discount }}</span>
        </div>
      </div>
      <p class="text-light opacity-75 small mb-3">{{ description }}</p>
      <div v-if="validUntil" class="text-warning small fst-italic mb-3">
        <i class="bi bi-clock-history me-1"></i> Hạn dùng: {{ validUntil }}
      </div>
    </div>
    
    <div class="position-relative z-1 mt-auto">
      <div class="d-flex align-items-center justify-content-between p-2 rounded-3 bg-dark border border-secondary border-opacity-50 border-dashed">
        <span class="font-monospace fw-bold text-warning tracking-widest fs-5 ms-2">{{ code }}</span>
        <button class="btn btn-sm btn-outline-warning rounded-pill px-3 copy-btn hover-lift" @click="copyCode">
          <i class="bi bi-clipboard"></i> Copy
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voucher-card {
  background: linear-gradient(135deg, #2b3035 0%, #1a1d21 100%);
  border: 1px solid #3d424b;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.voucher-card:hover {
  transform: translateY(-5px);
  border-color: #ffc107;
  box-shadow: 0 0.5rem 1rem rgba(255, 193, 7, 0.15) !important;
}

.voucher-bg {
  background-image: radial-gradient(#3d424b 1px, transparent 1px);
  background-size: 10px 10px;
  opacity: 0.15;
}

.border-dashed {
  border-style: dashed !important;
}

.tracking-widest {
  letter-spacing: 0.15em;
}

.hover-lift {
  transition: transform 0.2s, background-color 0.2s;
}

.hover-lift:hover {
  transform: translateY(-2px);
}
</style>
