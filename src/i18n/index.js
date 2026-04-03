import { createI18n } from "vue-i18n";
import translations from "@/locales/localTranslations.json";

const knownLocales = new Set(["en_US", "zh_CN", "id_ID"]);
const stored = typeof localStorage !== "undefined"
  ? localStorage.getItem("language")
  : null;
const savedLocale =
  stored && knownLocales.has(stored) ? stored : "en_US";

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: "en_US",
  messages: translations,
});

export default i18n;
