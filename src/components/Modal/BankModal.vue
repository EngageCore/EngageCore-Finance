<template>
  <div class="modal-container">
    <div v-if="isVisible" class="modal fade show" id="BankModal" tabindex="-1" aria-labelledby="BankModal" data-bs-keyboard="false" style="display: block;">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md">
        <div class="modal-content border-0 shadow-lg">
          <!-- Header -->
          <div class="modal-header border-bottom bg-light">
            <div class="d-flex align-items-center w-100">
              <div class="flex-grow-1">
                <h5 class="modal-title mb-0 fw-semibold">
                  <i class="ri-bank-line me-2 text-muted"></i>{{ formTitle }}
                </h5>
              </div>
              <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
            </div>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-bottom py-3">
                <h6 class="mb-0 fw-bold">
                  <i class="ri-bank-line me-2"></i>Bank Information
                </h6>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <!-- Account Name -->
                  <div class="col-12">
                    <label for="name" class="form-label fw-semibold mb-2">
                      <i class="ri-file-text-line me-2"></i>
                      {{ $t('account_name') }} <span class="text-danger">*</span>
                    </label>
                    <input id="account_name" type="text" v-model="formData.account_name" class="form-control" 
                      @input="validateField('account_name')"
                      :class="{ 'is-invalid': validationErrors.account_name }"
                      :placeholder="$t('enter_account_name')" />
                    <div class="invalid-feedback" v-if="validationErrors.account_name">
                      {{ $t(validationErrors.account_name) }}
                    </div>
                  </div>

                  <!-- Account Number -->
                  <div class="col-12">
                    <label for="account_number" class="form-label fw-semibold mb-2">
                      <i class="ri-hashtag me-2"></i>
                      {{ $t('account_number') }} <span class="text-danger">*</span>
                    </label>
                    <input id="account_number" type="text" v-model="formData.account_number" class="form-control"
                      @input="validateField('account_number')"
                      :class="{ 'is-invalid': validationErrors.account_number }"
                      :placeholder="$t('enter_account_number')" />
                    <div class="invalid-feedback" v-if="validationErrors.account_number">
                      {{ $t(validationErrors.account_number) }}
                    </div>
                  </div>

                  <!-- Opening Balance (Add only) -->
                  <div class="col-12" v-if="!isEdit">
                    <label for="opening_balance" class="form-label fw-semibold mb-2">
                      <i class="ri-coins-line me-2"></i>
                      {{ $t('opening_balance') }} <span class="text-danger">*</span>
                    </label>
                    <input id="opening_balance" type="number" step="0.01" v-model.number="formData.opening_balance" class="form-control" 
                      @input="validateField('opening_balance')"
                      :class="{ 'is-invalid': validationErrors.opening_balance }"
                      placeholder="0.00" />
                    <div class="invalid-feedback" v-if="validationErrors.opening_balance">
                      {{ $t(validationErrors.opening_balance) }}
                    </div>
                  </div>

                  <!-- Balance (Edit only) -->
                  <div class="col-12" v-else>
                    <label for="balance" class="form-label fw-semibold mb-2">
                      <i class="ri-coins-line me-2"></i>
                      {{ $t('balance') }} <span class="text-danger">*</span>
                    </label>
                    <input id="balance" type="number" step="0.01" v-model.number="formData.balance" class="form-control" 
                      @input="validateField('balance')"
                      :class="{ 'is-invalid': validationErrors.balance }"
                      placeholder="0.00" />
                    <div class="invalid-feedback" v-if="validationErrors.balance">
                      {{ $t(validationErrors.balance) }}
                    </div>
                  </div>

                  <!-- Status -->
                  <div class="col-12">
                    <label for="status" class="form-label fw-semibold mb-2">
                      <i class="ri-toggle-line me-2"></i>
                      {{ $t('status') }}
                    </label>
                    <select id="status" v-model="formData.status" class="form-select">
                      <option value="active">{{ $t('active') }}</option>
                      <option value="inactive">{{ $t('inactive') }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer border-top bg-light">
            <div class="d-flex justify-content-end w-100">
              <button type="button" class="btn btn-secondary me-2" @click="closeModal">
                <i class="ri-close-line me-1"></i>{{ $t('close') }}
              </button>
              <button type="button" class="btn btn-primary" @click="handleSave">
                <i class="ri-save-line me-1"></i>{{ $t('save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//#region Imports
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
//#endregion

//#region Common
const { t } = useI18n();
//#endregion

//#region Props & Emits
const props = defineProps({
  isVisible: { type: Boolean, required: true },
  formTitle: { type: String, required: true },
  formData: { type: Object, required: true },
  isEdit: { type: Boolean, default: false },
});
const emit = defineEmits(['closeModal', 'saveChanges']);
//#endregion

//#region Handlers
const handleSave = () => {
  if (validateForm()) {
    emit('saveChanges', props.formData);
  }
};
const closeModal = () => {
  emit('closeModal');
};
//#endregion

//#region Validation
const validationErrors = reactive({
  account_name: '',
  account_number: '',
  opening_balance: '',
  balance: '',
});

const validateField = (fieldKey) => {
  let error = '';
  const val = props.formData[fieldKey];

  if (fieldKey === 'account_name') {
    if (!val || !String(val).trim()) error = 'account_name_is_required';
  }

  if (fieldKey === 'account_number') {
    if (!val || !String(val).trim()) error = 'account_number_is_required';
  }

  if (!props.isEdit && fieldKey === 'opening_balance') {
    if (val === null || val === undefined || val === '' || Number.isNaN(Number(val))) {
      error = 'opening_balance_is_required';
    }
  }

  if (props.isEdit && fieldKey === 'balance') {
    if (val === null || val === undefined || val === '' || Number.isNaN(Number(val))) {
      error = 'balance_is_required';
    }
  }

  validationErrors[fieldKey] = error;
  return !error;
};

const validateForm = () => {
  let isValid = true;

  // 清空旧错误
  Object.keys(validationErrors).forEach((k) => (validationErrors[k] = ''));

  if (!validateField('account_name')) isValid = false;
  if (!validateField('account_number')) isValid = false;
  if (props.isEdit) {
    if (!validateField('balance')) isValid = false;
  } else {
    if (!validateField('opening_balance')) isValid = false;
  }

  return isValid;
};
//#endregion
</script>
