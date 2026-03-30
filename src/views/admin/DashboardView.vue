<template>
  <div class="dashboard-view h-100 d-flex flex-column custom-scrollbar overflow-auto">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 p-3 pb-0">
      <h4 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
        <i class="bi bi-speedometer2 text-primary"></i> Tổng quan
      </h4>

      <div class="d-flex align-items-center gap-3 bg-white p-2 rounded shadow-sm border">
        <div class="d-flex align-items-center gap-2">
          <label class="text-muted small fw-bold mb-0 text-nowrap">Từ ngày:</label>
          <input
            type="date"
            v-model="filters.startDate"
            class="form-control form-control-sm border-0 bg-light"
            @change="fetchDashboard"
          />
        </div>
        <div class="gap-2 d-none d-md-block border-start border-2 border-light h-100 mx-1"></div>
        <div class="d-flex align-items-center gap-2">
          <label class="text-muted small fw-bold mb-0 text-nowrap">Đến ngày:</label>
          <input
            type="date"
            v-model="filters.endDate"
            class="form-control form-control-sm border-0 bg-light"
            @change="fetchDashboard"
          />
        </div>
        <button class="btn btn-primary btn-sm ms-2" @click="fetchDashboard" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{'spin-animation': loading}"></i>
        </button>
      </div>
    </div>

    <div
      v-if="loading && !dashboardData"
      class="flex-grow-1 d-flex flex-column align-items-center justify-content-center"
    >
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem"></div>
      <p class="mt-3 text-muted fw-bold">Đang tải dữ liệu...</p>
    </div>

    <div v-else-if="dashboardData" class="dashboard-content flex-grow-1 px-3 pb-4">
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 shadow-sm kpi-card bg-primary text-white">
            <div class="card-body p-3 d-flex align-items-center position-relative overflow-hidden">
              <div class="flex-grow-1 z-index-1">
                <p class="text-white-50 fw-bold mb-1 small text-uppercase">Tổng Doanh Thu</p>
                <h4 class="fw-bolder mb-0 text-truncate">{{ formatCurrency(dashboardData.totalRevenue) }}</h4>
              </div>
              <div class="icon-bg position-absolute"><i class="bi bi-wallet2"></i></div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 shadow-sm kpi-card bg-success text-white">
            <div class="card-body p-3 d-flex align-items-center position-relative overflow-hidden">
              <div class="flex-grow-1 z-index-1">
                <p class="text-white-50 fw-bold mb-1 small text-uppercase">Đơn Hoàn Thành</p>
                <h4 class="fw-bolder mb-0">
                  {{ dashboardData.totalOrders }} <span class="fs-6 fw-normal">đơn</span>
                </h4>
              </div>
              <div class="icon-bg position-absolute"><i class="bi bi-receipt"></i></div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 shadow-sm kpi-card bg-info text-white">
            <div class="card-body p-3 d-flex align-items-center position-relative overflow-hidden">
              <div class="flex-grow-1 z-index-1">
                <p class="text-white-50 fw-bold mb-1 small text-uppercase">Trung Bình / Đơn</p>
                <h4 class="fw-bolder mb-0 text-truncate">
                  {{ formatCurrency(dashboardData.averageOrderValue) }}
                </h4>
              </div>
              <div class="icon-bg position-absolute"><i class="bi bi-graph-up"></i></div>
            </div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-xl-3">
          <div class="card h-100 border-0 shadow-sm kpi-card bg-warning text-dark">
            <div class="card-body p-3 d-flex align-items-center position-relative overflow-hidden">
              <div class="flex-grow-1 z-index-1">
                <p class="text-dark fw-bold mb-1 small text-uppercase opacity-75">Khách Đã Mua</p>
                <h4 class="fw-bolder mb-0">
                  {{ dashboardData.totalCustomers || 0 }} <span class="fs-6 fw-normal">khách</span>
                </h4>
              </div>
              <div class="icon-bg position-absolute text-dark"><i class="bi bi-people-fill"></i></div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-12 col-xl-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
              <h6 class="mb-0 fw-bold text-dark">
                <i class="bi bi-bar-chart-line-fill text-primary me-2"></i>Doanh thu theo ngày
              </h6>
            </div>
            <div
              class="card-body d-flex justify-content-center align-items-center p-3"
              style="min-height: 300px"
            >
              <div v-if="dashboardData.revenueTrends.length === 0" class="text-muted">Không có dữ liệu</div>
              <Bar v-else :data="barChartData" :options="barChartOptions" class="w-100 h-100" />
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
              <h6 class="mb-0 fw-bold text-dark">
                <i class="bi bi-pie-chart-fill text-success me-2"></i>Thanh toán
              </h6>
            </div>
            <div
              class="card-body d-flex flex-column justify-content-center align-items-center p-3"
              style="min-height: 300px"
            >
              <div v-if="dashboardData.paymentMethodStats.length === 0" class="text-muted">
                Không có dữ liệu
              </div>
              <div v-else class="w-100 h-100 position-relative" style="max-height: 250px">
                <Doughnut :data="pieChartData" :options="pieChartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-2">
        <div class="card-header bg-white border-bottom pt-3 pb-2">
          <h6 class="mb-0 fw-bold text-dark">
            <i class="bi bi-star-fill text-warning me-2"></i>Top 5 Món Bán Chạy Nhất
          </h6>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover table-borderless align-middle mb-0">
              <thead class="bg-light text-muted small fw-bolder">
                <tr>
                  <th class="ps-4 py-2" style="width: 60px">#</th>
                  <th class="py-2">Tên sản phẩm</th>
                  <th class="py-2 text-center">Số lượng</th>
                  <th class="pe-4 py-2 text-end">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="dashboardData.topSellingProducts.length === 0">
                  <td colspan="4" class="text-center py-4 text-muted">Chưa có món nào được bán</td>
                </tr>
                <tr
                  v-for="(product, index) in dashboardData.topSellingProducts"
                  :key="index"
                  class="border-bottom"
                >
                  <td class="ps-4 py-2">
                    <span
                      class="badge rounded-circle p-1 d-flex align-items-center justify-content-center"
                      :class="getRankBadgeClass(index)"
                      style="width: 24px; height: 24px"
                    >
                      {{ index + 1 }}
                    </span>
                  </td>
                  <td class="py-2 fw-semibold text-dark small">{{ product.productName }}</td>
                  <td class="py-2 text-center">
                    <span class="badge bg-light text-dark border px-2 py-1">{{ product.totalQuantity }}</span>
                  </td>
                  <td class="pe-4 py-2 text-end text-success fw-bold small">
                    {{ formatCurrency(product.totalRevenue) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from "vue";
import {reportService, type DashboardFilterDto, type DashboardSummaryDto} from "@/services/ReportService";
import {toast} from "@/utils/toast";
// 👉 Import thêm BarElement cho biểu đồ cột
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import {Doughnut, Bar} from "vue-chartjs"; // 👉 Dùng Bar thay cho Line

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
);
const loading = ref(false);
const dashboardData = ref<DashboardSummaryDto | null>(null);

const getTodayString = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const getSevenDaysAgoString = () => {
  const date = new Date();
  date.setDate(date.getDate() - 7); // Mặc định lấy 7 ngày cho biểu đồ cột đẹp
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const filters = ref<DashboardFilterDto>({
  startDate: getSevenDaysAgoString(),
  endDate: getTodayString(),
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(value);
};

const getRankBadgeClass = (index: number) => {
  if (index === 0) return "bg-warning text-dark";
  if (index === 1) return "bg-secondary text-white";
  if (index === 2) return "bg-danger text-white";
  return "bg-light text-secondary border";
};

const fetchDashboard = async () => {
  try {
    loading.value = true;
    dashboardData.value = await reportService.getDashboardSummary(filters.value);
  } catch (error: any) {
    toast.error("Có lỗi xảy ra khi tải dữ liệu tổng quan");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboard();
});

// 👉 CẤU HÌNH BIỂU ĐỒ CỘT (BAR CHART) - Xanh dương dọc
const barChartData = computed(() => {
  if (!dashboardData.value) return {labels: [], datasets: []};

  // Chỉ lấy tối đa 7 ngày gần nhất từ data trả về để biểu đồ không bị nát
  const trendData = dashboardData.value.revenueTrends.slice(-7);

  return {
    labels: trendData.map((x) => x.date.substring(0, 5)), // Cắt lấy DD/MM
    datasets: [
      {
        label: "Doanh thu (VNĐ)",
        backgroundColor: "#0d6efd", // Màu xanh dương chuẩn Bootstrap
        borderRadius: 4,
        barPercentage: 0.5, // Độ rộng cột (50%)
        data: trendData.map((x) => x.revenue),
      },
    ],
  };
});

const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {display: false},
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(
            context.parsed.y,
          );
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          if (value >= 1000000) return value / 1000000 + "M";
          if (value >= 1000) return value / 1000 + "k";
          return value;
        },
        font: {size: 11},
      },
      grid: {color: "rgba(0, 0, 0, 0.05)"},
    },
    x: {
      grid: {display: false},
      ticks: {font: {size: 11}},
    },
  },
};

