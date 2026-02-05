<template>
  <!-- Start Switcher -->
  <div class="offcanvas offcanvas-end" :class="{ 'show': isCollapsed }" tabindex="-1" id="switcher-canvas"
    aria-labelledby="offcanvasRightLabel">
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title text-default" id="offcanvasRightLabel">{{ $t('switcher') }}</h5>
      <button type="button" class="btn-close" @click.prevent="isCollapsed = false" data-bs-dismiss="offcanvas"
        aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <nav class="border-bottom border-block-end-dashed">
        <div class="nav nav-tabs nav-justified" id="switcher-main-tab" role="tablist">
          <button class="nav-link active" id="switcher-home-tab" data-bs-toggle="tab" data-bs-target="#switcher-home"
            type="button" role="tab" aria-controls="switcher-home" aria-selected="true">{{ $t('theme_styles') }}</button>
        </div>
      </nav>
      <div class="tab-content" id="nav-tabContent">
        <div class="tab-pane fade show active border-0" id="switcher-home" role="tabpanel"
          aria-labelledby="switcher-home-tab" tabindex="0">
          <div class="">
            <p class="switcher-style-head">{{ $t('theme_color_mode') }}:</p>
            <div class="row switcher-style gx-0 gy-2">
              <div class="col-sm-3 col-6">
                <div class="form-check switch-select">
                  <label class="form-check-label" for="switcher-default-theme">
                    {{ $t('default') }}
                  </label>
                  <input class="form-check-input" type="radio" name="theme-style" id="switcher-default-theme"
                    :checked="currentTheme === 'default'" @click="updateTheme('default')">
                </div>
              </div>
              <div class="col-sm-3 col-6">
                <div class="form-check switch-select">
                  <label class="form-check-label" for="switcher-light-theme">
                    {{ $t('light') }}
                  </label>
                  <input class="form-check-input" type="radio" name="theme-style" id="switcher-light-theme"
                    :checked="currentTheme === 'light'" @click="updateTheme('light')">
                </div>
              </div>
              <div class="col-sm-3 col-6">
                <div class="form-check switch-select">
                  <label class="form-check-label" for="switcher-dark-theme">
                    {{ $t('dark') }}
                  </label>
                  <input class="form-check-input" type="radio" name="theme-style" id="switcher-dark-theme"
                    :checked="currentTheme === 'dark'" @click="updateTheme('dark')">
                </div>
              </div>
              <div class="col-sm-3 col-6">
                <div class="form-check switch-select">
                  <label class="form-check-label" for="switcher-glassy-theme">
                    {{ $t('glassy') }}
                  </label>
                  <input class="form-check-input" type="radio" name="theme-style" id="switcher-glassy-theme"
                    :checked="currentTheme === 'glassy'" @click="updateTheme('glassy')">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="d-grid canvas-footer">
          <a href="#" id="reset-all" class="btn btn-danger" @click.prevent="resetTheme">{{ $t('reset') }}</a>
        </div>
      </div>
    </div>
  </div>

  <!-- End Switcher -->
  <header class="app-header">
    <!-- Start::main-header-container -->
    <div class="main-header-container container-fluid">
      <!-- Start::header-content-left -->
      <div class="header-content-left">
        <!-- Start::header-element -->
        <div class="header-element">
          <div class="horizontal-logo">
            <a href="index.html" class="header-logo">
              <img src="../assets/img/brand-logos/desktop-logo.png" alt="logo" class="desktop-logo">
              <!-- Other logo images -->
            </a>
          </div>
        </div>
        <!-- End::header-element -->
        <!-- Start::header-element -->
        <div class="header-element">
          <a aria-label="Hide Sidebar"
            class="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle" href="#"
            @click.prevent="sidebarStore.toggleSidebar">
            <span></span>
          </a>
        </div>
      </div>

      <!-- Start::header-content-right -->
      <div class="header-content-right">
        <div class="header-element">
          <a href="#" class="header-link dropdown-toggle" id="mainHeaderProfile" data-bs-toggle="dropdown"
            aria-expanded="false">
            <div class="d-flex align-items-center">
              <div class="">
                <img src="../assets/img/users/1.jpg" alt="img" width="30" height="30" class="rounded-circle">
              </div>
            </div>
          </a>
          <div class="header-element">
            <a href="#" class="header-link dropdown-toggle" id="languageDropdown" data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="fas fa-globe"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
              <li><a class="dropdown-item" href="#" @click.prevent="switchLanguage('en_US')">{{ $t('english') }}</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="switchLanguage('zh_CN')">{{ $t('chinese_simplified') }}</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="switchLanguage('zh_TW')">{{ $t('chinese_traditional') }}</a></li>
              <li><a class="dropdown-item" href="#" @click.prevent="switchLanguage('ms')">{{ $t('malay') }}</a></li>
            </ul>
          </div>
          <div class="main-header-dropdown dropdown-menu pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end"
            aria-labelledby="mainHeaderProfile">
            <div class="header-dropdown bg-primary text-fixed-white rounded-top">
              <div class="d-flex align-items-center">
                <div class="me-sm-2 me-0 avatar">
                  <img src="../assets/img/users/1.jpg" alt="img" class="rounded-circle">
                </div>
                <div class="d-sm-block d-none">
                  <p class="fw-semibold mb-0 lh-1">{{ authStore.user?.username }}</p>
                </div>
              </div>
            </div>
            <div class="dropdown-divider mb-0"></div>
            <ul class="list-unstyled mb-0">
              <li><a class="dropdown-item d-flex" href="#" @click.prevent="logout"><i
                    class="ti ti-logout fs-18 me-2"></i>{{ $t('logout')}}</a>
              </li>
            </ul>
          </div>
        </div>

        <div class="header-element">
          <a @click.prevent="toggleFullscreen" href="#" class="header-link">
            <i class="fas fa-expand"></i>
          </a>
        </div>
        
        <!-- <div class="header-element">
          <a @click.prevent="isCollapsed = true" href="#" class="header-link switcher-icon" data-bs-toggle="offcanvas"
            data-bs-target="#switcher-canvas">
            <svg class="ionicon fa-spin header-link-icon" viewBox="0 0 512 512">
              <title>Switcher</title>
              <path
                d="M262.29 192.31a64 64 0 1057.4 57.4 64.13 64.13 0 00-57.4-57.4zM416.39 256a154.34 154.34 0 01-1.53 20.79l45.21 35.46a10.81 10.81 0 012.45 13.75l-42.77 74a10.81 10.81 0 01-13.14 4.59l-44.9-18.08a16.11 16.11 0 00-15.17 1.75A164.48 164.48 0 01325 400.8a15.94 15.94 0 00-8.82 12.14l-6.73 47.89a11.08 11.08 0 01-10.68 9.17h-85.54a11.11 11.11 0 01-10.69-8.87l-6.72-47.82a16.07 16.07 0 00-9-12.22 155.3 155.3 0 01-21.46-12.57 16 16 0 00-15.11-1.71l-44.89 18.07a10.81 10.81 0 01-13.14-4.58l-42.77-74a10.8 10.8 0 012.45-13.75l38.21-30a16.05 16.05 0 006-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 00-6.07-13.94l-38.19-30A10.81 10.81 0 0149.48 186l42.77-74a10.81 10.81 0 0113.14-4.59l44.9 18.08a16.11 16.11 0 0015.17-1.75A164.48 164.48 0 01187 111.2a15.94 15.94 0 008.82-12.14l6.73-47.89A11.08 11.08 0 01213.23 42h85.54a11.11 11.11 0 0110.69 8.87l6.72 47.82a16.07 16.07 0 009 12.22 155.3 155.3 0 0121.46 12.57 16 16 0 0015.11 1.71l44.89-18.07a10.81 10.81 0 0113.14 4.58l42.77 74a10.8 10.8 0 01-2.45 13.75l-38.21 30a16.05 16.05 0 00-6.05 14.08c.33 4.14.55 8.3.55 12.47z"
                fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32">
              </path>
            </svg>
          </a>
        </div> -->
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, reactive, computed, onBeforeUnmount } from 'vue';
import { useSidebarStore } from '../store/sidebarStore';
import { useAuthStore } from '../store/authStore';
import { useCallApi } from '@/hooks/useCallApi';
import { useI18n } from "vue-i18n";
import { useApiError } from '@/composables/useApiError';
import { useRouter } from 'vue-router';

