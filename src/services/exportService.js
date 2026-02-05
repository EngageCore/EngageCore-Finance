// src/services/exportService.js
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export const useExportService = () => {
  /**
   * Export table data to Excel
   * @param {Array} data - Data to export
   * @param {Array} headers - Table headers configuration
   * @param {String} fileName - File name without extension
   * @param {Object} options - Additional export options
   * @returns {Boolean} Success status
   */
  const exportToExcel = (data, headers, fileName, options = {}) => {
    // 修改：只检查headers是否存在，允许data为空
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return false;
    }

    try {
      // 如果data为空或不是数组，创建空数组
      let exportData = data;
      if (!exportData || !Array.isArray(exportData)) {
        exportData = [];
      }

      // Format data for export - 即使是空数组也会正常处理
      const formattedData = formatDataForExport(exportData, headers, options);

      // 创建包含表头和数据的完整数组
      const worksheetData = [];
      
      // 第一行：表头（始终包含）
      worksheetData.push(headers.map(h => h.label));
      
      // 后续行：数据（如果有数据的话）
      if (formattedData && formattedData.length > 0) {
        formattedData.forEach(row => {
          const dataRow = headers.map(header => {
            const value = row[header.key];
            return value !== undefined && value !== null ? value : '';
          });
          worksheetData.push(dataRow);
        });
      } else {
        // 修改：如果没有数据，添加一行空行以保持表格结构
        const emptyRow = headers.map(() => '');
        worksheetData.push(emptyRow);
      }

      // 使用 aoa_to_sheet 创建工作表
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);

      // Auto-fit column widths based on content
      const colWidths = headers.map((header) => {
        const headerLength = header.label ? header.label.length : 0;
        
        // 修改：如果没有数据，只基于表头长度计算宽度
        let maxContentLength = 0;
        if (formattedData && formattedData.length > 0) {
          maxContentLength = formattedData.reduce((max, row) => {
            const cellValue = row[header.key];
            const cellLength = cellValue ? cellValue.toString().length : 0;
            return Math.max(max, cellLength);
          }, 0);
        }
        
        const calculatedWidth = Math.max(headerLength, maxContentLength);
        return {
          wch: Math.max(10, Math.min(50, calculatedWidth + 2))
        };
      });
      ws['!cols'] = colWidths;

      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Data');

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, {
        bookType: options.bookType || 'xlsx',
        type: 'array'
      });

      // Create Blob and save file
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create filename with timestamp only if not already present
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      let fileNameWithTimestamp;
      
      // Check if fileName already contains a date pattern
      if (fileName.match(/\d{4}-\d{2}-\d{2}/) || fileName.match(/\d{8}/)) {
        // If already has date, just add extension
        fileNameWithTimestamp = `${fileName}.${options.bookType || 'xlsx'}`;
      } else {
        // If no date, add timestamp
        fileNameWithTimestamp = `${fileName}_${timestamp}.${options.bookType || 'xlsx'}`;
      }

      saveAs(blob, fileNameWithTimestamp);
      return true;
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
      return false;
    }
  };

  /**
   * Export table data to CSV
   * @param {Array} data - Data to export
   * @param {Array} headers - Table headers configuration
   * @param {String} fileName - File name without extension
   * @returns {Boolean} Success status
   */
  const exportToCsv = (data, headers, fileName) => {
    // 修改：只检查headers是否存在，允许data为空
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return false;
    }

    try {
      // 如果data为空或不是数组，创建空数组
      let exportData = data;
      if (!exportData || !Array.isArray(exportData)) {
        exportData = [];
      }

      // Format data for export - 即使是空数组也会正常处理
      const formattedData = formatDataForExport(exportData, headers);

      // Create header row（始终包含表头）
      const headerRow = headers.map(h => `"${h.label}"`).join(',');

      // Create CSV rows
      const rows = [];
      if (formattedData && formattedData.length > 0) {
        formattedData.forEach(row => {
          const csvRow = headers.map(header => {
            const value = row[header.key];
            return `"${value !== undefined && value !== null ? value : ''}"`;
          }).join(',');
          rows.push(csvRow);
        });
      } else {
        // 修改：如果没有数据，添加一行空行
        const emptyRow = headers.map(() => '""').join(',');
        rows.push(emptyRow);
      }

      // Combine header and rows
      const csvContent = [headerRow, ...rows].join('\n');

      // Create Blob and save file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Create filename with timestamp only if not already present
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      let fileNameWithTimestamp;
      
      // Check if fileName already contains a date pattern
      if (fileName.match(/\d{4}-\d{2}-\d{2}/) || fileName.match(/\d{8}/)) {
        // If already has date, just add extension
        fileNameWithTimestamp = `${fileName}.csv`;
      } else {
        // If no date, add timestamp
        fileNameWithTimestamp = `${fileName}_${timestamp}.csv`;
      }

      saveAs(blob, fileNameWithTimestamp);
      return true;
    } catch (error) {
      console.error('Error exporting data to CSV:', error);
      return false;
    }
  };

  /**
   * Format data for export based on header types
   * @param {Array} data - Raw data
   * @param {Array} headers - Table headers configuration
   * @param {Object} options - Additional formatting options
   * @returns {Array} Formatted data
   */
  const formatDataForExport = (data, headers, options = {}) => {
    // 修改：如果data为空，直接返回空数组，不再转换失败
    if (!data) {
      return [];
    }

    if (!Array.isArray(data)) {
      if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          data = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          data = data.items;
        } else if (data.results && Array.isArray(data.results)) {
          data = data.results;
        } else {
          data = [data];
        }
      } else {
        return [];
      }
    }

    // 修改：确保data是数组，如果不是则返回空数组
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(item => {
      const formattedRow = {};

      headers.forEach(header => {
        let value = item[header.key];

        // Format based on type
        if (header.type === 'currency') {
          formattedRow[header.key] = typeof value === 'number' ?
            value.toFixed(2) :
            (value ? parseFloat(value.toString().replace(/[^0-9.-]+/g, '')).toFixed(2) : '');
        } else if (header.type === 'date' && value) {
          const dateValue = value instanceof Date ? value : new Date(value);
          if (!isNaN(dateValue)) {
            formattedRow[header.key] = format(dateValue, options.dateFormat || 'yyyy-MM-dd');
          } else {
            formattedRow[header.key] = value;
          }
        } else if (header.type === 'boolean') {
          formattedRow[header.key] = value ? 'Yes' : 'No';
        } else {
          formattedRow[header.key] = value !== undefined && value !== null ? value : '';
        }

        // Apply custom formatter if provided
        if (header.formatter && typeof header.formatter === 'function') {
          try {
            formattedRow[header.key] = header.formatter(value, item);
          } catch (error) {
            // If formatter fails, keep original value
            formattedRow[header.key] = value !== undefined && value !== null ? value : '';
          }
        }
      });

      return formattedRow;
    });
  };

  /**
   * Fetch all data for export if needed
   * @param {Function} fetchAllFn - Function to fetch all data
   * @param {Object} params - Parameters for the fetch function
   * @returns {Promise<Array>} All data for export
   */
  const fetchAllDataForExport = async (fetchAllFn, params = {}) => {
    if (typeof fetchAllFn === 'function') {
      try {
        const result = await fetchAllFn(params);
        
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          if (result.data && Array.isArray(result.data)) {
            return result.data;
          } else if (result.items && Array.isArray(result.items)) {
            return result.items;
          } else if (result.results && Array.isArray(result.results)) {
            return result.results;
          }
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching all data for export:', error);
        throw error;
      }
    }
    return null;
  };

  /**
   * Combine multiple export functions in one method
   * @param {Array} data - Data to export
   * @param {Array} headers - Table headers
   * @param {String} fileName - File name without extension
   * @param {String} format - Export format (excel, csv)
   * @param {Object} options - Additional options
   * @returns {Boolean} Success status
   */
  const exportTableData = async (data, headers, fileName, format = 'excel', options = {}) => {
    try {
      let exportData = data;

      if (options.fetchAll && typeof options.fetchAllFn === 'function') {
        if (options.setLoading && typeof options.setLoading === 'function') {
          options.setLoading(true);
        }

        const allData = await fetchAllDataForExport(options.fetchAllFn, options.fetchParams);
        if (allData !== null) {
          exportData = allData;
        }
      }

      // 修改：简化数据处理逻辑，允许空数据
      if (!Array.isArray(exportData)) {
        if (exportData && typeof exportData === 'object') {
          if (exportData.data && Array.isArray(exportData.data)) {
            exportData = exportData.data;
          } else if (exportData.items && Array.isArray(exportData.items)) {
            exportData = exportData.items;
          } else if (exportData.results && Array.isArray(exportData.results)) {
            exportData = exportData.results;
          } else {
            // 修改：如果不是预期的数据结构，设置为空数组而不是返回失败
            exportData = [];
          }
        } else {
          // 修改：如果数据为null或undefined，设置为空数组
          exportData = [];
        }
      }

      // 修改：移除数据长度检查，允许导出空数据
      // 原代码：if (!exportData || exportData.length === 0) { return false; }
      // 现在即使exportData为空数组也会继续执行

      const sanitizedFileName = fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      const translatedHeaders = headers.map(header => ({
        ...header,
        label: options.translate ? options.translate(header.label) : header.label
      }));

      let result = false;
      switch (format.toLowerCase()) {
        case 'csv':
          result = exportToCsv(exportData, translatedHeaders, sanitizedFileName);
          break;
        case 'excel':
        case 'xlsx':
        default:
          result = exportToExcel(exportData, translatedHeaders, sanitizedFileName, options);
          break;
      }

      return result;
    } catch (error) {
      console.error('Error in exportTableData:', error);
      return false;
    } finally {
      if (options.setLoading && typeof options.setLoading === 'function') {
        options.setLoading(false);
      }
    }
  };

  return {
    exportTableData,
    exportToExcel,
    exportToCsv
  };
};