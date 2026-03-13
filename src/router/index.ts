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
    // Sau này các trang Admin sẽ nằm ở một cụm khác dùng AdminLayout
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
  ],
});

export default router;
