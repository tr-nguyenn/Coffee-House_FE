<template>
  <div class="d-flex flex-column h-100 bg-white ms-3 border-start no-print">
    <div class="p-2 border-bottom bg-light flex-shrink-0 z-1 d-flex justify-content-center">
      <div class="custom-tab-container bg-white border shadow-sm p-1 rounded-pill d-inline-flex">
        <button
          class="custom-tab-btn rounded-pill fw-semibold transition-all"
          :class="{active: activeTab === 'menu'}"
          @click="activeTab = 'menu'"
        >
          <i class="bi bi-journal-text me-1"></i> Thực đơn
        </button>
        <button
          class="custom-tab-btn rounded-pill fw-semibold transition-all position-relative"
          :class="{active: activeTab === 'cart'}"
          @click="activeTab = 'cart'"
        >
          <i class="bi bi-receipt me-1"></i> Hóa đơn
          <span
            v-if="cart.length > 0"
            class="position-absolute badge rounded-pill bg-danger border border-white"
            style="
              top: 0px;
              right: 0px;
              transform: translate(-60%, 20%);
              font-size: 0.65rem;
              padding: 0.3em 0.5em;
            "
          >
            {{ cart.length }}
            <span class="visually-hidden">món trong giỏ</span>
          </span>
        </button>
      </div>
    </div>

    <div class="tab-content flex-grow-1 overflow-hidden position-relative">
      <div
        class="tab-pane fade h-100 w-100 position-absolute top-0 start-0"
        :class="{'show active': activeTab === 'menu'}"
        style="z-index: 1"
      >
        <PosMenu @add-to-cart="handleAddToCart" />
      </div>

      <div
        class="tab-pane fade h-100 w-100 position-absolute top-0 start-0 bg-white"
        :class="{'show active': activeTab === 'cart'}"
        style="z-index: 2"
      >
        <PosCart
          :selectedTable="selectedTable"
          :cart="cart"
          :existingOrder="existingOrder"
          @remove-item="handleRemoveItem"
          @send-to-kitchen="handleSendToKitchen"
          @checkout="handleCheckout"
          @open-table="handleOpenTable"
          @print-provisional="handlePrintProvisional"
          @add-customer="handleOpenCustomerModal"
          @show-qr-modal="handleShowQrModal"
        />
      </div>
    </div>
  </div>

  <PrintBill :order="orderToPrint" />

  <CustomerModal ref="userModalRef" @saved="handleCustomerSaved" />
</template>

<script setup lang="ts">
import {ref, watch, nextTick, onMounted, onUnmounted} from "vue";
import {paymentService} from "@/services/PaymentService";
import PrintBill from "../shared/PrintBill.vue";
import PosMenu from "./PosMenu.vue";
import PosCart from "./PosCart.vue";
import CustomerModal from "@/components/admin/CustomerModal.vue";
import {toast} from "@/utils/toast";
import {orderService} from "@/services/OrderService";
import {formatVND} from "@/utils/helpers";

const props = defineProps<{selectedTable: any | null}>();
const emit = defineEmits(["order-success"]);

export interface OrderDetailDto {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  note: string;
}

const activeTab = ref<"menu" | "cart">("menu");
const cart = ref<OrderDetailDto[]>([]);
const existingOrder = ref<any>(null);
const selectedTableIdRef = ref<string | null>(null);
const orderToPrint = ref<any>(null);

// 👉 Khai báo biến Ref cho Modal Khách hàng
const userModalRef = ref<any>(null);

// 👉 Biến state cho Thanh toán QR (SePay)
const lastPayload = ref<any>(null);

