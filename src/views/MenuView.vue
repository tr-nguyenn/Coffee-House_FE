<template>
  <div class="menu-page bg-dark text-light min-vh-100 pb-5">
    <!-- Header banner -->
    <div class="container pt-5 pb-3">
      <div class="text-center mb-5 mt-4">
        <h2 class="display-5 fw-bold mb-3 text-white">Thực đơn của chúng tôi</h2>
        <div class="d-flex justify-content-center">
          <div class="divider bg-warning rounded-pill" style="height: 4px; width: 60px;"></div>
        </div>
        <p class="text-light opacity-75 mt-3 mx-auto" style="max-width: 800px;">
          Khám phá hương vị tuyệt vời từ những hạt cà phê rang xay nguyên chất và các thức uống trọn vị.
        </p>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- Sidebar filters -->
        <div class="col-lg-3 mb-4 mb-lg-0">
          <div class="card custom-dark-card shadow-sm sticky-top rounded-4" style="top: 100px; z-index: 10;">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-4 d-flex align-items-center text-white">
                <div class="icon-box bg-warning bg-opacity-10 text-warning rounded-3 me-3 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                  <i class="bi bi-funnel-fill"></i>
                </div>
                Danh mục
              </h5>
              
              <div v-if="loadingCategories" class="d-flex flex-column gap-2 mb-3">
                <div class="placeholder-glow" v-for="i in 5" :key="i">
                  <span class="placeholder col-12 rounded-3" style="height: 42px;"></span>
                </div>
              </div>

              <div v-else class="d-flex flex-column gap-2 menu-categories">
                <button 
                  class="btn text-start px-3 py-2 rounded-3 category-btn d-flex align-items-center" 
                  :class="{ 'active': selectedCategoryId === null }"
                  @click="selectCategory(null)"
                >
                  <i class="bi bi-grid-fill me-3 opacity-50 fs-5"></i>
                  <span class="fw-medium">Tất cả sản phẩm</span>
                </button>
                <button 
                  v-for="cat in categories" 
                  :key="cat.id"
                  class="btn text-start px-3 py-2 rounded-3 category-btn d-flex align-items-center"
                  :class="{ 'active': selectedCategoryId === cat.id }"
                  @click="selectCategory(cat.id)"
                >
                  <i class="bi bi-cup-hot-fill me-3 opacity-50 fs-5"></i>
                  <span class="fw-medium">{{ cat.name }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Product List -->
        <div class="col-lg-9">
          <!-- Search & Filter bar -->
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom border-secondary border-opacity-50">
            <h4 class="fw-bold mb-3 mb-md-0 d-flex align-items-center">
              <span v-if="searchQuery" class="text-white">Kết quả tìm kiếm: <span class="text-warning">"{{ searchQuery }}"</span></span>
              <span v-else-if="selectedCategoryName" class="text-white">{{ selectedCategoryName }}</span>
              <span v-else class="text-white">Tất cả sản phẩm</span>
              <span class="badge bg-secondary bg-opacity-25 text-light ms-3 rounded-pill fs-6 fw-normal px-3 py-2">
                {{ filteredProducts.length }} món
              </span>
            </h4>

            <div v-if="searchQuery || selectedCategoryId !== null" class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-danger rounded-pill px-3" @click="resetFilters">
                  <i class="bi bi-x-circle me-1"></i> Xóa bộ lọc
                </button>
            </div>
          </div>

          <!-- Loading state -->
          <div v-if="loadingProducts" class="row g-4">
             <div v-for="i in 6" :key="i" class="col-sm-6 col-md-4">
               <div class="card h-100 custom-dark-card shadow-sm rounded-4" aria-hidden="true">
                 <div class="placeholder-glow">
                   <div class="placeholder w-100 bg-secondary" style="height: 200px; border-top-left-radius: 16px; border-top-right-radius: 16px;"></div>
                 </div>
                 <div class="card-body p-4">
                   <h5 class="card-title placeholder-glow"><span class="placeholder col-6 rounded-pill bg-secondary"></span></h5>
                   <p class="card-text placeholder-glow">
                     <span class="placeholder col-7 rounded-pill bg-secondary"></span>
                     <span class="placeholder col-4 rounded-pill bg-secondary"></span>
                     <span class="placeholder col-4 rounded-pill bg-secondary"></span>
                   </p>
                 </div>
               </div>
             </div>
          </div>

          <!-- Empty state -->
          <div v-else-if="filteredProducts.length === 0" class="text-center py-5 custom-dark-card rounded-5 shadow-sm my-4" style="min-height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="bg-dark rounded-circle p-4 mb-4 border border-secondary border-opacity-50">
               <i class="bi bi-search display-4 text-light opacity-50 d-block"></i>
            </div>
            <h4 class="fw-bold text-white mb-2">Không tìm thấy món nào!</h4>
            <p class="text-light opacity-75 mb-4 px-3">Thử thay đổi từ khóa hoặc lựa chọn danh mục khác nhé.</p>
            <button class="btn btn-warning px-4 py-2 rounded-pill fw-bold shadow-sm" @click="resetFilters">
              Xem tất cả thực đơn
            </button>
          </div>

          <!-- Products grid -->
          <template v-else>
            <div class="row g-4 mb-4">
              <div v-for="product in paginatedProducts" :key="product.id" class="col-sm-6 col-xl-4">
                <div class="card h-100 shadow-sm product-card rounded-4 d-flex flex-column custom-dark-card" :class="{'opacity-75': !product.isAvailable}">
                  <div class="position-relative product-img-wrapper" style="background-color: #000;">
                    <img 
                       :src="getImageUrl(product.imageUrl)" 
                       class="card-img-top object-fit-cover w-100 h-100" 
                       alt="Hình sản phẩm"
                       @error="handleImageError"
                    >
                    <div class="position-absolute top-0 end-0 p-3">
                      <span 
                        v-if="!product.isAvailable" 
                        class="badge bg-danger shadow-sm px-3 py-2 rounded-pill fw-bold"
                      >Hết hàng</span>
                    </div>
                    <div class="product-overlay d-flex align-items-center justify-content-center">
                       <button class="btn btn-light rounded-circle shadow add-overlay-btn" :disabled="!product.isAvailable" title="Thêm vào giỏ hàng">
                          <i class="bi bi-cart-plus-fill fs-4 text-warning"></i>
                       </button>
                    </div>
                  </div>
                  
                  <div class="card-body p-4 d-flex flex-column flex-grow-1">
                    <div class="mb-2">
                       <span class="badge bg-warning text-dark px-2 py-1 mb-2 fw-medium">{{ product.categoryName || 'Thức uống' }}</span>
                    </div>
                    <h5 class="card-title fw-bold mb-2 text-white fs-5 product-title">{{ product.name }}</h5>
                    <p class="card-text text-light opacity-75 small flex-grow-1 line-clamp-2" :title="product.description || ''">
                      {{ product.description || 'Hương vị tuyệt hảo từ nhà trứ danh.' }}
                    </p>
                    
                    <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-50">
                      <div class="fw-bold fs-5" style="color: #d97706">{{ formatVND(product.price) }}</div>
                      <button class="btn btn-warning btn-sm rounded-circle shadow-sm add-btn d-flex align-items-center justify-content-center" :disabled="!product.isAvailable" style="width: 36px; height: 36px;">
                        <i class="bi bi-plus-lg fw-bold text-dark"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Phân trang (Pagination) -->
            <div v-if="totalPages > 1" class="d-flex justify-content-center mt-5 mb-4">
              <nav aria-label="Page navigation">
                <ul class="pagination pagination-lg mb-0">
                  <li class="page-item" :class="{disabled: currentPage === 1}">
                    <button
                      class="page-link shadow-sm bg-dark text-light border-secondary hover-bg-light"
                      @click="changePage(currentPage - 1)"
                      aria-label="Previous"
                    >
                      <span aria-hidden="true">&laquo;</span>
                    </button>
                  </li>

                  <li
                    class="page-item"
                    v-for="page in displayedPages"
                    :key="page"
                    :class="{active: page === currentPage}"
                  >
                    <button class="page-link shadow-sm border-secondary" @click="changePage(page)">
                      {{ page }}
                    </button>
                  </li>
                  <li class="page-item" :class="{disabled: currentPage === totalPages}">
                    <button
                      class="page-link shadow-sm bg-dark text-light border-secondary hover-bg-light"
                      @click="changePage(currentPage + 1)"
                      aria-label="Next"
                    >
                      <span aria-hidden="true">&raquo;</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { productService } from '@/services/ProductService';
import { categoryService } from '@/services/CategoryService';
import type { Product } from '@/models/Product';
import type { Category } from '@/models/Category';
import { formatVND } from '@/utils/helpers';

const route = useRoute();
const router = useRouter();

const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loadingProducts = ref(true);
const loadingCategories = ref(true);

const selectedCategoryId = ref<number | string | null>(null);
const searchQuery = ref<string>('');

// Fetch Data
const fetchCategories = async () => {
  loadingCategories.value = true;
  try {
    const catRes = await categoryService.getAll();
    categories.value = (catRes.data?.items || catRes.items || catRes.data || catRes) as Category[];
  } catch (error) {
    console.error('Error fetching categories:', error);
  } finally {
    loadingCategories.value = false;
  }
};

const fetchProducts = async () => {
  loadingProducts.value = true;
  try {
    const prodRes = await productService.getAll({ pageSize: 1000 }); // Try to get all products
    products.value = (prodRes.data?.items || prodRes.items || prodRes.data || prodRes) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    loadingProducts.value = false;
  }
};

// Handle Route Queries
const parseQueryParams = () => {
  if (route.query.q) {
    searchQuery.value = route.query.q as string;
  } else {
    searchQuery.value = '';
  }
  
  if (route.query.category) {
    selectedCategoryId.value = route.query.category as string;
  }
};

// On Mounted
onMounted(() => {
  parseQueryParams();
  fetchCategories();
  fetchProducts();
});

// Watch Route Changes
watch(() => route.query, () => {
  parseQueryParams();
}, { deep: true });

// Filtered Products Computed
const filteredProducts = computed(() => {
  let result = products.value;
  
  // Filter by search query
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q))
    );
  }
  
  // Filter by category
  if (selectedCategoryId.value !== null) {
    result = result.filter(p => p.categoryId.toString() === selectedCategoryId.value?.toString());
  }
  
  return result;
});

