<template>
  <div class="d-flex flex-column h-100 bg-white">
    
    <div class="flex-shrink-0 mx-2 p-3 shadow-sm d-flex justify-content-between align-items-center z-2"
         :class="selectedTable?.tableId === 'TAKEAWAY' ? 'bg-warning text-dark' : (selectedTable ? 'bg-dark text-white' : 'bg-secondary text-white')">
      <h5 class="mb-0 fw-bold">
        <i class="bi" :class="selectedTable?.tableId === 'TAKEAWAY' ? 'bi-bag-check-fill' : 'bi-geo-alt-fill'"></i>
        {{ selectedTable ? ` ${selectedTable.tableName}` : "CHƯA CHỌN BÀN" }}
      </h5>
      
      <div v-if="selectedTable && selectedTable.tableId !== 'TAKEAWAY'">
        <span v-if="selectedTable.isInUse" class="badge bg-danger me-2">Có Khách</span>
        <span v-else class="badge bg-success me-2">Bàn Trống</span>
        
        <button v-if="selectedTable.isInUse" class="btn btn-sm btn-outline-light rounded-pill" @click="handleChangeTable">
          <i class="bi bi-arrow-left-right"></i> Chuyển
        </button>
      </div>
    </div>

    <div v-if="selectedTable" class="p-2 bg-light border-bottom z-3">
      <div class="row g-2">
        
        <div class="col-12 position-relative">
          
          <div v-if="selectedCustomer" class="d-flex justify-content-between align-items-center p-2 bg-success bg-opacity-10 border border-success rounded">
            <div class="d-flex align-items-center">
              <i class="bi bi-person-check-fill text-success fs-4 me-2"></i>
              <div>
                <div class="fw-bold text-dark" style="font-size: 0.9rem;">{{ selectedCustomer.fullName }}</div>
                <div class="small text-muted">
                  {{ selectedCustomer.phoneNumber }}
                  <span class="badge bg-warning text-dark border border-warning ms-1">{{ selectedCustomer.rewardPoints }} điểm</span>
                </div>
              </div>
            </div>
            <button class="btn btn-sm btn-close" @click="clearCustomer" title="Hủy chọn"></button>
          </div>

          <div v-else>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
              <input type="text" class="form-control" 
                     placeholder="Tìm Tên hoặc SĐT Khách hàng..." 
                     v-model="searchQuery" 
                     @input="handleSearch"
                     @focus="showDropdown = true"
                     @blur="hideDropdownDelay">
            </div>

            <ul v-if="showDropdown && searchQuery" class="dropdown-menu show w-100 position-absolute shadow-lg" style="top: 100%; z-index: 1050;">
              <li v-if="isSearching" class="dropdown-item text-center text-muted small py-2">
                <div class="spinner-border spinner-border-sm text-primary me-1" role="status"></div> Đang tìm...
              </li>
              
              <li v-for="c in suggestedCustomers" :key="c.id" @click="selectCustomer(c)">
                <a class="dropdown-item cursor-pointer d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-bold text-dark"><i class="bi bi-person text-primary me-1"></i> {{ c.fullName }}</div>
                    <div class="text-muted small">{{ c.phoneNumber }}</div>
                  </div>
                  <span class="badge bg-warning text-dark border border-warning">{{ c.rewardPoints }} điểm</span>
                </a>
              </li>

              <li v-if="!isSearching && suggestedCustomers.length === 0">
                <a class="dropdown-item text-primary cursor-pointer fw-bold py-2" @click="openAddCustomerModal">
                  <i class="bi bi-plus-circle-fill me-1"></i> Thêm khách mới: "{{ searchQuery }}"
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-12">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white"><i class="bi bi-ticket-perforated-fill text-muted"></i></span>
            <input type="text" class="form-control" placeholder="Mã Voucher giảm giá" v-model="voucherCode">
            <button class="btn btn-dark" @click="applyVoucher">Áp dụng</button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-grow-1 overflow-auto bg-light custom-scrollbar p-2">
      <div v-if="!existingOrder && cart.length === 0" class="text-center text-muted py-5 mt-5">
        <i class="bi bi-cart-x display-1 opacity-25"></i>
        <h5 class="mt-3">Chưa có món nào</h5>
      </div>

      <div v-else>
        <div v-if="existingItems.length > 0" class="mb-3">
          <h6 class="text-muted fw-bold mb-2 small"><i class="bi bi-clock-history"></i> ĐÃ GỌI ({{existingItems.length}})</h6>
          <div v-for="item in existingItems" :key="item.id || item.productId" class="card shadow-sm mb-2 border-0 border-start border-4 border-success">
            <div class="card-body p-2 d-flex justify-content-between align-items-center">
              <div>
                <div class="fw-bold">{{ item.productName || item.name || 'Món' }}</div>
                <div class="text-muted small">{{ formatVND(item.unitPrice || item.price) }} x {{ item.quantity }}</div>
                <div v-if="item.note" class="text-secondary small fst-italic">Ghi chú: {{ item.note }}</div>
              </div>
              <div class="fw-bold text-success">{{ formatVND(item.unitPrice * item.quantity) }}</div>
            </div>
          </div>
        </div>

        <div v-if="cart.length > 0">
          <h6 class="text-muted fw-bold mb-2 small"><i class="bi bi-cart-plus"></i> MÓN MỚI ({{cart.length}})</h6>
          <div v-for="item in cart" :key="item.productId" class="card shadow-sm mb-2 border-0 border-start border-4 border-warning">
            <div class="card-body p-2 d-flex justify-content-between align-items-start">
              <div class="flex-grow-1">
                <div class="fw-bold text-dark">{{ item.name }}</div>
                <div class="d-flex align-items-center mt-1 mb-1">
                  <div class="input-group input-group-sm" style="width: 100px;">
                    <button class="btn btn-outline-secondary" @click="item.quantity > 1 ? item.quantity-- : emit('remove-item', item)">-</button>
                    <input type="number" class="form-control text-center px-1" v-model="item.quantity" min="1">
                    <button class="btn btn-outline-secondary" @click="item.quantity++">+</button>
                  </div>
                  <span class="text-muted small ms-2">x {{ formatVND(item.unitPrice) }}</span>
                </div>
                <input type="text" class="form-control form-control-sm mt-1" placeholder="Ghi chú (Tùy chọn)" v-model="item.note">
              </div>
              <div class="d-flex flex-column align-items-end ms-2">
                <div class="fw-bold text-warning mb-2">{{ formatVND(item.unitPrice * item.quantity) }}</div>
                <button class="btn btn-sm btn-outline-danger" @click="emit('remove-item', item)" title="Xóa món">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-shrink-0 bg-white shadow-lg p-3 z-3 border-top">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <span class="fs-5 fw-bold text-muted">TỔNG CỘNG</span>
        <span class="fs-3 fw-bolder text-danger">{{ formatVND(totalAmount) }}</span>
      </div>
      
      <div v-if="selectedTable" class="row g-2">
        <template v-if="selectedTable.tableId !== 'TAKEAWAY'">
          <div class="col-12" v-if="!selectedTable.isInUse">
            <button class="btn btn-primary w-100 py-3 fw-bold fs-5 shadow-sm" @click="emit('open-table')">
              <i class="bi bi-unlock-fill me-2"></i> MỞ BÀN
            </button>
            <div class="text-center text-muted small mt-2">Vui lòng Mở Bàn trước khi gọi món</div>
          </div>
          
          <template v-else>
            <!-- UI Phương thức thanh toán (chỉ hiện nếu có món hoặc đơn cũ) -->
            <div class="col-12 mb-2" v-if="cart.length > 0 || existingOrder">
              <label class="form-label small fw-bold text-muted mb-1">Phương thức thanh toán</label>
              <select class="form-select bg-light" v-model="selectedPaymentMethod">
                <option value="Cash">Tiền mặt</option>
                <option value="Banking">Chuyển khoản / QR Code</option>
                <option value="Card">Thẻ / Ví điện tử</option>
              </select>
            </div>

            <div class="col-6" v-if="cart.length > 0">
              <button class="btn btn-warning w-100 py-2 fw-bold text-dark shadow-sm" @click="emit('send-to-kitchen', getCheckoutPayload())">
                <i class="bi bi-bell-fill me-1"></i> BÁO BẾP
              </button>
            </div>
            <div :class="cart.length > 0 ? 'col-6' : 'col-12'" v-if="existingOrder">
              <button class="btn btn-success w-100 py-2 fw-bold shadow-sm" @click="emit('checkout', getCheckoutPayload())">
                <i class="bi bi-credit-card-fill me-1"></i> THANH TOÁN
              </button>
            </div>
          </template>
        </template>
        
        <template v-else>
          <!-- UI Phương thức thanh toán cho Takeaway -->
          <div class="col-12 mb-2" v-if="cart.length > 0">
            <label class="form-label small fw-bold text-muted mb-1">Phương thức thanh toán</label>
            <select class="form-select bg-light" v-model="selectedPaymentMethod">
              <option value="Cash">Tiền mặt</option>
              <option value="Banking">Chuyển khoản / QR Code</option>
              <option value="Card">Thẻ / Ví điện tử</option>
            </select>
          </div>

          <div class="col-12" v-if="cart.length > 0">
            <button class="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm" @click="emit('send-to-kitchen', getCheckoutPayload())">
              <i class="bi bi-bag-check-fill me-2"></i> TẠO ĐƠN & THANH TOÁN
            </button>
          </div>
          <div class="col-12 text-center text-muted small mt-2" v-if="cart.length > 0">
             Đơn mang đi sẽ được đưa trực tiếp vào Bếp
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { formatVND } from '@/utils/helpers';
import type { OrderDetailDto } from './OperationsArea.vue';
import Swal from 'sweetalert2';
import { toast } from '@/utils/toast';
import { userService } from '@/services/UserService';