onMounted(() => {
  // Global listener: Bất kể thu ngân đang phục vụ bàn nào, nếu có SignalR báo "Đã nhận tiền" -> Tự động In Bill!
  paymentService.startConnection(async (orderId: string, amount: number) => {
    toast.success(`Hệ thống đã nhận tự động ${formatVND(amount)} từ khách chuyển khoản!`);
    
    // Tự động kéo Order Detail về từ Server để in (Tránh việc thu ngân đã chuyển sang bàn khác)
    try {
      const orderData = await orderService.getOrderById(orderId);
      
      orderToPrint.value = {
        ...orderData,
        paymentMethod: "Banking",
        isProvisional: false,
        customerName: orderData.customerName,
        discountAmount: orderData.discountAmount ?? 0,
        finalAmount: orderData.finalAmount,
        totalAmount: orderData.totalAmount,
      };

      // In tự động và ẩn
      setTimeout(() => {
        window.print();
        orderToPrint.value = null;
      }, 500);

      // Nếu bàn hiện tại đang được chọn trùng với bàn vừa trả tiền -> Xóa trắng khu vực POS đi (Đóng bàn)
      if (existingOrder.value && existingOrder.value.id === orderId) {
        emit("order-success", "checkout");
      } else {
        // Cập nhật ngầm TableMap nếu thu ngân đang xem bàn khác
        emit("order-success", "update");
      }

    } catch (e) {
      console.error("Lỗi khi fetch order in bill tự động", e);
    }
  });
});

onUnmounted(() => {
  paymentService.stopConnection();
});

watch(
  () => props.selectedTable,
  async (newTable) => {
    if (newTable?.tableId !== selectedTableIdRef.value) {
      cart.value = [];
      selectedTableIdRef.value = newTable?.tableId || null;
    }
    existingOrder.value = null;
    if (newTable && newTable.isInUse && newTable.activeOrderId && newTable.tableId !== "TAKEAWAY") {
      try {
        existingOrder.value = await orderService.getOrderById(newTable.activeOrderId);
      } catch (err) {
        toast.error("Lỗi tải thông tin hóa đơn cũ!");
      }
    }
  },
  {immediate: true},
);

// 👉 HÀM XỬ LÝ MỞ MODAL THÊM KHÁCH (Tự động điền dữ liệu)
const handleOpenCustomerModal = (searchStr: string) => {
  const prefillData: any = {};

  if (searchStr) {
    const trimmedStr = searchStr.trim();
    // Regex check: Nếu chuỗi chỉ chứa số (có thể có dấu + đầu tiên) -> Là Số điện thoại
    if (/^[\d+]+$/.test(trimmedStr)) {
      prefillData.phoneNumber = trimmedStr;
    }
    // Còn lại thì mặc định gán vào Tên khách hàng
    else {
      prefillData.fullName = trimmedStr;
    }
  }

  // Gọi hàm show của Modal và nhét data mồi vào
  userModalRef.value?.show(prefillData);
};

// 👉 Xử lý sau khi lưu khách hàng thành công
const handleCustomerSaved = () => {
  toast.success("Thêm khách hàng thành công! Vui lòng gõ lại SĐT để chọn.");
};

const handleAddToCart = (product: any) => {
  const existing = cart.value.find((c) => c.productId === product.id);
  if (existing) existing.quantity++;
  else
    cart.value.push({
      productId: product.id,
      name: product.name,
      quantity: 1,
      unitPrice: product.price,
      note: "",
    });
  toast.success(`Đã thêm ${product.name}`);
};

const handleRemoveItem = (item: OrderDetailDto) => {
  cart.value = cart.value.filter((c) => c.productId !== item.productId);
};

