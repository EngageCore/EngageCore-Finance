import axios from "axios";
import i18n from "../i18n";
import localTranslations from "@/locales/localTranslations.json"; // Import the local translations


export const loadTranslationsFromLocal = () => {
  const updateTranslations = (translations) => {
    console.log(Object.keys(translations['en_US']).length)

    Object.keys(translations).forEach((locale) => {
      i18n.global.setLocaleMessage(locale, translations[locale]);
    });
  };

  try {
    // Update i18n messages with local translations
    updateTranslations(localTranslations);
  } catch (error) {
    console.error("Error loading local translations:", error);
  }
};
