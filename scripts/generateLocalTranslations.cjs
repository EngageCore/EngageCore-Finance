const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..', 'src');
const localesPath = path.join(projectRoot, 'locales');
const localTranslationsPath = path.join(localesPath, 'localTranslations.json');

const exts = ['.js', '.jsx', '.ts', '.tsx', '.vue'];
const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.idea', '.vscode']);

function collectFiles(dir, result) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      collectFiles(fullPath, result);
    } else {
      const ext = path.extname(entry.name);
      if (exts.includes(ext)) {
        result.push(fullPath);
      }
    }
  }
}

function collectUsedKeys() {
  const files = [];
  collectFiles(projectRoot, files);
  const keys = new Set();

  const patterns = [
    /\$t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /i18n\.t\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /\bt\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  ];

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    for (const re of patterns) {
      let match;
      while ((match = re.exec(content)) !== null) {
        if (match[1]) {
          keys.add(match[1]);
        }
      }
    }
  }

  return Array.from(keys).sort();
}

function main() {
  if (!fs.existsSync(localTranslationsPath)) {
    console.error('localTranslations.json not found at', localTranslationsPath);
    process.exit(1);
  }

  const usedKeys = collectUsedKeys();

  console.log('Found used translation keys:', usedKeys.length);

  let original;
  try {
    original = JSON.parse(fs.readFileSync(localTranslationsPath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse localTranslations.json:', e.message);
    process.exit(1);
  }

  const newData = {};

  for (const [lang, translations] of Object.entries(original)) {
    const langObj = {};
    for (const key of usedKeys) {
      if (translations && Object.prototype.hasOwnProperty.call(translations, key)) {
        langObj[key] = translations[key];
      } else {
        langObj[key] = key;
      }
    }
    newData[lang] = langObj;
  }

  fs.writeFileSync(localTranslationsPath, JSON.stringify(newData, null, 2), 'utf8');
  console.log('localTranslations.json regenerated with', usedKeys.length, 'keys.');
}

main();

