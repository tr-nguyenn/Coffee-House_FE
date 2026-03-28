<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import ProductCard from '@/components/ProductCard.vue';
import HomeHero from '@/components/HomeHero.vue';
import VoucherCard from '@/components/VoucherCard.vue';
import type { Product } from '@/models/Product';
import type { PagingInfo } from '@/types';
import { productService } from '@/services/ProductService';

const promotions = ref([
  { id: 1, title: 'Giảm 20% Đơn Đầu Tiên', description: 'Áp dụng cho khách hàng mới khi mua các sản phẩm Cà phê truyền thống.', code: 'NEW20', discount: '20%', validUntil: '30/11/2026' },
  { id: 2, title: 'Mua 2 Tặng 1', description: 'Khi mua 2 ly Trà trái cây bất kỳ, tặng ngay 1 ly cỡ nhỏ.', code: 'B2G1FREE', discount: '100% Ly 3', validUntil: '15/12/2026' },
  { id: 3, title: 'Flash Sale Cuối Tuần', description: 'Giảm giá cực sốc vào thứ Bảy và Chủ Nhật cho toàn bộ sản phẩm đá xay.', code: 'WEEKEND50', discount: '50K', validUntil: 'Mỗi cuối tuần' }
]);

const products = ref<Product[]>([]);
const loading = ref(false);

const paging = reactive<PagingInfo>({
  pageNumber: 1,
  pageSize: 8, 
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false
});

const fetchProducts = async (page = 1) => {
  loading.value = true;
  paging.pageNumber = page;
  try {
    const response = await productService.getAll({
      pageNumber: paging.pageNumber,
      pageSize: paging.pageSize
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
  <div class="home bg-dark" style="min-height: 100vh;">
    <HomeHero />

    <!-- Khuyến mãi Section -->
    <section class="promotions py-5 bg-dark border-bottom border-secondary border-opacity-25">
      <div class="container py-3">
        <div class="d-flex align-items-center mb-4">
          <i class="bi bi-gift-fill text-warning fs-3 me-3"></i>
          <h3 class="fw-bold text-white mb-0">Khuyến mãi & Ưu đãi đặc biệt</h3>
        </div>
        
        <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
          <div class="col" v-for="promo in promotions" :key="promo.id">
            <VoucherCard 
              :title="promo.title"
              :description="promo.description"
              :code="promo.code"
              :discount="promo.discount"
              :valid-until="promo.validUntil"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Sản phẩm nổi bật Section -->
    <section class="featured-products py-4 bg-dark text-light">
      <div class="container py-4">
        <div class="text-center mb-5">
          <h2 class="display-5 fw-bold mb-3 text-white">Sản phẩm nổi bật</h2>
          <div class="d-flex justify-content-center">
            <div class="divider bg-warning rounded-pill"></div>
          </div>
          <p class="text-light opacity-75 mt-2">Những thức uống được khách hàng yêu thích nhất tại không gian của chúng tôi.</p>
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
        
        <!-- Phân trang (Pagination) -->
        <div v-if="paging.totalPages > 1 && !loading" class="d-flex justify-content-center mt-5">
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-lg mb-0">
              <li class="page-item" :class="{ disabled: !paging.hasPreviousPage }">
                <button class="page-link shadow-sm bg-dark text-light border-secondary hover-bg-light" @click="changePage(paging.pageNumber - 1)" aria-label="Previous">
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              
              <li 
                class="page-item" 
                v-for="page in displayedPages" 
                :key="page" 
                :class="{ active: page === paging.pageNumber }"
              >
                <button class="page-link shadow-sm border-secondary" @click="changePage(page)">{{ page }}</button>
              </li>             
              <li class="page-item" :class="{ disabled: !paging.hasNextPage }">
                <button class="page-link shadow-sm bg-dark text-light border-secondary hover-bg-light" @click="changePage(paging.pageNumber + 1)" aria-label="Next">
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
        <div class="text-center mt-5">
          <router-link to="/menu" class="btn btn-warning text-dark fw-bold btn-lg px-5 rounded-pill hover-lift shadow">
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15) !important;
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