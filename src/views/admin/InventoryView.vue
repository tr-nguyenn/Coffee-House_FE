<template>
  <div class="admin-content-inner">
    <BaseToolbar
      placeholder="Tìm tên vật tư..."
      btnLabel="Thêm vật tư"
      @search="onSearch"
      @add="openAddMaterialModal"
    />

    <BaseTable
      :columns="inventoryCols"
      :items="paginatedMaterials"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      @edit="openEditModal"
    >
      <template #col-name="{item}">
        <span class="fw-bold text-dark fs-6">{{ item.name }}</span>
      </template>

      <template #col-unit="{item}">
        <div class="d-flex justify-content-center">
          <span class="badge bg-light text-secondary border px-2 py-1">{{ item.unit }}</span>
        </div>
      </template>

      <template #col-stockQuantity="{item}">
        <div class="d-flex justify-content-end">
          <span class="fw-bold fs-5" :class="item.stockQuantity <= item.minStockLevel ? 'text-danger' : 'text-success'">
            {{ formatNumber(item.stockQuantity) }}
          </span>
        </div>
      </template>

      <template #col-minStockLevel="{item}">
        <div class="d-flex justify-content-end">
          <span class="text-muted fw-medium">{{ formatNumber(item.minStockLevel) }}</span>
        </div>
      </template>

      <template #col-status="{item}">
        <div class="d-flex justify-content-center">
          <span v-if="item.stockQuantity <= item.minStockLevel" class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1 rounded-2">
            <i class="bi bi-exclamation-triangle-fill me-1 small"></i> Sắp hết
          </span>
          <span v-else class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-2">
            <i class="bi bi-check-circle-fill me-1 small"></i> Ổn định
          </span>
        </div>
      </template>

      <template #col-actions="{item}">
        <div class="d-flex justify-content-end">
          <div class="btn-group shadow-sm rounded-3">
            <button class="btn btn-sm btn-light border" @click.stop="openEditModal(item)" title="Sửa thông tin" data-bs-toggle="tooltip">
              <i class="bi bi-pencil-square text-secondary"></i>
            </button>
            <button class="btn btn-sm btn-primary border-primary fw-medium" @click.stop="openImportModal(item)">
              <i class="bi bi-box-arrow-in-down me-1"></i> Nhập hàng
            </button>
          </div>
        </div>
      </template>
    </BaseTable>

    <BasePagination
      :total="paging.totalCount"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      :from="pagingFrom"
      :to="pagingTo"
      @change="handlePageChange"
    />

    <div v-if="showAddModal" class="modal fade show d-block modal-backdrop-custom">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Thêm Vật Tư Mới</h5>
            <button type="button" class="btn-close" @click="showAddModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitAddMaterial">
              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary uppercase">Tên vật tư</label>
                <input v-model="newMaterial.name" type="text" class="form-control form-control-lg bg-light border-0" required />
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label small fw-bold text-secondary uppercase">Đơn vị tính</label>
                  <input v-model="newMaterial.unit" type="text" class="form-control form-control-lg bg-light border-0" required />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label small fw-bold text-secondary uppercase">Mức cảnh báo</label>
                  <input v-model="newMaterial.minStockLevel" type="number" step="0.01" class="form-control form-control-lg bg-light border-0" min="0" required />
                </div>
              </div>
              <button type="submit" class="btn btn-warning w-100 py-3 fw-bold rounded-3 mt-2" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> XÁC NHẬN THÊM
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal fade show d-block modal-backdrop-custom">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Sửa Thông Tin Vật Tư</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitEditMaterial">
              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary uppercase">Tên vật tư</label>
                <input v-model="editMaterialData.name" type="text" class="form-control form-control-lg bg-light border-0" required />
              </div>
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label small fw-bold text-secondary uppercase">Đơn vị tính</label>
                  <input v-model="editMaterialData.unit" type="text" class="form-control form-control-lg bg-light border-0" required />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label small fw-bold text-secondary uppercase">Mức cảnh báo</label>
                  <input v-model="editMaterialData.minStockLevel" type="number" step="0.01" class="form-control form-control-lg bg-light border-0" min="0" required />
                </div>
              </div>
              <div class="alert alert-info small border-0 bg-primary bg-opacity-10 text-primary py-2">
                <i class="bi bi-info-circle-fill me-1"></i> Số lượng tồn kho chỉ được thay đổi qua "Nhập hàng".
              </div>
              <button type="submit" class="btn btn-primary w-100 py-3 fw-bold rounded-3 mt-2" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> LƯU THAY ĐỔI
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showImportModal" class="modal fade show d-block modal-backdrop-custom">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold">Nhập Kho: <span class="text-primary">{{ selectedMaterial?.name }}</span></h5>
            <button type="button" class="btn-close" @click="showImportModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitImportStock">
              <div class="row">
                <div class="col-6 mb-3">
                  <label class="form-label small fw-bold text-secondary uppercase">SL nhập ({{ selectedMaterial?.unit }})</label>
                  <input v-model="importData.quantity" type="number" step="0.01" class="form-control form-control-lg bg-light border-0" min="0.01" required />
                </div>
                <div class="col-6 mb-3">
                  <label class="form-label small fw-bold text-secondary uppercase">Giá vốn / 1 {{ selectedMaterial?.unit }}</label>
                  <input v-model="importData.costPerUnit" type="number" class="form-control form-control-lg bg-light border-0" min="0" required />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label small fw-bold text-secondary uppercase">Ghi chú (Tùy chọn)</label>
                <textarea v-model="importData.note" class="form-control form-control-lg bg-light border-0" rows="2"></textarea>
              </div>
              <button type="submit" class="btn btn-primary w-100 py-3 fw-bold rounded-3 mt-2" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-2"></span> LƯU PHIẾU NHẬP
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { inventoryService } from '@/services/InventoryService';
import { toast } from '@/utils/toast';
import type { TableColumn, PagingInfo } from "@/types";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";

