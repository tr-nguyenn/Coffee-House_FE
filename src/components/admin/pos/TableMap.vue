<template>
  <div class="d-flex flex-column h-100 bg-white">
    <div class="p-2 border-bottom bg-light flex-shrink-0 shadow-sm z-1">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="fs-5 fw-bold text-dark"><i class="bi bi-grid-fill mx-2 text-primary"></i>Sơ đồ bàn</span>
        <button class="btn btn-sm btn-outline-secondary rounded-circle" title="Làm mới" @click="fetchTables">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
      </div>

      <div class="d-flex overflow-auto custom-scrollbar pb-3 gap-2" style="white-space: nowrap">
        <button
          class="btn btn-sm rounded-pill fw-bold transition-all"
          :class="selectedArea === 'All' ? 'btn-primary' : 'btn-outline-secondary'"
          @click="selectedArea = 'All'"
        >
          Tất cả
        </button>
        <button
          v-for="area in uniqueAreas"
          :key="area"
          class="btn btn-sm rounded-pill fw-bold transition-all"
          :class="selectedArea === area ? 'btn-primary' : 'btn-outline-secondary'"
          @click="selectedArea = area"
        >
          {{ area }}
        </button>
      </div>
    </div>

    <div
      class="flex-grow-1 overflow-auto p-3 custom-scrollbar"
      style="background-color: #f8fafc; min-height: 0; height: 0px"
    >
      <div class="mb-4">
        <div
          class="card text-center cursor-pointer transition-all border-0 rounded-4 shadow-sm takeaway-card"
          :class="{'selected-takeaway transform-active': selectedTableId === 'TAKEAWAY'}"
          @click="selectTakeaway"
        >
          <div
            class="card-body p-2 d-flex align-items-center justify-content-center gap-3 bg-white border border-warning border-2 rounded-4"
          >
            <div
              class="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
              style="width: 45px; height: 45px"
            >
              <i class="bi bi-bag-check-fill fs-4"></i>
            </div>
            <div class="text-start flex-grow-1">
              <h6 class="fw-bolder text-dark mb-0 letter-spacing-1">Khách mua mang đi</h6>
              <small class="text-secondary fw-semibold">Không cần bàn</small>
            </div>
            <i class="bi bi-chevron-right text-warning fs-5"></i>
          </div>
        </div>
      </div>

      <div v-if="loading" class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>

      <div v-else>
        <div v-for="(group, areaName) in filteredGroupedTables" :key="areaName" class="mb-5">
          <div class="d-flex align-items-center mb-3 ps-1">
            <div class="bg-primary rounded-pill me-2" style="width: 5px; height: 20px"></div>
            <h6 class="fw-bolder text-dark mb-0">{{ areaName }}</h6>
            <span class="badge bg-white text-secondary ms-2 border shadow-sm">{{ group.length }} bàn</span>
          </div>

          <div class="row row-cols-3 row-cols-sm-4 row-cols-md-5 g-2">
            <div class="col" v-for="table in group" :key="table.tableId">
              <div
                class="card h-100 text-center cursor-pointer transition-all border-2 rounded-4 select-none table-card position-relative overflow-hidden"
                :class="[
                  table.isInUse ? 'card-occupied' : 'card-empty',
                  selectedTableId === table.tableId ? 'selected-table transform-active' : 'shadow-sm',
                ]"
                @click="onSelect(table)"
              >
                <div class="position-absolute top-0 end-0 mt-2 me-2">
                  <i
                    class="bi fs-6"
                    :class="table.isInUse ? 'bi-cup-hot-fill text-danger' : 'bi-check2-circle text-success'"
                  ></i>
                </div>

                <div class="card-body p-2 d-flex flex-column justify-content-center align-items-center">
                  <h5
                    class="fw-bolder mt-3 mb-1"
                    :class="table.isInUse ? 'text-danger' : 'text-success'"
                    style="font-size: 1.1rem"
                  >
                    {{ table.tableName }}
                  </h5>

                  <span
                    class="badge rounded-pill mb-1 px-2 py-1"
                    :class="
                      table.isInUse
                        ? 'bg-danger bg-opacity-10 text-danger'
                        : 'bg-success bg-opacity-10 text-success'
                    "
                    style="font-size: 0.7rem; font-weight: 700"
                  >
                    {{ table.isInUse ? "Có Khách" : "Trống" }}
                  </span>

                  <div
                    v-if="table.activeOrderTime && table.isInUse"
                    class="text-danger fw-bold mt-1"
                    style="font-size: 0.75rem"
                  >
                    <i class="bi bi-clock-history"></i> {{ getElapsedTime(table.activeOrderTime) }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="group.length === 0" class="col-12 py-2 text-muted fst-italic small">
              Không có bàn ở khu vực này.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, onUnmounted} from "vue";
import {tableService} from "@/services/TableService";
import {toast} from "@/utils/toast";
import type {TableStatusDto} from "@/models/Table";