const { t, locale } = useI18n();
const sidebarStore = useSidebarStore();
const authStore = useAuthStore();
const isCollapsed = ref(false);
const currentTheme = ref('');
const { callApi } = useCallApi();
const { handleApiError } = useApiError();
const router = useRouter();

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

const logout = () => {
  authStore.logout();
};

const updateTheme = (themeMode) => {
  const htmlElement = document.documentElement;
  htmlElement.setAttribute('data-theme-mode', themeMode);
  localStorage.setItem('theme', themeMode);
  currentTheme.value = themeMode;
};

const resetTheme = () => {
  updateTheme('default');
};

const switchLanguage = (lang) => {
  localStorage.setItem('language', lang);
  locale.value = lang;
};

// 通知相关
let refreshInterval;

// 窗口大小变化处理
const handleResize = () => {
  // 更新store中的移动端状态
  sidebarStore.updateMobileStatus();
  
  // 如果从移动端切换到桌面端，重置侧边栏状态
  if (!sidebarStore.isMobile.value && sidebarStore.isSidebarToggled) {
    sidebarStore.resetSidebarState();
  }
};

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    updateTheme(savedTheme);
  }
  
  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // 移除窗口大小变化监听器
  window.removeEventListener('resize', handleResize);

  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>

<style scoped>
/* ========== 搜索栏样式 ========== */