const inventoryCols: TableColumn[] = [
  { label: "Tên Vật Tư", key: "name" },
  { label: "Đơn Vị", key: "unit", align: "center" },
  { label: "Tồn Kho Hiện Tại", key: "stockQuantity", align: "right" },
  { label: "Mức Cảnh Báo", key: "minStockLevel", align: "right" },
  { label: "Trạng Thái", key: "status", align: "center" },
  { label: "Thao Tác", key: "actions", align: "right" }
];

const materials = ref<any[]>([]);
const filteredMaterials = ref<any[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const searchKeyword = ref("");

const showAddModal = ref(false);
const showEditModal = ref(false);
const showImportModal = ref(false);

const newMaterial = reactive({ name: '', unit: '', minStockLevel: 0 });
const editMaterialData = reactive({ id: '', name: '', unit: '', minStockLevel: 0 });
const selectedMaterial = ref<any>(null);
const importData = reactive({ quantity: 0, costPerUnit: 0, note: '' });

const paging = reactive<PagingInfo>({
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
});

const pagingFrom = computed(() =>
  paging.totalCount === 0 ? 0 : (paging.pageNumber - 1) * paging.pageSize + 1,
);
const pagingTo = computed(() => Math.min(paging.pageNumber * paging.pageSize, paging.totalCount));

const paginatedMaterials = computed(() => {
  const start = (paging.pageNumber - 1) * paging.pageSize;
  const end = start + paging.pageSize;
  return filteredMaterials.value.slice(start, end);
});

const loadMaterials = async () => {
  isLoading.value = true;
  try {
    const data = await inventoryService.getMaterials();
    materials.value = data;
    filterData();
  } catch (error) {
    toast.error("Không thể tải dữ liệu kho hàng.");
  } finally {
    isLoading.value = false;
  }
};

const filterData = () => {
  if (!searchKeyword.value) {
    filteredMaterials.value = materials.value;
  } else {
    const keyword = searchKeyword.value.toLowerCase();
    filteredMaterials.value = materials.value.filter(m => 
      m.name.toLowerCase().includes(keyword)
    );
  }
  paging.totalCount = filteredMaterials.value.length;
  // Quay về trang 1 nếu lọc
  if (paging.pageNumber > Math.ceil(paging.totalCount / paging.pageSize) && paging.totalCount > 0) {
    paging.pageNumber = 1;
  }
};

let searchTimeout: ReturnType<typeof setTimeout>;
const onSearch = (value: string) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchKeyword.value = value;
    filterData();
  }, 300);
};

const handlePageChange = (newPage: number) => {
  paging.pageNumber = newPage;
};

onMounted(() => loadMaterials());

const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

// --- CÁC HÀM MỞ MODAL ---
const openAddMaterialModal = () => {
  newMaterial.name = ''; newMaterial.unit = ''; newMaterial.minStockLevel = 0;
  showAddModal.value = true;
};

const openEditModal = (item: any) => {
  editMaterialData.id = item.id;
  editMaterialData.name = item.name;
  editMaterialData.unit = item.unit;
  editMaterialData.minStockLevel = item.minStockLevel;
  showEditModal.value = true;
};

const openImportModal = (item: any) => {
  selectedMaterial.value = item;
  importData.quantity = 0; importData.costPerUnit = item.costPerUnit || 0; importData.note = '';
  showImportModal.value = true;
};

// --- CÁC HÀM SUBMIT ---
const submitAddMaterial = async () => {
  isSaving.value = true;
  try {
    await inventoryService.createMaterial(newMaterial);
    toast.success("Thêm vật tư thành công!");
    showAddModal.value = false;
    await loadMaterials();
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Lỗi khi thêm vật tư.");
  } finally {
    isSaving.value = false;
  }
};

const submitEditMaterial = async () => {
  isSaving.value = true;
  try {
    await inventoryService.updateMaterial(editMaterialData.id, {
      name: editMaterialData.name,
      unit: editMaterialData.unit,
      minStockLevel: editMaterialData.minStockLevel
    });
    toast.success("Cập nhật vật tư thành công!");
    showEditModal.value = false;
    await loadMaterials();
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Lỗi khi cập nhật vật tư.");
  } finally {
    isSaving.value = false;
  }
};

const submitImportStock = async () => {
  isSaving.value = true;
  try {
    await inventoryService.importStock({
      materialId: selectedMaterial.value.id,
      quantity: importData.quantity,
      costPerUnit: importData.costPerUnit,
      note: importData.note
    });
    toast.success("Nhập kho thành công!");
    showImportModal.value = false;
    await loadMaterials();
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Lỗi khi nhập kho.");
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.uppercase {
  text-transform: uppercase;
  font-size: 0.8rem;
}
.modal-backdrop-custom {
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1050;
}
</style>