<template>
  <div class="admin-content-inner">
    <BaseToolbar placeholder="Tìm tên loại sản phẩm..." btnLabel="Thêm loại mới" @search="onSearch" @add="openModal" />

    <BaseTable
      :columns="categoryCols"
      :items="categories"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      @edit="openModal"
      @delete="handleDelete"
    >
      <template #col-name="{item}">
        <span class="fw-semibold">{{ item.name }}</span>
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
    <CategoryModal ref="modalRef" @saved="fetchData(paging.pageNumber)" />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import type {Category} from "@/models/Category";
import type {PagingInfo, TableColumn} from "@/types";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import CategoryModal from "@/components/admin/CategoryModal.vue";
import {categoryService} from "@/services/CategoryService";
import {toast} from "@/utils/toast";
import {confirmDelete} from "@/utils/swal";

const categoryCols: TableColumn[] = [
  {label: "Tên loại sản phẩm", key: "name"},
  {label: "Mô tả chi tiết", key: "description"},
];

const categories = ref<Category[]>([]);
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

const pagingFrom = computed(() => (paging.totalCount === 0 ? 0 : (paging.pageNumber - 1) * paging.pageSize + 1));
const pagingTo = computed(() => Math.min(paging.pageNumber * paging.pageSize, paging.totalCount));

const fetchData = async (page = 1) => {
  loading.value = true;
  paging.pageNumber = page;
  try {
    const result = await categoryService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      search: searchKeyword.value,
    });

    const data = result.data || result;
    categories.value = data.items || [];
    paging.totalCount = data.totalCount || 0;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
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

const openModal = (item?: Category) => {
  modalRef.value?.show(item);
};

const handleDelete = async (id: string) => {
  const result = await confirmDelete("Xóa loại sản phẩm?", "Tất cả sản phẩm thuộc loại này cũng sẽ bị ảnh hưởng!");
  if (result.isConfirmed) {
    try {
      await categoryService.delete(id);
      await fetchData(paging.pageNumber);
      toast.success("Xóa loại sản phẩm thành công!");
    } catch (error) {
      toast.error("Không thể xóa. Có thể danh mục này đang chứa sản phẩm.");
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
