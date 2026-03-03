// 真正可用的 Google Translate 前端翻译（无 API key）
export const translateText = async (text, sourceLang, targetLang) => {
  if (!text?.trim() || sourceLang === targetLang) return text;

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const res = await fetch(url);
    const data = await res.json();

    return data[0]?.map(item => item[0]).join('') || text;
  } catch (error) {
    console.error("Google translate error:", error);
    return text;
  }
};

export const translateHtml = async (htmlContent, sourceLang, targetLang) => {
  if (!htmlContent?.trim() || sourceLang === targetLang) return htmlContent;

  const textMap = {};
  let counter = 0;

  const htmlWithPlaceholders = htmlContent.replace(/>([^<]+)</g, (match, text) => {
    if (!text.trim()) return match;
    const id = counter++;
    textMap[id] = text.trim();
    return `>[[TRANSLATE:${id}]]<`;
  });

  const translatedMap = {};
  for (const [id, text] of Object.entries(textMap)) {
    translatedMap[id] = await translateText(text, sourceLang, targetLang);
  }

  return htmlWithPlaceholders.replace(/\[\[TRANSLATE:(\d+)\]\]/g, (_, id) => {
    return translatedMap[id] || textMap[id];
  });
};

const language = [
  { id: 1, name: 'English', code: 'en' },
  { id: 2, name: 'Simplified Chinese', code: 'zh-CN' },
  { id: 3, name: 'Malay', code: 'ms' },
];

export const getLanguageCode = (languageId) =>
  language.find(lang => lang.id === languageId)?.code || 'en';

export const getLanguageName = (languageId) =>
  language.find(lang => lang.id === languageId)?.name || 'English';
