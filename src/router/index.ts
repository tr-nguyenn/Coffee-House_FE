import {createRouter, createWebHistory} from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";
import Swal from "sweetalert2";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        {
          path: "",
          name: "home",
          component: () => import("@/views/HomeView.vue"),
        },
        {
          path: "menu",
          name: "menu",
          component: () => import("@/views/MenuView.vue"),
        },
      ],
    },
    {
      path: "/admin",
      component: () => import("@/layouts/AdminLayout.vue"),
      redirect: "/admin/pos",
      children: [
        {
          path: "dashboard",
          name: "admin-dashboard",
          component: () => import("@/views/admin/DashboardView.vue"),
          meta: {roles: ["Admin"]},
        },
        {
          path: "staffs",
          name: "admin-staffs",
          component: () => import("@/views/admin/StaffsView.vue"),
          meta: {roles: ["Admin"]},
        },
        {
          path: "tables",
          name: "admin-tables",
          component: () => import("@/views/admin/TablesView.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "products",
          name: "admin-products",
          component: () => import("@/views/admin/ProductsView.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "categories",
          name: "admin-categories",
          component: () => import("@/views/admin/CategoriesView.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "invoices",
          name: "admin-invoices",
          component: () => import("@/views/admin/OrderManagement.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "areas",
          name: "admin-areas",
          component: () => import("@/views/admin/AreasView.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "vouchers",
          name: "admin-vouchers",
          component: () => import("@/views/admin/VoucherManagement.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "users",
          name: "admin-users",
          component: () => import("@/views/admin/CustomersView.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "pos",
          name: "admin-pos",
          component: () => import("@/views/admin/PosView.vue"),
          meta: {roles: ["Admin", "Staff"]},
        },
        {
          path: "kitchen",
          name: "admin-kitchen",
          component: () => import("@/views/admin/KitchenView.vue"),
          meta: {roles: ["Admin", "Kitchen"]},
        },
        {
          path: "report-revenue",
          name: "admin-report-revenue",
          component: () => import("@/views/admin/RevenueReportView.vue"),
          meta: {roles: ["Admin"]},
        },
        {
          path: "report-products",
          name: "admin-report-products",
          component: () => import("@/views/admin/ProductReportView.vue"),
          meta: {roles: ["Admin"]},
        },
        {
          path: "report-peak-hours",
          name: "admin-report-peak-hours",
          component: () => import("@/views/admin/PeakHourReportView.vue"),
          meta: {roles: ["Admin"]},
        },
        {
          path: "inventory",
          name: "admin-inventory",
          component: () => import("@/views/admin/InventoryView.vue"),
          meta: { roles: ["Admin", "Staff"] },
        },
      ],
    },
    {
      path: "/customer-display",
      name: "customer-display",
      component: () => import("@/views/admin/CustomerDisplay.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/views/RegisterView.vue"),
    },
    {
      path: "/reset-password",
      name: "reset-password",
      component: () => import("@/views/ResetPasswordView.vue"),
    },
    {
      path: "/forbidden",
      name: "forbidden",
      component: () => import("@/views/ForbiddenView.vue"),
    },
    {
      path: "/not-found",
      name: "not-found",
      component: () => import("@/views/ForbiddenView.vue"),
    },
  ],
});

//BẮT LỖI TRUY CẬP TRÁI PHÉP
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  let userRole = null;

  // 1. Giải mã Token để lấy Quyền
  if (token) {
    try {
      const base64Url = token.split(".")[1] ?? "";
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join(""),
        );

        const payload = JSON.parse(jsonPayload);
        const rawRole =
          payload["role"] || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        userRole = Array.isArray(rawRole) ? rawRole[0] : rawRole;
      }
    } catch {
      userRole = null;
    }
  }

  // 2. Ổ KHÓA TỔNG CHO TOÀN BỘ KHU VỰC QUẢN TRỊ (/admin)
  if (to.path.startsWith("/admin")) {
    if (!token || !userRole) {
      Swal.fire({
        icon: "warning",
        title: "Truy cập bị từ chối!",
        text: "Bạn phải đăng nhập tài khoản nhân viên để vào trang Quản trị.",
        confirmButtonColor: "#ffc107",
        confirmButtonText: "Đăng nhập ngay",
        background: "#1e1e2d",
        color: "#fff",
      });
      return next("/login");
    }

    // Nếu đã đăng nhập, bắt đầu check quyền từng phòng con
    if (to.meta && to.meta.roles) {
      const allowedRoles = to.meta.roles as string[];

      // Nếu đi sai phòng -> Đá về trang chủ
      if (!allowedRoles.includes(userRole)) {
        return next("/not-found");
      }
    }
  }

  // Hợp lệ -> Cho qua
  next();
});

export default router;
