<template>
  <div class="col-12 mb-3">
    <!-- Accordion Component for Form -->
    <div class="accordion" id="formAccordion">
      <div class="accordion-item">
        <h2 class="accordion-header" id="formAccordionHeading">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
            data-bs-target="#formAccordionCollapse" aria-expanded="false" aria-controls="formAccordionCollapse">
            {{ $t('form_filters')}}
          </button>
        </h2>
        <div id="formAccordionCollapse" class="accordion-collapse collapse show" aria-labelledby="formAccordionHeading"
          data-bs-parent="#formAccordion">
          <div class="accordion-body">
            <!-- Form Content -->
            <div class="custom-card" :class="{ card: fields.length > 0 }">
              <div class="card-body">
                <form @submit.prevent="onSubmit" class="row g-3 needs-validation">
                  <div v-for="(field, index) in fields" :key="index" :class="field.colClass || 'col-12'">
                    <label :for="field.id" class="form-label">{{ $t(field.label) }}</label>
                    <div>
                      <!-- Custom Slot for Each Field -->
                      <slot :name="`custom-${field.id}`" :field="field" :formData="formData">
                        <!-- Default Rendering if Slot is Not Provided -->
                        <template v-if="['text', 'number', 'date'].includes(field.type)">
                          <input :type="field.type" :id="field.id" v-model="formData[field.id]" class="form-control"
                            :placeholder="field.placeholder ? t(field.placeholder) : ''" @input="validateField(field)" />
                        </template>

                        <template v-else-if="field.type === 'select'">
                          <vue-multiselect :id="field.id" v-model="formData[field.id]" :options="field.options"
                            track-by="value" label="label" :placeholder="$t('select_an_option')" value="value" :searchable="true" :multiple="false"
                            class="custom-multiselect" :class="{
                              'is-invalid': field.isRequired && !formData[field.id],
                              'is-valid': field.isRequired && formData[field.id],
                            }" @select="instantReflectHandler(field)" />
                        </template>

                        <template v-else-if="field.type === 'multiselect'">
                          <vue-multiselect :id="field.id" v-model="formData[field.id]" :options="field.options"
                            track-by="value" label="label" :placeholder="$t('select_an_option')" value="value" :multiple="true" :taggable="true"
                            class="custom-multiselect" />
                        </template>
                      </slot>

                      <div class="invalid-feedback" v-if="isEndDateField(field) && !validationState[field.id]"
                        style="display: block;">
                       {{ $t('end_date_greater_than_start')}}
                      </div>
                      <div class="invalid-feedback" v-else
                        :style="{ display: validationState[field.id] ? 'none' : 'block' }">
                        {{ `${$t(field.label)} ${$t('is_required')}` }}
                      </div>
                    </div>
                  </div>

                  <slot name="toolbars"></slot>

                  <div class="mb-3 d-flex justify-content-end">
                    <slot name="extra-button"></slot>
                    <button v-if="showResetButton" class="btn btn-outline-primary" @click="onReset" type="button">
                      {{ $t('reset') }}
                    </button>
                    <button v-if="showAddButton" class="btn btn-secondary ms-2" @click="onAdd"  type="button">
                      {{ $t('add') }}
                    </button>
                    <button v-if="showSearchButton" class="btn btn-primary ms-2" type="submit">
                      {{ $t('search') }}
                    </button>
                  </div>
                </form>
              </div>
              <div class="card-footer d-none border-top-0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { reactive, watch, nextTick } from 'vue';
import VueMultiselect from 'vue-multiselect';
import { handleMessage } from '@/utils/notification';
import { Collapse } from 'bootstrap';
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();
const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
  initialData: {
    type: Object,
    default: () => ({}),
  },
  showResetButton: {
    type: Boolean,
    default: true,
  },
  showAddButton: {
    type: Boolean,
    default: false,
  },
  showSearchButton: {
    type: Boolean,
    default: true,
  },
  defaultData: {
    type: Object,
    default: () => ({}),
  },
  isAutoCollapse: {
    type: Boolean,
    default: false, 
  },
  // 新增属性：定义日期配对
  datePairs: {
    type: Array,
    default: () => [
      { start: 'startAt', end: 'endAt' },
      { start: 'createdStartAt', end: 'createdEndAt' },
      { start: 'updatedStartAt', end: 'updatedEndAt' },
      { start: 'lastLoginStartAt', end: 'lastLoginEndAt' },
      { start: 'refereeCreatedStartAt', end: 'refereeCreatedEndAt' },
      { start: 'broadcastStartAt', end: 'broadcastEndAt' }
    ],
  },
});

const emit = defineEmits(['submit', 'add', 'update', 'reset']);

const formData = reactive({});
const validationState = reactive({});
let messageShown = false;

