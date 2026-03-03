import { createI18n } from "vue-i18n";
import translations from "@/locales/localTranslations.json";

const savedLocale = localStorage.getItem("language") || "en";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en",
  messages: translations,
});

export default i18n;
