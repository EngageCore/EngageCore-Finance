<template>
  <Transition name="fade">
    <div v-if="loading" id="loader" class="loader-overlay">
      <div class="loader-container">
        <div class="loader-spinner">
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
          <div class="spinner-ring"></div>
        </div>
        <div class="loader-text">Loading...</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useLoadingStore } from '../store/loadingStore'; 
import { computed } from 'vue';

const loadingStore = useLoadingStore();
const loading = computed(() => loadingStore.isLoading);
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  cursor: wait;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loader-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
  border-top-color: #6366f1;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #8b5cf6;
  width: 85%;
  height: 85%;
  top: 7.5%;
  left: 7.5%;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: #a855f7;
  width: 70%;
  height: 70%;
  top: 15%;
  left: 15%;
}

.spinner-ring:nth-child(4) {
  border-top-color: #c084fc;
  width: 55%;
  height: 55%;
  top: 22.5%;
  left: 22.5%;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loader-text {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loader-overlay {
    background: rgba(0, 0, 0, 0.85);
  }
}

/* Light mode support */
@media (prefers-color-scheme: light) {
  .loader-overlay {
    background: rgba(255, 255, 255, 0.9);
  }
  
  .loader-text {
    color: #1f2937;
  }
}
</style>
