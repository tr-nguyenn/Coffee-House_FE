<template>
  <div class="admin-content-inner">
    <BaseToolbar
      placeholder="Tìm mã voucher..."
      btnLabel="Tạo Voucher mới"
      @search="onSearch"
      @add="openModal"
    />

    <BaseTable
      :columns="voucherCols"
      :items="vouchers"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      @edit="openModal"
      @delete="handleDelete"
    >
      <!-- Cột Mã voucher -->
      <template #col-code="{item}">
        <span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-2 py-1" style="font-size: 0.85rem">
          {{ item.code }}
        </span>
      </template>

      <!-- Cột Loại giảm giá + Giá trị -->
      <template #col-discountInfo="{item}">
        <div class="d-flex align-items-center gap-1">
          <span
            class="badge"
            :class="item.discountType === 'Percentage' ? 'bg-info bg-opacity-10 text-info' : 'bg-success bg-opacity-10 text-success'"
          >
            {{ item.discountType === 'Percentage' ? '%' : 'VNĐ' }}
          </span>
          <span class="fw-bold text-dark">
            {{ item.discountType === 'Percentage' ? `${item.discountValue}%` : formatVND(item.discountValue) }}
          </span>
          <span v-if="item.discountType === 'Percentage' && item.maxDiscountAmount" class="text-muted small">
            (tối đa {{ formatVND(item.maxDiscountAmount) }})
          </span>
        </div>
      </template>

      <!-- Cột Thời hạn -->
      <template #col-period="{item}">
        <div class="small">
          <div><i class="bi bi-calendar-event text-muted me-1"></i>{{ formatDate(item.startDate) }}</div>
          <div><i class="bi bi-calendar-x text-muted me-1"></i>{{ formatDate(item.expiryDate) }}</div>
        </div>
      </template>

      <!-- Cột Đơn tối thiểu -->
      <template #col-minOrderAmount="{item}">
        <span class="text-dark fw-semibold">{{ formatVND(item.minOrderAmount) }}</span>
      </template>

      <!-- Cột Lượt dùng -->
      <template #col-usage="{item}">
        <div class="d-flex align-items-center gap-1">
          <div
            class="progress flex-grow-1"
            style="height: 7px; width: 80px; background-color: #e5e7eb"
          >
            <div
              class="progress-bar"
              :class="item.usedCount >= item.usageLimit ? 'bg-danger' : 'bg-primary'"
              :style="{width: Math.min((item.usedCount / item.usageLimit) * 100, 100) + '%'}"
            ></div>
          </div>
          <span class="small fw-semibold text-dark">{{ item.usedCount }}/{{ item.usageLimit }}</span>
        </div>
      </template>

      <!-- Cột Toggle Trạng thái -->
      <template #col-isActive="{item}">
        <div class="form-check form-switch mb-0">
          <input
            class="form-check-input cursor-pointer"
            type="checkbox"
            role="switch"
            :checked="item.isActive"
            @change="handleToggle(item)"
          />
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

    <VoucherModal ref="modalRef" @saved="fetchData(paging.pageNumber)" />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import type {PagingInfo, TableColumn} from "@/types";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import VoucherModal from "@/components/admin/VoucherModal.vue";
import {voucherService} from "@/services/VoucherService";
import type {VoucherDto} from "@/services/VoucherService";
import {toast} from "@/utils/toast";
import {confirmDelete} from "@/utils/swal";
import {formatVND} from "@/utils/helpers";

const voucherCols: TableColumn[] = [
  {label: "Mã Voucher", key: "code"},
  {label: "Giảm giá", key: "discountInfo"},
  {label: "Đơn tối thiểu", key: "minOrderAmount"},
  {label: "Thời hạn", key: "period"},
  {label: "Lượt dùng", key: "usage"},
  {label: "Trạng thái", key: "isActive"},
];

const vouchers = ref<VoucherDto[]>([]);
const loading = ref(false);
const modalRef = ref();
const searchKeyword = ref("");

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

const fetchData = async (page = 1) => {
  loading.value = true;
  paging.pageNumber = page;
  try {
    const result = await voucherService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      search: searchKeyword.value,
    });

    const data = result.data || result;
    vouchers.value = data.items || [];
    paging.totalCount = data.totalCount || 0;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
  } finally {
    loading.value = false;
  }
};

let searchTimeout: ReturnType<typeof setTimeout>;
const onSearch = (value: string) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchKeyword.value = value;
    fetchData(1);
  }, 500);
};

const openModal = (item?: VoucherDto) => {
  modalRef.value?.show(item);
};

const handleDelete = async (id: string) => {
  const result = await confirmDelete("Xóa voucher này?", "Voucher chưa có lượt sử dụng mới xóa được.");
  if (result.isConfirmed) {
    try {
      await voucherService.delete(id);
      await fetchData(paging.pageNumber);
      toast.success("Xóa voucher thành công!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể xóa voucher này.";
      toast.error(msg);
    }
  }
};

const handleToggle = async (item: VoucherDto) => {
  try {
    await voucherService.toggleActive(item.id);
    item.isActive = !item.isActive;
    toast.success(item.isActive ? "Đã kích hoạt voucher" : "Đã vô hiệu hóa voucher");
  } catch (error: any) {
    const msg = error.response?.data?.message || "Có lỗi xảy ra";
    toast.error(msg);
  }
};

const handlePageChange = (newPage: number) => {
  fetchData(newPage);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.form-check-input:checked {
  background-color: #10b981;
  border-color: #10b981;
}
</style>
