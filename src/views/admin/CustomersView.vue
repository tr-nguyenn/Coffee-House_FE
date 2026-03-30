<template>
  <div class="admin-content-inner">
    <BaseToolbar
      placeholder="Tìm tên hoặc SĐT khách hàng..."
      btnLabel="Thêm khách hàng mới"
      @search="onSearch"
      @add="openModal"
    />

    <BaseTable
      :columns="userCols"
      :items="users"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      @edit="openModal"
      @delete="handleDelete"
    >
      <template #col-fullName="{item}">
        <span class="fw-semibold">{{ item.fullName }}</span>
      </template>
      <template #col-phoneNumber="{item}">
        <span>{{ item.phoneNumber }}</span>
      </template>
      <template #col-rewardPoints="{item}">
        <div class="d-flex justify-content-center align-items-center">
          <span class="badge rounded-pill reward-badge">
            <i class="bi bi-star-fill me-1 text-warning"></i>
            {{ item.rewardPoints }} điểm
          </span>
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

    <CustomerModal ref="customerModalRef" @saved="fetchData(paging.pageNumber)" />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import type {Customer} from "@/models/Customer";
import type {PagingInfo, TableColumn} from "@/types";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import CustomerModal from "@/components/admin/CustomerModal.vue";
import {userService} from "@/services/CustomerService";
import {toast} from "@/utils/toast";
import {confirmDelete} from "@/utils/swal";

const userCols: TableColumn[] = [
  {label: "Tên khách hàng", key: "fullName", width: "35%"},
  {label: "Số điện thoại", key: "phoneNumber"},
  {label: "Điểm thưởng", key: "rewardPoints"},
];

const users = ref<Customer[]>([]);
const loading = ref(false);
const customerModalRef = ref();
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
    const result = await userService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      search: searchKeyword.value,
    });

    const data = result.data || result;
    users.value = data.items || [];
    paging.totalCount = data.totalCount || 0;
  } catch (error) {
    toast.error("Không thể tải danh sách khách hàng.");
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

const openModal = (item?: Customer) => {
  customerModalRef.value?.show(item);
};

const handleDelete = async (id: string) => {
  const result = await confirmDelete(
    "Khóa tài khoản?",
    "Khách hàng đã mua hàng sẽ không thể xóa, chỉ có thể khóa!",
  );
  if (result.isConfirmed) {
    try {
      await userService.delete(id);
      await fetchData(paging.pageNumber);
      toast.success("Đã xử lý khách hàng thành công!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể xóa khách hàng này.";
      toast.error(msg);
    }
  }
};

const handlePageChange = (newPage: number) => {
  fetchData(newPage);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.reward-badge {
  background-color: #f0f9ff;
  color: #0369a1;
  border: 1px solid #e0f2fe;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}

.reward-badge:hover {
  background-color: #e0f2fe;
  transform: scale(1.05);
}
</style>
