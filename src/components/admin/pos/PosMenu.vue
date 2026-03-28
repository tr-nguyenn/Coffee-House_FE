<template>
  <div
    class="d-flex flex-column h-100 bg-light position-relative overflow-hidden"
  >
    <div class="p-2 bg-white border-bottom shadow-sm flex-shrink-0 z-2">
      <div class="d-flex gap-2 align-items-center">
        <div
          class="input-group input-group-sm rounded-pill overflow-hidden border flex-grow-1 bg-light"
        >
          <span
            class="input-group-text bg-transparent border-0 pe-1 text-muted"
          >
            <i class="bi bi-search"></i>
          </span>
          <input
            type="text"
            class="form-control border-0 shadow-none bg-transparent"
            placeholder="Tìm món..."
            v-model="searchQuery"
          />
          <button
            class="btn btn-sm btn-transparent border-0 text-secondary"
            v-if="searchQuery"
            @click="searchQuery = ''"
          >
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>

        <button
          class="btn btn-sm rounded-pill d-flex align-items-center justify-content-center transition-all px-3"
          :class="
            selectedCategoryIds.length > 0
              ? 'btn-primary shadow-sm'
              : 'btn-outline-secondary'
          "
          @click="showFilter = true"
        >
          <i class="bi bi-funnel-fill me-1"></i> Lọc
          <span
            v-if="selectedCategoryIds.length > 0"
            class="badge bg-danger ms-2 rounded-pill"
          >
            {{ selectedCategoryIds.length }}
          </span>
        </button>

        <button
          class="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center justify-content-center px-3 text-nowrap"
          @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
        >
          <i
            class="bi me-1"
            :class="viewMode === 'grid' ? 'bi-list-ul' : 'bi-image'"
          ></i>
          {{ viewMode === "grid" ? "Danh sách" : "Hình ảnh" }}
        </button>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto p-3 custom-scrollbar z-1">
      <div
        v-if="viewMode === 'grid'"
        class="row row-cols-3 row-cols-sm-4 row-cols-md-4 row-cols-xl-5 g-2"
      >
        <div
          class="col"
          v-for="product in filteredProducts"
          :key="'grid-' + product.id"
        >
          <div
            class="card h-100 shadow-sm border-0 product-card cursor-pointer rounded-3 overflow-hidden m-2"
            @click="emit('add-to-cart', product)"
          >
            <div
              class="ratio ratio-1x1 bg-dark text-white d-flex justify-content-center align-items-center position-relative"
            >
              <img
                v-if="getImageUrl(product.imageUrl)"
                :src="getImageUrl(product.imageUrl)!"
                class="object-fit-cover w-100 h-100 position-absolute top-0 start-0"
              />
              <i
                v-else
                class="bi bi-cup-hot-fill display-5 opacity-50 m-auto"
              ></i>

              <div
                class="overlay d-flex align-items-center justify-content-center position-absolute w-100 h-100 top-0 start-0 transition-all text-white"
              >
                <i class="bi bi-plus-circle-fill display-5"></i>
              </div>
            </div>
            <div
              class="card-body p-2 text-center d-flex flex-column justify-content-between bg-white"
            >
              <h6
                class="card-title text-dark fw-bold mb-1 product-name lh-sm"
                :title="product.name"
              >
                {{ product.name }}
              </h6>
              <span class="text-primary fw-bolder mt-auto">{{
                formatVND(product.price)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-2"
      >
        <div
          class="col"
          v-for="product in filteredProducts"
          :key="'list-' + product.id"
        >
          <div
            class="card h-100 shadow-sm border-0 product-compact-card cursor-pointer rounded-3"
            @click="emit('add-to-cart', product)"
          >
            <div class="card-body p-2 d-flex align-items-center gap-2">
              <img
                v-if="getImageUrl(product.imageUrl)"
                :src="getImageUrl(product.imageUrl)!"
                class="rounded object-fit-cover flex-shrink-0"
                style="width: 45px; height: 45px"
              />
              <div
                v-else
                class="bg-light border rounded d-flex align-items-center justify-content-center text-secondary flex-shrink-0"
                style="width: 45px; height: 45px"
              >
                <i class="bi bi-cup-hot fs-5"></i>
              </div>

              <div
                class="flex-grow-1 min-w-0 text-start d-flex flex-column justify-content-center"
              >
                <h6
                  class="mb-0 text-dark fw-bold text-truncate"
                  style="font-size: 0.85rem"
                  :title="product.name"
                >
                  {{ product.name }}
                </h6>
                <span
                  class="text-primary fw-bolder mt-1"
                  style="font-size: 0.85rem"
                >
                  {{ formatVND(product.price) }}
                </span>
              </div>

              <div
                class="ms-auto pe-1 text-primary opacity-50 add-icon transition-all"
              >
                <i class="bi bi-plus-circle-fill fs-5"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="filteredProducts.length === 0"
        class="col-12 py-5 text-center text-muted w-100"
      >
        <i class="bi bi-search fs-1 opacity-25"></i>
        <h5 class="mt-3 fw-bold">Không tìm thấy món</h5>
        <p class="small">Vui lòng thử từ khóa hoặc bộ lọc khác.</p>
      </div>
    </div>

    <div
      class="filter-backdrop position-absolute top-0 start-0 w-100 h-100 bg-dark z-3 transition-all"
      :class="showFilter ? 'opacity-25 visible' : 'opacity-0 invisible'"
      @click="showFilter = false"
    ></div>

    <div
      class="filter-panel bg-white shadow-lg border-start position-absolute top-0 end-0 h-100 z-3 d-flex flex-column transition-all"
      :class="showFilter ? 'panel-open' : 'panel-closed'"
      style="width: 280px"
    >
      <div
        class="p-3 border-bottom d-flex justify-content-between align-items-center bg-light"
      >
        <h6 class="fw-bold mb-0 text-dark">
          <i class="bi bi-funnel-fill me-2 text-primary"></i>Lọc theo nhóm
        </h6>
        <button
          class="btn-close"
          style="font-size: 0.75rem"
          @click="showFilter = false"
        ></button>
      </div>

      <div class="flex-grow-1 overflow-auto p-3 custom-scrollbar">
        <div class="form-check mb-3">
          <input
            class="form-check-input cursor-pointer"
            type="checkbox"
            id="cat-all"
            :checked="selectedCategoryIds.length === 0"
            @change="selectedCategoryIds = []"
          />
          <label
            class="form-check-label fw-semibold cursor-pointer w-100"
            for="cat-all"
            >Tất cả nhóm hàng</label
          >
        </div>
        <hr class="text-muted opacity-25" />

        <div
          class="form-check mb-3"
          v-for="cat in uniqueCategories"
          :key="cat.id"
        >
          <input
            class="form-check-input cursor-pointer"
            type="checkbox"
            :value="cat.id"
            :id="'cat-' + cat.id"
            v-model="selectedCategoryIds"
          />
          <label
            class="form-check-label cursor-pointer w-100 text-secondary"
            :for="'cat-' + cat.id"
          >
            {{ cat.name }}
          </label>
        </div>
      </div>

      <div class="p-3 border-top d-flex gap-2">
        <button
          class="btn btn-sm btn-light text-danger fw-bold flex-grow-1"
          @click="selectedCategoryIds = []"
        >
          Bỏ chọn tất cả
        </button>
        <button
          class="btn btn-sm btn-primary fw-bold flex-grow-1"
          @click="showFilter = false"
        >
          Áp dụng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted} from "vue";
import {formatVND} from "@/utils/helpers";
import {productService} from "@/services/ProductService";
import type {Product} from "@/models/Product";
import {toast} from "@/utils/toast";

const emit = defineEmits(["add-to-cart"]);

const searchQuery = ref("");
const viewMode = ref<"grid" | "list">("list");
const showFilter = ref(false);
const products = ref<Product[]>([]);
const selectedCategoryIds = ref<string[]>([]);

onMounted(async () => {
  try {
    const res = await productService.getAll({pageSize: 500});
    const pData = res.data;
    products.value = (pData.items || pData) as Product[];
  } catch (error) {
    console.error(error);
    toast.error("Lỗi tải danh sách món!");
  }
});

// Helper xử lý URL ảnh
const getImageUrl = (url?: string) => {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http")) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const uniqueCategories = computed(() => {
  const map = new Map<string, string>();
  products.value.forEach((p) => {
    const catId = (p as any).categoryId || (p as any).category?.id;
    const catName = (p as any).categoryName || (p as any).category?.name;
    if (catId && catName) map.set(catId, catName);
  });
  return Array.from(map, ([id, name]) => ({id, name}));
});

