<template>
  <div class="pagination-bar d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-2 pt-2">
    <div class="page-info">
      Hiển thị <strong>{{ from }}–{{ to }}</strong> trong tổng số <strong>{{ total }}</strong> mục
    </div>

    <div class="pagination-controls d-flex align-items-center gap-2">
      <button class="pgn-nav" :disabled="currentPage === 1" @click="$emit('change', currentPage - 1)" title="Trang trước">
        <i class="bi bi-chevron-left"></i>
      </button>

      <template v-for="(page, index) in displayedPages" :key="index">
        <button
          v-if="typeof page === 'number'"
          class="pgn-btn"
          :class="{ active: page === currentPage }"
          @click="$emit('change', page)"
        >{{ page }}</button>
        <span v-else class="pgn-ellipsis">···</span>
      </template>

      <button class="pgn-nav" :disabled="currentPage === totalPages" @click="$emit('change', currentPage + 1)" title="Trang sau">
        <i class="bi bi-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  total: number;
  currentPage: number;
  pageSize: number;
  from: number;
  to: number;
}>();

defineEmits(["change"]);

const totalPages = computed(() => Math.ceil(props.total / props.pageSize) || 1);
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = props.currentPage;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }
  return pages;
});
</script>

<style scoped>
.pagination-bar {
  border-top: 1px solid #e5e7eb;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.page-info {
  font-size: 0.82rem;
  color: #6b7280;
}
.page-info strong {
  color: #374151;
  font-weight: 600;
}

.pgn-btn,
.pgn-nav {
  min-width: 34px;
  height: 34px;
  padding: 0 8px;
  border-radius:50%;
  border: 1px solid transparent;
  background-color: transparent;
  color: #4b5563;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}

.pgn-nav {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
}

.pgn-btn:hover:not(.active),
.pgn-nav:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #111827;
}

.pgn-btn.active {
  background-color: #0d6efd;
  color: #ffffff;
  border-color: #0d6efd;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

.pgn-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: transparent;
}

.pgn-ellipsis {
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 0 4px;
  line-height: 34px;
}
</style>