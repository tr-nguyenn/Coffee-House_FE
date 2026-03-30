<template>
  <div id="print-bill-area" class="print-only" v-if="order">
    <div class="bill-container">
      <div class="text-center mb-3">
        <h4 class="fw-bold mb-1">COFFEE HOUSE</h4>
        <p class="mb-0" style="font-size: 12px">123 Đường Bán Cà Phê, Đà Nẵng</p>
        <p class="mb-0" style="font-size: 12px">SĐT: 0123.456.789</p>
        <h5 class="fw-bold mt-2 border-top border-bottom py-1 border-dark dashed-border">
          {{ order.isProvisional ? "PHIẾU TẠM TÍNH" : "HÓA ĐƠN THANH TOÁN" }}
        </h5>
      </div>

      <div class="mb-2" style="font-size: 12px">
        <div class="d-flex justify-content-between">
          <span>Số phiếu:</span>
          <span class="fw-bold">{{ order.orderCode }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Ngày:</span>
          <span>{{ new Date(order.createdAt || Date.now()).toLocaleString("vi-VN") }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Bàn:</span>
          <span class="fw-bold">{{ order.tableName || "Mang đi" }}</span>
        </div>
        <div class="d-flex justify-content-between">
          <span>Thu ngân:</span>
          <span>Admin</span>
        </div>
        <div class="d-flex justify-content-between" v-if="order.customerName">
          <span>Khách:</span>
          <span class="fw-bold text-end" style="max-width: 150px">{{ order.customerName }}</span>
        </div>
      </div>

      <table
        class="w-100 mb-2"
        style="font-size: 12px; border-top: 1px dashed #000; border-bottom: 1px dashed #000"
      >
        <thead>
          <tr class="border-bottom border-dark border-dashed">
            <th class="py-1 text-start">Món</th>
            <th class="py-1 text-center">SL</th>
            <th class="py-1 text-end">Tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.orderDetails" :key="item.productId">
            <td class="py-1 pe-1">
              {{ item.productName || item.name }}
              <div v-if="item.note" style="font-size: 10px; font-style: italic">({{ item.note }})</div>
            </td>
            <td class="py-1 text-center align-top">{{ item.quantity }}</td>
            <td class="py-1 text-end align-top">
              {{ formatVND(item.unitPrice * item.quantity) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mb-3" style="font-size: 13px">
        <div class="d-flex justify-content-between mt-1">
          <span>Tổng tiền món:</span>
          <span>{{ formatVND(order.totalAmount || order.finalAmount) }}</span>
        </div>

        <div v-if="order.discountAmount > 0" class="d-flex justify-content-between mt-1">
          <span>Giảm giá:</span>
          <span>- {{ formatVND(order.discountAmount) }}</span>
        </div>

        <div
          class="d-flex justify-content-between fw-bold fs-6 mt-1 pt-1"
          style="border-top: 1px dashed #000"
        >
          <span>THỰC THU:</span>
          <span>{{ formatVND(order.finalAmount) }}</span>
        </div>

        <div class="d-flex justify-content-between text-muted mt-1" style="font-size: 11px">
          <span>Thanh toán:</span>
          <span>{{
            order.isProvisional ? "Chưa thanh toán" : getPaymentMethodName(order.paymentMethod)
          }}</span>
        </div>
      </div>

      <div class="text-center mt-3" style="font-size: 12px">
        <p class="fst-italic mb-0">Cảm ơn quý khách & Hẹn gặp lại!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {formatVND} from "@/utils/helpers";

defineProps<{
  order: any | null;
}>();

const getPaymentMethodName = (method: string) => {
  const map: Record<string, string> = {
    Cash: "Tiền mặt",
    Banking: "Chuyển khoản / QR",
    Card: "Thẻ / Ví",
  };
  return map[method] || method || "Tiền mặt";
};
</script>

<style scoped>
.print-only {
  display: none;
}
</style>

<style>
/* CSS DÀNH RIÊNG CHO MÁY IN KHÔNG ĐƯỢC SCOPED */
@media print {
  body * {
    visibility: hidden;
  }
  #print-bill-area,
  #print-bill-area * {
    visibility: visible;
  }

  #print-bill-area {
    display: block !important;
    position: fixed !important;
    left: 0;
    top: 0;
    width: 80mm !important;
    margin: 0;
    padding: 0;
    color: #000 !important;
    background: #fff !important;
    font-family: "Courier New", Courier, monospace;
    z-index: 99999;
  }
  .dashed-border {
    border-style: dashed !important;
  }
  html,
  body,
  #app,
  .admin-layout,
  .main-wrapper,
  .pos-layout {
    height: auto !important;
    overflow: visible !important;
    background-color: white !important;
  }
}
</style>