// 👉 CẤU HÌNH BIỂU ĐỒ TRÒN (THU NHỎ LẠI)
const pieChartData = computed(() => {
  if (!dashboardData.value) return {labels: [], datasets: []};

  return {
    labels: dashboardData.value.paymentMethodStats.map((x) =>
      x.paymentMethod === "Cash"
        ? "Tiền mặt"
        : x.paymentMethod === "Transfer"
          ? "Chuyển khoản"
          : x.paymentMethod,
    ),
    datasets: [
      {
        backgroundColor: ["#198754", "#0dcaf0", "#ffc107"], // Xanh lá, Xanh lơ, Vàng
        borderWidth: 0,
        data: dashboardData.value.paymentMethodStats.map((x) => x.totalAmount),
      },
    ],
  };
});

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "70%", // Khoét lỗ giữa to ra để viền mỏng lại (nhìn tinh tế hơn)
  plugins: {
    legend: {
      position: "right" as const, // Chuyển chú thích sang bên phải cho đỡ tốn diện tích dọc
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: {size: 11},
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return (
            " " + new Intl.NumberFormat("vi-VN", {style: "currency", currency: "VND"}).format(context.parsed)
          );
        },
      },
    },
  },
};
</script>

<style scoped>
.dashboard-view {
  font-family: "Inter", sans-serif;
  background-color: #f8f9fa;
}

.kpi-card {
  transition: transform 0.2s ease;
  border-radius: 0.75rem;
}

.kpi-card:hover {
  transform: translateY(-3px);
}

.icon-bg {
  right: -10px;
  bottom: -20px;
  font-size: 6rem;
  opacity: 0.15;
  transform: rotate(-15deg);
}

.z-index-1 {
  z-index: 1;
}

.spin-animation {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
</style>
