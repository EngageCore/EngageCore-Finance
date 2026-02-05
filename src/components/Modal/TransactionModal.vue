<template>
  <div class="modal-container">
    <div
      v-if="isVisible"
      class="modal fade show"
      id="transactionModal"
      tabindex="-1"
      aria-labelledby="transactionModal"
      data-bs-keyboard="false"
      style="display: block;"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-md">
        <div class="modal-content border-0 shadow-lg">
          <!-- Header -->
          <div class="modal-header border-bottom bg-light">
            <div class="d-flex align-items-center w-100">
              <div class="flex-grow-1">
                <h5 class="modal-title mb-0 fw-semibold">
                  <i class="ri-exchange-dollar-line me-2 text-muted"></i>{{ formTitle }}
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
                  <i class="ri-file-list-3-line me-2"></i>{{ $t('transaction_information') }}
                </h6>
              </div>
              <div class="card-body p-4">
                <div class="row g-3">
                  <!-- Bank -->
                  <div class="col-12">
                    <label for="bank_id" class="form-label fw-semibold mb-2">
                      <i class="ri-bank-line me-2"></i>{{ $t('bank') }} <span class="text-danger">*</span>
                    </label>
                    <select
                      id="bank_id"
                      v-model.number="formData.bank_id"
                      class="form-select"
                      @change="validateField('bank_id')"
                      :class="{ 'is-invalid': validationErrors.bank_id }"
                    >
                      <option disabled :value="0">{{ $t('select_bank') }}</option>
                      <option v-for="b in banks" :key="b.id" :value="b.id">
                        {{ b.account_name }} ({{ b.account_number }})
                      </option>
                    </select>
                    <div class="invalid-feedback" v-if="validationErrors.bank_id">
                      {{ $t(validationErrors.bank_id) }}
                    </div>
                  </div>

                  <!-- Type -->
                  <div class="col-12">
                    <label for="type" class="form-label fw-semibold mb-2">
                      <i class="ri-repeat-2-line me-2"></i>{{ $t('type') }} <span class="text-danger">*</span>
                    </label>
                    <select
                      id="type"
                      v-model="formData.type"
                      class="form-select"
                      @change="validateField('type')"
                      :class="{ 'is-invalid': validationErrors.type }"
                    >
                      <option disabled value="">{{ $t('select_type') }}</option>
                      <option value="deposit">{{ $t('deposit') }}</option>
                      <option value="withdrawal">{{ $t('withdrawal') }}</option>
                    </select>
                    <div class="invalid-feedback" v-if="validationErrors.type">
                      {{ $t(validationErrors.type) }}
                    </div>
                  </div>

                  <!-- Amount -->
                  <div class="col-12">
                    <label for="amount" class="form-label fw-semibold mb-2">
                      <i class="ri-coins-line me-2"></i>{{ $t('amount') }} <span class="text-danger">*</span>
                    </label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      v-model.number="formData.amount"
                      class="form-control"
                      @input="validateField('amount')"
                      :class="{ 'is-invalid': validationErrors.amount }"
                      :placeholder="$t('enter_amount')"
                    />
                    <div class="invalid-feedback" v-if="validationErrors.amount">
                      {{ $t(validationErrors.amount) }}
                    </div>
                  </div>

                  <!-- Remark -->
                  <div class="col-12">
                    <label for="remark" class="form-label fw-semibold mb-2">
                      <i class="ri-file-text-line me-2"></i>{{ $t('remark') }}
                    </label>
                    <textarea
                      id="remark"
                      v-model="formData.remark"
                      class="form-control"
                      rows="2"
                      :placeholder="$t('enter_remark')"
                    ></textarea>
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
import { reactive } from 'vue';

const props = defineProps({
  isVisible: { type: Boolean, required: true },
  formTitle: { type: String, required: true },
  formData: { type: Object, required: true },
  banks: { type: Array, required: true },
});

const emit = defineEmits(['closeModal', 'saveChanges']);

const validationErrors = reactive({
  bank_id: '',
  type: '',
  amount: '',
});

const validateField = (fieldKey) => {
  let error = '';
  const val = props.formData[fieldKey];

  if (fieldKey === 'bank_id') {
    if (!val || Number(val) <= 0) error = 'bank_is_required';
  }
  if (fieldKey === 'type') {
    if (!val || !String(val).trim()) error = 'type_is_required';
  }
  if (fieldKey === 'amount') {
    if (val === null || val === undefined || val === '' || Number.isNaN(Number(val)) || Number(val) <= 0) {
      error = 'amount_must_be_positive';
    }
  }

  validationErrors[fieldKey] = error;
  return !error;
};

const validateForm = () => {
  Object.keys(validationErrors).forEach((k) => (validationErrors[k] = ''));
  let ok = true;
  if (!validateField('bank_id')) ok = false;
  if (!validateField('type')) ok = false;
  if (!validateField('amount')) ok = false;
  return ok;
};

const handleSave = () => {
  if (validateForm()) {
    emit('saveChanges', props.formData);
  }
};

const closeModal = () => emit('closeModal');
</script>

