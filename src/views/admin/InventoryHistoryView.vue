<template>
  <div class="admin-content-inner">
    <!-- Header Page -->
    <div class="d-flex justify-content-between align-items-center mb-4 ms-3">
      <h4 class="fw-bold mb-0 text-dark">
        {{ pageTitle }}
      </h4>
    </div>

    <div class="row g-4">
      <!-- Trai: Filters Section -->
      <div class="col-lg-2">
        <div class="card border-0 rounded-4 shadow-sm bg-white p-4 sticky-top" style="top: 20px; z-index: 10;">
          <h6 class="fw-bold mb-3 d-flex align-items-center text-dark">
            <i class="bi bi-funnel text-primary me-2"></i> BỘ LỌC TÌM KIẾM
          </h6>
          <hr class="text-secondary opacity-25 mt-0 mb-3" />

          <div class="mb-3">
            <label class="form-label small fw-bold text-secondary uppercase">Từ ngày</label>
            <input type="date" v-model="filters.fromDate" class="form-control bg-light border-0" @change="loadHistory" />
          </div>
          
          <div class="mb-3">
            <label class="form-label small fw-bold text-secondary uppercase">Đến ngày</label>
            <input type="date" v-model="filters.toDate" class="form-control bg-light border-0" @change="loadHistory" />
          </div>
          
          <div class="mb-4">
            <label class="form-label small fw-bold text-secondary uppercase">Vật tư</label>
            <select v-model="filters.materialId" class="form-select bg-light border-0" @change="loadHistory">
              <option value="">-- Tất cả vật tư --</option>
              <option v-for="m in materials" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          
          <div class="d-flex gap-2">
            <button class="btn btn-primary flex-grow-1 fw-medium shadow-sm py-2" @click="loadHistory">
              Áp dụng
            </button>
            <button class="btn btn-light fw-medium border shadow-sm text-secondary" @click="resetFilters" title="Đặt lại bộ lọc">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Phai: Table Section -->
      <div class="col-lg-10">
        <div class="card border-0 rounded-4 shadow-sm bg-white overflow-hidden mb-3">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 custom-table">
              <thead class="bg-light">
                <tr class="text-secondary small uppercase" style="letter-spacing: 0.5px;">
                  <th class="ps-4 py-3 border-bottom-0" style="width: 20%; font-weight: 600;">Thời Gian</th>
                  <th class="py-3 border-bottom-0" style="width: 25%; font-weight: 600;">Vật Tư</th>
                  <th class="text-end py-3 border-bottom-0" style="width: 15%; font-weight: 600;">Số Lượng</th>
                  <th class="text-end py-3 border-bottom-0" style="width: 15%; font-weight: 600;">Tồn Kho</th>
                  <th class="pe-4 py-3 border-bottom-0" style="width: 25%; font-weight: 600;">Ghi Chú</th>
                </tr>
              </thead>
              <tbody class="border-top-0">
                <tr v-if="isLoading">
                  <td colspan="5" class="text-center py-5 text-secondary">
                    <div class="spinner-border spinner-border-sm text-primary me-2"></div> Đang tải dữ liệu...
                  </td>
                </tr>
                
                <tr v-else-if="paginatedTransactions.length === 0">
                  <td colspan="5" class="text-center py-5">
                    <div class="text-muted mb-2"><i class="bi bi-clock-history fs-2"></i></div>
                    <span class="text-secondary">Không tìm thấy lịch sử giao dịch nào!</span>
                  </td>
                </tr>

                <tr v-else v-for="item in paginatedTransactions" :key="item.id">
                  <td class="ps-4 py-3 text-muted fw-medium">
                    {{ formatDate(item.createdAt) }}
                  </td>
                  <td class="py-3">
                    <span class="fw-bold text-dark">{{ item.materialName }}</span>
                  </td>
                  <td class="text-end py-3">
                    <span class="fw-bold" :class="item.quantityChanged > 0 ? 'text-success' : 'text-danger'">
                      {{ item.quantityChanged > 0 ? '+' : '' }}{{ formatNumber(item.quantityChanged) }}
                    </span>
                  </td>
                  <td class="text-end py-3 text-dark fw-medium">
                    {{ formatNumber(item.remainingQuantity) }}
                  </td>
                  <td class="pe-4 py-3">
                    <div class="text-muted small text-truncate" style="max-width: 200px" :title="item.note">
                      {{ item.note || '---' }}
                    </div>
                    <div v-if="item.referenceId" class="badge bg-light text-secondary border mt-1">
                      Mã: {{ item.referenceId }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <BasePagination
          class="mt-3"
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
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { inventoryService } from '@/services/InventoryService';
import { toast } from '@/utils/toast';
import type { PagingInfo } from "@/types";
import BasePagination from "@/components/admin/shared/BasePagination.vue";

const route = useRoute();
const isLoading = ref(false);
const transactions = ref<any[]>([]);
const materials = ref<any[]>([]);

// Page Type
const pageType = computed(() => route.meta.type as number);
const pageTitle = computed(() => pageType.value === 1 ? 'Lịch sử nhập hàng' : 'Lịch sử xuất hàng');

const filters = reactive({
  fromDate: '',
  toDate: '',
  materialId: ''
});

const paging = reactive<PagingInfo>({
  pageNumber: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
});

const pagingFrom = computed(() => paging.totalCount === 0 ? 0 : (paging.pageNumber - 1) * paging.pageSize + 1);
const pagingTo = computed(() => Math.min(paging.pageNumber * paging.pageSize, paging.totalCount));

const paginatedTransactions = computed(() => {
  const start = (paging.pageNumber - 1) * paging.pageSize;
  const end = start + paging.pageSize;
  return transactions.value.slice(start, end);
});

const loadInitialData = async () => {
  try {
    materials.value = await inventoryService.getMaterials();
  } catch (error) {
    console.error(error);
  }
};

const loadHistory = async () => {
  isLoading.value = true;
  try {
    const params: any = { type: pageType.value };
    if (filters.materialId) params.materialId = filters.materialId;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;

    const data = await inventoryService.getTransactions(params);
    transactions.value = data;
    paging.totalCount = data.length;
    
    // Reset to page 1 if currently out of bounds
    if (paging.pageNumber > Math.ceil(paging.totalCount / paging.pageSize) && paging.totalCount > 0) {
      paging.pageNumber = 1;
    }
  } catch (error) {
    toast.error("Không thể tải dữ liệu lịch sử.");
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = () => {
  filters.fromDate = '';
  filters.toDate = '';
  filters.materialId = '';
  paging.pageNumber = 1;
  loadHistory();
};

const handlePageChange = (newPage: number) => {
  paging.pageNumber = newPage;
};

// Theo dõi sự thay đổi route.meta.type để reload khi chuyển tab qua lại trên sidebar
watch(() => route.meta.type, () => {
  resetFilters();
});

onMounted(() => {
  loadInitialData();
  loadHistory();
});

const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit' }).format(d);
};
</script>

<style scoped>
.custom-table th {
  border-bottom: 2px solid #e9ecef;
  letter-spacing: 0.5px;
}
.custom-table td {
  padding: 1rem 0.5rem;
}
.uppercase {
  text-transform: uppercase;
  font-size: 0.8rem;
}
</style>
