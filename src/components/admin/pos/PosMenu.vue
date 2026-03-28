<template>
  <div class="d-flex flex-column h-100 bg-light">
    <!-- Search Bar -->
    <div class="p-3 bg-white border-bottom shadow-sm flex-shrink-0 z-1">
      <div
        class="input-group input-group-lg rounded-pill overflow-hidden border"
      >
        <span class="input-group-text bg-white border-0 pe-1 text-muted"
          ><i class="bi bi-search"></i
        ></span>
        <input
          type="text"
          class="form-control border-0 shadow-none bg-white"
          placeholder="Tìm kiếm món đồ uống, thức ăn..."
          v-model="searchQuery"
        />
        <button
          class="btn btn-white border-0 text-secondary"
          v-if="searchQuery"
          @click="searchQuery = ''"
        >
          <i class="bi bi-x-circle-fill"></i>
        </button>
      </div>
    </div>

    <!-- Product Grid -->
    <div class="flex-grow-1 overflow-auto p-4 custom-scrollbar">
      <div
        class="row row-cols-2 row-cols-sm-3 row-cols-md-3 row-cols-lg-4 row-cols-xl-5 g-3"
      >
        <div class="col" v-for="product in filteredProducts" :key="product.id">
          <div
            class="card h-100 shadow-sm border-0 product-card cursor-pointer rounded-4 overflow-hidden"
            @click="emit('add-to-cart', product)"
          >
            <!-- Image or Placeholder -->
            <div
              class="ratio ratio-1x1 bg-dark text-white d-flex justify-content-center align-items-center position-relative"
            >
              <img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                class="object-fit-cover w-100 h-100 position-absolute top-0 start-0"
              />
              <i
                v-else
                class="bi bi-cup-hot-fill display-4 opacity-50 m-auto"
              ></i>

              <!-- Add icon overlay -->
              <div
                class="overlay d-flex align-items-center justify-content-center position-absolute w-100 h-100 top-0 start-0 transition-all text-white"
              >
                <i class="bi bi-plus-circle-fill display-5"></i>
              </div>
            </div>

            <!-- Details -->
            <div
              class="card-body p-2 px-3 text-center d-flex flex-column justify-content-between bg-white"
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

        <div
          v-if="filteredProducts.length === 0"
          class="col-12 py-5 text-center text-muted w-100"
        >
          <i class="bi bi-search fs-1 opacity-25"></i>
          <h5 class="mt-3 fw-bold">Không tìm thấy món</h5>
          <p class="small">Vui lòng thử từ khóa khác.</p>
        </div>
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

const products = ref<Product[]>([]);

onMounted(async () => {
  try {
    const res = await productService.getAll({pageSize: 500});
    const pData = res.data || res;
    products.value = (pData.items || pData) as Product[];
  } catch (error) {
    console.error(error);
    toast.error("Lỗi tải danh sách món!");
  }
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  return products.value.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: all 0.2s ease;
}
.z-1 {
  z-index: 1;
}

.product-card {
  transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15) !important;
}
.product-card:active {
  transform: translateY(-2px);
}

.object-fit-cover {
  object-fit: cover;
}

.overlay {
  background: rgba(13, 110, 253, 0.6);
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

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
</style>
