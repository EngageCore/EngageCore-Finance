import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import i18n from "./i18n";
import { loadTranslationsFromLocal } from "./utils/loadTranslations";
import { createPinia } from 'pinia';
import * as common from "./utils/common";
import { sessionManager } from './utils/sessionManager';
import router from "./router";
import tooltipDirective from '@/directives/tooltips'

import 'vue-multiselect/dist/vue-multiselect.css';
import "./assets/libs/bootstrap/css/bootstrap.min.css";
import "./assets/css/styles.min.css";
import "./assets/css/icons.css";
import 'bootstrap';
import 'sweetalert2/dist/sweetalert2.min.css';

import "./assets/css/custom.css";
import "./assets/css/awn.css";

const app = createApp(App);

// Add common functions to global properties
Object.keys(common).forEach((key) => {
  app.config.globalProperties[`$${key}`] = common[key];
});

// Load translations from Google Sheets
loadTranslationsFromLocal();
// Check if theme is stored in localStorage and set the data-theme-mode attribute
// const themeMode = localStorage.getItem('theme');
// if (themeMode) {
//   const htmlElement = document.documentElement;
//   htmlElement.setAttribute('data-theme-mode', themeMode);
// }
const htmlElement = document.documentElement;
htmlElement.setAttribute('data-theme-mode', 'glassy');

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(store);
app.use(i18n);
app.directive('tooltip', tooltipDirective)
app.mount("#app");
