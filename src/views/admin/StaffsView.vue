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
        <span class="fw-semibold">{{ item.fullName }}</span>
      </template>
      <template #col-email="{item}">
        <span>{{ item.email }}</span>
      </template>
      <template #col-phoneNumber="{item}">
        <span>{{ item.phoneNumber }}</span>
      </template>

      <template #col-roles="{item}">
        <div class="d-flex justify-content-center flex-wrap">
          <span
            class="role-badge me-1 mb-1"
            :class="getRoleBadgeClass(role)"
            v-for="role in Array.isArray(item.roles) ? item.roles : [item.roles]"
            :key="role"
          >
            <i class="bi me-1" :class="getRoleIcon(role)"></i>
            {{ formatRoleName(role) }}
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
  {label: "Tên nhân viên", key: "fullName"},
  {label: "Email", key: "email"},
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
  const map: Record<string, string> = {
    Admin: "role-admin",
    Staff: "role-staff",
    Kitchen: "role-kitchen",
  };
  return map[role] || "role-default";
};

const getRoleIcon = (role: string) => {
  const map: Record<string, string> = {
    Admin: "bi-shield-fill-check",
    Staff: "bi-person-badge-fill",
    Kitchen: "bi-fire",
  };
  return map[role] || "bi-person-fill";
};

const formatRoleName = (role: string) => {
  if (!role) return "Chưa cấp quyền";
  const map: Record<string, string> = {
    Admin: "Quản trị viên",
    Staff: "Nhân viên",
    Kitchen: "Bếp",
  };
  return map[role] || role;
};

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
.role-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 14px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.2px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.role-admin {
  background-color: #fff1f2;
  color: #e11d48;
  border-color: #fecdd3;
}

.role-staff {
  background-color: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.role-kitchen {
  background-color: #fffbeb;
  color: #d97706;
  border-color: #fde68a;
}

.role-default {
  background-color: #f3f4f6;
  color: #4b5563;
  border-color: #e5e7eb;
}
</style>
