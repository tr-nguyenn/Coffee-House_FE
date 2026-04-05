<script setup lang="ts">
import {ref, reactive, onMounted, computed} from "vue";
import ProductCard from "@/components/ProductCard.vue";
import HomeHero from "@/components/HomeHero.vue";
import HomePromotions from "@/components/HomePromotions.vue";
import type {Product} from "@/models/Product";
import type {PagingInfo} from "@/types";
import {productService} from "@/services/ProductService";

const products = ref<Product[]>([]);
const loading = ref(false);

const paging = reactive<PagingInfo>({
  pageNumber: 1,
  pageSize: 16,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
});

const fetchProducts = async (page = 1) => {
  loading.value = true;
  paging.pageNumber = page;
  try {
    const response = await productService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize,
    });

    const data = response.data || response;
    products.value = data.items || [];

    paging.totalCount = data.totalCount || 0;
    paging.totalPages = data.totalPages || Math.ceil(paging.totalCount / paging.pageSize) || 0;
  } catch (error) {
    console.error("Lỗi khi tải danh sách sản phẩm:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

const changePage = (newPage: number) => {
  if (newPage < 1 || (paging.totalPages && newPage > paging.totalPages)) return;
  fetchProducts(newPage);
};

const displayedPages = computed(() => {
  const current = paging.pageNumber;
  const total = paging.totalPages || 0;
  const delta = 2;

  if (total <= 1) return [];

  let start = Math.max(1, current - delta);
  let end = Math.min(total, current + delta);

  if (current - start < delta) {
    end = Math.min(total, end + (delta - (current - start)));
  }
  if (end - current < delta) {
    start = Math.max(1, start - (delta - (end - current)));
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>

<template>
  <div class="home bg-dark" style="min-height: 100vh">
    <HomeHero />

    <!-- Khuyến mãi Section (Dynamic Component) -->
    <HomePromotions />

    <!-- Sản phẩm nổi bật Section -->
    <section class="featured-products py-4 bg-dark text-light">
      <div class="container py-4">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold mb-3 text-white">Sản phẩm nổi bật</h2>
          <div class="d-flex justify-content-center">
            <div class="divider bg-warning rounded-pill"></div>
          </div>
          <p class="text-light opacity-75 mt-2">
            Những thức uống được khách hàng yêu thích nhất tại không gian của chúng tôi.
          </p>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else-if="products.length === 0" class="text-center py-5 text-light opacity-75">
          <p>Hiện tại chưa có sản phẩm nào. Vui lòng quay lại sau!</p>
        </div>

        <div v-else class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 mt-2">
          <div class="col" v-for="product in products" :key="product.id">
            <ProductCard :product="product" />
          </div>
        </div>

        <div class="text-center mt-5">
          <router-link
            to="/menu"
            class="btn btn-warning text-dark fw-bold btn-lg px-5 rounded-pill hover-lift shadow"
          >
            Tất cả sản phẩm
            <i class="bi bi-arrow-right ms-2 text-dark"></i>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tracking-wider {
  letter-spacing: 0.1em;
}

.divider {
  height: 4px;
  width: 60px;
}

.hover-lift {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}

.pagination .page-link {
  background-color: #212529;
  color: #f8f9fa;
  border-color: #495057;
}
.pagination .page-item.active .page-link {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #1c1c1c;
  font-weight: bold;
}
.pagination .page-link:hover:not(.active) {
  background-color: #343a40 !important;
  color: #ffc107 !important;
  border-color: #495057;
}
.pagination .page-item.disabled .page-link {
  background-color: #212529;
  color: #6c757d;
  border-color: #495057;
}
</style>
