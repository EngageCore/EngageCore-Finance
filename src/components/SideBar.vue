<template>
  <!-- Mobile backdrop -->
  <div v-if="isMobile && isBackdropVisible" class="sidebar-backdrop" @click="closeSideMenu"></div>

  <!-- Start::app-sidebar -->
  <aside class="app-sidebar" id="sidebar">
    <!-- Start::main-sidebar-header -->
    <div class="main-sidebar-header">
      <router-link to="/landing" class="header-logo">
        <img src="../assets/logo.png" alt="logo" class="main-logo desktop-logo">
        <img src="../assets/logo.png" alt="logo" class="main-logo toggle-logo">
        <img src="../assets/logo.png" alt="logo" class="main-logo desktop-dark">
        <img src="../assets/logo.png" alt="logo" class="main-logo toggle-dark">
        <img src="../assets/logo.png" alt="logo" class="main-logo toggle-default">
        <img src="../assets/logo.png" alt="logo" class="main-logo desktop-white">
        <img src="../assets/logo.png" alt="logo" class="toggle-white">
      </router-link>
    </div>
    <!-- End::main-sidebar-header -->

    <!-- Start::main-sidebar -->
    <div class="main-sidebar" id="sidebar-scroll">
      <!-- Start::nav -->
      <nav class="main-menu-container nav nav-pills flex-column">
        <ul class="main-menu">
          <template v-for="(items, category) in filteredGroupedMenuItems" :key="category">
            <li class="slide__category" v-if="category !== 'Uncategorized'">
              <span class="category-name">{{ $t(category) }}</span>
            </li>

            <!-- 单层菜单，直接渲染为链接 -->
            <li class="slide" v-for="(item, i) in items" :key="category + '-' + i">
              <router-link
                :to="item.link"
                class="side-menu__item d-flex align-items-center"
                :class="{ 'active': isActive(item.link) }"
                @click="closeSideMenu"
              >
                <i class="side-menu__icon me-2" :class="item.icon"></i>
                <span class="side-menu__label">{{ $t(item.title) }}</span>
              </router-link>
            </li>
          </template>
        </ul>
      </nav>
      <!-- End::nav -->
    </div>
    <!-- End::main-sidebar -->
  </aside>
  <!-- End::app-sidebar -->
</template>

<script setup>
//#region Imports
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from "vue-i18n";
import { useSidebarStore } from '../store/sidebarStore';
import { useAuthStore } from '../store/authStore';
//#endregion

//#region Common
const { t } = useI18n();
const route = useRoute();
const sidebarStore = useSidebarStore();
const authStore = useAuthStore();
//#endregion

//#region State
const isMobile = ref(window.innerWidth <= 1024);
const isBackdropVisible = ref(false);
//#endregion

//#region Menu (单层)
const menuItems = ref([
  // Bank
  { title: 'bank_management', category: 'configuration', icon: 'ri-bank-line', link: '/bank' },
  // Transactions
  { title: 'transactions_management', category: 'configuration', icon: 'ri-exchange-dollar-line', link: '/transactions' },
]);
//#endregion

//#region Computed
const filteredGroupedMenuItems = computed(() => {
  return menuItems.value.reduce((acc, item) => {
    // 权限过滤（如无权限系统，可移除这段判断）
    if (item.permissionId && !authStore.hasPermission(item.permissionId)) return acc;

    const category = item.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});
});
//#endregion

//#region Methods
const isActive = (link) => route.path === link;

const closeSideMenu = () => {
  if (isMobile.value) {
    document.documentElement.setAttribute('data-toggled', 'close');
    sidebarStore.isSidebarToggled = false;
    isBackdropVisible.value = false;
  }
};

const handleResize = () => {
  const wasMobile = isMobile.value;
  isMobile.value = window.innerWidth <= 1024;

  if (wasMobile && !isMobile.value) {
    isBackdropVisible.value = false;
    document.documentElement.removeAttribute('data-toggled');
  } else if (!wasMobile && isMobile.value) {
    if (sidebarStore.isSidebarToggled) {
      isBackdropVisible.value = true;
      document.documentElement.setAttribute('data-toggled', 'open');
    } else {
      isBackdropVisible.value = false;
      document.documentElement.setAttribute('data-toggled', 'close');
    }
  }
};
//#endregion

//#region Watchers
watch(
  () => sidebarStore.isSidebarToggled,
  (open) => {
    if (isMobile.value) {
      isBackdropVisible.value = open;
      document.documentElement.setAttribute('data-toggled', open ? 'open' : 'close');
    } else {
      isBackdropVisible.value = false;
    }
  }
);
//#endregion

//#region Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize);
  if (isMobile.value) {
    const toggledValue = document.documentElement.getAttribute('data-toggled');
    isBackdropVisible.value = toggledValue === 'open';
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
//#endregion
</script>

<style scoped>
/* Mobile 背景遮罩 */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 998;
}

/* 激活态 */
.router-link-active,
.side-menu__item.active {
  color: var(--primary-color) !important;
}

.app-sidebar .side-menu__icon {
  font-size: 1.14rem;
}

.app-sidebar .slide__category {
  padding-left: .7rem;
  margin-top: .5rem;
  margin-bottom: .25rem;
  color: var(--default-text-color);
  opacity: .7;
}

.badge {
  font-size: 10px;
  padding: 3px 6px;
  margin-left: 8px;
}

/* 确保侧边栏在 backdrop 上方 */
.app-sidebar {
  z-index: 999;
}
</style>
