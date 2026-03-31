<script setup lang="ts">
import {ref, onMounted} from "vue";
import VoucherCard from "@/components/VoucherCard.vue";
import {voucherService} from "@/services/VoucherService";
import type {VoucherDto} from "@/services/VoucherService";
import {formatVND} from "@/utils/helpers";

const promotions = ref<VoucherDto[]>([]);
const loading = ref(true);

const fetchPromotions = async () => {
  try {
    const res = await voucherService.getAll({
      pageNumber: 1,
      pageSize: 6,
      validOnly: true,
    } as any);

    const data = res.data || res;
    promotions.value = data.items || [];
  } catch (error) {
    console.error("Lỗi khi tải khuyến mãi:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPromotions();
});
</script>

<template>
  <section
    v-if="loading || promotions.length > 0"
    class="promotions py-5 bg-dark border-bottom border-secondary border-opacity-25"
  >
    <div class="container py-3">
      <div class="d-flex align-items-center mb-4">
        <i class="bi bi-gift-fill text-warning fs-3 me-3"></i>
        <h3 class="fw-bold text-white mb-0">Khuyến mãi & Ưu đãi đặc biệt</h3>
      </div>

      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
        <div class="col" v-for="promo in promotions" :key="promo.id">
          <VoucherCard
            :title="promo.description"
            :description="`Đơn tối thiểu: ${formatVND(promo.minOrderAmount)}`"
            :code="promo.code"
            :discount="
              promo.discountType === 'Percentage'
                ? `${promo.discountValue}%`
                : formatVND(promo.discountValue)
            "
            :valid-until="new Date(promo.expiryDate).toLocaleDateString('vi-VN')"
          />
        </div>
      </div>
    </div>
  </section>
</template>
