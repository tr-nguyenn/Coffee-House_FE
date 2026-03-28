<template>
  <div class="admin-content-inner d-flex flex-column h-100">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div class="d-flex align-items-center gap-3">
        <div class="btn-group bg-white rounded-3 shadow-sm p-1" role="group">
          <button
            type="button"
            class="btn btn-sm rounded-2 px-3 fw-semibold d-flex align-items-center gap-2"
            :class="viewMode === 'map' ? 'btn-warning text-dark' : 'btn-white text-secondary'"
            @click="viewMode = 'map'"
          >
            <i class="bi bi-grid-fill"></i> Sơ đồ
          </button>
          <button
            type="button"
            class="btn btn-sm rounded-2 px-3 fw-semibold d-flex align-items-center gap-2"
            :class="viewMode === 'list' ? 'btn-warning text-dark' : 'btn-white text-secondary'"
            @click="viewMode = 'list'"
          >
            <i class="bi bi-list-ul"></i> Danh sách
          </button>
        </div>
      </div>

      <button
        class="btn btn-warning fw-bold d-flex align-items-center gap-2 shadow-sm px-4"
        @click="openModal()"
      >
        <i class="bi bi-plus-circle"></i> THÊM BÀN MỚI
      </button>
    </div>

    <div v-if="viewMode === 'map'" class="map-view flex-grow-1 d-flex flex-column fade-in">
      <ul class="nav nav-pills mb-4 gap-2 custom-tabs">
        <li class="nav-item">
          <button
            class="nav-link rounded-pill px-4 fw-semibold"
            :class="{active: activeAreaId === 'all'}"
            @click="activeAreaId = 'all'"
          >
            Tất cả
          </button>
        </li>
        <li class="nav-item" v-for="area in areas" :key="area.id">
          <button
            class="nav-link rounded-pill px-4 fw-semibold"
            :class="{active: activeAreaId === area.id}"
            @click="activeAreaId = area.id"
          >
            {{ area.name }}
          </button>
        </li>
      </ul>

      <div class="table-grid-scroll flex-grow-1 pe-2 custom-scrollbar overflow-y-auto" style="height: 0">
        <div v-if="loadingMap" class="d-flex justify-content-center align-items-center h-100">
          <div class="spinner-border text-warning" role="status"></div>
        </div>

        <template v-else>
          <div
            v-for="group in tableGroups"
            :key="group.areaId"
            class="mb-5"
            v-show="activeAreaId === 'all' || activeAreaId === group.areaId"
          >
            <h5 class="fw-bold mb-4 text-dark border-start border-4 border-warning ps-3">
              {{ group.areaName }}
            </h5>

            <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 row-cols-xl-6 g-3">
              <div class="col" v-for="table in group.tables" :key="table.id">
                <div
                  class="table-card card h-100 shadow-sm cursor-pointer position-relative overflow-hidden"
                  :class="getCardClass(table.status)"
                  @click="handleTableClick(table)"
                >
                  <div class="card-body d-flex flex-column align-items-center justify-content-center p-3">
                    <div class="status-icon mb-2 transition-transform">
                      <i class="bi bi-check2-circle fs-3" v-if="getStatusText(table.status) === 'Trống'"></i>
                      <i
                        class="bi bi-cup-hot fs-3"
                        v-else-if="getStatusText(table.status) === 'Có khách'"
                      ></i>
                      <i class="bi bi-tools fs-3" v-else></i>
                    </div>

                    <h5 class="table-name fw-bolder mb-2">{{ table.name }}</h5>

                    <div class="d-flex flex-column align-items-center gap-1 mt-auto">
                      <span class="status-badge fw-bold rounded-pill font-monospace text-center">
                        {{ getStatusText(table.status) }}
                      </span>

                      <span
                        v-if="table.activeOrderTime && getStatusText(table.status) === 'Có khách'"
                        class="fw-bold mt-1"
                        style="font-size: 0.75rem; color: #dc2626"
                      >
                        <i class="bi bi-clock-history"></i> {{ getElapsedTime(table.activeOrderTime) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="group.tables.length === 0" class="col-12 text-muted fst-italic ps-3">
              Không có bàn nào trong khu vực này.
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-else class="list-view flex-grow-1 d-flex flex-column fade-in">
      <BaseToolbar
        placeholder="Tìm tên bàn..."
        btnLabel=""
        @search="onSearch"
        @add="openModal"
        class="mb-3 d-none"
      />

      <div class="d-flex mb-4">
        <div class="input-group bg-white rounded-3 shadow-sm border overflow-hidden" style="max-width: 350px">
          <span class="input-group-text bg-white border-0 text-muted ps-3"><i class="bi bi-search"></i></span>
          <input
            type="text"
            class="form-control border-0 shadow-none py-2"
            placeholder="Tìm kiếm tên bàn..."
            v-model="searchKeyword"
            @input="onSearchInput"
          />
        </div>
      </div>

      <div class="flex-grow-1 bg-white rounded-3 shadow-sm overflow-hidden d-flex flex-column">
        <BaseTable
          :columns="tableCols"
          :items="tablesPaginated"
          :currentPage="paging.pageNumber"
          :pageSize="paging.pageSize"
          @edit="openModal"
          @delete="handleDelete"
          class="flex-grow-1 border-0 m-0"
        >
          <template #col-name="{item}">
            <span class="fw-bold">{{ item.name }}</span>
          </template>
          <template #col-area="{item}">
            <span>{{ item.area?.name || item.areaName || "Chưa xếp" }}</span>
          </template>
          <template #col-status="{item}">
            <div class="d-flex justify-content-center align-items-center w-100">
              <span class="status-pill" :class="getListBadgeClass(item.status)">
                <span class="dot"></span>
                {{ getStatusText(item.status) }}
              </span>
            </div>
          </template>
        </BaseTable>

        <div class="p-3 border-top bg-light mt-auto">
          <BasePagination
            :total="paging.totalCount"
            :currentPage="paging.pageNumber"
            :pageSize="paging.pageSize"
            :from="pagingFrom"
            :to="pagingTo"
            @change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <TableModal ref="modalRef" @saved="handleSave" />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed, onUnmounted} from "vue";
import type {Table} from "@/models/Table";
import type {Area} from "@/models/Area";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import TableModal from "@/components/admin/TableModal.vue";
import {tableService} from "@/services/TableService";
import {areaService} from "@/services/AreaService";
import type {TableColumn} from "@/types";
import {toast} from "@/utils/toast";
import {confirmDelete} from "@/utils/swal";
import {usePagination} from "@/composables/usePagination";

const viewMode = ref<"map" | "list">("map");
const activeAreaId = ref<string | undefined>("all");
const modalRef = ref();

const areas = ref<Area[]>([]);
const allTables = ref<Table[]>([]);
const loadingMap = ref(false);

const tablesPaginated = ref<Table[]>([]);
const searchKeyword = ref("");
const tableCols: TableColumn[] = [
  {label: "Tên bàn", key: "name"},
  {label: "Khu vực", key: "area"},
  {label: "Trạng thái", key: "status"},
];

const {paging, pagingFrom, pagingTo} = usePagination(10);

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

  if (hours > 0) {
    return `${hours}g ${mins}p`;
  }
  return `${mins} phút`;
};

