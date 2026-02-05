import { createI18n } from "vue-i18n";

// Retrieve the saved language from local storage or use default
const savedLocale = localStorage.getItem("language") || "en_US";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en_US",
  messages: {},
});

export default i18n;
