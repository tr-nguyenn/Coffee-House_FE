<template>
  <div class="report-view h-100 d-flex flex-column overflow-auto custom-scrollbar">
    <!-- HEADER + BỘ LỌC -->
    <div class="report-header d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 pb-0">
      <h4 class="mb-0 fw-bold d-flex align-items-center gap-2">
        <i class="bi bi-cup-hot-fill text-primary"></i>
        <span class="text-dark">Báo cáo Sản phẩm bán chạy</span>
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
      <div class="row g-3">
        <!-- DOUGHNUT CHART -->
        <div class="col-12 col-xl-5">
          <div class="chart-card rounded-3 p-3 h-100 shadow-sm bg-white border">
            <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-pie-chart-fill text-info"></i>
              <span class="text-dark">Tỷ trọng sản phẩm</span>
            </h6>
            <div class="d-flex justify-content-center align-items-center" style="min-height: 320px">
              <div v-if="reportData.length === 0" class="text-muted">Không có dữ liệu</div>
              <div v-else class="w-100 position-relative" style="max-width: 340px">
                <Doughnut :data="doughnutData" :options="doughnutOptions" />
              </div>
            </div>
          </div>
        </div>

        <!-- BẢNG CHI TIẾT -->
        <div class="col-12 col-xl-7">
          <div class="chart-card rounded-3 p-0 h-100 overflow-hidden shadow-sm bg-white border">
            <div class="p-3 pb-2">
              <h6 class="fw-bold mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-trophy-fill text-warning"></i>
                <span class="text-dark">Bảng xếp hạng Top 10</span>
              </h6>
            </div>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr class="text-muted small text-uppercase">
                    <th class="ps-3 py-2" style="width: 50px">#</th>
                    <th class="py-2">Tên sản phẩm</th>
                    <th class="py-2 text-center">Số lượng bán</th>
                    <th class="pe-3 py-2 text-end">Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="reportData.length === 0">
                    <td colspan="4" class="text-center py-4 text-muted">Chưa có dữ liệu</td>
                  </tr>
                  <tr v-for="(item, i) in reportData" :key="i" class="product-row">
                    <td class="ps-3">
                      <span class="rank-badge" :class="getRankClass(i)">{{ i + 1 }}</span>
                    </td>
                    <td class="fw-semibold text-dark">{{ item.productName }}</td>
                    <td class="text-center">
                      <span class="badge bg-light text-dark border px-2 py-1">{{ item.totalQuantity }}</span>
                    </td>
                    <td class="pe-3 text-end text-success fw-bold small">{{ formatCurrency(item.totalRevenue) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { reportService, type TopProductDto } from "@/services/ReportService";
import { toast } from "@/utils/toast";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "vue-chartjs";

ChartJS.register(ArcElement, Tooltip, Legend);

const loading = ref(false);
const reportData = ref<TopProductDto[]>([]);

const getDateString = (daysOffset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

const startDate = ref(getDateString(-30));
const endDate = ref(getDateString(0));

const formatCurrency = (v: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

const getRankClass = (i: number) => {
  if (i === 0) return "rank-gold";
  if (i === 1) return "rank-silver";
  if (i === 2) return "rank-bronze";
  return "rank-default";
};

const fetchData = async () => {
  loading.value = true;
  try {
    reportData.value = await reportService.getTopProductsReport(startDate.value, endDate.value);
  } catch {
    toast.error("Lỗi khi tải báo cáo sản phẩm");
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

// Bảng màu cho Doughnut
const chartColors = [
  "#0d6efd", "#0dcaf0", "#198754", "#ffc107", "#fd7e14",
  "#6f42c1", "#d63384", "#20c997", "#dc3545", "#6c757d"
];

const doughnutData = computed(() => ({
  labels: reportData.value.map(x => x.productName),
  datasets: [{
    data: reportData.value.map(x => x.totalQuantity),
    backgroundColor: chartColors.slice(0, reportData.value.length),
    borderColor: "#ffffff",
    borderWidth: 2,
    hoverOffset: 8,
  }],
}));

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: true,
  cutout: "65%",
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "#6c757d",
        usePointStyle: true,
        boxWidth: 8,
        font: { size: 11 },
        padding: 12,
      },
    },
    tooltip: {
      backgroundColor: "#1e1e2d",
      titleColor: "#fff",
      bodyColor: "#fff",
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
.chart-card { background-color: #fff; border: 1px solid #dee2e6; }

.product-row { transition: background 0.2s; }

.rank-badge {
  width: 26px; height: 26px; border-radius: 50%; display: inline-flex;
  align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem;
}
.rank-gold { background: #ffc107; color: #121212; }
.rank-silver { background: #e9ecef; color: #6c757d; border: 1px solid #dee2e6; }
.rank-bronze { background: #fff3e0; color: #e65100; border: 1px solid #ffe0b2; }
.rank-default { background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; }

.spin { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
</style>