const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === null) return null;
  const cat = categories.value.find(c => c.id?.toString() === selectedCategoryId.value?.toString());
  return cat ? cat.name : null;
});

// Pagination computed
const currentPage = ref(1);
const pageSize = 12;

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / pageSize));

const displayedPages = computed(() => {
  const current = currentPage.value;
  const total = totalPages.value;
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

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredProducts.value.slice(start, end);
});

// Reset page on filter change
watch([searchQuery, selectedCategoryId], () => {
  currentPage.value = 1;
});

// Actions
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 300, behavior: 'smooth' });
};

const selectCategory = (id: number | string | null | undefined) => {
  selectedCategoryId.value = id ?? null;
  const query: any = { ...route.query };
  if (id) {
    query.category = id;
  } else {
    delete query.category;
  }
  
  router.push({ path: '/menu', query });
};

const resetFilters = () => {
  selectedCategoryId.value = null;
  searchQuery.value = '';
  router.push({ path: '/menu' });
};

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  target.src = 'https://placehold.co/400x400/eeeeee/999999?text=Coffee+House';
};

const getImageUrl = (url?: string | null) => {
  if (!url) return 'https://placehold.co/400x400/eeeeee/999999?text=Coffee+House';
  if (url.startsWith('http')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
</script>

<style scoped>
.custom-dark-card {
  background-color: #2b3035;
  color: #f8f9fa;
  border: 1px solid #495057 !important;
}

.category-btn {
  color: #adb5bd;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  background-color: transparent;
}
.category-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: #f8f9fa;
  transform: translateX(4px);
}
.category-btn.active {
  background-color: rgba(255, 193, 7, 0.15);
  color: #ffc107;
  border-color: rgba(255, 193, 7, 0.3);
  font-weight: 600;
}
.category-btn.active i {
  color: #ffc107;
  opacity: 1 !important;
}

.product-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  overflow: hidden;
}
.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.3) !important;
}

.product-img-wrapper {
  height: 220px;
  background-color: #000;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  overflow: hidden;
}
.product-img-wrapper img {
  transition: transform 0.5s ease;
}
.product-card:hover .product-img-wrapper img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.product-card:hover .product-overlay {
  opacity: 1;
}

.add-overlay-btn {
  transform: translateY(20px);
  transition: all 0.3s ease;
  width: 60px;
  height: 60px;
  border-color: transparent !important;
}
.product-card:hover .add-overlay-btn {
  transform: translateY(0);
}
.add-overlay-btn:hover {
  background-color: #ffc107 !important;
}
.add-overlay-btn:hover i {
  color: #212529 !important;
}

.product-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.add-btn {
  transition: all 0.2s;
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}
.add-btn:hover:not(:disabled) {
  transform: scale(1.1);
  background-color: #e0a800;
  border-color: #d39e00;
}

.pagination .page-link {
  background-color: #2b3035;
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
  background-color: #2b3035;
  color: #6c757d;
  border-color: #495057;
}
.hover-bg-light:hover:not(:disabled) {
  background-color: #343a40 !important;
}
</style>
