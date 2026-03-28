<template>
  <div class="d-flex flex-column h-100 bg-white ms-3">
    <ul class="nav nav-tabs bg-light border-bottom flex-shrink-0" role="tablist">
      <li class="nav-item">
        <button class="nav-link fs-5 fw-bold" :class="{ 'active': activeTab === 'menu' }" @click="activeTab = 'menu'">THỰC ĐƠN</button>
      </li>
      <li class="nav-item">
        <button class="nav-link fs-5 fw-bold" :class="{ 'active': activeTab === 'cart' }" @click="activeTab = 'cart'">
          HÓA ĐƠN <span v-if="cart.length > 0" class="badge bg-danger ms-1">{{ cart.length }}</span>
        </button>
      </li>
    </ul>

    <div class="tab-content flex-grow-1 overflow-hidden">
      <div class="tab-pane fade h-100" :class="{ 'show active': activeTab === 'menu' }">
        <PosMenu @add-to-cart="handleAddToCart" />
      </div>
      <div class="tab-pane fade h-100" :class="{ 'show active': activeTab === 'cart' }">
        <PosCart 
          :selectedTable="selectedTable" 
          :cart="cart" 
          :existingOrder="existingOrder"
          @remove-item="handleRemoveItem"
          @send-to-kitchen="handleSendToKitchen" 
          @checkout="handleCheckout"
          @open-table="handleOpenTable"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import PosMenu from './PosMenu.vue';
import PosCart from './PosCart.vue';
import { toast } from '@/utils/toast';
import { orderService } from '@/services/OrderService';

const props = defineProps<{ selectedTable: any | null }>();
const emit = defineEmits(['order-success']);

export interface OrderDetailDto {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  note: string;
}

const activeTab = ref<'menu' | 'cart'>('menu');
const cart = ref<OrderDetailDto[]>([]);
const existingOrder = ref<any>(null); // Lưu thông tin hóa đơn cũ của bàn

const selectedTableIdRef = ref<string | null>(null);

// Lắng nghe: Cứ mỗi lần đổi bàn bên cột trái, lập tức reset Giỏ hàng mới và tải Hóa đơn cũ (nếu có)
watch(() => props.selectedTable, async (newTable) => {
  // Chỉ reset giỏ hàng nếu ĐỔI sang bàn khác
  if (newTable?.tableId !== selectedTableIdRef.value) {
    cart.value = [];
    selectedTableIdRef.value = newTable?.tableId || null;
  }
  
  existingOrder.value = null;
  
  if (newTable && newTable.isInUse && newTable.activeOrderId && newTable.tableId !== 'TAKEAWAY') {
    try {
      // Bàn Đỏ: Gọi API lấy chi tiết Bill cũ về
      existingOrder.value = await orderService.getOrderById(newTable.activeOrderId);
    } catch (err) {
      toast.error('Lỗi tải thông tin hóa đơn cũ!');
    }
  }
}, { immediate: true });

const handleAddToCart = (product: any) => {
  const existing = cart.value.find(c => c.productId === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ productId: product.id, name: product.name, quantity: 1, unitPrice: product.price, note: '' });
  }
  toast.success(`Đã thêm ${product.name}`);
};

const handleRemoveItem = (item: OrderDetailDto) => {
  cart.value = cart.value.filter(c => c.productId !== item.productId);
};

// LUỒNG 1: BÁO BẾP (Gửi Order)
const handleSendToKitchen = async (payload?: any) => {
  if (!props.selectedTable) { toast.error("Vui lòng chọn bàn hoặc Khách mang đi!"); return; }
  if (cart.value.length === 0) return;

  const itemsDto = cart.value.map(c => ({ productId: c.productId, quantity: c.quantity, note: c.note }));

  try {
    // TRƯỜNG HỢP 1: KHÁCH MANG ĐI (Tạo Order mới hoàn toàn, TableId = null)
    if (props.selectedTable.tableId === 'TAKEAWAY') {
      await orderService.createOrder({ 
        tableId: null, 
        items: itemsDto,
        paymentMethod: payload?.paymentMethod || 'Cash',
        userId: payload?.customerId || null,
        customerName: payload?.customerName || null,
        customerPhone: payload?.customerPhone || null,
        note: 'Takeaway' 
      });
      toast.success('Thanh toán mang đi thành công! Đã báo bếp.');
    } 
    // TRƯỜNG HỢP 2: KHÁCH TẠI QUÁN
    else {
      if (!props.selectedTable.isInUse || !props.selectedTable.activeOrderId) {
        toast.warning("Vui lòng mở bàn trước khi gọi món!");
        return;
      }
      // Gọi API Update thêm món vào Bill đang mở
      await orderService.addItemsToOrder(props.selectedTable.activeOrderId, { newItems: itemsDto });
      toast.success('Đã báo bếp món thêm!');
    }

    cart.value = []; // Reset giỏ hàng mới
    emit('order-success', 'update');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Lỗi báo bếp!');
  }
};

// LUỒNG MỚI: MỞ BÀN
const handleOpenTable = async () => {
  if (!props.selectedTable) return;
  try {
    await orderService.openTable(props.selectedTable.tableId);
    toast.success('Mở bàn thành công!');
    
    // Cập nhật lại sơ đồ bàn -> Bàn chuyển sang đỏ
    emit('order-success', 'create'); 
  } catch(err: any) {
    const errorMsg = err.response?.data?.message || err.message || 'Lỗi mở bàn!';
    toast.error(errorMsg);
  }
};

// LUỒNG 2: THANH TOÁN & TRẢ BÀN
const handleCheckout = async (payload?: any) => {
  if (!existingOrder.value) return;
  
  if (confirm("Xác nhận thanh toán và đóng bàn này?")) {
    try {
      await orderService.checkoutOrder(existingOrder.value.id, { 
        paymentMethod: payload?.paymentMethod || 'Cash',
        customerId: payload?.customerId || null,
        customerName: payload?.customerName || null,
        customerPhone: payload?.customerPhone || null
      });
      toast.success('Thanh toán thành công!');
      emit('order-success', 'checkout'); // Yêu cầu load lại Sơ đồ bàn (Bàn sẽ về màu Xanh)
    } catch (err) {
      toast.error('Lỗi thanh toán!');
    }
  }
};
</script>