const props = defineProps<{selectedTableId: string | null}>();
const emit = defineEmits(["select-table", "select-takeaway"]);

const loading = ref(false);
const tables = ref<TableStatusDto[]>([]);
const selectedArea = ref<string>("All");

// --- LOGIC ĐẾM GIỜ ---
const currentTime = ref(new Date());
let timerInterval: ReturnType<typeof setInterval>;

const getElapsedTime = (activeOrderTime?: string | Date) => {
  if (!activeOrderTime) return "";

  let timeStr = String(activeOrderTime);
  if (!timeStr.endsWith("Z")) {
    timeStr += "Z";
  }

  const startTime = new Date(timeStr);
  const diffMs = currentTime.value.getTime() - startTime.getTime();

  if (diffMs <= 0) return "Vừa vào";

  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0) return `${hours}g ${mins}p`;
  return `${mins} phút`;
};

// --- LOGIC XỬ LÝ SẮP XẾP ---

// 1. Lấy danh sách tên Khu vực (Menu ngang) xếp theo AreaDisplayOrder
const uniqueAreas = computed(() => {
  const areaMap = new Map<string, number>();

  tables.value.forEach((t) => {
    const areaName = t.areaName || "Khác";
    // Ánh xạ tên khu vực với AreaDisplayOrder nhỏ nhất
    if (!areaMap.has(areaName)) {
      areaMap.set(areaName, t.areaDisplayOrder ?? 9999);
    } else {
      areaMap.set(areaName, Math.min(areaMap.get(areaName)!, t.areaDisplayOrder ?? 9999));
    }
  });

  // Chuyển thành Array, xếp theo số DisplayOrder, rồi bóc tên Khu vực ra
  return Array.from(areaMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map((entry) => entry[0]);
});

// 2. Nhóm bàn theo khu vực và Sắp xếp hiển thị bên dưới
const filteredGroupedTables = computed(() => {
  const groups: Record<string, TableStatusDto[]> = {};

  // BƯỚC 1: Dựng sẵn các "căn phòng" theo ĐÚNG THỨ TỰ của Menu (uniqueAreas)
  // Javascript sẽ in Object ra đúng theo thứ tự chúng ta tạo Key ở bước này.
  uniqueAreas.value.forEach((area) => {
    if (selectedArea.value === "All" || selectedArea.value === area) {
      groups[area] = [];
    }
  });

  // BƯỚC 2: Thả các bàn vào đúng "căn phòng" của nó
  tables.value.forEach((t) => {
    const areaName = t.areaName || "Khác";
    if (groups[areaName]) {
      groups[areaName].push(t);
    }
  });

  // BƯỚC 3: Đi vào từng "căn phòng", xếp lại bàn ghế theo DisplayOrder
  for (const key in groups) {
    groups[key]!.sort((a, b) => {
      const orderA = a.displayOrder ?? 9999;
      const orderB = b.displayOrder ?? 9999;
      return orderA - orderB;
    });
  }

  return groups;
});

// --- LOGIC API & SỰ KIỆN ---

const fetchTables = async () => {
  loading.value = true;
  try {
    const response = await tableService.getTablesWithStatus();
    tables.value = response;
  } catch (error) {
    console.error(error);
    toast.error("Lỗi khi tải danh sách bàn. Vui lòng thử lại!");
  } finally {
    loading.value = false;
  }
};

const onSelect = (table: TableStatusDto) => {
  emit("select-table", table);
};

const selectTakeaway = () => {
  emit("select-takeaway");
};

onMounted(() => {
  fetchTables();
  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 30000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

defineExpose({fetchTables, tables});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.select-none {
  user-select: none;
}
.letter-spacing-1 {
  letter-spacing: 0.5px;
}

.table-card {
  background-color: #ffffff;
  min-height: 100px;
}

.card-empty {
  border-color: #bbf7d0 !important;
  background-color: #f0fdf4;
}
.card-empty:hover {
  background-color: #dcfce7;
  transform: translateY(-2px);
}

.card-occupied {
  border-color: #fecaca !important;
  background-color: #fef2f2;
}
.card-occupied:hover {
  background-color: #fee2e2;
  transform: translateY(-2px);
}

.selected-table {
  box-shadow:
    0 0 0 3px #3b82f6,
    0 8px 16px rgba(59, 130, 246, 0.2) !important;
  border-color: transparent !important;
  background-color: #eff6ff !important;
}

.selected-takeaway .card-body {
  box-shadow:
    0 0 0 3px #f59e0b,
    0 8px 16px rgba(245, 158, 11, 0.2) !important;
  background-color: #fffbeb !important;
}

.transform-active {
  transform: translateY(-4px) scale(1.02);
  z-index: 10;
}

.takeaway-card .card-body {
  transition: all 0.2s;
}
.takeaway-card:hover .card-body {
  background-color: #fffbeb !important;
  transform: translateY(-2px);
}

.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
