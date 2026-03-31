<template>
  <div class="flex-grow-1 overflow-auto p-3 custom-scrollbar position-relative">
    <div
      v-if="isLoading"
      class="position-absolute w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-75 z-2"
      style="top: 0; left: 0"
    >
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
      <table class="table mb-0 table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th class="ps-3" style="width: 120px">Mã HĐ</th>
            <th>Thời gian</th>
            <th>Bàn</th>
            <th>Khách hàng</th>
            <th class="text-end">Tổng gốc</th>
            <th class="text-end">Giảm giá</th>
            <th class="text-end">Thực thu</th>
            <th class="text-center">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="order in orders" :key="order.id">
            <tr
              class="cursor-pointer transition-all"
              :class="{'table-active': expandedOrderId === order.id}"
              @click="toggleExpand(order.id)"
            >
              <td class="ps-3 fw-bold text-primary">{{ order.orderCode }}</td>
              <td class="small">{{ formatDateTime(order.createdAt) }}</td>
              <td class="small fw-semibold">{{ order.tableName || "Khách mang đi" }}</td>

              <td class="small">
                <span v-if="order.customerName" class="fw-semibold text-dark">{{ order.customerName }}</span>
                <span v-else class="text-muted fst-italic">Khách lẻ</span>
              </td>

              <td class="text-end small fw-semibold text-secondary">
                {{ formatVND(order.totalAmount || 0) }}
              </td>
              <td class="text-end small fw-bold text-success">
                {{ order.discountAmount > 0 ? "-" + formatVND(order.discountAmount) : "0 ₫" }}
              </td>
              <td class="text-end fw-bold text-danger">{{ formatVND(order.finalAmount) }}</td>

              <td class="text-center">
                <span class="badge" :class="getStatusClass(order.status)">{{
                  getStatusName(order.status)
                }}</span>
              </td>
            </tr>

            <tr v-if="expandedOrderId === order.id">
              <td colspan="8" class="p-0 border-bottom-0">
                <div class="bg-white p-3 border-start border-4 border-primary shadow-inner">
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 class="fw-bold mb-1">
                        <i class="bi bi-receipt me-1"></i> Chi tiết {{ order.orderCode }}
                      </h6>
                      <div class="text-muted small">
                        Thu ngân: Admin • Thanh toán: {{ getPaymentName(order.paymentMethod) }}
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-secondary" @click="emit('reprint', order)">
                        <i class="bi bi-printer"></i> In lại Bill
                      </button>
                      <button v-if="order.status === 'Processing'" class="btn btn-sm btn-danger">
                        <i class="bi bi-x-circle"></i> Hủy đơn
                      </button>
                    </div>
                  </div>

                  <table class="table table-sm table-bordered mb-0 bg-white">
                    <thead class="table-light text-muted small">
                      <tr>
                        <th>Mã món</th>
                        <th>Tên món</th>
                        <th class="text-center">SL</th>
                        <th class="text-end">Đơn giá</th>
                        <th class="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in order.orderDetails" :key="item.productId">
                        <td class="small text-muted">{{ item.productId.substring(0, 8) }}...</td>
                        <td class="small fw-semibold">
                          {{ item.productName }}
                          <span v-if="item.note" class="text-danger fst-italic fw-normal"
                            >({{ item.note }})</span
                          >
                        </td>
                        <td class="text-center small">{{ item.quantity }}</td>
                        <td class="text-end small">{{ formatVND(item.unitPrice) }}</td>
                        <td class="text-end small fw-bold">
                          {{ formatVND(item.unitPrice * item.quantity) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="d-flex justify-content-end mt-3">
                    <div style="width: 320px" class="bg-light p-2 rounded border">
                      <div class="d-flex justify-content-between small mb-1 text-muted">
                        <span>Tổng tiền món:</span>
                        <span class="fw-semibold">{{ formatVND(order.totalAmount || 0) }}</span>
                      </div>
                      <div
                        class="d-flex justify-content-between small mb-1 text-success"
                        v-if="order.discountAmount > 0"
                      >
                        <span>Giảm giá (Điểm/Voucher):</span>
                        <span class="fw-bold">- {{ formatVND(order.discountAmount) }}</span>
                      </div>
                      <div class="d-flex justify-content-between pt-2 mt-1 border-top">
                        <span class="fw-bold text-dark">KHÁCH ĐÃ TRẢ:</span>
                        <span class="fw-bolder fs-5 text-danger lh-1">{{
                          formatVND(order.finalAmount)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!isLoading && orders.length === 0">
            <td colspan="8" class="text-center py-5 text-muted">
              <i class="bi bi-inbox display-4 opacity-25"></i>
              <p class="mt-2">Không tìm thấy hóa đơn nào</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {formatVND} from "@/utils/helpers";

defineProps<{orders: any[]; isLoading: boolean}>();
const emit = defineEmits(["reprint"]);

const expandedOrderId = ref<string | null>(null);

const toggleExpand = (id: string) => {
  expandedOrderId.value = expandedOrderId.value === id ? null : id;
};

// Các hàm Format UI
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {hour: "2-digit", minute: "2-digit"})}`;
};

const getStatusClass = (status: string) =>
  ({Completed: "bg-success", Processing: "bg-warning text-dark", Cancelled: "bg-danger"})[status] ||
  "bg-secondary";

const getStatusName = (status: string) =>
  ({Completed: "Hoàn thành", Processing: "Đang phục vụ", Cancelled: "Đã hủy"})[status] || status;

const getPaymentName = (method: string) =>
  ({Cash: "Tiền mặt", Banking: "Chuyển khoản / QR", Card: "Thẻ / Ví"})[method] || method;
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.table > :not(caption) > * > * {
  padding: 0.75rem 1rem;
}
.table-active {
  background-color: #f1f5f9 !important;
}
.shadow-inner {
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.04);
  background-color: #f8fafc;
}
.cursor-pointer {
  cursor: pointer;
}
.transition-all {
  transition: background-color 0.2s;
}
</style>
