<template>
  <div class="dashboard-view h-100 d-flex flex-column">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <h4 class="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
        <i class="bi bi-speedometer2 text-primary"></i>
        Tổng quan
      </h4>
      
      <div class="d-flex align-items-center gap-3 bg-white p-2 rounded shadow-sm">
        <div class="d-flex align-items-center gap-2">
          <label class="text-muted small fw-bold mb-0 text-nowrap">Từ ngày:</label>
          <input type="date" v-model="filters.startDate" class="form-control form-control-sm border-0 bg-light" @change="fetchDashboard" />
        </div>
        <div class="gap-2 d-none d-md-block border-start border-2 border-light h-100 mx-1"></div>
        <div class="d-flex align-items-center gap-2">
          <label class="text-muted small fw-bold mb-0 text-nowrap">Đến ngày:</label>
          <input type="date" v-model="filters.endDate" class="form-control form-control-sm border-0 bg-light" @change="fetchDashboard" />
        </div>
        <button class="btn btn-primary btn-sm ms-2" @click="fetchDashboard" :disabled="loading">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': loading }"></i>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !dashboardData" class="flex-grow-1 d-flex flex-column align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
      <p class="mt-3 text-muted fw-bold">Đang tải dữ liệu dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData" class="dashboard-content flex-grow-1 overflow-auto pb-4">
      
      <!-- KPI Indicators -->
      <div class="row g-4 mb-4">
        <!-- Total Revenue -->
        <div class="col-12 col-md-4">
          <div class="card h-100 border-0 shadow-sm kpi-card bg-primary text-white">
            <div class="card-body p-4 d-flex align-items-center position-relative overflow-hidden">
              <div class="flex-grow-1 z-index-1">
                <p class="text-white-50 text-uppercase fw-bold mb-1 small tracking-wide">Tổng Doanh Thu</p>
                <h3 class="fw-bolder mb-0 display-6">{{ formatCurrency(dashboardData.totalRevenue) }}</h3>
              </div>
              <div class="icon-bg position-absolute">
                <i class="bi bi-currency-dollar"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Orders -->
        <div class="col-12 col-md-4">
          <div class="card h-100 border-0 shadow-sm kpi-card bg-success text-white">
            <div class="card-body p-4 d-flex align-items-center position-relative overflow-hidden">
              <div class="flex-grow-1 z-index-1">
                <p class="text-white-50 text-uppercase fw-bold mb-1 small tracking-wide">Tổng Đơn Hàng</p>
                <h3 class="fw-bolder mb-0 display-6">{{ dashboardData.totalOrders }} <span class="fs-5 fw-normal text-white-50">đơn</span></h3>
              </div>
              <div class="icon-bg position-absolute">
                <i class="bi bi-receipt"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Average Order Value -->
        <div class="col-12 col-md-4">
          <div class="card h-100 border-0 shadow-sm kpi-card bg-info text-white">
            <div class="card-body p-4 d-flex align-items-center position-relative overflow-hidden">
              <div class="flex-grow-1 z-index-1">
                <p class="text-white-50 text-uppercase fw-bold mb-1 small tracking-wide">Giá Trị TB / Đơn</p>
                <h3 class="fw-bolder mb-0 display-6">{{ formatCurrency(dashboardData.averageOrderValue) }}</h3>
              </div>
              <div class="icon-bg position-absolute">
                <i class="bi bi-graph-up"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <!-- Revenue Line Chart -->
        <div class="col-12 col-xl-8">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
              <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-graph-up-arrow text-primary me-2"></i>Biểu đồ Doanh Thu</h6>
            </div>
            <div class="card-body align-items-center d-flex justify-content-center p-4" style="min-height: 350px;">
              <div v-if="dashboardData.revenueTrends.length === 0" class="text-muted h-100 d-flex align-items-center">Không có dữ liệu trong khoảng thời gian này</div>
              <Line v-else :data="lineChartData" :options="lineChartOptions" class="w-100" />
            </div>
          </div>
        </div>

        <!-- Payment Methods Doughnut Chart -->
        <div class="col-12 col-xl-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white border-bottom-0 pt-4 pb-0">
              <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-pie-chart text-success me-2"></i>Phương thức thanh toán</h6>
            </div>
            <div class="card-body d-flex flex-column justify-content-center align-items-center p-4" style="min-height: 350px;">
              <div v-if="dashboardData.paymentMethodStats.length === 0" class="text-muted h-100 d-flex align-items-center">Không có dữ liệu</div>
              <Doughnut v-else :data="pieChartData" :options="pieChartOptions" class="w-100" />
            </div>
          </div>
        </div>
      </div>

      <!-- Top Selling Products List -->
      <div class="card border-0 shadow-sm mb-2">
        <div class="card-header bg-white border-bottom pt-4 pb-3">
          <h6 class="mb-0 fw-bold text-dark"><i class="bi bi-star-fill text-warning me-2"></i>Top 5 Món Bán Chạy Nhất</h6>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover table-borderless align-middle mb-0">
              <thead class="bg-light text-uppercase text-muted small fw-bolder">
                <tr>
                  <th class="ps-4 rounded-start py-3" style="width: 60px;">#</th>
                  <th class="py-3">Tên sản phẩm</th>
                  <th class="py-3 text-center">Số lượng bán</th>
                  <th class="pe-4 rounded-end py-3 text-end">Tổng tiền mang lại</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="dashboardData.topSellingProducts.length === 0">
                  <td colspan="4" class="text-center py-5 text-muted">Không có sản phẩm nào được bán trong thời gian này</td>
                </tr>
                <tr v-for="(product, index) in dashboardData.topSellingProducts" :key="index" class="border-bottom">
                  <td class="ps-4 py-3">
                    <span class="badge rounded-circle p-2" :class="getRankBadgeClass(index)" style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
                      {{ index + 1 }}
                    </span>
                  </td>
                  <td class="py-3 fw-bold text-dark">{{ product.productName }}</td>
                  <td class="py-3 text-center">
                    <span class="badge bg-light text-dark border fs-6 px-3 py-2">{{ product.totalQuantity }}</span>
                  </td>
                  <td class="pe-4 py-3 text-end text-success fw-bold">{{ formatCurrency(product.totalRevenue) }}</td>
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
import { ref, onMounted, computed } from 'vue';
import { reportService, type DashboardFilterDto, type DashboardSummaryDto } from '@/services/ReportService';
import { toast } from '@/utils/toast';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, Filler
} from 'chart.js';
import { Line, Doughnut } from 'vue-chartjs';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);
const loading = ref(false);
const dashboardData = ref<DashboardSummaryDto | null>(null);

