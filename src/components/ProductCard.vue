<script setup lang="ts">
import type { Product } from '@/models/Product';
import { computed } from 'vue';

const props = defineProps<{
    product: Product;
}>();

// Hàm định dạng tiền tệ (VNĐ)
const formattedPrice = computed(() => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(props.product.price);
});

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Xử lý ảnh mặc định nếu không có ảnh
const displayImage = computed(() => {
    return props.product.imageUrl ? `${baseUrl}/${props.product.imageUrl}` : 'https://placehold.co/400x300?text=No+Image';
});
</script>

<template>
    <div class="card h-100 shadow-sm product-card custom-dark-card" :class="{ 'opacity-75': !product.isAvailable }">
        <!-- Badge Hết hàng -->
        <div v-if="!product.isAvailable" class="position-absolute top-0 end-0 p-2 z-1">
            <span class="badge bg-danger">Hết hàng</span>
        </div>
        
        <!-- Ảnh rản phẩm -->
        <div class="card-img-wrapper overflow-hidden bg-black" style="height: 200px;">
            <img :src="displayImage" class="card-img-top w-100 h-100 object-fit-cover transition-transform" :alt="product.name" />
        </div>

        <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title text-truncate mb-0" :title="product.name">{{ product.name }}</h5>
                <span v-if="product.category" class="badge bg-warning text-dark ms-2 text-truncate" style="max-width: 80px;">
                    {{ product.category.name }}
                </span>
            </div>
            
            <p class="card-text text-light opacity-75 small flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                {{ product.description || 'Chưa có mô tả' }}
            </p>
            
            <div class="d-flex justify-content-between align-items-center mt-3">
                <span class="fs-5 fw-bold" style="color: #d97706;">{{ formattedPrice }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.custom-dark-card {
    background-color: #2b3035; /* Sáng hơn nền bg-dark một chút */
    color: #f8f9fa;
    border: 1px solid #495057;
}

.product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
}

.card-img-wrapper img.transition-transform {
    transition: transform 0.3s ease;
}

.product-card:hover .card-img-wrapper img {
    transform: scale(1.05);
}
</style>
