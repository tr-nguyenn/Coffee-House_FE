<template>
  <div class="kitchen-view h-100 d-flex flex-column">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
        <i class="bi bi-display text-primary"></i>
        Màn hình Bếp
      </h4>
      <div class="d-flex align-items-center gap-3">
        <span class="badge bg-primary fs-6">{{ pendingTickets.length }} đơn đang chờ</span>
        <button class="btn btn-outline-secondary btn-sm" @click="fetchTickets" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': loading }"></i> Làm mới
        </button>
      </div>
    </div>

    <!-- Error/Empty State -->
    <div v-if="!loading && pendingTickets.length === 0" class="flex-grow-1 d-flex flex-column align-items-center justify-content-center text-muted">
      <i class="bi bi-check2-circle display-1 text-success opacity-50 mb-3"></i>
      <h5>Không có món nào đang chờ pha chế</h5>
      <p>Nhà bếp hiện đang rảnh rỗi.</p>
    </div>

    <!-- Grid of Tickets -->
    <div v-else class="row g-3 flex-grow-1 align-content-start overflow-auto pb-4">
      <transition-group name="list">
        <div v-for="ticket in pendingTickets" :key="ticket.orderDetailId" class="col-12 col-md-6 col-lg-4 col-xl-3">
          <div class="card h-100 shadow-sm ticket-card" :class="{ 'border-danger danger-pulse': getWaitTimeSeconds(ticket.prepStartTime) >= 300, 'border-0': getWaitTimeSeconds(ticket.prepStartTime) < 300 }">
            <div class="card-header border-0 pb-0 pt-3 bg-transparent d-flex justify-content-between align-items-start">
              <div>
                <span class="badge bg-dark fw-bold px-3 py-2 fs-6 mb-2">{{ ticket.tableName || 'Mang về' }}</span>
              </div>
              <div class="wait-time" :class="getWaitTimeSeconds(ticket.prepStartTime) >= 300 ? 'text-danger fw-bold' : 'text-muted'">
                <i class="bi bi-clock-history"></i> {{ formatWaitTime(getWaitTimeSeconds(ticket.prepStartTime)) }}
              </div>
            </div>
            
            <div class="card-body py-3">
              <h5 class="card-title fw-bold text-dark mb-1">{{ ticket.productName }}</h5>
              <div class="d-flex align-items-center mb-2 mt-2">
                <span class="badge bg-warning text-dark me-2 fs-6 px-3">SL: {{ ticket.quantity }}</span>
              </div>
              <p class="card-text text-muted small mb-0 mt-3 p-2 bg-light rounded border" v-if="ticket.note">
                <strong>Ghi chú:</strong> <span class="text-danger fw-bold">{{ ticket.note }}</span>
              </p>
            </div>
            
            <div class="card-footer bg-transparent border-0 pt-0 pb-3">
              <button 
                class="btn btn-success fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2" 
                @click="markReady(ticket.orderDetailId)"
                :disabled="processingId === ticket.orderDetailId">
                <span v-if="processingId === ticket.orderDetailId" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-check-circle-fill fs-5"></i>
                ĐÃ XONG
              </button>
            </div>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { orderService } from '@/services/OrderService';
import { toast } from '@/utils/toast';
import type { KitchenTicketDto } from '@/models/Order';
import { HubConnectionBuilder, LogLevel, type HubConnection } from '@microsoft/signalr';

// const toast = useToast(); is no longer needed since we import the toast object directly
const pendingTickets = ref<KitchenTicketDto[]>([]);
const loading = ref(false);
const processingId = ref<string | null>(null);
const timerInterval = ref<number | undefined>(undefined);
const now = ref(new Date().getTime());
let connection: HubConnection | null = null;

const fetchTickets = async () => {
  if (processingId.value) return; // Don't fetch while processing to avoid flickering
  try {
    loading.value = true;
    const items = await orderService.getPendingKitchenItems();
    // Maintain local state
    pendingTickets.value = items;
  } catch (error: any) {
    console.error('Failed to fetch kitchen tickets', error);
  } finally {
    loading.value = false;
  }
};

const markReady = async (id: string) => {
  try {
    processingId.value = id;
    await orderService.markItemReady(id);
    
    // Remove locally fast
    pendingTickets.value = pendingTickets.value.filter(t => t.orderDetailId !== id);
    toast.success('Đã cập nhật món hoàn thành!');
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
  } finally {
    processingId.value = null;
  }
};

const getWaitTimeSeconds = (prepStartTime?: string | null): number => {
  if (!prepStartTime) return 0;
  // Ensure we parse correctly depending on timezone. 
  // API prepStartTime should be UTC format usually "YYYY-MM-DDTHH:mm:ssZ"
  const start = new Date(prepStartTime + (prepStartTime.endsWith('Z') ? '' : 'Z')).getTime();
  const current = now.value;
  return Math.max(0, Math.floor((current - start) / 1000));
};

const formatWaitTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

onMounted(async () => {
  await fetchTickets();
  
  // Update UI timer every second
  timerInterval.value = window.setInterval(() => {
    now.value = new Date().getTime();
  }, 3000);

  // Setup SignalR Connection
  connection = new HubConnectionBuilder()
    .withUrl('https://localhost:7144/kitchenHub')
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Information)
    .build();

  connection.on('RefreshKitchenTickets', async () => {
    console.log('SignalR: Received RefreshKitchenTickets event');

    await fetchTickets();

    // Lưu lại số lượng đơn cũ trước khi lấy dữ liệu mới
    const oldLength = pendingTickets.value.length;
    
    await fetchTickets(); // Lấy dữ liệu mới từ Server
    
    // Nếu số lượng đơn mới nhiều hơn đơn cũ -> Chắc chắn là có người vừa order
    if (pendingTickets.value.length > oldLength) {
        toast.info('Bếp ơi! Có đơn hàng mới kìa!');
        
        // (Tùy chọn) Sếp có thể thêm code chạy âm thanh "Ting Ting" ở đây nếu muốn
        // const audio = new Audio('/sounds/ting-ting.mp3');
        // audio.play().catch(e => console.log('Auto-play blocked by browser'));
    }
  });

  try {
    await connection.start();
    console.log('SignalR: Connected to Kitchen Hub');
  } catch (err) {
    console.error('SignalR Connection Error: ', err);
  }
});

onUnmounted(() => {
  if (timerInterval.value) window.clearInterval(timerInterval.value);
  if (connection) {
    connection.stop();
  }
});
</script>

<style scoped>
.kitchen-view {
  min-height: 100%;
}
.ticket-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
}
.ticket-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}
.ticket-card.border-danger {
  border-width: 2px !important;
  border-color: #dc3545 !important;
  background-color: #fffafb;
}

.danger-pulse {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
}

.spin-animation {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.list-leave-active {
  position: absolute;
}
</style>