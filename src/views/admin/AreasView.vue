<template>
  <div class="admin-content-inner">
    <BaseToolbar
      placeholder="Tìm tên khu vực..."
      btnLabel="THÊM KHU VỰC MỚI"
      @search="onSearch"
      @add="openModal"
    />

    <BaseTable
      :columns="areaCols"
      :items="areas"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      @edit="openModal"
      @delete="handleDelete"
    >
      <template #col-name="{item}">
        <span class="fw-semibold">{{ item.name }}</span>
      </template>
      <template #col-displayOrder="{item}">
        <div class="d-flex justify-content-center align-items-center w-100">
          <span class="badge-order">{{ item.displayOrder ?? 0 }}</span>
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

    <AreaModal ref="modalRef" @saved="fetchData(paging.pageNumber)" />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from "vue";
import type {Area} from "@/models/Area";
import type {TableColumn} from "@/types";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import AreaModal from "@/components/admin/AreaModal.vue";
import {areaService} from "@/services/AreaService";
import {usePagination} from "@/composables/usePagination";
import {toast} from "@/utils/toast";
import {confirmDelete} from "@/utils/swal";

const areaCols: TableColumn[] = [
  {label: "Tên khu vực", key: "name"},
  {label: "Thứ tự hiện thị", key: "displayOrder"},
];

const areas = ref<Area[]>([]);
const loading = ref(false);
const modalRef = ref();
const searchKeyword = ref("");
const {paging, pagingFrom, pagingTo} = usePagination(10);

const fetchData = async (page = 1) => {
  loading.value = true;
  paging.pageNumber = page;
  try {
    const result = await areaService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      search: searchKeyword.value,
    });

    const data = result.data || result;
    areas.value = data.items || [];
    paging.totalCount = data.totalCount || 0;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu khu vực:", error);
    toast.error("Không thể tải danh sách khu vực.");
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

const openModal = (item?: Area) => {
  modalRef.value?.show(item);
};

const handleDelete = async (id: string) => {
  const result = await confirmDelete("Xóa khu vực?", "Bạn không thể xóa khu vực đang chứa bàn!");
  if (result.isConfirmed) {
    try {
      await areaService.delete(id);
      await fetchData(paging.pageNumber);
      toast.success("Xóa khu vực thành công!");
    } catch (error: any) {
      const msg = error.response?.data?.message || "Khu vực đang chứa bàn, không thể xóa.";
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
.badge-order {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  background-color: #eef2ff;
  color: #4f46e5;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(79, 70, 229, 0.05);
}
</style>