// 检查字段是否是结束日期字段
const isEndDateField = (field) => {
  return props.datePairs.some(pair => pair.end === field.id);
};

// 获取对应的开始日期字段ID
const getStartDateFieldId = (endDateFieldId) => {
  const pair = props.datePairs.find(p => p.end === endDateFieldId);
  return pair ? pair.start : null;
};

const initializeFormData = () => {
  props.fields.forEach((field) => {
    const initialValue = props.initialData[field.id];
    validationState[field.id] = true;
    if (field.type === 'multiselect' && Array.isArray(initialValue)) {
      nextTick(() => {
        formData[field.id] = initialValue
          .map(id => field.options.find(option => option.value === id))
          .filter(Boolean);
      });
    } else if (field.type === 'select') {
      nextTick(() => {
        formData[field.id] = field.options.find(option =>
          typeof initialValue === 'object' ? option.value === initialValue.value : option.value === initialValue
        ) || field.default || '';
      });
    } else {
      formData[field.id] = initialValue || field.default || (field.type === 'multiselect' ? [] : '');
    }
  });
};

const validateField = (field) => {
  if (field.isRequired && !formData[field.id]) {
    validationState[field.id] = false;
    if (!messageShown) {
      handleMessage(t,`${t(field.label)} ${t('is_required')}`, 'error');
      messageShown = true;
    }
  } else {
    validationState[field.id] = true;
  }

  // 验证所有日期配对
  validateDatePairs();
};

// 验证所有日期配对
const validateDatePairs = () => {
  props.datePairs.forEach(pair => {
    const startDateField = props.fields.find(f => f.id === pair.start);
    const endDateField = props.fields.find(f => f.id === pair.end);

    if (startDateField && endDateField) {
      const startDate = formData[startDateField.id];
      const endDate = formData[endDateField.id];
      
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        validationState[endDateField.id] = false;
      } else if (endDate && validationState[endDateField.id] !== false) {
        // 只有在没有其他验证错误时才设置为 true
        validationState[endDateField.id] = true;
      }
    }
  });
};

const validateForm = () => {
  messageShown = false;
  let isValid = true;

  for (const field of props.fields) {
    validateField(field);
    if (!validationState[field.id]) {
      isValid = false;
      break; 
    }
  }

  return isValid;
};

const instantReflectHandler = (data) => {
  const submissionData = {};
  props.fields.forEach((field) => {
    if (field.type === 'multiselect' && Array.isArray(formData[field.id])) {
      submissionData[field.id] = formData[field.id].map(item => item.value);
      field.default = formData[field.id].map(item => item.value);
    } else {
      submissionData[field.id] = formData[field.id];
    }
  });
  submissionData[data.id] = formData[data.id];
  emit('update', submissionData);
};

props.fields.forEach((field) => {
  if (field.type === 'multiselect' || field.type === 'select') {
    watch(
      () => field.options,
      () => {
        initializeFormData();
      },
      { immediate: true, deep: true }
    );
  }
});

initializeFormData();

watch(
  () => props.initialData,
  () => {
    initializeFormData();
  },
  { deep: true }
);

const onSubmit = () => {

  if (validateForm()) {
    const submissionData = {};

    props.fields.forEach((field) => {
      if (field.type === 'multiselect' && Array.isArray(formData[field.id])) {
        submissionData[field.id] = formData[field.id].map(item => item.value);
        field.default = formData[field.id].map(item => item.value);
      } else if (field.type === 'select') {
        submissionData[field.id] = formData[field.id] && typeof formData[field.id] === 'object'
          ? formData[field.id].value
          : formData[field.id];
      } else {
        submissionData[field.id] = formData[field.id];
      }
    });

    emit('submit', submissionData);

    initializeFormData();
  }

};

watch(
  () => props.isAutoCollapse,
  () => {
    if (props.isAutoCollapse) {
      const accordion = document.getElementById('formAccordionCollapse');
      if (accordion) {
        const collapseInstance = new Collapse(accordion, { toggle: true });
        collapseInstance.hide();
      }
    }
  },
  { deep: true }
);

const onAdd = () => {
  emit('add');
};

const onReset = () => {
  
  emit('reset');
  props.fields.forEach((field) => {
    const defaultValue = props.defaultData && props.defaultData[field.id] !== undefined
      ? props.defaultData[field.id]
      : null;

    if (field.type === 'multiselect' && Array.isArray(defaultValue)) {
      formData[field.id] = defaultValue
        .map(id => field.options.find(option => option.value === id))
        .filter(Boolean);
    } else {
      formData[field.id] = defaultValue || (field.type === 'multiselect' ? [] : '');
    }
    validationState[field.id] = true;
  });
};
</script>

<style>
.multiselect__input,
.multiselect__single {
  color: var(--default-text-color);
}
</style>
