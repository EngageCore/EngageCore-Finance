// src/tools/i18ngenerator.js
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ✅ 解决 ESM 下没有 __dirname 的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== 配置 =====
const SHEET_ID = "1OR8qHTuFzMvu-Pasy-iE_xCPSCcxGvtjimWtPNL3tCs"; 
const API_KEY = "AIzaSyBCNDHfrzDQB8MiOoNf3BSOajn_kAhuG6g"; 
const RANGE = "Sheet1!A1:E1000";
const LOCAL_FILE_PATH = path.join(__dirname, "../locales/localTranslations.json");

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;

// ===== 主逻辑 =====
(async () => {
  try {
    const { data } = await axios.get(url);
    const values = data.values;

    if (!values || values.length === 0) {
      throw new Error("No data found in Google Sheet");
    }

    const [locales, ...translations] = values;
    const messages = {};

    translations.forEach((row) => {
      const [key, ...translationValues] = row;
      translationValues.forEach((value, index) => {
        const locale = locales[index + 1];
        if (!messages[locale]) messages[locale] = {};
        messages[locale][key] = value || "";
      });
    });

    // 确保输出目录存在
    fs.mkdirSync(path.dirname(LOCAL_FILE_PATH), { recursive: true });

    // 写文件
    fs.writeFileSync(LOCAL_FILE_PATH, JSON.stringify(messages, null, 2));
    console.log("✅ Translations updated successfully.");
  } catch (err) {
    console.error("❌ Error fetching translations:", err.message);
  }
})();