/* Header 布局调整 - 使用 Flexbox 三段式布局 */
.main-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

/* ========== 搜索栏样式 ========== */

/* Header 布局调整 - 保持原始的水平布局 */
.main-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

/* 左右内容区域 - 固定宽度，防止挤压中央搜索栏 */
.header-content-left,
.header-content-right {
  display: flex;
  align-items: center;
  flex: 0 0 auto; /* 不允许伸缩，保持固定宽度 */
}

.header-content-right {
  justify-content: flex-end; /* 右边内容右对齐 */
}

/* 中央搜索区域 - 在剩余空间中居中 */
.header-content-center {
  flex: 1; /* 占用剩余所有空间 */
  display: flex;
  justify-content: center; /* 在可用空间中居中 */
  align-items: center;
  pointer-events: none; /* 防止阻挡其他元素 */
}

/* 搜索栏包装器 - 添加覆盖层拦截点击 */
.search-bar-wrapper {
  pointer-events: auto; /* 恢复点击事件 */
  position: relative;
  cursor: pointer;
  width: min(700px, 80%); /* 700px或80%，取较小值 */
  min-width: 250px; /* 减小最小宽度适配手机 */
}

/* 搜索输入框 - 桌面和移动端统一样式 */
.search-input {
  pointer-events: none !important; /* 完全禁用input的点击 */
  cursor: pointer !important;
  border-radius: 25px !important; /* 圆角 */
  padding: 10px 20px !important; /* 内边距 */
  font-size: 14px;
  width: 100%; /* 填满容器宽度 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  transition: all 0.3s ease; /* 平滑过渡 */
}

/* 悬停效果 - 使用标准的 form-control 悬停样式 */
.search-bar-wrapper:hover .search-input {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 增强阴影 */
}

/* 防止input获得焦点时的outline */
.search-input:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
  outline: none !important;
}

/* ========== 响应式设计 ========== */

/* 移动设备 (≤768px) - 搜索栏适配 */
@media (max-width: 768px) {
  /* 保持水平布局，优化间距 */
  .main-header-container {
    gap: 8px;
    padding: 8px 12px;
    justify-content: space-between;
  }
  
  /* 左侧内容紧凑排列 */
  .header-content-left {
    flex: 0 0 auto;
    gap: 8px;
  }
  
  /* 中央搜索区域 - 手机端使用更多空间 */
  .header-content-center {
    flex: 1; /* 占用更多空间 */
    margin: 0 8px; /* 适当间距 */
    min-width: 0; /* 允许收缩 */
  }
  
  /* 右侧内容紧凑排列 */
  .header-content-right {
    flex: 0 0 auto;
    gap: 8px;
  }
  
  .search-bar-wrapper {
    width: 100%; /* 手机端占满可用空间 */
    max-width: 100%; /* 最大100%宽度 */
    min-width: 0; /* 允许收缩 */
  }
  
  /* 手机端搜索输入框样式调整 */
  .search-input {
    padding: 8px 16px !important; /* 减少内边距适配小屏 */
    font-size: 13px; /* 稍小字体 */
    border-radius: 20px !important; /* 稍小圆角 */
  }
  
  /* 优化通知下拉菜单在移动端的显示 */
  #notificationDropdownMenu {
    width: 85vw !important;
    max-width: 350px !important;
    right: 10px !important;
    left: auto !important;
  }
}

@media (max-width: 576px) {
  .main-header-container {
    padding: 6px 8px;
    gap: 6px;
  }
  
  /* 进一步紧凑左右内容 */
  .header-content-left {
    gap: 4px;
  }
  
  .header-content-right {
    gap: 4px;
  }
  
  /* 中央搜索栏进一步优化 */
  .header-content-center {
    margin: 0 6px;
  }
  
  /* 超小屏幕搜索输入框进一步缩小 */
  .search-input {
    padding: 6px 12px !important;
    font-size: 12px;
    border-radius: 18px !important;
  }
}