// Data Fetching
const fetchMapData = async () => {
  loadingMap.value = true;
  try {
    const resArea = await areaService.getAll();
    areas.value = resArea.data || resArea.items || resArea;

    const resTables = await tableService.getAll({pageNumber: 1, pageSize: 1000});
    const data = resTables.data || resTables;
    allTables.value = data.items || data;
  } catch (error) {
    console.error("Lỗi lấy dữ liệu sơ đồ:", error);
    toast.error("Không tải được sơ đồ bàn.");
  } finally {
    loadingMap.value = false;
  }
};

const fetchListData = async (page = 1) => {
  paging.pageNumber = page;
  try {
    const result = await tableService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      search: searchKeyword.value,
    });
    const data = result.data || result;
    tablesPaginated.value = data.items || [];
    paging.totalCount = data.totalCount || 0;
  } catch (error) {}
};

const tableGroups = computed(() => {
  const groups: {areaId: string | undefined; areaName: string; tables: Table[]}[] = [];

  if (areas.value && areas.value.length > 0) {
    areas.value.forEach((area) => {
      groups.push({
        areaId: area.id,
        areaName: area.name,
        tables: allTables.value
          .filter((t) => t.areaId === area.id)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      });
    });
  }

  const noAreaTables = allTables.value.filter((t) => !t.areaId);
  if (noAreaTables.length > 0) {
    groups.push({
      areaId: "none",
      areaName: "Chưa xếp khu vực",
      tables: noAreaTables,
    });
  }

  return groups;
});