const filteredProducts = computed(() => {
  let result = products.value;

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  if (selectedCategoryIds.value.length > 0) {
    result = result.filter((p) => {
      const catId = (p as any).categoryId || (p as any).category?.id;
      return selectedCategoryIds.value.includes(catId);
    });
  }

  return result;
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.min-w-0 {
  min-width: 0;
}

.product-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}
.product-card:active {
  transform: translateY(-1px);
}

.product-compact-card {
  border: 1px solid #e5e7eb !important;
  transition: all 0.2s;
}
.product-compact-card:hover {
  border-color: #3b82f6 !important;
  background-color: #eff6ff !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15) !important;
}
.product-compact-card:active {
  transform: translateY(0);
}

.product-compact-card .add-icon {
  opacity: 0;
  transform: scale(0.8);
}
.product-compact-card:hover .add-icon {
  opacity: 1;
  transform: scale(1);
}

.object-fit-cover {
  object-fit: cover;
}
.overlay {
  background: rgba(13, 110, 253, 0.7);
  opacity: 0;
}
.product-card:hover .overlay {
  opacity: 1;
}
.product-name {
  font-size: 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.filter-panel {
  transform: translateX(100%);
}
.panel-open {
  transform: translateX(0);
}
.panel-closed {
  transform: translateX(100%);
}
.visible {
  visibility: visible;
}
.invisible {
  visibility: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
