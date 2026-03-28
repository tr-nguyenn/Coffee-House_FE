<template>
  <div class="admin-content-inner">
    <BaseToolbar
      placeholder="Tìm tên hoặc email nhân viên..."
      btnLabel="THÊM NHÂN VIÊN MỚI"
      @search="onSearch"
      @add="openModal"
    />

    <BaseTable
      :columns="staffCols"
      :items="staffs"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      @edit="openModal"
      @delete="handleDelete"
    >
      <template #col-fullName="{item}">
        <span class="text-warning fw-semibold">{{ item.fullName }}</span>
      </template>
      <template #col-email="{item}">
        <span>{{ item.email }}</span>
      </template>
      <template #col-phoneNumber="{item}">
        <span>{{ item.phoneNumber }}</span>
      </template>
      <template #col-roles="{item}">
        <span class="badge me-1 mb-1" :class="getRoleBadgeClass(role)" v-for="role in item.roles" :key="role">
          {{ role }}
        </span>
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

    <StaffModal ref="modalRef" @saved="fetchData(paging.pageNumber)" />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import type {Staff} from "@/models/Staff";
import type {PagingInfo, TableColumn} from "@/types";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import StaffModal from "@/components/admin/StaffModal.vue";
import {staffService} from "@/services/StaffService";
import {toast} from "@/utils/toast";
import {confirmDelete} from "@/utils/swal";

const staffCols: TableColumn[] = [
  {label: "Tên nhân viên", key: "fullName", width: "25%"},
  {label: "Email", key: "email", width: "25%"},
  {label: "Số điện thoại", key: "phoneNumber"},
  {label: "Quyền", key: "roles"},
];

const staffs = ref<Staff[]>([]);
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

const getRoleBadgeClass = (role: string) => {
  return role === "Admin" ? "bg-danger text-light" : "bg-primary text-light";
};

// 4. Các hàm xử lý dữ liệu
const fetchData = async (page = 1) => {
  loading.value = true;
  paging.pageNumber = page;
  try {
    const result = await staffService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      search: searchKeyword.value,
    });

    const data = result.data || result;
    staffs.value = data.items || [];
    paging.totalCount = data.totalCount || 0;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu nhân viên:", error);
    toast.error("Không thể tải danh sách nhân viên.");
  } finally {
    loading.value = false;
  }
};

// 5. Xử lý sự kiện từ UI
let searchTimeout: ReturnType<typeof setTimeout>;
const onSearch = (value: string) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchKeyword.value = value;
    fetchData(1);
  }, 500);
};

const openModal = (item?: Staff) => {
  modalRef.value?.show(item);
};

const handleDelete = async (id: string) => {
  const result = await confirmDelete("Xóa nhân viên?", "Nhân viên sẽ bị xóa khỏi hệ thống mãi mãi!");
  if (result.isConfirmed) {
    try {
      await staffService.delete(id);
      await fetchData(paging.pageNumber);
      toast.success("Xóa nhân viên thành công!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể xóa nhân viên.";
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
.badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.85rem;
}
</style>
