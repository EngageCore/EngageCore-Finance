// Function to format number to 2 decimal places
export const numberFormat = (number) => {
  return number.toFixed(2);
};

export const formatNumber = (number) => {
  if (typeof number === 'string') {
    number = Number(number);
  }
  if (typeof number === 'number' && !isNaN(number)) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    return "0";
  }
};

export const formatAmount = (number) => {
  
  if (typeof number === 'string') {
    number = Number(number);
  }

  if (typeof number === 'number' && !isNaN(number)) {
    const floatValue = number.toFixed(2);

    const parts = floatValue.split('.');
  
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
    return parts.join('.');
  } else {
    return "0.00";
  }
};

export const processDate = (rawDate, options = {}) => {
  const {
    timezoneOffset = 8, // Default timezone adjustment (e.g., UTC+8)
    format = 'yyyy-MM-dd HH:mm:ss', // Default format
  } = options;

  // Parse the raw date and set it to 00:00:00
  const date = new Date(rawDate + 'T00:00:00');

  // Subtract the timezone offset
  date.setHours(date.getHours() - timezoneOffset);

  // Extract date components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Replace tokens in the format string
  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};


export const processDateAddDay = (rawDate, options = {}) => {
  const {
    timezoneOffset = 8, // Default timezone adjustment (e.g., UTC+8)
    format = 'yyyy-MM-dd HH:mm:ss', // Default format
  } = options;

  // Parse the raw date and set it to 00:00:00
  const date = new Date(rawDate + 'T00:00:00');

  // Subtract the timezone offset
  date.setHours(date.getHours() - timezoneOffset);

  // Extract date components
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = (date.getDate() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Replace tokens in the format string
  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

// Function to format UTC date to local timezone and specified format
export const dateFormat = (utcDate) => {
  const date = new Date(utcDate);

  // Convert to local timezone with offset adjustment
  date.setHours(date.getHours() + 8);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  // Calculate AM/PM and adjust hours for 12-hour format
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours || 12; // the hour '0' should be '12'
  const strHours = hours.toString().padStart(2, "0");

  return `${year}/${month}/${day} ${strHours}:${minutes}:${seconds} ${ampm}`;
};

// Function to format UTC date to local timezone date only (no time)
export const dateFormatOnly = (utcDate) => {
  const date = new Date(utcDate); // 会自动转为本地时间
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Function to convert local date to UTC date in ISO 8601 format
export const convertToUTC = (localDate) => {
  if (!localDate) return null;
  
  // Extract date part only (YYYY-MM-DD) if datetime format is provided
  const dateOnly = localDate.split('T')[0];
  
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    throw new Error(`Invalid date format: ${localDate}. Expected YYYY-MM-DD format.`);
  }
  
  // Create date at midnight local time and convert to UTC ISO string
  const date = new Date(dateOnly + 'T00:00:00');
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${localDate}`);
  }
  
  return date.toISOString();
};

// Function to get the access token from localStorage
export const getToken = () => {
  return localStorage.getItem("access_token");
};

// Function to set the access token in localStorage
export const setToken = (token) => {
  localStorage.setItem("access_token", token);
};

// Function to remove the access token from localStorage
export const removeToken = () => {
  localStorage.removeItem("access_token");
};
