import {createRouter, createWebHistory} from "vue-router";
import MainLayout from "@/layouts/MainLayout.vue";

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
      children: [
        {
          path: "tables",
          name: "admin-tables",
          component: () => import("@/views/admin/TablesView.vue"),
        },
        {
          path: "products",
          name: "admin-products",
          component: () => import("@/views/admin/ProductsView.vue"),
        },
      ],
    },

    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
  ],
});

export default router;
