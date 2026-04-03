<template>
  <div class="h-100">
    
    <div class="d-flex h-100 bg-light no-print">
      <OrderFilterSidebar @apply-filter="handleApplyFilter" />

      <div class="flex-grow-1 d-flex flex-column overflow-hidden p-2">
        <div
          class="p-3 bg-white border-bottom d-flex justify-content-between align-items-center flex-shrink-0 mx-3"
        >
          <h5 class="mb-0 fw-bold">Danh sách hóa đơn</h5>
          <button
            class="btn btn-sm btn-outline-success"
            @click="handleExportExcel"
            :disabled="isExporting"
          >
            <span v-if="isExporting" class="spinner-border spinner-border-sm me-1" role="status"></span>
            <i v-else class="bi bi-file-earmark-excel"></i>
            {{ isExporting ? "Đang xuất..." : "Xuất Excel" }}
          </button>
        </div>

        <OrderTableList :orders="orders" :isLoading="isLoading" @reprint="handleReprint" />

        <div class="p-3 bg-white mx-3">
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

    <PrintBill :order="billToReprint" />

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import OrderFilterSidebar from "@/components/admin/OrderFilterSidebar.vue";
import OrderTableList from "@/components/admin/OrderTableList.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import PrintBill from "@/components/admin/shared/PrintBill.vue";
import { usePagination } from "@/composables/usePagination";
import { orderService } from "@/services/OrderService";
import { toast } from "@/utils/toast";

const isLoading = ref(false);
const orders = ref<any[]>([]);
const billToReprint = ref<any>(null);

const { paging, pagingFrom, pagingTo } = usePagination(20);

// Filter State (Lưu cục filter do Sidebar ném lên)
let activeFilters: any = {};

// HÀM 1: Bắt sự kiện lọc từ Sidebar (Nút "Áp dụng")
const handleApplyFilter = (filtersFromSidebar: any) => {
  activeFilters = filtersFromSidebar;
  fetchOrders(1); // Luôn reset về trang 1 khi thay đổi bộ lọc
};

// HÀM 2: Bắt sự kiện chuyển trang từ BasePagination
const handlePageChange = (newPage: number) => {
  fetchOrders(newPage);
};

// HÀM 3: Gọi API chính
const fetchOrders = async (page = 1) => {
  isLoading.value = true;
  paging.pageNumber = page;

  try {
    const params = {
      ...activeFilters,
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
    };

    const data = await orderService.getManagementOrders(params);

    orders.value = data.items || [];
    paging.totalCount = data.totalCount || 0;
  } catch (error) {
    toast.error("Không thể tải danh sách hóa đơn.");
  } finally {
    isLoading.value = false;
  }
};

// HÀM 4: Bắt sự kiện In từ TableList ném lên
const handleReprint = async (orderInfo: any) => {
  billToReprint.value = { ...orderInfo, isProvisional: false };
  await nextTick();
  setTimeout(() => {
    window.print();
    billToReprint.value = null;
  }, 100);
};

// HÀM 5: Xuất Excel
const isExporting = ref(false);
const handleExportExcel = async () => {
  if (isExporting.value) return;
  isExporting.value = true;
  toast.info("Đang tạo file Excel, vui lòng chờ...");

  try {
    const blob = await orderService.exportManagementOrdersExcel(activeFilters);

    // Tạo URL tạm & tự động tải xuống
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HoaDon_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Xuất Excel thành công!");
  } catch (error) {
    toast.error("Lỗi khi xuất Excel. Vui lòng thử lại!");
  } finally {
    isExporting.value = false;
  }
};
</script>