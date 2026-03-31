<template>
  <div class="d-flex h-100 bg-light no-print">
    <OrderFilterSidebar @apply-filter="handleApplyFilter" />

    <div class="flex-grow-1 d-flex flex-column overflow-hidden p-2">
      <div
        class="p-3 bg-white border-bottom d-flex justify-content-between align-items-center flex-shrink-0 mx-3"
      >
        <h5 class="mb-0 fw-bold">Danh sách hóa đơn</h5>
        <button class="btn btn-sm btn-outline-success">
          <i class="bi bi-file-earmark-excel"></i> Xuất Excel
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
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from "vue";
import OrderFilterSidebar from "@/components/admin/OrderFilterSidebar.vue";
import OrderTableList from "@/components/admin//OrderTableList.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import PrintBill from "@/components/admin/shared/PrintBill.vue";
import {usePagination} from "@/composables/usePagination";
import {orderService} from "@/services/OrderService";
import {toast} from "@/utils/toast";

const isLoading = ref(false);
const orders = ref<any[]>([]);
const billToReprint = ref<any>(null);

const {paging, pagingFrom, pagingTo} = usePagination(20);

// Filter State (Lưu cục filter do Sidebar ném lên)
let activeFilters = {};

// HÀM 1: Bắt sự kiện lọc từ Sidebar
const handleApplyFilter = (filtersFromSidebar: any) => {
  activeFilters = filtersFromSidebar; // Cập nhật bộ lọc
  fetchOrders(1); // Gọi lại API từ trang 1
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

    const res = await orderService.getManagementOrders(params);
    const data = res.data || res;

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
  billToReprint.value = {...orderInfo, isProvisional: false};
  await nextTick();
  setTimeout(() => {
    window.print();
    billToReprint.value = null;
  }, 100);
};

// Khởi tạo
onMounted(() => {
  fetchOrders(1);
});
</script>
