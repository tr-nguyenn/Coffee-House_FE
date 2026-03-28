<template>
  <div class="invoices-container h-100 d-flex flex-column bg-dark text-light p-3 p-xl-4 position-relative">
    <div class="row g-4 flex-grow-1 overflow-hidden h-100">
      
      <!-- LEFT PANEL: INVOICE LIST (60%) -->
      <div class="col-12 col-xl-7 h-100 d-flex flex-column">
        <!-- Top Toolbar -->
        <div class="toolbar d-flex flex-wrap gap-3 align-items-end mb-4 bg-secondary p-3 rounded-3 shadow-sm border border-secondary border-opacity-50">
          <div class="flex-grow-1 min-w-200">
            <label class="form-label text-warning small fw-bold mb-1"><i class="bi bi-search me-1"></i>Search</label>
            <div class="input-group search-group">
              <span class="input-group-text bg-dark border-secondary text-secondary">
                <i class="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                class="form-control bg-dark border-secondary text-light" 
                placeholder="Search Invoice Code..."
                v-model="filter.searchTerm"
                @keyup.enter="fetchInvoices"
              />
            </div>
          </div>
          
          <div class="d-flex gap-3 flex-wrap">
            <div style="min-width: 150px;">
              <label class="form-label text-warning small fw-bold mb-1"><i class="bi bi-calendar-event me-1"></i>From Date</label>
              <input type="date" class="form-control bg-dark border-secondary text-light date-picker" v-model="filter.fromDate" />
            </div>
            <div style="min-width: 150px;">
              <label class="form-label text-warning small fw-bold mb-1"><i class="bi bi-calendar-event-fill me-1"></i>To Date</label>
              <input type="date" class="form-control bg-dark border-secondary text-light date-picker" v-model="filter.toDate" />
            </div>
          </div>
          
          <div>
            <button class="btn btn-warning fw-bold px-4 h-100 d-flex align-items-center gap-2 hover-elevate" @click="fetchInvoices">
              <i class="bi bi-funnel-fill"></i> Filter
            </button>
          </div>
        </div>

        <!-- Main Area: Data Table -->
        <div class="table-container flex-grow-1 bg-secondary rounded-3 shadow-sm border border-secondary border-opacity-50 d-flex flex-column overflow-hidden position-relative">
          
          <!-- Loading overlay -->
          <div v-if="loading" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3">
            <div class="spinner-border text-warning" role="status"></div>
          </div>

          <div class="table-responsive flex-grow-1 p-0 m-0 custom-scrollbar">
            <table class="table table-dark table-hover align-middle mb-0 base-table">
              <thead class="sticky-top bg-dark border-bottom border-warning border-2">
                <tr>
                  <th class="py-3 px-3 text-secondary text-uppercase small letter-spacing-1">Code</th>
                  <th class="py-3 text-secondary text-uppercase small letter-spacing-1">Table</th>
                  <th class="py-3 text-secondary text-uppercase small letter-spacing-1">Check-in</th>
                  <th class="py-3 text-secondary text-uppercase small letter-spacing-1">Check-out</th>
                  <th class="py-3 text-end text-secondary text-uppercase small letter-spacing-1">Amount</th>
                  <th class="py-3 px-3 text-center text-secondary text-uppercase small letter-spacing-1">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="invoices.length === 0 && !loading">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-receipt fs-1 d-block mb-2"></i>
                    No invoices found.
                  </td>
                </tr>
                <tr 
                  v-for="invoice in invoices" 
                  :key="invoice.id"
                  @click="selectInvoice(invoice.id)"
                  class="cursor-pointer transition-all"
                  :class="{ 'table-active border-start border-warning border-4': selectedInvoiceId === invoice.id }"
                >
                  <td class="px-3 fw-bold text-light">#{{ invoice.invoiceCode }}</td>
                  <td>
                    <span class="d-inline-flex align-items-center gap-1">
                      <i class="bi bi-diagram-3 small text-secondary"></i>
                      {{ invoice.tableName }}
                    </span>
                  </td>
                  <td class="small">{{ formatDateTime(invoice.checkInTime) }}</td>
                  <td class="small">{{ invoice.checkOutTime ? formatDateTime(invoice.checkOutTime) : '--' }}</td>
                  <td class="text-end fw-bold text-warning">{{ formatCurrency(invoice.finalAmount) }}</td>
                  <td class="px-3 text-center">
                    <span class="badge bg-success bg-opacity-10 text-success border border-success fw-bold px-2 py-1 rounded-pill">
                      <i class="bi bi-check-circle-fill me-1"></i> PAID
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer: Summary & Pagination -->
          <div class="p-3 bg-dark border-top border-secondary border-opacity-50 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div class="revenue-summary d-flex align-items-center gap-2 bg-warning bg-opacity-10 px-4 py-2 rounded-3 border border-warning border-opacity-25">
              <i class="bi bi-cash-coin fs-4 text-warning"></i>
              <div>
                <div class="small text-secondary fw-bold text-uppercase letter-spacing-1" style="font-size: 0.7rem;">Total Revenue</div>
                <div class="fs-5 fw-bolder text-warning">{{ formatCurrency(totalRevenue) }}</div>
              </div>
            </div>

            <div class="pagination-controls d-flex gap-2 align-items-center">
              <span class="small text-secondary me-2">Page {{ filter.pageNumber }} / {{ totalPages || 1 }}</span>
              <button class="btn btn-sm btn-outline-secondary btn-icon rounded-circle" :disabled="filter.pageNumber === 1" @click="changePage((filter.pageNumber ?? 1) - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button class="btn btn-sm btn-outline-secondary btn-icon rounded-circle" :disabled="(filter.pageNumber ?? 1) >= totalPages" @click="changePage((filter.pageNumber ?? 1) + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: INVOICE DETAIL (40%) -->
      <div 
        class="col-12 col-xl-5 h-100 transition-all right-panel-wrapper"
        :class="{ 'd-none d-xl-block': !selectedInvoiceId && !isMobileMode, 'd-block position-absolute z-3 top-0 start-0 w-100 bg-dark detail-mobile-overlay': selectedInvoiceId && isMobileMode }"
      >
        <div class="invoice-detail h-100 bg-secondary rounded-3 shadow-lg border border-secondary border-opacity-50 d-flex flex-column overflow-hidden position-relative">
          
          <div v-if="detailLoading" class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center z-3">
             <div class="spinner-border text-warning" role="status"></div>
          </div>

          <template v-if="selectedDetail">
            <!-- Header -->
            <div class="detail-header p-4 bg-dark border-bottom border-warning border-2 position-relative">
              <button v-if="isMobileMode" class="btn btn-sm btn-outline-secondary position-absolute top-0 start-0 m-3 btn-icon rounded-circle" @click="selectedInvoiceId = null">
                 <i class="bi bi-x-lg"></i>
              </button>
              <div class="text-center mb-3 mt-2 mt-xl-0">
                <h5 class="fw-bolder text-uppercase letter-spacing-2 text-warning mb-1">Invoice Detail</h5>
                <h3 class="fw-black text-white mb-0">#{{ selectedDetail.invoiceCode }}</h3>
              </div>
              
              <div class="row g-3 small bg-secondary bg-opacity-25 p-3 rounded-3 mt-2">
                 <div class="col-6">
                    <div class="text-secondary text-uppercase fw-bold mb-1" style="font-size: 0.65rem;">Check-in</div>
                    <div class="fw-medium">{{ formatDateTime(selectedDetail.checkInTime) }}</div>
                 </div>
                 <div class="col-6">
                    <div class="text-secondary text-uppercase fw-bold mb-1" style="font-size: 0.65rem;">Check-out</div>
                    <div class="fw-medium">{{ selectedDetail.checkOutTime ? formatDateTime(selectedDetail.checkOutTime) : '--' }}</div>
                 </div>
                 <div class="col-12 mt-2 pt-2 border-top border-secondary border-opacity-25">
                    <div class="d-flex justify-content-between align-items-center">
                      <span class="text-secondary text-uppercase fw-bold" style="font-size: 0.65rem;">Table</span>
                      <span class="badge bg-dark border border-secondary text-light px-3 py-1">{{ selectedDetail.tableName }}</span>
                    </div>
                 </div>
              </div>
            </div>

            <!-- Itemized Table -->
            <div class="detail-body flex-grow-1 p-4 overflow-y-auto custom-scrollbar bg-dark bg-opacity-50">
               <div class="table-responsive">
                 <table class="table table-borderless table-sm text-light mb-0 align-middle">
                    <thead class="border-bottom border-secondary border-opacity-50 text-secondary small text-uppercase">
                       <tr>
                          <th class="fw-bold pb-2">Item</th>
                          <th class="fw-bold pb-2 text-center">Qty</th>
                          <th class="fw-bold pb-2 text-end">Price</th>
                          <th class="fw-bold pb-2 text-end">Total</th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr v-for="(item, index) in selectedDetail.items" :key="index" class="border-bottom border-secondary border-opacity-10">
                          <td class="py-3 fw-medium">{{ item.productName }}</td>
                          <td class="py-3 text-center text-secondary">x{{ item.quantity }}</td>
                          <td class="py-3 text-end text-secondary small">{{ formatCurrency(item.unitPrice) }}</td>
                          <td class="py-3 text-end fw-bold">{{ formatCurrency(item.totalPrice) }}</td>
                       </tr>
                    </tbody>
                 </table>
               </div>
            </div>

            <!-- Totals Summary & Actions -->
            <div class="detail-footer p-4 bg-dark border-top border-secondary border-opacity-50">
               <div class="summary-breakdown mb-4">
                  <div class="d-flex justify-content-between mb-2">
                     <span class="text-secondary">Subtotal</span>
                     <span class="fw-medium">{{ formatCurrency(selectedDetail.subTotal) }}</span>
                  </div>
                  <div class="d-flex justify-content-between mb-2 text-success">
                     <span>Discount</span>
                     <span>-{{ formatCurrency(selectedDetail.discount) }}</span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary border-opacity-50">
                     <span class="fw-bold text-uppercase letter-spacing-1 text-light">Final Payment</span>
                     <h3 class="fw-black text-warning mb-0 m-0">{{ formatCurrency(selectedDetail.finalAmount) }}</h3>
                  </div>
               </div>

               <div class="d-flex gap-3">
                  <button class="btn btn-outline-secondary flex-grow-0 px-4 hover-elevate transition-all fw-bold" @click="closeDetail">
                    <i class="bi bi-x-circle me-1"></i> Close
                  </button>
                  <button class="btn btn-warning flex-grow-1 fw-bold fs-6 dropdown-item hover-elevate transition-all d-flex align-items-center justify-content-center gap-2" @click="printInvoice">
                     <i class="bi bi-printer-fill fs-5"></i> PRINT INVOICE
                  </button>
               </div>
            </div>
          </template>

          <div v-else class="h-100 d-flex flex-column align-items-center justify-content-center text-secondary opacity-50 p-5 text-center">
            <i class="bi bi-receipt-cutoff" style="font-size: 5rem; margin-bottom: 1rem;"></i>
            <h4 class="fw-bold letter-spacing-1">NO INVOICE SELECTED</h4>
            <p class="small">Select an invoice from the list to view its details</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import InvoiceService from '@/services/InvoiceService';
import type { InvoiceDto, InvoiceDetailDto, InvoiceFilterDto } from '@/services/InvoiceService';
import { toast } from '@/utils/toast';

const loading = ref(false);
const detailLoading = ref(false);
const invoices = ref<InvoiceDto[]>([]);
const totalRevenue = ref(0);
const totalPages = ref(1);

const filter = ref<InvoiceFilterDto>({
  pageNumber: 1,
  pageSize: 15,
  searchTerm: '',
  fromDate: '',
  toDate: ''
});

const selectedInvoiceId = ref<string | null>(null);
const selectedDetail = ref<InvoiceDetailDto | null>(null);

const isMobileMode = ref(window.innerWidth < 1200);

const handleResize = () => {
  isMobileMode.value = window.innerWidth < 1200;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
  fetchInvoices();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

const fetchInvoices = async () => {
  try {
    loading.value = true;
    const res = await InvoiceService.getInvoicesPaged(filter.value);
    invoices.value = res.data.data.items || [];
    totalRevenue.value = res.data.data.totalRevenue || 0;
    const totalCount = res.data.data.totalCount || 0;
    totalPages.value = Math.ceil(totalCount / (filter.value.pageSize || 15));
  } catch (err: any) {
    toast.error('Gặp lỗi khi tải danh sách hóa đơn.');
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const changePage = (page: number) => {
  filter.value.pageNumber = page;
  fetchInvoices();
};

const selectInvoice = async (id: string) => {
  selectedInvoiceId.value = id;
  try {
    detailLoading.value = true;
    const res = await InvoiceService.getInvoiceDetail(id);
    selectedDetail.value = res.data.data;
  } catch (err: any) {
    toast.error('Gặp lỗi khi tải chi tiết hóa đơn.');
    selectedInvoiceId.value = null;
    console.error(err);
  } finally {
    detailLoading.value = false;
  }
};

const closeDetail = () => {
  selectedInvoiceId.value = null;
  selectedDetail.value = null;
};

const printInvoice = () => {
  if (!selectedDetail.value) return;
  toast.success(`Printing invoice ${selectedDetail.value.invoiceCode}...`);
  // Print logic ideally triggers a browser print for a specific hidden div or PDF generation
  window.print();
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
</script>

<style scoped>
/* Base Dark Theme Adjustments matching the prompt's aesthetic */
.invoices-container {
  background-color: #151521 !important; /* Deep charcoal */
}

/* Scrollbar styling */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 193, 7, 0.3);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 193, 7, 0.6);
}

.base-table td {
  border-color: rgba(255, 255, 255, 0.05);
}

.table-hover tbody tr:hover td {
  background-color: rgba(255, 255, 255, 0.02) !important;
  color: #fff;
}

.table-active td {
  background-color: rgba(255, 193, 7, 0.05) !important;
}

.min-w-200 {
  min-width: 200px;
}

/* Inputs and Forms */
.form-control:focus, .input-group-text {
  box-shadow: none;
  border-color: #ffc107 !important;
}
.date-picker::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.6;
  cursor: pointer;
}
.date-picker::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}

/* Typography & Layout Utils */
.fw-black {
  font-weight: 900;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-2 {
  letter-spacing: 2px;
}
.transition-all {
  transition: all 0.2s ease-in-out;
}
.hover-elevate:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}
.cursor-pointer {
  cursor: pointer;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Detail Mobile Overlay */
.detail-mobile-overlay {
  height: 100vh;
  position: fixed !important;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1060 !important;
  padding: 1rem;
}
.detail-mobile-overlay .invoice-detail {
  height: 100% !important;
}

@media print {
  /* Hide everything except the detail view when printing */
  body * {
    visibility: hidden;
  }
  .invoice-detail, .invoice-detail * {
    visibility: visible;
  }
  .invoice-detail {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    background: white !important;
    color: black !important;
  }
  .detail-header, .detail-body, .detail-footer {
    background: white !important;
    color: black !important;
  }
  .text-warning, .text-secondary, .text-light {
    color: black !important;
  }
  .btn {
    display: none !important;
  }
}
</style>