/* ========== 通知系统样式 ========== */

.list-unstyled li:not(:last-child) {
  margin-block-end: 0;
}

#notificationDropdownMenu {
  width: 500px; 
  border-radius: 10px; 
  overflow: hidden;
}

.notification-tab-content {
  height: 450px; 
  overflow-y: auto;
}

.notification-tab {
  padding: 0 !important;
}

/* Bell 图标包装器 */
.bell-icon-wrapper {
  position: relative;
  display: inline-block;
}

/* Bell 图标通知红点样式 - 贴着图标右上角，呼吸灯效果 */
.bell-notification-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 6px;
  height: 6px;
  background-color: #dc3545;
  border-radius: 50%;
  border: none;
  z-index: 10;
  animation: breathe 2s ease-in-out infinite;
}

/* 呼吸灯关键帧动画 */
@keyframes breathe {
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
}

/* 通知徽章样式 */
.icon-wrapper {
  position: relative;
  display: inline-block;
}

.icon-wrapper i {
  font-size: 16px;
}

.notification-badge {
  position: absolute;
  bottom: -3px;
  right: -8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #dc3545 !important;
  color: white !important;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

/* 当数字超过9时，徽章变为椭圆形 */
.notification-badge:has-text("10"),
.notification-badge:has-text("11"),
.notification-badge:has-text("12"),
.notification-badge:has-text("13"),
.notification-badge:has-text("14"),
.notification-badge:has-text("15"),
.notification-badge:has-text("16"),
.notification-badge:has-text("17"),
.notification-badge:has-text("18"),
.notification-badge:has-text("19") {
  width: 18px;
  border-radius: 9px;
  font-size: 8px;
}

/* 当数字是99+时 */
.notification-badge:has-text("99+") {
  width: 20px;
  border-radius: 10px;
  font-size: 7px;
}

/* 确保active状态下徽章仍然保持红色，无边框 */
.nav-link.active .notification-badge,
.nav-link:active .notification-badge,
.nav-link:focus .notification-badge,
.nav-link:hover .notification-badge {
  background-color: #dc3545 !important;
  color: white !important;
  border: none !important;
}

/* hover效果 */
.nav-link:hover .notification-badge {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* 空状态样式 */
.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 8px;
}

/* 确保tab-pane有相对定位 */
.notification-tab {
  position: relative;
  padding: 0 !important;
  height: 100%;
}

/* 确保nav-link紧凑 */
.nav-link {
  padding: 8px 16px;
}

.nav-tabs .nav-link {
  padding: 8px 16px;
  border: none;
}

.cursor-pointer {
  cursor: pointer;
}

/* ========== 移动端通知系统响应式优化 ========== */

/* 平板设备 (768px - 991px) */
@media (max-width: 991px) {
  #notificationDropdownMenu {
    width: 400px;
  }
  
  .notification-tab-content {
    height: 400px;
  }
}

/* 手机设备 (小于768px) */
@media (max-width: 768px) {
  .dropdown-menu-end[data-bs-popper] {
    right: 0 !important;
    left: auto !important;
  }
  
  #notificationDropdownMenu {
    width: 90vw !important;
    max-width: 380px !important;
    min-width: 320px;
  }
  
  .notification-tab-content {
    height: auto;
    max-height: 60vh;
    min-height: 200px;
    overflow-y: auto;
  }
  
  .bg-white.px-3.py-2.border-bottom h6 {
    font-size: 0.9rem;
    margin-bottom: 0;
  }
  
  .nav-tabs {
    flex-wrap: nowrap;
    overflow-x: hidden;
  }
  
  .nav-tabs .nav-item {
    flex: 1;
    min-width: 0;
  }
  
  .nav-tabs .nav-link {
    padding: 6px 4px;
    font-size: 0.85rem;
  }
  
  .icon-wrapper i {
    font-size: 14px;
  }
  
  .notification-badge {
    width: 12px;
    height: 12px;
    font-size: 8px;
    bottom: -2px;
    right: -6px;
  }
  
  .list-group-item {
    padding: 10px 12px;
  }
  
  .list-group-item.d-flex {
    flex-wrap: nowrap;
    align-items: flex-start !important;
  }
  
  .list-group-item > i {
    flex-shrink: 0;
    width: 16px;
  }
  
  .list-group-item .flex-grow-1:first-of-type {
    flex: 1 1 auto;
    min-width: 0;
    margin-right: 8px;
  }
  
  .list-group-item .flex-grow-1:last-child {
    flex: 0 0 auto !important;
    margin-left: auto;
  }
  
  .list-group-item .small {
    font-size: 0.8rem;
    line-height: 1.4;
    word-break: break-word;
  }
  
  .list-group-item .text-muted.small {
    font-size: 0.75rem;
  }
  
  .list-group-item .badge {
    font-size: 0.7rem;
    padding: 3px 8px;
    white-space: nowrap;
    display: inline-block;
  }
  
  .list-group-item.d-flex.gap-2 {
    gap: 0.5rem !important;
  }
  
  .empty-state i {
    font-size: 1.5rem;
  }
  
  .empty-state p {
    font-size: 0.8rem;
  }
  
  .bell-notification-dot {
    width: 8px;
    height: 8px;
    top: -3px;
    right: -3px;
  }
}