const handleSendToKitchen = async (payload?: any) => {
  if (!props.selectedTable) return toast.error("Vui lòng chọn bàn hoặc Khách mang đi!");
  if (cart.value.length === 0) return;
  const itemsDto = cart.value.map((c) => ({
    productId: c.productId,
    quantity: c.quantity,
    note: c.note,
  }));

  try {
    // 1. Nếu THÊM MÓN vào Đơn (Cả bàn thật và Takeaway đã có existingOrder)
    if (existingOrder.value) {
      await orderService.addItemsToOrder(existingOrder.value.id, {
        newItems: itemsDto,
      });
      cart.value = [];
      toast.success("Đã báo bếp món thêm!");
      // Tải lại order hiện tại để hiển thị đầy đủ
      existingOrder.value = await orderService.getOrderById(existingOrder.value.id);
      return; 
    }

    // 2. Nếu TẠO MỚI cho Khách Mang Đi
    if (props.selectedTable.tableId === "TAKEAWAY") {
      // Báo bếp mang đi sẽ giả lập như Mở bàn, tạo bill "Unpaid" chứ chưa có thanh toán ngay
      const res: any = await orderService.createOrder({
        tableId: null,
        items: itemsDto,
        paymentMethod: "Unpaid", 
        customerId: payload?.customerId || null,
        customerName: payload?.customerName || null,
        customerPhone: payload?.customerPhone || null,
        note: "Takeaway",
        pointsUsed: payload?.pointsUsed || 0,
        voucherId: payload?.voucherId || null,
      });

      // Clear giỏ hàng nháp
      cart.value = [];
      
      // Load hóa đơn vừa tạo vào màn hình hiện tại (để hiện ra nút THANH TOÁN giống hệt bàn thật)
      try {
        existingOrder.value = await orderService.getOrderById(res.id || res.orderId);
      } catch (err: any) {
        toast.error("Không thể load lại bill vừa tạo!");
      }

      toast.success("Đã báo bếp đơn mang đi! Vui lòng bấm Thanh toán.");
      return;
    } 
    
    // 3. Nghiệp vụ dự phòng (Lỗi không mở bàn mà đòi gọi móng)
    if (!props.selectedTable.isInUse || !props.selectedTable.activeOrderId) {
      return toast.warning("Vui lòng mở bàn trước khi gọi món!");
    }
    
    cart.value = [];
    emit("order-success", "update");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Lỗi báo bếp!");
  }
};

const handleOpenTable = async () => {
  if (!props.selectedTable) return;
  try {
    await orderService.openTable(props.selectedTable.tableId);
    toast.success("Mở bàn thành công!");
    emit("order-success", "create");
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || "Lỗi mở bàn!");
  }
};

const getPaymentMethodName = (method: string) => {
  const map: Record<string, string> = {Cash: "Tiền mặt", Banking: "Chuyển khoản / QR", Card: "Thẻ / Ví"};
  return map[method] || method || "Tiền mặt";
};

const handlePrintProvisional = async (payload?: any) => {
  if (!existingOrder.value) {
    // Khách mang đi đang chọn món -> In form tạm tính mô phỏng
    if (cart.value.length === 0) return toast.warning("Giỏ hàng đang trống!");
    orderToPrint.value = {
      orderCode: "TẠM TÍNH",
      status: "Processing",
      paymentMethod: payload?.paymentMethod || "Unpaid",
      isProvisional: true,
      customerName: payload?.customerName || "Khách mang đi",
      discountAmount: payload?.discountAmount || 0,
      finalAmount: payload?.finalAmount || 0,
      totalAmount: payload?.totalAmount || 0,
      orderDetails: cart.value.map(c => ({
        productName: c.name,
        quantity: c.quantity,
        unitPrice: c.unitPrice
      }))
    };
    await nextTick();
    setTimeout(() => {
      window.print();
      orderToPrint.value = null;
    }, 100);
    return;
  }

  orderToPrint.value = {
    ...existingOrder.value,
    isProvisional: true,
    customerName: payload?.customerName || existingOrder.value.customerName,
    discountAmount: payload?.discountAmount ?? existingOrder.value.discountAmount ?? 0,
    finalAmount: payload?.finalAmount ?? existingOrder.value.finalAmount,
    totalAmount: payload?.totalAmount ?? existingOrder.value.totalAmount,
  };
  await nextTick();
  setTimeout(() => {
    window.print();
    orderToPrint.value = null;
  }, 100);
};

const pushQrToCustomerDisplay = (payload: any) => {
  const STK = "15102000711111"; 
  const BANK = "MBBank";
  const qrUrl = `https://qr.sepay.vn/img?acc=${STK}&bank=${BANK}&amount=${payload.finalAmount}&des=${existingOrder.value.orderCode}`;
  
  const bc = new BroadcastChannel("pos-customer-channel");
  bc.postMessage({
    action: "SHOW_QR",
    payload: {
      orderId: existingOrder.value.id,
      orderCode: existingOrder.value.orderCode,
      amount: payload.finalAmount,
      sepayQrUrl: qrUrl
    }
  });
};

