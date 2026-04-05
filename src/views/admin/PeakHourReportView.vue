<template>
  <div class="report-view h-100 d-flex flex-column overflow-auto custom-scrollbar">
    <!-- HEADER + BỘ LỌC -->
    <div class="report-header d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 pb-0">
      <h4 class="mb-0 fw-bold d-flex align-items-center gap-2">
        <i class="bi bi-clock-history text-primary"></i>
        <span class="text-dark">Phân tích Giờ cao điểm</span>
      </h4>
      <div class="filter-bar d-flex align-items-center gap-3 p-2 rounded-3 shadow-sm bg-white border">
        <div class="d-flex align-items-center gap-2">
          <label class="text-muted small fw-bold mb-0 text-nowrap">Từ ngày:</label>
          <input type="date" v-model="startDate" class="form-control form-control-sm filter-input" @change="fetchData" />
        </div>
        <div class="d-flex align-items-center gap-2">
          <label class="text-muted small fw-bold mb-0 text-nowrap">Đến ngày:</label>
          <input type="date" v-model="endDate" class="form-control form-control-sm filter-input" @change="fetchData" />
        </div>
        <button class="btn btn-primary btn-sm px-3 fw-bold" @click="fetchData" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{'spin': loading}"></i>
        </button>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading && !reportData.length" class="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem"></div>
      <p class="mt-3 text-muted fw-bold">Đang tải dữ liệu...</p>
    </div>

    <!-- NỘI DUNG -->
    <div v-else class="flex-grow-1 px-3 pb-4 pt-3">
      <!-- HIGHLIGHT CARD -->
      <div class="row g-3 mb-4" v-if="peakHourInfo">
        <div class="col-12 col-md-4">
          <div class="kpi-card p-3 rounded-3 d-flex align-items-center gap-3 shadow-sm bg-white border">
            <div class="kpi-icon bg-primary-subtle"><i class="bi bi-fire text-primary fs-4"></i></div>
            <div>
              <p class="text-muted small mb-1 fw-bold text-uppercase">Giờ cao điểm nhất</p>
              <h5 class="fw-bolder mb-0 text-dark">{{ peakHourInfo.hour }}:00 - {{ peakHourInfo.hour }}:59</h5>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="kpi-card p-3 rounded-3 d-flex align-items-center gap-3 shadow-sm bg-white border">
            <div class="kpi-icon bg-info-subtle"><i class="bi bi-cart-check text-info fs-4"></i></div>
            <div>
              <p class="text-muted small mb-1 fw-bold text-uppercase">Đơn hàng cao điểm</p>
              <h5 class="fw-bolder mb-0 text-dark">{{ peakHourInfo.orderCount }} <span class="fs-6 fw-normal text-muted">đơn</span></h5>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="kpi-card p-3 rounded-3 d-flex align-items-center gap-3 shadow-sm bg-white border">
            <div class="kpi-icon bg-success-subtle"><i class="bi bi-clipboard-data text-success fs-4"></i></div>
            <div>
              <p class="text-muted small mb-1 fw-bold text-uppercase">Tổng đơn trong kỳ</p>
              <h5 class="fw-bolder mb-0 text-dark">{{ totalOrders }} <span class="fs-6 fw-normal text-muted">đơn</span></h5>
            </div>
          </div>
        </div>
      </div>

      <!-- BAR CHART -->
      <div class="chart-card rounded-3 p-3 shadow-sm bg-white border">
        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-bar-chart-fill text-info"></i>
          <span class="text-dark">Lưu lượng đơn hàng theo khung giờ (0h - 23h)</span>
        </h6>
        <div style="min-height: 380px; position: relative;">
          <Bar :data="barData" :options="barOptions" class="w-100 h-100" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { reportService, type PeakHourDto } from "@/services/ReportService";
import { toast } from "@/utils/toast";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const loading = ref(false);
const reportData = ref<PeakHourDto[]>([]);

const getDateString = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const startDate = ref(getDateString(-30));
const endDate = ref(getDateString(0));

const totalOrders = computed(() => reportData.value.reduce((s, x) => s + x.orderCount, 0));

// Tìm giờ có nhiều đơn nhất
const peakHourInfo = computed(() => {
  if (!reportData.value.length) return null;
  const first = reportData.value[0]!;
  return reportData.value.reduce((max, x) => x.orderCount > max.orderCount ? x : max, first);
});

const fetchData = async () => {
  loading.value = true;
  try {
    reportData.value = await reportService.getPeakHoursReport(startDate.value, endDate.value);
  } catch {
    toast.error("Lỗi khi tải phân tích giờ cao điểm");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// Tạo màu: cột nào nhiều đơn nhất -> xanh đậm (primary), còn lại -> xanh lơ hoặc xám
const barData = computed(() => {
  const maxCount = Math.max(...reportData.value.map(x => x.orderCount), 1);
  const colors = reportData.value.map(x => {
    const ratio = x.orderCount / maxCount;
    if (ratio >= 0.9) return "#0d6efd";     // Xanh đậm - Giờ cao điểm
    if (ratio >= 0.6) return "#0dcaf0";     // Xanh lơ
    if (ratio >= 0.3) return "#a5d8ff";     // Xanh nhạt
    return "#e9ecef";                        // Xám nhạt
  });

  return {
    labels: reportData.value.map(x => `${x.hour}h`),
    datasets: [{
      label: "Số đơn hàng",
      data: reportData.value.map(x => x.orderCount),
      backgroundColor: colors,
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.7,
    }],
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e1e2d",
      titleColor: "#fff",
      bodyColor: "#fff",
      callbacks: {
        title: (items: any[]) => `Khung giờ: ${items[0].label}`,
        label: (ctx: any) => ` ${ctx.parsed.y} đơn hàng`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: { color: "#6c757d", font: { size: 11 }, stepSize: 1 },
    },
    x: {
      grid: { display: false },
      ticks: { color: "#6c757d", font: { size: 11 } },
    },
  },
};
</script>

<style scoped>
.report-view { background-color: #f8f9fa; color: #333; font-family: "Inter", sans-serif; }
.report-header h4 { color: #212529; }
.filter-bar { background: #fff; }
.filter-input { background-color: #f8f9fa !important; border: 1px solid #dee2e6; color: #333 !important; border-radius: 6px; }
.filter-input:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.1); }

.kpi-card { transition: transform 0.2s; }
.kpi-card:hover { transform: translateY(-3px); }
.kpi-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.bg-primary-subtle { background: rgba(13,110,253,0.1); }
.bg-info-subtle { background: rgba(13,202,240,0.1); }
.bg-success-subtle { background: rgba(25,135,84,0.1); }

.chart-card { background-color: #fff; border: 1px solid #dee2e6; }

.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
</style>
