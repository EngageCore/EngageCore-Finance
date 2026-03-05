<script setup>
import { computed } from 'vue';
import { useThemeStore } from '@/store/useThemeStore';

defineOptions({
  name: 'LandingPage'
});

const themeStore = useThemeStore();

const rootStyle = computed(() => {
  const themeColor = themeStore.themeColor || '#22d3ee';

  if (themeStore.darkMode) {
    return {
      '--landing-theme-color': themeColor,
      '--landing-bg-base': '#020617',
      '--landing-card-bg': 'rgba(15, 23, 42, 0.88)',
      '--landing-card-border': 'rgba(148, 163, 184, 0.25)',
      '--landing-title-from': '#e2e8f0',
      '--landing-title-to': '#f9fafb',
      '--landing-subtitle-color': '#9ca3af'
    };
  }

  return {
    '--landing-theme-color': themeColor,
    '--landing-bg-base': '#e5f5ff',
    '--landing-card-bg': 'rgba(255, 255, 255, 0.94)',
    '--landing-card-border': 'rgba(148, 163, 184, 0.35)',
    '--landing-title-from': '#0f172a',
    '--landing-title-to': themeColor,
    '--landing-subtitle-color': '#4b5563'
  };
});
</script>

<template>
  <div class="landing-root" :style="rootStyle">
    <!-- Animated gradient background -->
    <div class="gradient-layer" />
    <div class="blob blob-1" />
    <div class="blob blob-2" />
    <div class="blob blob-3" />

    <!-- Content -->
    <div class="content">
      <div class="card">
        <h1 class="title">
          EngageFinance
        </h1>
        <p class="subtitle">
          {{ $t('landing_subtitle') }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--landing-theme-color) 18%, transparent), transparent 55%),
    radial-gradient(circle at bottom right, color-mix(in srgb, var(--landing-theme-color) 26%, transparent), transparent 55%),
    linear-gradient(135deg, var(--landing-bg-base), var(--landing-bg-base));
}

.gradient-layer {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--landing-theme-color) 52%, transparent), transparent 55%),
    radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--landing-theme-color) 48%, transparent), transparent 55%);
  opacity: 0.55;
  mix-blend-mode: screen;
}

.blob {
  position: absolute;
  border-radius: 999px;
  filter: blur(26px);
  opacity: 0.35;
  mix-blend-mode: screen;
  will-change: transform;
}

.blob-1 {
  width: 260px;
  height: 260px;
  background: color-mix(in srgb, var(--landing-theme-color) 90%, transparent);
  top: -80px;
  left: -60px;
}

.blob-2 {
  width: 300px;
  height: 300px;
  background: color-mix(in srgb, var(--landing-theme-color) 80%, #1d4ed8 20%);
  bottom: -120px;
  right: -40px;
}

.blob-3 {
  width: 220px;
  height: 220px;
  background: color-mix(in srgb, var(--landing-theme-color) 78%, #22c55e 22%);
  bottom: 10%;
  left: 15%;
}

.content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  width: 100%;
  max-width: 1200px;
}

.card {
  width: 100%;
  max-width: 720px;
  padding: 2.75rem 2.5rem;
  border-radius: 1.5rem;
  background: var(--landing-card-bg);
  border: 1px solid var(--landing-card-border);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(18px);
  text-align: center;
}

.title {
  font-size: 2.2rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-bottom: 0.9rem;
  background: linear-gradient(135deg, var(--landing-title-from), var(--landing-title-to));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--landing-subtitle-color);
  max-width: 26rem;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .card {
    padding: 2rem 1.5rem;
    border-radius: 1.35rem;
  }

  .title {
    font-size: 1.8rem;
  }

  .blob-1,
  .blob-2,
  .blob-3 {
    filter: blur(22px);
    opacity: 0.3;
  }
}
</style>