const props = defineProps<{ selectedTable: any, cart: OrderDetailDto[], existingOrder: any }>();
const emit = defineEmits(['remove-item', 'send-to-kitchen', 'checkout', 'open-table', 'change-table']);

const existingItems = computed(() => {
  if (!props.existingOrder) return [];
  return props.existingOrder.orderDetails || [];
});

const voucherCode = ref('');
const selectedPaymentMethod = ref('Cash');

// ==========================================
// CODE MỚI: XỬ LÝ AUTOTOCOMPLETE KHÁCH HÀNG
// ==========================================
const searchQuery = ref('');
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

  // Chờ 300ms sau khi ngừng gõ mới gọi API
  searchTimeout = setTimeout(async () => {
    try {
      // Sử dụng UserService chuẩn của hệ thống
      const res = await userService.getAll({ search: searchQuery.value, pageSize: 15 });
      const data = res.data || res;
      suggestedCustomers.value = data.items || [];
    } catch (error) {
      console.error('Lỗi tìm khách hàng:', error);
    } finally {
      isSearching.value = false;
    }
  }, 300); 
};

const selectCustomer = (customer: any) => {
  selectedCustomer.value = customer;
  searchQuery.value = ''; 
  showDropdown.value = false;
};

const clearCustomer = () => {
  selectedCustomer.value = null;
};

