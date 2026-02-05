// store/sidebarStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useSidebarStore = defineStore('sidebar', () => {
  const isSidebarToggled = ref(false);
  const isMobile = ref(window.innerWidth <= 1024);
  
  // 更新移动端状态的方法
  const updateMobileStatus = () => {
    isMobile.value = window.innerWidth <= 1024;
  };
  
  const toggleSidebar = () => {
    isSidebarToggled.value = !isSidebarToggled.value;
    const htmlTag = document.documentElement;
    const dataVal = isMobile.value ? 'open' : 'icon-overlay-close';
    if (isSidebarToggled.value) {
      htmlTag.setAttribute('data-toggled', dataVal);
    } else {
      if (isMobile.value) {
        htmlTag.setAttribute('data-toggled', 'close');
      } else {
        htmlTag.removeAttribute('data-toggled');
      }
    }
  };
  
  // 重置侧边栏状态（用于窗口大小变化时）
  const resetSidebarState = () => {
    isSidebarToggled.value = false;
    document.documentElement.removeAttribute('data-toggled');
  };

  return { 
    isSidebarToggled, 
    isMobile, 
    toggleSidebar, 
    updateMobileStatus, 
    resetSidebarState 
  };
});
