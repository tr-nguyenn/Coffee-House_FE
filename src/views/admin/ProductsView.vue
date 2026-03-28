<template>
  <div class="admin-content-inner">
    <BaseToolbar placeholder="Tìm tên sản phẩm..." btnLabel="Thêm sản phẩm" @search="onSearch" @add="openModal" />

    <BaseTable
      :columns="productCols"
      :items="products"
      :currentPage="paging.pageNumber"
      :pageSize="paging.pageSize"
      @edit="openModal"
      @delete="handleDelete"
      @row-click="openDetail"
    >
      <template #col-name="{item}">
        <span class="fw-bold product-name-link">
          {{ item.name }}
        </span>
      </template>
      <template #col-price="{item}">
        <span class="fw-bold">{{ formatVND(item.price) }}</span>
      </template>
      <template #col-category="{item}">
        <span>{{ item.categoryName || "Chi tiết..." }}</span>
      </template>
      <template #col-status="{item}">
        <div @click.stop="handleToggleStatus(item)" class="status-badge-wrapper d-flex justify-content-center">
          <span
            v-if="item.isAvailable"
            class="badge rounded-pill bg-success bg-opacity-10 text-success border border-success px-3 py-2 fw-bold custom-hover-badge"
          >
            <i class="bi bi-check-circle-fill me-1"></i> Đang bán
          </span>
          <span v-else class="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2 fw-bold custom-hover-badge">
            <i class="bi bi-slash-circle-fill me-1"></i> Ngừng bán
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

    <ProductModal ref="modalRef" @saved="fetchData(paging.pageNumber)" />

    <ProductDetailDrawer ref="detailDrawerRef" @edit="openModal" @delete="handleDelete" />
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import {toast} from "@/utils/toast";
import {confirmDelete} from "@/utils/swal";
import {formatVND} from "@/utils/helpers";
import type {PagingInfo, TableColumn} from "@/types";
import {productService} from "@/services/ProductService";
import type {Product} from "@/models/Product";
import BaseToolbar from "@/components/admin/shared/BaseToolbar.vue";
import BaseTable from "@/components/admin/shared/BaseTable.vue";
import BasePagination from "@/components/admin/shared/BasePagination.vue";
import ProductModal from "@/components/admin/ProductModal.vue";
import ProductDetailDrawer from "@/components/admin/ProductDetailDrawer.vue";

const productCols: TableColumn[] = [
  {label: "Tên sản phẩm", key: "name"},
  {label: "Giá bán", key: "price"},
  {label: "Danh mục", key: "category"},
  {label: "Trạng thái", key: "status"},
];

const products = ref<Product[]>([]);
const loading = ref(false);
const modalRef = ref();
const detailDrawerRef = ref();
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
    const result = await productService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
      search: searchKeyword.value,
    });

    const data = result.data || result;
    products.value = data.items || [];
    console.log(products.value);
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

const openModal = (item?: Product) => {
  modalRef.value?.show(item);
};
const openDetail = (item: Product) => {
  detailDrawerRef.value?.show(item);
};

const handleDelete = async (id: string) => {
  const result = await confirmDelete("Xóa sản phẩm?", "Hành động này không thể hoàn tác!");
  if (result.isConfirmed) {
    try {
      await productService.delete(id);
      await fetchData(paging.pageNumber);
      toast.success("Xóa sản phẩm thành công!");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm. Có thể xảy ra lỗi phía server.");
    }
  }
};

const handleToggleStatus = async (item: any) => {
  const oldStatus = item.isAvailable;
  const newStatus = !oldStatus;
  item.isAvailable = newStatus;

  try {
    await productService.update(item.id, {...item, isAvailable: newStatus});
    toast.success(`Đã ${newStatus ? "mở" : "tắt mở"} bán sản phẩm: ${item.name}`);
  } catch (error: any) {
    console.error("Lỗi khi đổi trạng thái:", error);
    item.isAvailable = oldStatus;
    toast.error("Có lỗi xảy ra, không thể đổi trạng thái!");
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
.product-name-link {
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 4px;
  transition: all 0.3s ease;
}

:deep(.clickable-row:hover) .product-name-link {
  text-decoration-color: #ffc107;
}

:deep(.clickable-row:hover) td {
  background-color: rgba(255, 193, 7, 0.05) !important;
}

.status-badge-wrapper {
  display: inline-block;
  cursor: pointer;
}

.custom-hover-badge {
  transition: all 0.2s ease-in-out;
  user-select: none;
}

.status-badge-wrapper:hover .custom-hover-badge {
  transform: translateY(-2px);
  box-shadow:
    0 4px 6px -1px rgba(216, 12, 12, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  filter: brightness(0.95);
}

.status-badge-wrapper:active .custom-hover-badge {
  transform: translateY(0);
}
</style>
