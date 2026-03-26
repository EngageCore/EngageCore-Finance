<template>
  <div class="p-4">
    <div class="flex">
      <n-card :title="$t('change_password')" class="w-full max-w-md">
        <n-form :model="form" label-placement="top" class="grid grid-cols-1 gap-3">
          <n-form-item :label="$t('old_password')" path="oldPassword" required>
            <n-input
              v-model:value="form.oldPassword"
              type="password"
              show-password-on="mousedown"
              :placeholder="$t('please_input')"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('new_password')" path="newPassword" required>
            <n-input
              v-model:value="form.newPassword"
              type="password"
              show-password-on="mousedown"
              :placeholder="$t('please_input')"
              clearable
            />
          </n-form-item>

          <n-form-item :label="$t('confirm_password')" path="confirmPassword" required>
            <n-input
              v-model:value="form.confirmPassword"
              type="password"
              show-password-on="mousedown"
              :placeholder="$t('please_input')"
              clearable
            />
          </n-form-item>

          <div class="flex items-center gap-2 pt-2">
            <n-button :disabled="submitting" @click="resetForm">
              {{ $t("reset") }}
            </n-button>
            <n-button type="primary" :loading="submitting" @click="submit">
              {{ $t("confirm") }}
            </n-button>
          </div>
        </n-form>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { NButton, NCard, NForm, NFormItem, NInput } from "naive-ui";
import { useI18n } from "vue-i18n";
import { useCallApi } from "@/hooks/useCallApi";
import { useApiError } from "@/composables/useApiError";
import { handleMessage } from "@/utils/common";
import { REG_PWD } from "@/constants/reg";

const { t } = useI18n();
const { callApi } = useCallApi();
const { handleApiError } = useApiError();

const submitting = ref(false);
const form = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const resetForm = () => {
  form.oldPassword = "";
  form.newPassword = "";
  form.confirmPassword = "";
};

const submit = async () => {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    window.$message?.error(t("please_fill_in_all_required_fields"));
    return;
  }
  if (!REG_PWD.test(form.newPassword)) {
    window.$message?.error(t("password_invalid"));
    return;
  }
  if (form.newPassword !== form.confirmPassword) {
    window.$message?.error(t("password_and_confirm_password_do_not_match"));
    return;
  }

  submitting.value = true;
  try {
    await callApi(
      "/password",
      "PATCH",
      { currentPassword: form.oldPassword, password: form.newPassword },
      null
    );
    handleMessage(t("user_password_updated"), "success");
    resetForm();
  } catch (error) {
    handleApiError(error);
  } finally {
    submitting.value = false;
  }
};
</script>