/* 小手机设备 (小于576px) */
@media (max-width: 576px) {
  #notificationDropdownMenu {
    width: 85vw !important;
    max-width: 340px !important;
    min-width: 300px;
    border-radius: 10px;
  }
  
  .notification-tab-content {
    height: auto;
    max-height: 50vh;
    min-height: 180px;
  }
  
  .bg-white.px-3.py-2.border-bottom {
    padding: 8px 12px !important;
  }
  
  .nav-tabs .nav-link {
    padding: 5px 2px;
  }
  
  .list-group-item {
    padding: 8px 10px;
  }
  
  .list-group-item.d-flex {
    flex-wrap: nowrap;
  }
  
  .list-group-item > i {
    flex-shrink: 0;
    width: 14px;
  }
  
  .list-group-item .flex-grow-1:first-of-type {
    flex: 1 1 60%;
    min-width: 0;
    margin-right: 6px;
  }
  
  .list-group-item .flex-grow-1:last-child {
    flex: 0 0 auto !important;
    margin-left: auto;
  }
  
  .list-group-item .small {
    font-size: 0.75rem;
    line-height: 1.3;
  }
  
  .list-group-item .text-muted.small {
    font-size: 0.7rem;
  }
  
  .list-group-item .badge {
    font-size: 0.65rem;
    padding: 2px 6px;
    white-space: nowrap;
  }
  
  .list-group-item .flex-grow-1 {
    overflow: hidden;
  }
  
  .list-group-item .small {
    word-break: break-word;
    overflow-wrap: break-word;
  }
}

/* 超小设备 (小于400px) */
@media (max-width: 400px) {
  #notificationDropdownMenu {
    width: 92vw !important;
    max-width: 320px !important;
    min-width: 280px;
  }
  
  .notification-tab-content {
    height: auto;
    max-height: 45vh;
    min-height: 150px;
  }
  
  .nav-tabs .nav-link {
    padding: 4px 1px;
    font-size: 0.8rem;
  }
  
  .icon-wrapper i {
    font-size: 12px;
  }
}

/* 超小设备横屏模式 */
@media (max-height: 500px) and (orientation: landscape) {
  .notification-tab-content {
    height: 200px;
    max-height: 40vh;
  }
}

/* 滚动条美化 - 移动端 */
@media (max-width: 768px) {
  .notification-tab-content::-webkit-scrollbar {
    width: 4px;
  }
  
  .notification-tab-content::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  .notification-tab-content::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 2px;
  }
  
  .notification-tab-content::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

/* 防止内容被截断 */
@media (max-width: 768px) {
  .dropdown-menu {
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }
  
  #notificationDropdownMenu {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .list-group-item {
    min-height: 44px;
  }
  
  .nav-tabs .nav-link {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* 特别针对状态标签显示不全的问题 */
@media (max-width: 768px) {
  .list-group-item.d-flex.align-items-center {
    flex-direction: column;
    align-items: flex-start !important;
  }
  
  .list-group-item .d-flex.gap-2 {
    width: 100%;
    margin-bottom: 4px;
  }
  
  .list-group-item > .flex-grow-1:last-child {
    width: 100%;
    text-align: right;
    margin-top: 4px;
  }
  
  @supports (display: grid) {
    .list-group-item {
      display: grid !important;
      grid-template-columns: auto 1fr auto;
      gap: 8px;
      align-items: center;
    }
    
    .list-group-item > i {
      grid-column: 1;
    }
    
    .list-group-item > .flex-grow-1:first-of-type {
      grid-column: 2;
    }
    
    .list-group-item > .flex-grow-1:last-child {
      grid-column: 3;
      text-align: right;
    }
  }
}
</style>
