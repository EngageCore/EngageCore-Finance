<script setup>
import { computed, reactive, ref } from 'vue';
import { useFormRules, useNaiveForm } from '@/hooks/form';
import { useAuthStore } from '@/store/useAuthStore';
import { $t } from '@/locales';
import { useCallApi } from '@/hooks/useCallApi';
import { localStg } from '@/utils/storage';
import { useI18n } from 'vue-i18n';
import { handleMessage } from '@/utils/common';

defineOptions({
  name: 'PwdLogin'
});

const { formRef, validate } = useNaiveForm();
const { callApi } = useCallApi();
const authStore = useAuthStore();
const { t } = useI18n();

// Login form model
const model = reactive({
  name: '',
  password: ''
});

// Login state
const loginLoading = ref(false);
const loginError = ref('');

/* 保留OTP功能代码以便未来需要时恢复 */
/*
// OTP verification state
const showOtpModal = ref(false);
const otpInputs = ref(['', '', '', '', '', '']);
const otpRefs = ref([]);
const otpLoading = ref(false);
const otpError = ref('');
const HARDCODED_OTP = '000000';
*/

async function handleSubmit() {
  await validate();

  if(!model.name || !model.password) {
    handleMessage(t('please_fill_in_username_and_password'), 'error');
    return;
  }

  loginLoading.value = true;

  try {
    const resp = await callApi('/login', 'POST', {
      name: model.name,
      password: model.password
    });

    if(resp) {
      authStore.login(resp.user, resp.accessToken);
    }

    window.$message?.success(t('login_successfully'));
  } catch (error) {
    handleMessage(t('invalid_login_credentials'), 'error');
  } finally {
    loginLoading.value = false;
  }
}

/* 保留OTP功能代码以便未来需要时恢复 */
/*
function handleOtpInput(index, value) {
  if (value.length > 1) {
    value = value.slice(-1);
  }
  otpInputs.value[index] = value;
  if (value && index < 5) {
    nextTick(() => {
      if (otpRefs.value[index + 1]) {
        otpRefs.value[index + 1].focus();
      }
    });
  }
  if (otpError.value) {
    otpError.value = '';
  }
}

function handleOtpKeydown(index, event) {
  if (event.key === 'Backspace' && !otpInputs.value[index] && index > 0) {
    nextTick(() => {
      if (otpRefs.value[index - 1]) {
        otpRefs.value[index - 1].focus();
      }
    });
  }
  if (event.key === 'Enter') {
    handleOtpSubmit();
  }
}

async function handleOtpSubmit() {
  const enteredOtp = otpInputs.value.join('');
  if (enteredOtp.length !== 6) {
    otpError.value = 'Please enter all 6 digits';
    return;
  }
  otpLoading.value = true;
  if (enteredOtp === HARDCODED_OTP) {
    await authStore.login(model.userName, model.password);
    closeOtpModal();
  } else {
    otpError.value = 'Invalid OTP. Please try again.';
    otpInputs.value = ['', '', '', '', '', ''];
    await nextTick();
    if (otpRefs.value[0]) {
      otpRefs.value[0].focus();
    }
  }
  otpLoading.value = false;
}

function closeOtpModal() {
  showOtpModal.value = false;
  otpInputs.value = ['', '', '', '', '', ''];
  otpError.value = '';
  otpLoading.value = false;
}
*/

// Clear login error when user starts typing
function clearLoginError() {
  if (loginError.value) {
    loginError.value = '';
  }
}
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Login Form -->
    <NForm
      ref="formRef"
      :model="model"
      size="large"
      :show-label="false"
      class="space-y-3"
      @keyup.enter="handleSubmit"
    >
      <!-- Name Field -->
      <NFormItem path="name">
        <NInput
          v-model:value="model.name"
          :placeholder="$t('name')"
          class="h-10 border-gray-200 rounded-lg dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
        />
      </NFormItem>

      <!-- Password Field -->
      <NFormItem path="password">
        <NInput
          v-model:value="model.password"
          type="password"
          show-password-on="click"
          :placeholder="$t('password')"
          class="h-10 border-gray-200 rounded-lg dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
        />
      </NFormItem>

      <!-- Error Message -->
      <!-- <div v-if="loginError" class="text-center">
        <div
          class="inline-flex items-center border border-red-200 rounded-lg bg-red-50 px-3 py-2 text-red-600 space-x-2 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="text-sm font-medium">{{ loginError }}</span>
        </div>
      </div> -->

      <!-- Submit Button -->
      <div class="pt-2">
        <NButton
          type="primary"
          size="large"
          block
          :loading="loginLoading"
          class="h-10 rounded-lg font-medium"
          @click="handleSubmit"
        >
          {{ $t('login') }}
        </NButton>
      </div>
    </NForm>

    <!-- Security Info -->
    <div class="text-center">
      <p
        class="flex items-center justify-center text-xs text-gray-600 space-x-2 dark:text-gray-400"
      >
        <svg class="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ $t('secure_login_description') }}</span>
      </p>
    </div>

    <!-- 保留OTP功能代码以便未来需要时恢复 -->

    <!--
      保留OTP功能代码以便未来需要时恢复
      以下为原OTP验证弹窗UI，现整体禁用保留。
    -->
    <!-- OTP Verification Modal (disabled) -->
    <!--
    <NModal
      v-model:show="showOtpModal"
      :mask-closable="false"
      preset="card"
      class="!max-w-sm"
      :bordered="false"
    >
      ...
    </NModal>
    -->
  </div>
</template>