const hideDropdownDelay = () => {
  setTimeout(() => { showDropdown.value = false; }, 200);
};

const openAddCustomerModal = () => {
  // Logic mở Modal thêm khách hàng sau này code ở đây
  toast.success(`Tính năng thêm khách: ${searchQuery.value} sẽ sớm ra mắt!`);
  showDropdown.value = false;
};

// ==========================================
// TẠO PAYLOAD THANH TOÁN (Gồm cả Khách hàng)
// ==========================================
const getCheckoutPayload = () => {
  return {
    paymentMethod: selectedPaymentMethod.value,
    customerId: selectedCustomer.value ? selectedCustomer.value.id : null,
    customerName: selectedCustomer.value ? selectedCustomer.value.fullName : searchQuery.value,
    customerPhone: selectedCustomer.value ? selectedCustomer.value.phoneNumber : null
  };
};

// ==========================================

const applyVoucher = () => {
  if (!voucherCode.value) return;
  toast.success(`Đã áp dụng mã: ${voucherCode.value}`);
};

const handleChangeTable = async () => {
  const { value: newTableId } = await Swal.fire({
    title: 'Chuyển Bàn',
    input: 'select',
    inputOptions: {
      'id-ban-2': 'Bàn 2 (Tầng 1)',
      'id-ban-3': 'Bàn 3 (Tầng 1)',
    },
    inputPlaceholder: 'Chọn bàn muốn chuyển đến',
    showCancelButton: true,
    confirmButtonText: 'Chuyển ngay',
    cancelButtonText: 'Hủy'
  });

  if (newTableId) {
    toast.success('Chuyển bàn thành công!');
    emit('change-table'); 
  }
};

const totalAmount = computed(() => {
  let oldTotal = props.existingOrder?.finalAmount || 0;
  let newTotal = props.cart.reduce((sum, item) => sum + ((item.unitPrice || 0) * Number(item.quantity)), 0);
  return oldTotal + newTotal;
});
</script>

<style scoped>
.cursor-pointer { cursor: pointer; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

input[type="number"]::-webkit-inner-spin-button, 
input[type="number"]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>