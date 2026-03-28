<template>
  <div class="d-flex flex-column h-100 bg-white">
    <div
      class="flex-shrink-0 p-2 shadow-sm d-flex justify-content-between align-items-center z-2 rounded-bottom"
      :class="
        selectedTable?.tableId === 'TAKEAWAY'
          ? 'bg-warning text-dark'
          : selectedTable
          ? 'bg-dark text-white'
          : 'bg-secondary text-white'
      "
    >
      <h6 class="mb-0 fw-bold">
        <i
          class="bi"
          :class="
            selectedTable?.tableId === 'TAKEAWAY'
              ? 'bi-bag-check-fill'
              : 'bi-geo-alt-fill'
          "
        ></i>
        {{ selectedTable ? ` ${selectedTable.tableName}` : "Chưa chọn bàn" }}
      </h6>

      <div v-if="selectedTable && selectedTable.tableId !== 'TAKEAWAY'">
        <span v-if="selectedTable.isInUse" class="badge bg-danger"
          >Có Khách</span
        >
        <span v-else class="badge bg-success">Trống</span>
      </div>
    </div>

    <div v-if="selectedTable" class="px-2 py-2 bg-light border-bottom z-3">
      <div class="d-flex gap-2">
        <div class="position-relative" style="flex: 5.5">
          <div
            v-if="selectedCustomer"
            class="d-flex justify-content-between align-items-center px-2 py-1 bg-success bg-opacity-10 border border-success rounded h-100"
          >
            <div class="d-flex align-items-center min-w-0">
              <i class="bi bi-person-check-fill text-success me-2"></i>
              <span class="fw-bold text-dark small text-truncate">{{
                selectedCustomer.fullName
              }}</span>
              <span class="badge bg-warning text-dark ms-2 flex-shrink-0"
                >{{ selectedCustomer.rewardPoints || 0 }} đ</span
              >
            </div>
            <button
              class="btn btn-sm btn-link text-danger p-0 ms-2 flex-shrink-0"
              @click="clearCustomer"
            >
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </div>

          <div v-else class="input-group input-group-sm h-100">
            <span class="input-group-text bg-white border-end-0 pe-1"
              ><i class="bi bi-person text-muted"></i
            ></span>
            <input
              type="text"
              class="form-control border-start-0 ps-1"
              placeholder="Tìm tên/SĐT khách..."
              v-model="searchQuery"
              @input="handleSearch"
              @focus="showDropdown = true"
              @blur="hideDropdownDelay"
            />
          </div>

          <ul
            v-if="showDropdown && searchQuery"
            class="dropdown-menu show w-100 position-absolute shadow-sm"
            style="top: 100%; z-index: 1050; font-size: 0.85rem"
          >
            <li
              v-if="isSearching"
              class="dropdown-item text-center text-muted py-1"
            >
              <div
                class="spinner-border spinner-border-sm text-primary"
                role="status"
              ></div>
            </li>
            <li
              v-for="c in suggestedCustomers"
              :key="c.id"
              @click="selectCustomer(c)"
            >
              <a
                class="dropdown-item cursor-pointer py-1 d-flex justify-content-between align-items-center"
              >
                <span class="text-truncate"
                  >{{ c.fullName }} - {{ c.phoneNumber }}</span
                >
                <span class="badge bg-warning text-dark flex-shrink-0"
                  >{{ c.rewardPoints || 0 }} đ</span
                >
              </a>
            </li>
            <li v-if="!isSearching && suggestedCustomers.length === 0">
              <a
                class="dropdown-item text-primary cursor-pointer fw-bold py-1"
                @click="openAddCustomerModal"
              >
                <i class="bi bi-plus-circle"></i> Thêm mới
              </a>
            </li>
          </ul>
        </div>

        <div class="input-group input-group-sm" style="flex: 4.5">
          <span class="input-group-text bg-white border-end-0 pe-1"
            ><i class="bi bi-ticket-perforated text-muted"></i
          ></span>
          <input
            type="text"
            class="form-control border-start-0 ps-1"
            placeholder="Mã Voucher..."
            v-model="voucherCode"
          />
        </div>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto bg-white custom-scrollbar px-2 py-1">
      <div
        v-if="!existingOrder && cart.length === 0"
        class="text-center text-muted py-5 mt-4"
      >
        <i class="bi bi-cart-x display-3 opacity-25"></i>
        <h6 class="mt-2">Giỏ hàng trống</h6>
      </div>

      <div v-else>
        <div v-if="existingItems.length > 0" class="mb-3">
          <h6 class="text-muted fw-bold mb-1 small px-1 bg-light py-1 rounded">
            <i class="bi bi-clock-history"></i> MÓN ĐÃ GỌI ({{
              existingItems.length
            }})
          </h6>
          <div
            v-for="item in existingItems"
            :key="item.id || item.productId"
            class="d-flex justify-content-between align-items-center py-2 border-bottom"
          >
            <div class="text-truncate pe-2">
              <div class="fw-bold text-dark small text-truncate">
                {{ item.productName || item.name || "Món" }}
              </div>
              <div class="text-muted" style="font-size: 0.75rem">
                {{ formatVND(item.unitPrice || item.price) }} x
                {{ item.quantity }}
              </div>
            </div>
            <div class="fw-bold text-success small text-nowrap">
              {{ formatVND(item.unitPrice * item.quantity) }}
            </div>
          </div>
        </div>

        <div v-if="cart.length > 0">
          <h6
            class="text-muted fw-bold mb-1 small px-1 bg-warning bg-opacity-10 py-1 rounded text-warning"
          >
            <i class="bi bi-cart-plus"></i> MÓN MỚI ({{ cart.length }})
          </h6>
          <div
            v-for="item in cart"
            :key="item.productId"
            class="py-2 border-bottom position-relative item-row"
          >
            <div class="d-flex justify-content-between align-items-start mb-1">
              <div
                class="fw-bold text-dark small text-truncate pe-2 flex-grow-1"
              >
                {{ item.name }}
              </div>
              <div class="fw-bold text-danger small text-nowrap">
                {{ formatVND(item.unitPrice * item.quantity) }}
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center">
              <div
                class="input-group input-group-sm qty-group"
                style="width: 85px"
              >
                <button
                  class="btn btn-outline-secondary px-2 py-0"
                  @click="
                    item.quantity > 1
                      ? item.quantity--
                      : emit('remove-item', item)
                  "
                >
                  -
                </button>
                <input
                  type="number"
                  class="form-control text-center p-0 fw-bold"
                  v-model="item.quantity"
                  min="1"
                  style="height: 24px"
                />
                <button
                  class="btn btn-outline-secondary px-2 py-0"
                  @click="item.quantity++"
                >
                  +
                </button>
              </div>

              <div class="d-flex gap-1">
                <input
                  type="text"
                  class="form-control form-control-sm border-0 bg-light px-2 py-0"
                  style="width: 120px; height: 24px; font-size: 0.75rem"
                  placeholder="+ Ghi chú"
                  v-model="item.note"
                />
                <button
                  class="btn btn-sm btn-link text-danger p-0 px-1"
                  @click="emit('remove-item', item)"
                >
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 bg-white shadow-lg p-2 z-3 border-top">
      <div class="d-flex justify-content-between align-items-center mb-2 px-1">
        <span class="fw-bold text-muted small">TỔNG TIỀN</span>
        <span class="fs-4 fw-bolder text-danger lh-1">{{
          formatVND(totalAmount)
        }}</span>
      </div>

      <div v-if="selectedTable" class="row g-1">
        <template v-if="selectedTable.tableId !== 'TAKEAWAY'">
          <div class="col-12" v-if="!selectedTable.isInUse">
            <button
              class="btn btn-primary w-100 py-2 fw-bold shadow-sm"
              @click="emit('open-table')"
            >
              <i class="bi bi-unlock-fill me-1"></i> MỞ BÀN
            </button>
          </div>

          <template v-else>
            <div
              class="col-12 d-flex gap-1"
              v-if="cart.length > 0 || existingOrder"
            >
              <select
                class="form-select form-select-sm bg-light fw-semibold"
                v-model="selectedPaymentMethod"
                style="width: 40%"
              >
                <option value="Cash">Tiền mặt</option>
                <option value="Banking">Chuyển khoản</option>
                <option value="Card">Thẻ / Ví</option>
              </select>

              <button
                v-if="cart.length > 0"
                class="btn btn-warning btn-sm flex-grow-1 fw-bold text-dark shadow-sm"
                @click="emit('send-to-kitchen', getCheckoutPayload())"
              >
                <i class="bi bi-bell-fill"></i> BÁO BẾP
              </button>

              <button
                v-if="existingOrder && cart.length === 0"
                class="btn btn-success btn-sm flex-grow-1 fw-bold shadow-sm"
                @click="emit('checkout', getCheckoutPayload())"
              >
                THANH TOÁN
              </button>
            </div>
          </template>
        </template>

        <template v-else>
          <div class="col-12 d-flex gap-1" v-if="cart.length > 0">
            <select
              class="form-select form-select-sm bg-light fw-semibold"
              v-model="selectedPaymentMethod"
              style="width: 40%"
            >
              <option value="Cash">Tiền mặt</option>
              <option value="Banking">Chuyển khoản</option>
              <option value="Card">Thẻ / Ví</option>
            </select>
            <button
              class="btn btn-success btn-sm flex-grow-1 fw-bold shadow-sm"
              @click="emit('send-to-kitchen', getCheckoutPayload())"
            >
              TẠO ĐƠN
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, computed} from "vue";
import {formatVND} from "@/utils/helpers";
import type {OrderDetailDto} from "./OperationsArea.vue";
import {toast} from "@/utils/toast";
import {userService} from "@/services/UserService";

