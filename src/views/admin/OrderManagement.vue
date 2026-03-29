<template>
  <div class="d-flex h-100 bg-light">
    <div
      class="bg-white border-end d-flex flex-column flex-shrink-0 z-1"
      style="width: 280px"
    >
      <div class="p-3 border-bottom bg-light">
        <h6 class="mb-0 fw-bold text-dark">
          <i class="bi bi-funnel-fill text-primary me-2"></i>Bộ lọc hóa đơn
        </h6>
      </div>

      <div class="p-3 flex-grow-1 overflow-auto custom-scrollbar">
        <div class="mb-4">
          <label class="form-label small fw-bold text-muted">Tìm kiếm</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white"
              ><i class="bi bi-search text-muted"></i
            ></span>
            <input
              type="text"
              class="form-control"
              placeholder="Mã HĐ, Tên KH..."
              v-model="filters.search"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label small fw-bold text-muted">Thời gian</label>
          <select
            class="form-select form-select-sm mb-2"
            v-model="filters.timeRange"
          >
            <option value="today">Hôm nay</option>
            <option value="yesterday">Hôm qua</option>
            <option value="thisWeek">Tuần này</option>
            <option value="thisMonth">Tháng này</option>
            <option value="custom">Tùy chỉnh...</option>
          </select>
          <div v-if="filters.timeRange === 'custom'" class="d-flex gap-2">
            <input
              type="date"
              class="form-control form-control-sm"
              v-model="filters.startDate"
            />
            <input
              type="date"
              class="form-control form-control-sm"
              v-model="filters.endDate"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label small fw-bold text-muted">Trạng thái</label>
          <div class="form-check mb-1">
            <input
              class="form-check-input"
              type="checkbox"
              id="st-completed"
              value="Completed"
              v-model="filters.statuses"
            />
            <label class="form-check-label small" for="st-completed"
              >Hoàn thành (Đã TT)</label
            >
          </div>
          <div class="form-check mb-1">
            <input
              class="form-check-input"
              type="checkbox"
              id="st-processing"
              value="Processing"
              v-model="filters.statuses"
            />
            <label class="form-check-label small" for="st-processing"
              >Đang phục vụ</label
            >
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="st-cancelled"
              value="Cancelled"
              v-model="filters.statuses"
            />
            <label class="form-check-label small" for="st-cancelled"
              >Đã hủy</label
            >
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label small fw-bold text-muted">Thanh toán</label>
          <select
            class="form-select form-select-sm"
            v-model="filters.paymentMethod"
          >
            <option value="">Tất cả</option>
            <option value="Cash">Tiền mặt</option>
            <option value="Banking">Chuyển khoản / QR</option>
            <option value="Card">Thẻ / Ví điện tử</option>
          </select>
        </div>
      </div>

      <div class="p-3 border-top">
        <button
          class="btn btn-primary btn-sm w-100 fw-bold"
          @click="fetchOrders"
        >
          <i class="bi bi-filter"></i> Áp dụng lọc
        </button>
      </div>
    </div>

    <div class="flex-grow-1 d-flex flex-column overflow-hidden">
      <div
        class="p-3 bg-white border-bottom d-flex justify-content-between align-items-center flex-shrink-0"
      >
        <h5 class="mb-0 fw-bold">Danh sách Hóa đơn</h5>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-success">
            <i class="bi bi-file-earmark-excel"></i> Xuất Excel
          </button>
        </div>
      </div>

      <div class="flex-grow-1 overflow-auto p-3 custom-scrollbar">
        <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
          <table class="table mb-0 table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th class="ps-3" style="width: 120px">Mã HĐ</th>
                <th>Thời gian</th>
                <th>Bàn / Khu vực</th>
                <th>Khách hàng</th>
                <th class="text-end">Tổng tiền</th>
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
                  <td class="ps-3 fw-bold text-primary">
                    {{ order.orderCode }}
                  </td>
                  <td class="small">{{ formatDateTime(order.createdAt) }}</td>
                  <td class="small fw-semibold">
                    {{ order.tableName || "Khách mang đi" }}
                  </td>
                  <td class="small">{{ order.customerName || "Khách lẻ" }}</td>
                  <td class="text-end fw-bold text-danger">
                    {{ formatVND(order.finalAmount) }}
                  </td>
                  <td class="text-center">
                    <span class="badge" :class="getStatusClass(order.status)">{{
                      getStatusName(order.status)
                    }}</span>
                  </td>
                </tr>

                <tr v-if="expandedOrderId === order.id">
                  <td colspan="6" class="p-0 border-bottom-0">
                    <div
                      class="bg-white p-3 border-start border-4 border-primary shadow-inner"
                    >
                      <div
                        class="d-flex justify-content-between align-items-start mb-3"
                      >
                        <div>
                          <h6 class="fw-bold mb-1">
                            <i class="bi bi-receipt me-1"></i> Chi tiết
                            {{ order.orderCode }}
                          </h6>
                          <div class="text-muted small">
                            Thu ngân: Admin • Thanh toán:
                            {{ getPaymentName(order.paymentMethod) }}
                          </div>
                        </div>
                        <div class="d-flex gap-2">
                          <button
                            class="btn btn-sm btn-outline-secondary"
                            @click="handleReprint(order)"
                          >
                            <i class="bi bi-printer"></i> In lại Bill
                          </button>

                          <button
                            v-if="order.status === 'Processing'"
                            class="btn btn-sm btn-danger"
                          >
                            <i class="bi bi-x-circle"></i> Hủy đơn
                          </button>
                        </div>
                      </div>

                      <table
                        class="table table-sm table-bordered mb-0 bg-white"
                      >
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
                          <tr
                            v-for="item in order.orderDetails"
                            :key="item.productId"
                          >
                            <td class="small text-muted">
                              {{ item.productId.substring(0, 8) }}...
                            </td>
                            <td class="small fw-semibold">
                              {{ item.productName }}
                              <span
                                v-if="item.note"
                                class="text-danger fst-italic fw-normal"
                                >({{ item.note }})</span
                              >
                            </td>
                            <td class="text-center small">
                              {{ item.quantity }}
                            </td>
                            <td class="text-end small">
                              {{ formatVND(item.unitPrice) }}
                            </td>
                            <td class="text-end small fw-bold">
                              {{ formatVND(item.unitPrice * item.quantity) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>

              <tr v-if="orders.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox display-4 opacity-25"></i>
                  <p class="mt-2">Không tìm thấy hóa đơn nào</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        class="p-3 bg-white border-top d-flex justify-content-between align-items-center"
      >
        <span class="small text-muted"
          >Hiển thị {{ orders.length }} hóa đơn</span
        >
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item disabled">
            <a class="page-link" href="#">Trước</a>
          </li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item"><a class="page-link" href="#">Sau</a></li>
        </ul>
      </div>
    </div>
  </div>

  <PrintBill :order="billToReprint" />
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, nextTick} from "vue";
import {formatVND} from "@/utils/helpers";
import PrintBill from "@/components/admin/shared/PrintBill.vue";

// Order cần in lại
const billToReprint = ref<any>(null);

// Filters State
const filters = reactive({
  search: "",
  timeRange: "today",
  startDate: "",
  endDate: "",
  statuses: ["Completed", "Processing"],
  paymentMethod: "",
});

// Orders State
const orders = ref<any[]>([]);
const expandedOrderId = ref<string | null>(null);

// MOCK DATA
onMounted(() => {
  orders.value = [
    {
      id: "1",
      orderCode: "HD000046",
      createdAt: new Date().toISOString(),
      tableName: "Bàn 01 (Tầng 1)",
      customerName: "Nguyễn Trung Nguyên",
      finalAmount: 145000,
      status: "Completed",
      paymentMethod: "Banking",
      orderDetails: [
        {
          productId: "p1",
          productName: "Cà phê Đen Đá",
          quantity: 2,
          unitPrice: 25000,
          note: "Ít đá",
        },
        {
          productId: "p2",
          productName: "Trà Đào Cam Sả",
          quantity: 1,
          unitPrice: 45000,
          note: "",
        },
        {
          productId: "p3",
          productName: "Bánh Croissant",
          quantity: 1,
          unitPrice: 50000,
          note: "",
        },
      ],
    },
    {
      id: "2",
      orderCode: "HD000047",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      tableName: null,
      customerName: "Khách vãng lai",
      finalAmount: 55000,
      status: "Completed",
      paymentMethod: "Cash",
      orderDetails: [
        {
          productId: "p4",
          productName: "Trà Sữa Trân Châu",
          quantity: 1,
          unitPrice: 55000,
          note: "Thêm trân châu trắng",
        },
      ],
    },
    {
      id: "3",
      orderCode: "HD000048",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      tableName: "Bàn 05 (Sân vườn)",
      customerName: "Trần Văn A",
      finalAmount: 120000,
      status: "Processing",
      paymentMethod: "Cash",
      orderDetails: [
        {
          productId: "p5",
          productName: "Sinh tố bơ",
          quantity: 2,
          unitPrice: 60000,
          note: "",
        },
      ],
    },
  ];
});

const fetchOrders = () => {
  console.log("Fetching orders with filters:", filters);
};

const toggleExpand = (id: string) => {
  expandedOrderId.value = expandedOrderId.value === id ? null : id;
};

// Helpers
const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    Completed: "bg-success",
    Processing: "bg-warning text-dark",
    Cancelled: "bg-danger",
  };
  return map[status] || "bg-secondary";
};

const getStatusName = (status: string) => {
  const map: Record<string, string> = {
    Completed: "Hoàn thành",
    Processing: "Đang phục vụ",
    Cancelled: "Đã hủy",
  };
  return map[status] || status;
};

const getPaymentName = (method: string) => {
  const map: Record<string, string> = {
    Cash: "Tiền mặt",
    Banking: "Chuyển khoản / QR",
    Card: "Thẻ / Ví điện tử",
  };
  return map[method] || method;
};

// Logic In Lại Bill
const handleReprint = async (orderInfo: any) => {
  billToReprint.value = {
    ...orderInfo,
    isProvisional: false,
  };

  await nextTick();

  setTimeout(() => {
    window.print();
    billToReprint.value = null;
  }, 100);
};
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
