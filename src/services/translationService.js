import axios from 'axios';

const LINGVA_API = 'https://lingva.ml/api/v1'; // 你可以换成其他 Lingva 实例

const language = [
  { id: 1, name: 'English', code: 'en' },
  { id: 2, name: 'Simplified Chinese', code: 'zh' }, // Lingva 用 zh，而不是 zh-CN
  { id: 3, name: 'Malay', code: 'ms' },
];

export const getLanguageCode = (languageId) => {
  return language.find(lang => lang.id === languageId)?.code || 'en';
};

export const getLanguageName = (languageId) => {
  return language.find(lang => lang.id === languageId)?.name || 'English';
};

export const translateText = async (text, sourceLang, targetLang) => {
  if (!text?.trim() || sourceLang === targetLang) return text;

  try {
    const url = `${LINGVA_API}/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`;
    const response = await axios.get(url, { timeout: 15000 });

    return response.data.translation || text;
  } catch (error) {
    console.error('translateText error:', error);
    return text;
  }
};

export const translateHtml = async (htmlContent, sourceLang, targetLang) => {
  if (!htmlContent?.trim() || sourceLang === targetLang) return htmlContent;

  const textMap = {};
  let counter = 0;

  // 用占位符标记纯文本内容
  const htmlWithPlaceholders = htmlContent.replace(/>([^<]+)</g, (match, text) => {
    if (!text.trim()) return match;

    const id = counter++;
    textMap[id] = text.trim();

    return `>[[TRANSLATE:${id}]]<`;
  });

  // 批量翻译（目前顺序执行）
  const translatedMap = {};
  for (const [id, text] of Object.entries(textMap)) {
    translatedMap[id] = await translateText(text, sourceLang, targetLang);
  }

  // 替换回翻译内容
  const finalHtml = htmlWithPlaceholders.replace(/\[\[TRANSLATE:(\d+)\]\]/g, (_, id) => {
    return translatedMap[id] || textMap[id];
  });

  return finalHtml;
};