const handleShowQrModal = () => {
  if (!existingOrder.value || !lastPayload.value) return;
  pushQrToCustomerDisplay(lastPayload.value);
  toast.success("Đã đẩy lại mã QR ra Màn hình phụ!");
};

const handleCheckout = async (payload?: any) => {
  if (!existingOrder.value) return;
  const paymentMethod = payload?.paymentMethod || "Cash";

  if (paymentMethod === "Banking") {
    try {
      lastPayload.value = payload;
      
      // 1. Lưu lại phương thức thanh toán xuống Database (Không chuyển status sang Completed)
      await orderService.updatePaymentMethod(existingOrder.value.id, "Banking");
      existingOrder.value.paymentMethod = "Banking";
      emit("order-success", "update"); // Refresh lại TableMap sang màu Cam
      
      // 2. Bắn QR ra màn phụ
      pushQrToCustomerDisplay(payload);
      toast.info(`Đã hiển thị QR lên màn phụ! Đang chuẩn bị in hóa đơn mã QR...`);

      // 3. Chuẩn bị In hóa đơn QR
      orderToPrint.value = {
        ...existingOrder.value,
        paymentMethod: "Banking",
        isProvisional: false, 
        customerName: payload?.customerName || existingOrder.value.customerName,
        discountAmount: payload?.discountAmount ?? existingOrder.value.discountAmount ?? 0,
        finalAmount: payload?.finalAmount ?? existingOrder.value.finalAmount,
        totalAmount: payload?.totalAmount ?? existingOrder.value.totalAmount,
      };

      await nextTick();
      setTimeout(() => {
        window.print();
        
        // 4. Xóa trắng giỏ hàng sau khi in xong (hoặc cancel)
        emit("order-success", "checkout");
        orderToPrint.value = null;
      }, 500);

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi cập nhật phương thức thanh toán!");
    }
  } else {
    // Tiền mặt / Thẻ -> Chốt đơn ngay lập tức
    if (confirm(`Xác nhận thanh toán hóa đơn này bằng ${getPaymentMethodName(paymentMethod)}?`)) {
      try {
        await orderService.checkoutOrder(existingOrder.value.id, {
          paymentMethod: paymentMethod,
          customerId: payload?.customerId || null,
          pointsUsed: payload?.pointsUsed || 0,
          voucherId: payload?.voucherId || null,
        });
        toast.success("Thanh toán thành công!");

        orderToPrint.value = {
          ...existingOrder.value,
          paymentMethod: paymentMethod,
          isProvisional: false,
          customerName: payload?.customerName || existingOrder.value.customerName,
          discountAmount: payload?.discountAmount ?? existingOrder.value.discountAmount ?? 0,
          finalAmount: payload?.finalAmount ?? existingOrder.value.finalAmount,
          totalAmount: payload?.totalAmount ?? existingOrder.value.totalAmount,
        };

        await nextTick();
        setTimeout(() => {
          window.print();
          emit("order-success", "checkout");
          orderToPrint.value = null;
        }, 500);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Lỗi thanh toán!");
      }
    }
  }
};
</script>

<style scoped>
.custom-tab-container {
  display: inline-flex;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}
.custom-tab-btn {
  background: transparent;
  border: none;
  color: #64748b;
  padding: 8px 32px;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  min-width: 140px;
  margin: 0 4px;
}
.custom-tab-btn:hover {
  color: #334155;
}
.custom-tab-btn.active {
  background-color: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.transition-all {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.tab-pane {
  display: flex;
  flex-direction: column;
}
.tab-content {
  position: relative;
  background-color: #ffffff;
}
.tab-pane:not(.active) {
  opacity: 0;
  pointer-events: none;
}
.tab-pane.active {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.3s ease;
}
.print-only {
  display: none;
}
</style>
