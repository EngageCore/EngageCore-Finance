import { createApp } from 'vue';
import Particles from '@tsparticles/vue3';
import { loadSlim } from '@tsparticles/slim';
import './plugins/assets';
import { setupAppVersionNotification, setupDayjs, setupIconifyOffline, setupLoading, setupNProgress } from './plugins';
import '@fortawesome/fontawesome-free/css/all.min.css'
import { setupStore } from './store';
import { setupRouter } from './router';
import { setupI18n } from './locales';
import App from './App.vue';

async function setupApp() {
  setupLoading();

  setupNProgress();

  setupIconifyOffline();

  setupDayjs();

  const app = createApp(App);

  app.use(Particles, {
    init: async engine => {
      await loadSlim(engine);
    }
  });

  setupStore(app);

  await setupRouter(app);

  setupI18n(app);

  setupAppVersionNotification();

  app.mount('#app');
}

setupApp();
