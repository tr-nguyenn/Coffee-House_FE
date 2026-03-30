<template>
  <div class="bg-white border-end d-flex flex-column flex-shrink-0 z-1" style="width: 280px">
    <div class="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
      <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-funnel-fill text-primary me-2"></i>Bộ lọc</h6>
      <button class="btn btn-sm text-danger p-0 fw-semibold text-decoration-none" @click="resetFilters">
        <i class="bi bi-arrow-counterclockwise"></i> Làm mới
      </button>
    </div>

    <div class="p-3 flex-grow-1 overflow-auto custom-scrollbar">
      <div class="mb-4">
        <label class="form-label small fw-bold text-muted">Tìm kiếm</label>
        <div class="input-group input-group-sm">
          <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
          <input
            type="text"
            class="form-control border-start-0"
            placeholder="Mã HĐ, Tên KH..."
            v-model="localFilters.search"
          />
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label small fw-bold text-muted">Thời gian</label>
        <select class="form-select form-select-sm mb-2 cursor-pointer" v-model="localFilters.timeRange">
          <option value="today">Hôm nay</option>
          <option value="yesterday">Hôm qua</option>
          <option value="thisWeek">Tuần này</option>
          <option value="thisMonth">Tháng này</option>
          <option value="custom">Tùy chỉnh...</option>
        </select>

        <div
          v-if="localFilters.timeRange === 'custom'"
          class="d-flex flex-column gap-2 p-2 bg-light border rounded"
        >
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white text-muted" style="width: 75px; font-size: 0.75rem"
              >Từ ngày</span
            >
            <input type="date" class="form-control" v-model="localFilters.startDate" />
          </div>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white text-muted" style="width: 75px; font-size: 0.75rem"
              >Đến ngày</span
            >
            <input type="date" class="form-control" v-model="localFilters.endDate" />
          </div>
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label small fw-bold text-muted">Trạng thái</label>
        <div class="form-check mb-1">
          <input
            class="form-check-input cursor-pointer"
            type="checkbox"
            id="st-completed"
            value="Completed"
            v-model="localFilters.statuses"
          />
          <label class="form-check-label small cursor-pointer" for="st-completed">Hoàn thành (Đã TT)</label>
        </div>
        <div class="form-check mb-1">
          <input
            class="form-check-input cursor-pointer"
            type="checkbox"
            id="st-processing"
            value="Processing"
            v-model="localFilters.statuses"
          />
          <label class="form-check-label small cursor-pointer" for="st-processing">Đang phục vụ</label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input cursor-pointer"
            type="checkbox"
            id="st-cancelled"
            value="Cancelled"
            v-model="localFilters.statuses"
          />
          <label class="form-check-label small cursor-pointer" for="st-cancelled">Đã hủy</label>
        </div>
      </div>

      <div class="mb-4">
        <label class="form-label small fw-bold text-muted">Thanh toán</label>
        <select class="form-select form-select-sm cursor-pointer" v-model="localFilters.paymentMethod">
          <option value="">Tất cả</option>
          <option value="Cash">Tiền mặt</option>
          <option value="Banking">Chuyển khoản / QR</option>
          <option value="Card">Thẻ / Ví điện tử</option>
        </select>
      </div>

      <div class="mb-4">
        <label class="form-label small fw-bold text-muted">Người tạo (Nhân viên)</label>
        <select class="form-select form-select-sm cursor-pointer" v-model="localFilters.createdBy">
          <option value="">Tất cả nhân viên</option>
          <option v-for="staff in staffList" :key="staff.id" :value="staff.id">
            {{ staff.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, watch} from "vue"; // 👉 Đã import thêm watch

const emit = defineEmits(["apply-filter"]);

const staffList = ref([
  {id: "nv01", name: "Nguyễn Trung Nguyên"},
  {id: "nv02", name: "Trần Văn B"},
  {id: "nv03", name: "Lê Thị C"},
]);

const defaultFilters = {
  search: "",
  timeRange: "today",
  startDate: "",
  endDate: "",
  statuses: ["Completed", "Processing"],
  paymentMethod: "",
  createdBy: "",
};

const localFilters = reactive({...defaultFilters});

let timeout: ReturnType<typeof setTimeout>;

// 👉 MA THUẬT NẰM Ở ĐÂY: Lắng nghe mọi sự thay đổi của Form
watch(
  localFilters,
  (newVal) => {
    clearTimeout(timeout);
    // Đợi 0.5s (500ms) sau khi user ngưng click/gõ thì mới báo cho Cha gọi API
    timeout = setTimeout(() => {
      emit("apply-filter", {...newVal});
    }, 500);
  },
  {deep: true},
);

const resetFilters = () => {
  Object.assign(localFilters, defaultFilters);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
