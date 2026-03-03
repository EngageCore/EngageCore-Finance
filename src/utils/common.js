import { $t } from '@/locales';

/**
 * Transform record to option
 *
 * @example
 *   ```ts
 *   const record = {
 *     key1: 'label1',
 *     key2: 'label2'
 *   };
 *   const options = transformRecordToOption(record);
 *   // [
 *   //   { value: 'key1', label: 'label1' },
 *   //   { value: 'key2', label: 'label2' }
 *   // ]
 *   ```;
 *
 * @param record
 */
export function transformRecordToOption(record) {
  return Object.entries(record).map(([value, label]) => ({
    value,
    label
  }));
}

/**
 * Translate options
 *
 * @param options
 */
export function translateOptions(options) {
  return options.map(option => ({
    ...option,
    label: $t(option.label)
  }));
}

/**
 * Toggle html class
 *
 * @param className
 */
export function toggleHtmlClass(className) {
  function add() {
    document.documentElement.classList.add(className);
  }

  function remove() {
    document.documentElement.classList.remove(className);
  }

  return {
    add,
    remove
  };
}

// Update date into format YYYY/MM/DD HH:MM:SS AM/PM
export const dateFormat = (utcDate, endOfDay = false) => {
  // ✅ 加上 'Z' 让它被当作 UTC 解析
  const date = new Date(utcDate.endsWith('Z') ? utcDate : `${utcDate}Z`);

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const strHours = hours.toString().padStart(2, "0");

  return `${year}/${month}/${day} ${strHours}:${minutes}:${seconds} ${ampm}`;
};

// Update date into UTC format
export const convertToUTC = (localDate) => {
  const date = new Date(localDate+'T00:00:00').toISOString();
  return date;
};

// Update number into format YYYY-MM-DD
export const formatDate = (timestamp) => {
  if (!timestamp) return null
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Update to local date format YYYY-MM-DD
export const convertToLocalDateOnly = (utcDate) => {
  if (!utcDate.includes("Z")) utcDate += "Z";
  const date = new Date(utcDate); // 会自动转为本地时间

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`; // 改为 - 分隔符
}

// Update date into number format
export const parseDateToNumber = (dateStr) => {
  if (!dateStr) return null;
  // 在末尾加上 T00:00:00，确保被当成本地时间解析
  const date = new Date(`${dateStr}T00:00:00`);
  return date.getTime();
};

// Update get image url
export const getImageUrl = (container, imageName) => {
  if (!imageName) return null;

  if (import.meta.env.VITE_ENV == 'development') {
    return `${import.meta.env.VITE_API_URL}/image/${container}/${imageName}`;
  } else {
    return `/api/image/${container}/${imageName}`;
  }
};

// Handle show message popup
export const handleMessage = (content, type = 'info') => {
  switch (type) {
    case 'success':
      window.$message.success(content);
      break;
    case 'error':
      window.$message.error(content);
      break;
    case 'warning':
      window.$message.warning(content);
      break;
    default:
      window.$message.info(content);
  }
};

// Update to numeric only
export function digitsOnly(formData, field, allowDecimal = false, decimalPlaces = 2) {
  let val = String(formData[field] ?? '');

  // 1️⃣ 过滤非法字符
  val = allowDecimal
    ? val.replace(/[^0-9.]/g, '')
    : val.replace(/\D/g, '');

  if (allowDecimal) {
    // 2️⃣ 只保留第一个小数点
    val = val.replace(/(\..*)\./g, '$1');

    // 3️⃣ 拆分整数 & 小数
    const [intPartRaw, decPartRaw] = val.split('.');

    // 4️⃣ 去除整数部分多余前导 0（但保留至少一个）
    const intPart = intPartRaw.replace(/^0+(?=\d)/, '');

    // 5️⃣ 限制小数位数
    const decPart = decPartRaw?.slice(0, decimalPlaces);

    val = decPart !== undefined ? `${intPart}.${decPart}` : intPart;
  } else {
    // 非小数情况才可以安全用 parseInt
    if (val !== '') val = String(parseInt(val, 10));
  }

  formData[field] = val;
}

// Update number into format with commas and decimal places
export const formatAmount = (number, excludeDecimal = false) => {
  if (typeof number === 'string') {
    number = Number(number);
  }

  if (typeof number === 'number' && !isNaN(number)) {
    const value = excludeDecimal
      ? Math.trunc(number).toString()
      : number.toFixed(2);

    const parts = value.split('.');

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return excludeDecimal ? parts[0] : parts.join('.');
  }

  return '0.00';
};

// Convert image url to base64
export async function urlToBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        base64: reader.result.split(',')[1],
        preview: reader.result,
        mimeType: blob.type,
        extension: blob.type.split('/')[1],
      });
    };
    reader.readAsDataURL(blob);
  });
}