// Get current date formatted for input type="date"
const getTodayString = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const getThirtyDaysAgoString = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const filters = ref<DashboardFilterDto>({
  startDate: getThirtyDaysAgoString(),
  endDate: getTodayString()
});

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getRankBadgeClass = (index: number) => {
  if (index === 0) return 'bg-warning text-dark';
  if (index === 1) return 'bg-secondary text-white';
  if (index === 2) return 'bg-danger text-white bg-opacity-75';
  return 'bg-light text-secondary border';
};

const fetchDashboard = async () => {
  try {
    loading.value = true;
    dashboardData.value = await reportService.getDashboardSummary(filters.value);
  } catch (error: any) {
    console.error('Failed to fetch dashboard', error);
    toast.error('Có lỗi xảy ra khi tải dữ liệu tổng quan');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboard();
});

// Chart computed properties
const lineChartData = computed(() => {
  if (!dashboardData.value) return { labels: [], datasets: [] };
  
  return {
    labels: dashboardData.value.revenueTrends.map(x => x.date.substring(0, 5)), // Get DD/MM part only for brevity if needed
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        backgroundColor: 'rgba(13, 110, 253, 0.2)', // Bootstrap Primary with opacity
        borderColor: '#0d6efd',
        borderWidth: 2,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#0d6efd',
        pointHoverBackgroundColor: '#0d6efd',
        pointHoverBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4, // smooth curves
        data: dashboardData.value.revenueTrends.map(x => x.revenue)
      }
    ]
  };
});

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
          }
          return label;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: any) {
          if (value >= 1000000) {
            return value / 1000000 + 'M';
          }
          if (value >= 1000) {
            return value / 1000 + 'k';
          }
          return value;
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      }
    },
    x: {
      grid: { display: false }
    }
  }
};

const pieChartData = computed(() => {
  if (!dashboardData.value) return { labels: [], datasets: [] };
  
  return {
    labels: dashboardData.value.paymentMethodStats.map(x => x.paymentMethod === 'Cash' ? 'Tiền mặt' : (x.paymentMethod === 'Transfer' ? 'Chuyển khoản' : x.paymentMethod)),
    datasets: [
      {
        backgroundColor: ['#198754', '#0dcaf0', '#ffc107', '#dc3545', '#6c757d'], // Bootstrap Success, Info, Warning, Danger
        data: dashboardData.value.paymentMethodStats.map(x => x.totalAmount) // Use total amount for chart proportions
      }
    ]
  };
});

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 20,
        usePointStyle: true,
        font: {
          family: "'Inter', sans-serif"
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== null) {
            label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed);
          }
          return label;
        }
      }
    }
  }
};
</script>

<style scoped>
.dashboard-view {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.kpi-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 1rem;
}

.kpi-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}

.icon-bg {
  right: -10px;
  bottom: -20px;
  font-size: 8rem;
  opacity: 0.15;
  transform: rotate(-15deg);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.kpi-card:hover .icon-bg {
  transform: rotate(0) scale(1.1);
  opacity: 0.25;
}

.z-index-1 {
  z-index: 1;
}

.tracking-wide {
  letter-spacing: 1px;
}

.spin-animation {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Base custom scrollbar for cards if needed */
.overflow-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.overflow-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}
.overflow-auto::-webkit-scrollbar-track {
  background: transparent;
}
</style>
