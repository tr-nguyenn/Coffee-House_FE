<template>
  <div class="table-card">
    <div class="table-responsive">
      <table class="table mb-0 custom-table table-bordered">
        <thead>
          <tr>
            <th class="stt-col">STT</th>
            <th class="text-center fw-bold" v-for="col in columns" :key="col.key" :style="{width: col.width}">
              {{ col.label }}
            </th>
            <th class="action-col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <!-- Empty State -->
          <tr v-if="items.length === 0">
            <td :colspan="columns.length + 2" class="empty-cell">
              <div class="empty-state">
                <div class="empty-icon"><i class="bi bi-inbox"></i></div>
                <p class="empty-title">Không có dữ liệu</p>
                <p class="empty-sub">Chưa có bản ghi nào được tìm thấy.</p>
              </div>
            </td>
          </tr>
          <!-- Rows -->
          <tr
            v-for="(item, index) in items"
            :key="item.id"
            @click="$emit('row-click', item)"
            class="data-row"
          >
            <td class="stt-col">
              <span class="stt-badge">{{ index + 1 + (currentPage - 1) * pageSize }}</span>
            </td>
            <td v-for="col in columns" :key="col.key">
              <slot :name="'col-' + col.key" :item="item">
                <span class="cell-text">{{ item[col.key] }}</span>
              </slot>
            </td>
            <td class="action-col">
              <div class="action-buttons">
                <button class="btn-action edit-btn" @click.stop="$emit('edit', item)" title="Chỉnh sửa">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn-action delete-btn" @click.stop="$emit('delete', item.id)" title="Xóa">
                  <i class="bi bi-trash3"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  columns: Array<{label: string; key: string; width?: string}>;
  items: any[];
  currentPage: number;
  pageSize: number;
}>();

defineEmits(["edit", "delete", "row-click"]);
</script>

<style scoped>
.table-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  font-family: "Inter", "Segoe UI", sans-serif;
}

.custom-table {
  border-collapse: collapse;
  width: 100%;
}

.custom-table thead th {
  background-color: #f8fafc;
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.custom-table tbody td {
  padding: 14px 20px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
  font-size: 0.875rem;
  color: #374151;
}

.custom-table tbody tr:last-child td {
  border-bottom: none;
}

.data-row {
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.data-row:hover td {
  background-color: #f9fafb;
}

/* STT */
.stt-col {
  width: 60px;
  text-align: center;
}

.stt-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #4f46e5;
  font-size: 0.9rem;
  font-weight: 900;
  font-family: "Courier New", Courier, monospace;
  position: relative;
}

.stt-badge::before {
  content: "";
  position: absolute;
  left: -10px;
  width: 5px;
  height: 5px;
  background-color: #4f46e5;
  border-radius: 50%;
  opacity: 0.5;
}

.cell-text {
  color: #111827;
  font-weight: 500;
}

.action-col {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.btn-action {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn {
  color: #3b82f6;
}
.edit-btn:hover {
  background-color: #eff6ff;
  color: #2563eb;
  transform: translateY(-1px);
}

.delete-btn {
  color: #ef4444;
}
.delete-btn:hover {
  background-color: #fef2f2;
  color: #dc2626;
  transform: translateY(-1px);
}

/* Empty State */
.empty-cell {
  padding: 60px 20px !important;
  background-color: #fafafa;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon {
  font-size: 2.5rem;
  color: #d1d5db;
  margin-bottom: 12px;
}
.empty-title {
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 4px;
  font-size: 0.95rem;
}
.empty-sub {
  color: #9ca3af;
  font-size: 0.82rem;
  margin: 0;
}

@media (max-width: 768px) {
  .custom-table thead {
    display: none;
  }
  .custom-table,
  .custom-table tbody,
  .custom-table tr,
  .custom-table td {
    display: block;
    width: 100%;
  }
  .custom-table tr {
    border-bottom: 1px solid #e5e7eb;
    padding: 8px 0;
  }
  .custom-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border: none;
    font-size: 0.85rem;
  }
  .custom-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
    font-size: 0.75rem;
    text-transform: uppercase;
    flex-shrink: 0;
    margin-right: 10px;
  }
}
</style>