const props = defineProps<{
  selectedTable: any;
  cart: OrderDetailDto[];
  existingOrder: any;
}>();
const emit = defineEmits([
  "remove-item",
  "send-to-kitchen",
  "checkout",
  "open-table",
  "change-table",
]);

const existingItems = computed(() => props.existingOrder?.orderDetails || []);

const voucherCode = ref("");
const selectedPaymentMethod = ref("Cash");

const searchQuery = ref("");
const isSearching = ref(false);
const showDropdown = ref(false);
const suggestedCustomers = ref<any[]>([]);
const selectedCustomer = ref<any>(null);
let searchTimeout: any = null;

const handleSearch = () => {
  showDropdown.value = true;
  isSearching.value = true;
  clearTimeout(searchTimeout);

  if (!searchQuery.value.trim()) {
    suggestedCustomers.value = [];
    isSearching.value = false;
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const res = await userService.getAll({
        search: searchQuery.value,
        pageSize: 15,
      });
      suggestedCustomers.value = (res.data || res).items || [];
    } catch (error) {
      console.error(error);
    } finally {
      isSearching.value = false;
    }
  }, 300);
};

const selectCustomer = (c: any) => {
  selectedCustomer.value = c;
  searchQuery.value = "";
  showDropdown.value = false;
};

const clearCustomer = () => {
  selectedCustomer.value = null;
};

const hideDropdownDelay = () =>
  setTimeout(() => {
    showDropdown.value = false;
  }, 200);

const openAddCustomerModal = () => {
  toast.success(`Thêm khách: ${searchQuery.value} sẽ sớm ra mắt!`);
  showDropdown.value = false;
};

const getCheckoutPayload = () => ({
  paymentMethod: selectedPaymentMethod.value,
  customerId: selectedCustomer.value?.id || null,
  customerName: selectedCustomer.value?.fullName || searchQuery.value,
  customerPhone: selectedCustomer.value?.phoneNumber || null,
});

const totalAmount = computed(() => {
  let oldTotal = props.existingOrder?.finalAmount || 0;
  let newTotal = props.cart.reduce(
    (sum, item) => sum + (item.unitPrice || 0) * Number(item.quantity),
    0
  );
  return oldTotal + newTotal;
});
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.min-w-0 {
  min-width: 0;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-group .btn {
  border-color: #dee2e6;
  color: #495057;
  background-color: #f8f9fa;
  font-weight: bold;
}
.qty-group input {
  border-color: #dee2e6;
  border-left: 0;
  border-right: 0;
}
</style>
