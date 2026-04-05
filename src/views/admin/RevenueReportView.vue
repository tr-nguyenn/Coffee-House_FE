<template>
  <div class="report-view h-100 d-flex flex-column overflow-auto custom-scrollbar">
    <!-- HEADER + BỘ LỌC -->
    <div class="report-header d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 pb-0">
      <h4 class="mb-0 fw-bold d-flex align-items-center gap-2">
        <i class="bi bi-graph-up text-primary"></i>
        <span class="text-dark">Báo cáo Doanh thu</span>
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
      <!-- KPI CARDS -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <div class="kpi-card p-3 rounded-3 d-flex align-items-center gap-3 shadow-sm bg-white border">
            <div class="kpi-icon bg-primary-subtle"><i class="bi bi-wallet2 text-primary fs-4"></i></div>
            <div>
              <p class="text-muted small mb-1 fw-bold text-uppercase">Tổng doanh thu</p>
              <h5 class="fw-bolder mb-0 text-dark">{{ formatCurrency(totalRevenue) }}</h5>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="kpi-card p-3 rounded-3 d-flex align-items-center gap-3 shadow-sm bg-white border">
            <div class="kpi-icon bg-info-subtle"><i class="bi bi-receipt text-info fs-4"></i></div>
            <div>
              <p class="text-muted small mb-1 fw-bold text-uppercase">Tổng số đơn</p>
              <h5 class="fw-bolder mb-0 text-dark">{{ totalOrders }} <span class="fs-6 fw-normal text-muted">đơn</span></h5>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="kpi-card p-3 rounded-3 d-flex align-items-center gap-3 shadow-sm bg-white border">
            <div class="kpi-icon bg-success-subtle"><i class="bi bi-graph-up-arrow text-success fs-4"></i></div>
            <div>
              <p class="text-muted small mb-1 fw-bold text-uppercase">Trung bình / Đơn</p>
              <h5 class="fw-bolder mb-0 text-dark">{{ formatCurrency(avgPerOrder) }}</h5>
            </div>
          </div>
        </div>
      </div>

      <!-- CHART -->
      <div class="chart-card rounded-3 p-3 shadow-sm bg-white border">
        <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-bar-chart-line-fill text-primary"></i>
          <span class="text-dark">Biểu đồ doanh thu theo ngày</span>
        </h6>
        <div style="min-height: 350px; position: relative;">
          <div v-if="reportData.length === 0" class="text-muted text-center py-5">Không có dữ liệu trong khoảng thời gian này</div>
          <Line v-else :data="chartData" :options="chartOptions" class="w-100 h-100" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { reportService, type RevenueReportItemDto } from "@/services/ReportService";
import { toast } from "@/utils/toast";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const loading = ref(false);
const reportData = ref<RevenueReportItemDto[]>([]);

const getDateString = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const startDate = ref(getDateString(-30));
const endDate = ref(getDateString(0));

const totalRevenue = computed(() => reportData.value.reduce((s, x) => s + x.totalRevenue, 0));
const totalOrders = computed(() => reportData.value.reduce((s, x) => s + x.orderCount, 0));
const avgPerOrder = computed(() => totalOrders.value > 0 ? totalRevenue.value / totalOrders.value : 0);

const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const fetchData = async () => {
  loading.value = true;
  try {
    reportData.value = await reportService.getRevenueReport(startDate.value, endDate.value);
  } catch {
    toast.error("Lỗi khi tải báo cáo doanh thu");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// Area Chart: Gradient fill dưới đường line
const chartData = computed(() => ({
  labels: reportData.value.map(x => x.date.substring(0, 5)),
  datasets: [
    {
      label: "Doanh thu (VNĐ)",
      data: reportData.value.map(x => x.totalRevenue),
      borderColor: "#0d6efd",
      backgroundColor: "rgba(13, 110, 253, 0.1)",
      borderWidth: 2.5,
      pointBackgroundColor: "#0d6efd",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e1e2d",
      titleColor: "#fff",
      bodyColor: "#fff",
      callbacks: {
        label: (ctx: any) => " " + new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ctx.parsed.y),
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(0,0,0,0.05)" },
      ticks: {
        color: "#6c757d",
        font: { size: 11 },
        callback: (v: any) => { if (v >= 1000000) return v / 1000000 + "M"; if (v >= 1000) return v / 1000 + "k"; return v; },
      },
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
.filter-input:focus { border-color: #0d6efd; box-shadow: 0 0 0 0.2rem rgba(13,110,253,0.15); }

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
