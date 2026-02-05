<template>
  <!-- Start:: row-7 -->
  <div class="row">
    <div class="col-12">
      <div class="card custom-card">
        <div class="card-header justify-content-between">
          <div class="card-title">
            {{ $t(title) }}
          </div>
          <!-- <button @click="exportToExcel" class="btn btn-primary">Export to Excel</button> -->
          <slot name="tableRight"></slot>
        </div>
        <div class="card-body">
          <div class="table-responsive"  ref="tableContainer">
            <table class="table text-nowrap" :class="{ 'table-bordered': bordered }">
              <thead>
                <tr>
                  <th v-for="(header, index) in headers" :key="index" @click="header.sortable ? sort(header.key) : null" class="table-header"
                    :class="{ 'text-right': header.type && header.type == 'currency' }" :style="header.width ? { minWidth: header.width } : {}">
                    <template v-if="$slots[`header-${header.key}`]">
                      <slot :name="`header-${header.key}`" :header="header" />
                    </template>
                    <template v-else>
                      {{ $t(header.label) }}
                      <i v-if="header.sortable" class="ri-sort-asc" :class="{ 'ri-sort-desc': sortOrder === 'desc' }"></i>
                    </template>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td :colspan="headers.length" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">{{ $t('loading') || 'Loading...' }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-else-if="!data.length">
                  <td :colspan="headers.length" class="text-center">{{ $t('no_records_found') }}</td>
                </tr>
                <tr 
                  v-else 
                  v-for="(row, rowIndex) in data" 
                  :key="rowIndex"
                  @click="handleRowClick(row)"
                  :class="getRowClass()"
                  class="table-row"
                >
                  <td v-for="(header, colIndex) in headers" :key="colIndex"
                    :class="{ 'text-right': header.type && header.type == 'currency' }">
                    <slot :name="header.key" :row="row" :index="rowIndex" :teleportDropdown="teleportDropdown" v-if="header.type && header.type == 'currency'">
                      {{ formatAmount(row[header.key]) }}
                    </slot>
                    <slot :name="header.key" :row="row" :index="rowIndex" :teleportDropdown="teleportDropdown" v-else>
                      {{ row[header.key] }}
                    </slot>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
          <div class="pagination-container mt-3 card-footer d-flex justify-content-between align-items-center"
            v-if="data.length && pagination">
            <div>
              {{ $t('pagination_msg', {val1 : offset + 1, val2 : Math.min(offset + limit, totalRows), val3 :totalRows }) }}
            </div>
            <div class="pagination">
              <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
                class="pagination-button">{{ $t('previous') }}</button>
              <template v-if="totalPages > 5">
                <button v-if="currentPage > 3" @click="changePage(1)" class="pagination-page btn">{{ 1 }}</button>
                <span v-if="currentPage > 4">...</span>
                <button v-for="page in visiblePages" :key="page" @click="changePage(page)"
                  :class="['pagination-page btn', { active: page === currentPage }]">{{ page }}</button>
                <span v-if="currentPage < totalPages - 3">...</span>
                <button v-if="currentPage < totalPages - 2" @click="changePage(totalPages)"
                  class="pagination-page btn">{{ totalPages }}</button>
              </template>
              <template v-else>
                <button v-for="page in totalPages" :key="page" @click="changePage(page)"
                  :class="['pagination-page btn', { active: page === currentPage }]">{{ page }}</button>
              </template>
              <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
                class="pagination-button">{{ $t('next') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Teleported Dropdowns -->
   <Teleport to="body">
     <div v-for="[dropdownId, dropdown] in activeDropdowns" :key="dropdownId" 
          v-show="dropdown.visible" 
          class="teleported-dropdown"
          :style="dropdown.position"
          :data-dropdown-id="dropdownId">
       <div class="dropdown-menu" style="display: block;">
         <slot :name="`dropdown-content`" :dropdownId="dropdownId" :rowData="dropdown.rowData" :hide="() => hideDropdown(dropdownId)"></slot>
       </div>
     </div>
   </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import * as XLSX from 'xlsx';
import { formatAmount } from '@/utils/common';
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

const props = defineProps({
  title: {
    type: String,
    required: false,
    default:''
  },
  data: {
    type: Array,
    required: true,
  },
  headers: {
    type: Array,
    required: true,
  },
  bordered: {
    type: Boolean,
    default: false,
  },
  offset: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
    default: 10,
  },
  totalRows: {
    type: Number,
    required: true,
  },
  pagination: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: String,
    default: 'asc'
  },
  // 新增行点击相关属性
  rowClickable: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['sort', 'pagination', 'rowAction']);

const tableContainer = ref(null);
const activeDropdowns = ref(new Map());

const sortOrder = ref(props.sortOrder);
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(props.totalRows / props.limit));

