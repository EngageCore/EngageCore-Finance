<script setup>
import { computed } from 'vue';
import { useThemeStore } from '@/store/useThemeStore';

defineOptions({
  name: 'AmbientParticles'
});

const themeStore = useThemeStore();

const particleOptions = computed(() => {
  const dark = themeStore.darkMode;

  return {
    fullScreen: {
      enable: false
    },
    background: {
      color: {
        value: 'transparent'
      }
    },
    fpsLimit: 60,
    particles: {
      number: {
        value: dark ? 55 : 45,
        density: {
          enable: true,
          area: 900
        }
      },
      color: {
        value: dark ? ['#7aa5cf', '#6a90b8', '#4f779f'] : ['#5c84ad', '#7a99ba', '#93acc8']
      },
      links: {
        enable: true,
        distance: 150,
        color: dark ? '#6d8eb1' : '#7a96b5',
        opacity: dark ? 0.22 : 0.18,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.55,
        random: false,
        straight: false,
        outModes: {
          default: 'bounce'
        }
      },
      opacity: {
        value: dark ? 0.32 : 0.22
      },
      size: {
        value: {
          min: 1,
          max: 3
        }
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab'
        },
        resize: {
          enable: true
        }
      },
      modes: {
        grab: {
          distance: 170,
          links: {
            opacity: dark ? 0.38 : 0.3
          }
        }
      }
    },
    detectRetina: true
  };
});
</script>

<template>
  <div class="ambient-particles-layer" aria-hidden="true">
    <vue-particles id="ambient-particles" class="ambient-particles-canvas" :options="particleOptions" />
  </div>
</template>

<style scoped>
.ambient-particles-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.ambient-particles-canvas {
  width: 100%;
  height: 100%;
}
</style>
