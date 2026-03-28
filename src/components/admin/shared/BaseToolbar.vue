<template>
  <div class="toolbar-container d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
    <!-- Search Section -->
    <div class="search-wrapper position-relative flex-grow-1" style="max-width: 420px;">
      <i class="bi bi-search search-icon position-absolute top-50 translate-middle-y"></i>
      <input
        type="text"
        class="form-control search-input shadow-none"
        :placeholder="placeholder"
        @input="$emit('search', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Action Buttons -->
    <div class="d-flex gap-2">
      <button class="btn btn-primary btn-add d-flex align-items-center gap-2" @click="$emit('add')">
        <i class="bi bi-plus-lg"></i>
        <span>{{ btnLabel }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  placeholder: { type: String, default: "Tìm kiếm..." },
  btnLabel: { type: String, default: "Thêm mới" },
});

defineEmits(["search", "add"]);
</script>

<style scoped>
.toolbar-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.search-wrapper .search-icon {
  left: 14px;
  color: #9ca3af;
  font-size: 0.95rem;
  pointer-events: none;
}

.search-wrapper .search-input {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px 16px 10px 40px;
  font-size: 0.9rem;
  color: #111827;
  transition: all 0.25s ease;
}

.search-wrapper .search-input::placeholder {
  color: #9ca3af;
}

.search-wrapper .search-input:focus {
  background-color: #ffffff;
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12) !important;
  outline: none;
}

.btn-add {
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.btn-add:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);
}

.btn-add:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