// Helpers
const getStatusText = (status: number | undefined) => {
  if (status === 2 || status === 1) return "Có khách";
  return "Trống";
};

const getListBadgeClass = (status: number | undefined) => {
  const txt = getStatusText(status);
  if (txt === "Có khách") return "pill-occupied";
  if (txt === "Trống") return "pill-empty";
  return "pill-maintenance";
};

const getCardClass = (status: number | undefined) => {
  const txt = getStatusText(status);
  if (txt === "Có khách") return "card-occupied";
  if (txt === "Trống") return "card-empty";
  return "card-maintenance";
};

// Actions
let searchTimeout: ReturnType<typeof setTimeout>;
const onSearchInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchKeyword.value = val;
    fetchListData(1);
  }, 500);
};

const onSearch = (val: string) => {
  searchKeyword.value = val;
  fetchListData(1);
};

const openModal = (item?: Table) => {
  modalRef.value?.show(item);
};

const handleTableClick = (table: Table) => {
  openModal(table);
};

const handleDelete = async (id: string) => {
  const result = await confirmDelete("Xóa bàn?", "Bạn không thể xóa bàn đang có khách ngồi!");
  if (result.isConfirmed) {
    try {
      await tableService.delete(id);
      await fetchListData(paging.pageNumber);
      await fetchMapData();
      toast.success("Xóa bàn thành công!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa. Bàn có thể đang có sự cố.");
    }
  }
};

const handlePageChange = (newPage: number) => {
  fetchListData(newPage);
};

const handleSave = () => {
  fetchListData(paging.pageNumber);
  fetchMapData();
};

// Lifecycle
onMounted(() => {
  fetchMapData();
  fetchListData(1);

  timerInterval = setInterval(() => {
    currentTime.value = new Date();
  }, 30000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.custom-tabs .nav-link {
  color: #494b74;
  background-color: #fff;
  border: 1px solid #e4e6ef;
  transition: all 0.2s ease;
  min-width: 100px;
  text-align: center;
}
.custom-tabs .nav-link:hover {
  background-color: #f4f7fa;
  color: #1e1e2d;
  transform: translateY(-1px);
}
.custom-tabs .nav-link.active {
  background-color: #ffc107;
  color: #121212;
  border-color: #ffc107;
  box-shadow: 0 4px 10px rgba(255, 193, 7, 0.3);
}

.table-card {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-height: 115px;
  border-radius: 16px !important;
  border: 2px solid transparent !important;
}
.table-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}
.table-card:active {
  transform: translateY(-1px);
}
.table-card:hover .transition-transform {
  transform: scale(1.15);
}
.transition-transform {
  transition: transform 0.3s ease;
}

.card-empty {
  background-color: #f0fdf4 !important;
  border-color: #bbf7d0 !important;
}
.card-empty .status-icon i {
  color: #16a34a;
}
.card-empty .table-name {
  color: #166534;
}
.card-empty .status-badge {
  background-color: #dcfce7;
  color: #15803d;
  padding: 4px 12px;
  font-size: 0.75rem;
}

.card-occupied {
  background-color: #fef2f2 !important;
  border-color: #fecaca !important;
}
.card-occupied .status-icon i {
  color: #dc2626;
}
.card-occupied .table-name {
  color: #991b1b;
}
.card-occupied .status-badge {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 4px 12px;
  font-size: 0.75rem;
}

.card-maintenance {
  background-color: #f8fafc !important;
  border-color: #e2e8f0 !important;
}
.card-maintenance .status-icon i {
  color: #64748b;
}
.card-maintenance .table-name {
  color: #334155;
}
.card-maintenance .status-badge {
  background-color: #e2e8f0;
  color: #475569;
  padding: 4px 12px;
  font-size: 0.75rem;
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 50rem;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.status-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 4px currentColor;
}

.pill-empty {
  background-color: #dcfce7;
  color: #15803d;
}
.pill-empty .dot {
  background-color: #22c55e;
}

.pill-occupied {
  background-color: #fef2f2;
  color: #b91c1c;
}
.pill-occupied .dot {
  background-color: #ef4444;
}

.pill-maintenance {
  background-color: #e2e8f0;
  color: #475569;
}
.pill-maintenance .dot {
  background-color: #64748b;
}
</style>
