// src/services/exportService.js

/**
 * headers: [{ label: 'username', key: 'playerUsername' }, ...]
 * data:    [{ playerUsername: 'aaa', ... }, ...]
 *
 * options:
 * - filename: 'export'
 * - type: 'csv' | 'xlsx'  (default csv)
 * - delimiter: ','        (default ,)
 * - bom: true             (default true, Excel UTF-8 友好)
 * - sheetName: 'Sheet1'   (xlsx only)
 * - labelResolver: (label) => string   // e.g. (k)=>t(k)
 * - valueResolver: (value, row, header) => any // format date/amount
 * - enablePathKey: true    // key 支持 'a.b.c'
 */

const DEFAULT_OPTIONS = {
  filename: 'export',
  type: 'csv',
  delimiter: ',',
  bom: true,
  sheetName: 'Sheet1',
  enablePathKey: true
};

function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

function normalizeCell(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function escapeCsvCell(cell, delimiter) {
  const v = String(cell ?? '');
  if (v.includes(delimiter) || v.includes('\n') || v.includes('\r') || v.includes('"')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildTable(data, headers, opts) {
  const labelResolver = opts.labelResolver || ((x) => x);

  const headerRow = headers.map((h) => labelResolver(h.label));

  const rows = (data || []).map((row) => {
    return headers.map((h) => {
      const raw = (opts.enablePathKey === false)
        ? (row ? row[h.key] : undefined)
        : getByPath(row, h.key);

      const resolved = opts.valueResolver ? opts.valueResolver(raw, row, h) : raw;
      return normalizeCell(resolved);
    });
  });

  return { headerRow, rows };
}

export const exportService = {
  async export(data, headers, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (!Array.isArray(headers) || headers.length === 0) {
      throw new Error('exportService: headers is required');
    }

    // 如果你想默认不导出 action/select，可以在这里改：
    const safeHeaders = headers.filter(h => !!h.key);

    if (opts.type === 'xlsx') {
      await exportService.exportXlsx(data, safeHeaders, opts);
    } else {
      exportService.exportCsv(data, safeHeaders, opts);
    }
  },

  exportCsv(data, headers, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options, type: 'csv' };
    const { headerRow, rows } = buildTable(data, headers, opts);

    const delimiter = opts.delimiter || ',';
    const lines = [
      headerRow.map((c) => escapeCsvCell(c, delimiter)).join(delimiter),
      ...rows.map((r) => r.map((c) => escapeCsvCell(c, delimiter)).join(delimiter))
    ].join('\r\n');

    const content = (opts.bom !== false) ? '\uFEFF' + lines : lines;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${opts.filename || 'export'}.csv`);
  },

  async exportXlsx(data, headers, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options, type: 'xlsx' };
    const { headerRow, rows } = buildTable(data, headers, opts);

    // ✅ 可选依赖：需要 npm i xlsx
    let XLSX;
    try {
      XLSX = await import('xlsx');
    } catch (e) {
      throw new Error("exportService: missing dependency 'xlsx'. Run: npm i xlsx");
    }

    const aoa = [headerRow, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, opts.sheetName || 'Sheet1');

    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    downloadBlob(blob, `${opts.filename || 'export'}.xlsx`);
  }
};
