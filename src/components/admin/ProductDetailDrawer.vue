<template>
  <div class="offcanvas-wrapper" :class="{'is-open': isOpen}">
    <div class="offcanvas-backdrop fade" :class="{show: isOpen}" @click="hide" v-if="isOpen"></div>

    <div class="offcanvas offcanvas-end" :class="{show: isOpen}" tabindex="-1">
      <!-- Header -->
      <div class="offcanvas-header px-3 py-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <div class="rounded-2 d-flex align-items-center justify-content-center bg-primary text-white" style="width: 30px; height: 30px">
            <i class="bi bi-box-seam" style="font-size: 0.8rem"></i>
          </div>
          <h6 class="mb-0 fw-bold text-dark">Chi tiết sản phẩm</h6>
        </div>
        <button type="button" class="btn-close" @click="hide"></button>
      </div>

      <!-- Body -->
      <div class="offcanvas-body p-0" v-if="product">
        <!-- Image -->
        <div class="position-relative overflow-hidden" style="height: 200px; background: #f8f9fa">
          <img v-if="product.imageUrl" :src="`${baseUrl}/${product.imageUrl}`" :alt="product.name" class="w-100 h-100 object-fit-cover" />
          <div v-else class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-secondary">
            <i class="bi bi-image mb-1" style="font-size: 2.2rem; opacity: 0.35"></i>
            <small class="fw-semibold opacity-50">Chưa có hình ảnh</small>
          </div>

          <span
            v-if="product.isAvailable"
            class="position-absolute top-0 end-0 m-2 badge d-flex align-items-center gap-1 px-2 py-1 rounded-pill border border-success text-success bg-white shadow-sm"
            style="font-size: 0.7rem"
          >
            <span class="rounded-circle bg-success d-inline-block" style="width: 6px; height: 6px"></span>
            Đang bán
          </span>
          <span
            v-else
            class="position-absolute top-0 end-0 m-2 badge d-flex align-items-center gap-1 px-2 py-1 rounded-pill border border-danger text-danger bg-white shadow-sm"
            style="font-size: 0.7rem"
          >
            <span class="rounded-circle bg-danger d-inline-block" style="width: 6px; height: 6px"></span>
            Ngừng bán
          </span>
        </div>

        <!-- Info -->
        <div class="px-3 pt-3 pb-2">
          <span
            class="badge bg-light text-secondary border rounded-pill px-2 py-1 mb-2 d-inline-flex align-items-center gap-1"
            style="font-size: 0.68rem; letter-spacing: 0.4px"
          >
            <i class="bi bi-tag opacity-75"></i>
            {{ product.categoryName || "Chưa phân loại" }}
          </span>

          <h5 class="fw-bold text-dark mb-3" style="line-height: 1.3">{{ product.name }}</h5>

          <div
            class="d-flex align-items-center justify-content-between rounded-3 px-3 py-2 border"
            style="background: #eef2ff; border-color: #c7d2fe !important"
          >
            <span class="text-uppercase fw-bold text-primary opacity-75" style="font-size: 0.68rem; letter-spacing: 0.5px">Giá bán</span>
            <span class="fw-bold text-primary" style="font-size: 1.25rem">{{ formatVND(product.price) }}</span>
          </div>
        </div>

        <hr class="mx-3 my-2 border-secondary border-opacity-10" />

        <!-- Description -->
        <div class="px-3 pb-3">
          <p class="text-uppercase fw-bold text-secondary mb-2 d-flex align-items-center gap-1" style="font-size: 0.68rem; letter-spacing: 0.6px">
            <i class="bi bi-align-left"></i> Mô tả sản phẩm
          </p>
          <div class="rounded-3 p-3 border bg-light">
            <p class="text-secondary mb-0" style="font-size: 0.875rem; line-height: 1.65; white-space: pre-line">
              {{ product.description || "Sản phẩm này chưa có mô tả chi tiết." }}
            </p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-3 border-top bg-light">
        <div class="d-flex gap-2">
          <button
            class="btn btn-outline-danger flex-grow-1 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
            style="font-size: 0.85rem"
            @click="onDelete"
          >
            <i class="bi bi-trash3"></i> Xóa
          </button>
          <button
            class="btn btn-primary flex-grow-1 fw-semibold d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
            style="font-size: 0.85rem"
            @click="onEdit"
          >
            <i class="bi bi-pencil"></i> Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import type {Product} from "@/models/Product";

const isOpen = ref(false);
const product = ref<Product | null>(null);
const baseUrl = import.meta.env.VITE_API_BASE_URL;
const emit = defineEmits(["edit", "delete"]);

const formatVND = (price?: number) => {
  if (price === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(price);
};

const show = (data: Product) => {
  product.value = data;
  isOpen.value = true;
};

const hide = () => {
  isOpen.value = false;
};

const onEdit = () => {
  if (product.value) {
    emit("edit", product.value);
    hide();
  }
};

const onDelete = () => {
  if (product.value?.id) {
    emit("delete", product.value.id);
  }
};

defineExpose({show, hide});
</script>

<style scoped>
.offcanvas-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 1050;
}
.offcanvas-wrapper.is-open {
  width: 100vw;
  height: 100vh;
}

.offcanvas-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 15, 25, 0.45);
  opacity: 0;
  transition: opacity 0.25s ease;
}
.offcanvas-backdrop.show {
  opacity: 1;
}

.offcanvas-end {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 100%;
  background: #fff;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -6px 0 24px rgba(0, 0, 0, 0.1);
}
.offcanvas-end.show {
  transform: translateX(0);
}

.offcanvas-body {
  flex: 1;
  overflow-y: auto;
}
.offcanvas-body::-webkit-scrollbar {
  width: 4px;
}
.offcanvas-body::-webkit-scrollbar-track {
  background: transparent;
}
.offcanvas-body::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 4px;
}

@media (max-width: 576px) {
  .offcanvas-end {
    width: 100%;
  }
}
</style>
