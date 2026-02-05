import { createRouter, createWebHistory } from "vue-router";
import AuthLayout from "@/layouts/AuthLayout.vue";
import PublicLayout from "@/layouts/PublicLayout.vue";
import { useAuthStore } from '@/store/authStore';
import { useLoadingStore } from '@/store/loadingStore';

export const routes = [
  {
    path: "/",
    component: PublicLayout,
    children: [
      {
        path: "",
        redirect: "/login",
      },
      {
        path: "login",
        component: () => import("../pages/Login.vue"),
        meta: { breadcrumb: ["Login"] },
      },
      {
        path: "unauthorized",
        component: () => import("../pages/404.vue"),
        meta: { breadcrumb: ["unauthorized"] },
      },
    ],
  },
  {
    path: "/",
    component: AuthLayout,
    children: [
      {
        path: "bank",
        component: () => import("../pages/Bank.vue"),
        meta: { breadcrumb: ["bank", "bank_management"] },
      },
      {
        path: "transactions",
        component: () => import("../pages/Transactions.vue"),
        meta: { breadcrumb: ["transactions", "transactions_management"] },
      },
    ]
  },
  // Add the wildcard route here
  {
    path: '/:pathMatch(.*)*', // This catches all undefined routes
    redirect: '/unauthorized', // Redirect to the unauthorized page
  },
];


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { left: 0, top: 0 };
    }
  },
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const loadingStore = useLoadingStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const permissionsId = to.meta.permissionsId;

  loadingStore.startLoading();
  if (requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (authStore.isAuthenticated && to.path === "/login") {
    next("/transactions");
  } else if (permissionsId && !authStore.hasPermission(permissionsId)) {
    // If user does not have the required permission, redirect or show error
    next("/unauthorized"); // Redirect to an unauthorized page or any other action
  } else {
    next();
  }
});

router.afterEach(() => {
  const loadingStore = useLoadingStore();
  loadingStore.stopLoading(); // Stop loading after route is resolved
});

export default router;
