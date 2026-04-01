<template>
  <div class="customer-display d-flex flex-column justify-content-center align-items-center vh-100 bg-light position-relative overflow-hidden">
    <!-- Background Design -->
    <div class="position-absolute top-0 start-0 w-100 h-100 bg-primary opacity-10" style="z-index: 0"></div>
    
    <div v-if="!qrPayload" class="z-1 text-center">
      <img src="https://thecoffeehouse.com/theme/hinh/logo.png" alt="Logo" class="mb-4" style="height: 100px; opacity: 0.5" />
      <h1 class="text-secondary fw-bold">KÍNH CHÀO QUÝ KHÁCH</h1>
      <p class="text-muted fs-5">Vui lòng đợi nhân viên lên món...</p>
    </div>

    <!-- Màn hình chờ chuyển khoản -->
    <div v-else-if="qrPayload && !paymentSuccess" class="z-1 text-center bg-white p-5 rounded-4 shadow-lg animate__animated animate__zoomIn" style="min-width: 450px">
      <h2 class="fw-bold text-primary mb-2">Quét mã để thanh toán</h2>
      <p class="text-muted mb-4 fs-5">Đơn hàng <strong class="text-dark">{{ qrPayload.orderCode }}</strong></p>
      
      <div class="bg-light p-3 rounded-3 d-inline-block border border-2 border-primary mb-3">
        <img :src="qrPayload.sepayQrUrl" alt="QR Thanh Toán" class="img-fluid rounded" style="width: 350px; height: 350px; object-fit: contain" />
      </div>

      <div class="amount-box bg-dark text-white rounded-3 py-3 px-4 mx-auto mb-4 d-inline-block shadow-sm">
        <p class="mb-0 fs-5 text-warning fw-semibold">Tổng tiền thanh toán</p>
        <h1 class="mb-0 fw-bold">{{ formatVND(qrPayload.amount) }}</h1>
      </div>

      <div class="d-flex align-items-center justify-content-center text-primary mt-2">
        <div class="spinner-grow spinner-grow-sm me-2" role="status"></div>
        <span class="fs-5 fw-semibold">Hệ thống đang chờ nhận tiền...</span>
      </div>
    </div>

    <!-- Màn hình Chuyển khoản thành công -->
    <div v-else-if="paymentSuccess" class="z-1 text-center bg-white p-5 rounded-4 shadow-lg border-bottom border-success border-5 animate__animated animate__fadeInUp" style="min-width: 450px">
      <div class="mb-4">
        <i class="bi bi-check-circle-fill text-success" style="font-size: 80px"></i>
      </div>
      <h1 class="fw-bold text-success mb-3">Thanh toán thành công!</h1>
      <p class="fs-4 text-dark mb-0">Đơn hàng <strong class="text-primary">{{ qrPayload?.orderCode }}</strong></p>
      <p class="fs-5 text-muted mt-2">Cảm ơn quý khách đã mua hàng, vui lòng nhận hóa đơn tại quầy.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { formatVND } from "@/utils/helpers";
import { paymentService } from "@/services/PaymentService";

const qrPayload = ref<{ orderCode: string; amount: number; sepayQrUrl: string; orderId: string } | null>(null);
const paymentSuccess = ref(false);
let resetTimeout: any;

const bc = new BroadcastChannel("pos-customer-channel");

onMounted(() => {
  // Lắng nghe lệnh từ POS Cashier
  bc.onmessage = (event) => {
    if (event.data.action === "SHOW_QR") {
      qrPayload.value = event.data.payload;
      paymentSuccess.value = false;
      clearTimeout(resetTimeout);
    } else if (event.data.action === "CLEAR") {
      qrPayload.value = null;
      paymentSuccess.value = false;
      clearTimeout(resetTimeout);
    }
  };

  // Lắng nghe SignalR Webhook
  paymentService.startConnection((orderId: string, _amount: number) => {
    // Nếu event thuộc về đơn hàng đang show QR
    if (qrPayload.value && qrPayload.value.orderId === orderId) {
      paymentSuccess.value = true;
      
      
      // Sau 5 giây, trở về màn hình chờ
      resetTimeout = setTimeout(() => {
        qrPayload.value = null;
        paymentSuccess.value = false;
      }, 5000);
    }
  });
});

onUnmounted(() => {
  bc.close();
  paymentService.stopConnection();
});
</script>

<style scoped>
.customer-display {
  font-family: "Inter", sans-serif;
}
.amount-box {
  min-width: 80%;
}
</style>
