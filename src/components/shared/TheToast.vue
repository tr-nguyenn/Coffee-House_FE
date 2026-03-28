<template>
  <div class="toast-wrapper">
    <transition-group name="toast-slide">
      <div
        v-for="t in toastState.toasts"
        :key="t.id"
        class="toast-card"
        :class="`toast-${t.type}`"
        role="alert"
      >
        <!-- Icon -->
        <div class="toast-icon-area">
          <i v-if="t.type === 'success'" class="bi bi-check-circle-fill"></i>
          <i v-else-if="t.type === 'danger'" class="bi bi-x-circle-fill"></i>
          <i v-else-if="t.type === 'warning'" class="bi bi-exclamation-triangle-fill"></i>
          <i v-else class="bi bi-info-circle-fill"></i>
        </div>

        <!-- Content -->
        <div class="toast-content">
          <span class="toast-label">{{ labelFor(t.type) }}</span>
          <p class="toast-message">{{ t.message }}</p>
        </div>

        <!-- Close -->
        <button class="toast-close" @click="toast.remove(t.id)">
          <i class="bi bi-x-lg"></i>
        </button>

        <!-- Progress bar -->
        <div class="toast-progress">
          <div
            class="toast-progress-bar"
            :style="{ animationDuration: (t.duration || 4000) + 'ms' }"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { toastState, toast } from "@/utils/toast";
import type { Toast } from "@/types";

const labelFor = (type: Toast["type"]) => {
  switch (type) {
    case "success": return "Thành công";
    case "danger": return "Lỗi";
    case "warning": return "Cảnh báo";
    case "info": return "Thông tin";
    default: return "";
  }
};
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}

.toast-card {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.toast-success { border-color: #bbf7d0; background: #f9fefb; }
.toast-danger { border-color: #fecaca; background: #fefafa; }
.toast-warning { border-color: #fde68a; background: #fffdf5; }
.toast-info { border-color: #bfdbfe; background: #f8fbff; }

.toast-icon-area {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.toast-success .toast-icon-area { background: #f0fdf4; color: #22c55e; }
.toast-danger .toast-icon-area { background: #fef2f2; color: #ef4444; }
.toast-warning .toast-icon-area { background: #fffbeb; color: #f59e0b; }
.toast-info .toast-icon-area { background: #eff6ff; color: #3b82f6; }

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1;
  margin-bottom: 2px;
  display: block;
}

.toast-success .toast-label { color: #16a34a; }
.toast-danger .toast-label { color: #dc2626; }
.toast-warning .toast-label { color: #d97706; }
.toast-info .toast-label { color: #2563eb; }

.toast-message {
  margin: 0;
  font-size: 0.88rem;
  color: #374151;
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.8rem;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}
.toast-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #f3f4f6;
}

.toast-progress-bar {
  height: 100%;
  border-radius: 0 0 0 12px;
  animation: toast-countdown linear forwards;
}

.toast-success .toast-progress-bar { background: #22c55e; }
.toast-danger .toast-progress-bar { background: #ef4444; }
.toast-warning .toast-progress-bar { background: #f59e0b; }
.toast-info .toast-progress-bar { background: #3b82f6; }

@keyframes toast-countdown {
  from { width: 100%; }
  to { width: 0%; }
}

.toast-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.21, 1.02, 0.73, 1);
}
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.06, 0.71, 0.55, 1);
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

@media (max-width: 480px) {
  .toast-wrapper {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