const visiblePages = computed(() => {
  const pages = [];
  const startPage = Math.max(1, currentPage.value - 2);
  const endPage = Math.min(totalPages.value, currentPage.value + 2);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

const hasFewRows = computed(() => {
  return props.data.length <= 2;
});

// 行点击处理函数
const handleRowClick = (row) => {
  if (!props.rowClickable) return;
  
  // 发出行点击事件给父组件，只传递row数据
  emit('rowAction', row);
};

// 获取行的CSS类
const getRowClass = () => {
  const classes = [];
  
  if (props.rowClickable) {
    classes.push('row-clickable');
  }
  
  return classes;
};

// 监听props变化（如果需要的话）
// watch(() => props.data, () => {
//   // 可以在这里添加数据变化的处理逻辑
// });

const sort = (key) => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  emit('sort', { key, order: sortOrder.value });
};

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  emit('pagination', { offset: (page - 1) * props.limit, limit: props.limit });
};

watch(() => props.offset, (newOffset) => {
  if (newOffset === 0) {
    currentPage.value = 1;
  }
});

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(props.data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${props.title}.xlsx`);
};

// Teleport dropdown functionality
 const teleportDropdown = (triggerElement, dropdownId, rowData = null) => {
   return {
     show: (event) => showDropdown(event, triggerElement, dropdownId, rowData),
     hide: () => hideDropdown(dropdownId),
     toggle: (event) => toggleDropdown(event, triggerElement, dropdownId, rowData)
   };
 };

const calculateDropdownPosition = (triggerRect, dropdownId = null) => {
  let dropdownHeight = 200; // Default estimated dropdown height
  
  // Try to get actual dropdown height if dropdownId is provided
  if (dropdownId) {
    const dropdownElement = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);
    if (dropdownElement) {
      // If dropdown is hidden, temporarily show it off-screen to measure
      const wasHidden = dropdownElement.style.display === 'none' || !dropdownElement.offsetParent;
      if (wasHidden) {
        const originalStyles = {
          position: dropdownElement.style.position,
          visibility: dropdownElement.style.visibility,
          left: dropdownElement.style.left,
          top: dropdownElement.style.top
        };
        
        // Temporarily position off-screen to measure
        dropdownElement.style.position = 'absolute';
        dropdownElement.style.visibility = 'hidden';
        dropdownElement.style.left = '-9999px';
        dropdownElement.style.top = '-9999px';
        dropdownElement.style.display = 'block';
        
        dropdownHeight = dropdownElement.offsetHeight;
        
        // Restore original styles
        dropdownElement.style.position = originalStyles.position;
        dropdownElement.style.visibility = originalStyles.visibility;
        dropdownElement.style.left = originalStyles.left;
        dropdownElement.style.top = originalStyles.top;
        if (wasHidden) {
          dropdownElement.style.display = 'none';
        }
      } else {
        dropdownHeight = dropdownElement.offsetHeight;
      }
    }
  }
  
  const viewportHeight = window.innerHeight;
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;
  
  let top = triggerRect.bottom + window.scrollY;
  let transformOrigin = 'top';
  
  // If not enough space below and more space above, show dropdown above
  if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    top = triggerRect.top + window.scrollY - dropdownHeight;
    transformOrigin = 'bottom';
  }
  
  return {
    position: 'absolute',
    top: `${top}px`,
    left: `${triggerRect.left + window.scrollX}px`,
    zIndex: 1050,
    transformOrigin
  };
};

const showDropdown = async (event, triggerElement, dropdownId, rowData = null) => {
   event.preventDefault();
   event.stopPropagation();
   
   // Hide other dropdowns
   activeDropdowns.value.forEach((dropdown, id) => {
     if (id !== dropdownId) {
       hideDropdown(id);
     }
   });
   
   const triggerRect = triggerElement.getBoundingClientRect();
   const position = calculateDropdownPosition(triggerRect, dropdownId);
   
   activeDropdowns.value.set(dropdownId, {
     visible: true,
     position,
     triggerElement,
     rowData
   });
   
   await nextTick();
   
   // Add click outside listener
   document.addEventListener('click', (e) => handleClickOutside(e, dropdownId), { once: true });
 };

const hideDropdown = (dropdownId) => {
  if (activeDropdowns.value.has(dropdownId)) {
    activeDropdowns.value.delete(dropdownId);
  }
};

const toggleDropdown = (event, triggerElement, dropdownId, rowData = null) => {
   if (activeDropdowns.value.has(dropdownId)) {
     hideDropdown(dropdownId);
   } else {
     showDropdown(event, triggerElement, dropdownId, rowData);
   }
 };

const handleClickOutside = (event, dropdownId) => {
  const dropdown = activeDropdowns.value.get(dropdownId);
  if (dropdown && !dropdown.triggerElement.contains(event.target)) {
    hideDropdown(dropdownId);
  }
};

const updateDropdownPositions = () => {
  activeDropdowns.value.forEach((dropdown, dropdownId) => {
    if (dropdown.visible && dropdown.triggerElement) {
      const triggerRect = dropdown.triggerElement.getBoundingClientRect();
      const position = calculateDropdownPosition(triggerRect, dropdownId);
      dropdown.position = position;
    }
  });
};

// Handle scroll and resize events
const handleScrollResize = () => {
  updateDropdownPositions();
};

onMounted(() => {
  if (tableContainer.value) {
    tableContainer.value.addEventListener('scroll', handleTableScroll, { passive: true });
  }
  window.addEventListener('scroll', handleScrollResize, true);
  window.addEventListener('resize', handleScrollResize);
});

onUnmounted(() => {
  if (tableContainer.value) {
    tableContainer.value.removeEventListener('scroll', handleTableScroll);
  }
  window.removeEventListener('scroll', handleScrollResize, true);
  window.removeEventListener('resize', handleScrollResize);
  activeDropdowns.value.clear();
});

const handleTableScroll = (e) => {
  // 如果水平滚动了，就关闭全部 dropdown
  if (e.target.scrollLeft !== 0) {
    activeDropdowns.value.clear();
  }
};
</script>

<style scoped>
.table-header {
  cursor: pointer;
}

.pagination {
  display: flex;
  align-items: center;
  background: var(--body-bg-rgb);
  border: 1px solid var(--primary01);
  border-radius: 10px;
  padding: 5px 10px;
  flex-wrap: wrap;
  /* Allow pagination items to wrap */
  justify-content: center;
  /* Center the pagination on smaller screens */
}

.pagination-button {
  border: none;
  background: none;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

.pagination-button:disabled {
  cursor: not-allowed;
  color: #6c757d;
}

.pagination-page {
  margin: 0 5px;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  background-color: var(--body-bg-rgb);
  color: var(--default-text-color);
  cursor: pointer;
  transition: background 0.3s ease-in-out;
}

.pagination-page:hover {
  background-color: var(--primary-color);
}

.pagination-page.active {
  background-color: var(--primary-color);
}

.pagination-button:hover:not(:disabled) {
  background: var(--body-bg-rgb);
}

.table-responsive {
  position: relative;
}

.table-row.row-clickable {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.table-row.row-clickable:hover {
  background-color: var(--primary-color-10, rgba(13, 110, 253, 0.1));
}

/* Responsive Styles */
@media (max-width: 768px) {

  .pagination-button,
  .pagination-page {
    padding: 5px 8px;
    /* Reduce padding on smaller screens */
    margin: 3px;
    /* Reduce margin for better spacing */
  }

  .pagination {
    padding: 5px;
    flex-wrap: nowrap;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 576px) {

  .pagination-button,
  .pagination-page {
    font-size: 12px;
    /* Reduce font size for very small screens */
    padding: 4px 6px;
  }

  .pagination {
    padding: 4px;
  }
}

.teleported-dropdown {
  position: absolute;
  z-index: 1050;
}

.teleported-dropdown .dropdown-menu {
  position: static;
  display: block;
  float: none;
  width: auto;
  margin: 0;
}

.teleported-dropdown .dropdown-item {
  display: block;
  width: 100%;
  padding: 0.25rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
}

.teleported-dropdown .dropdown-item:hover,
.teleported-dropdown .dropdown-item:focus {
  color: #1e2125;
  background-color: #e9ecef;
}
</style>