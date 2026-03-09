<template>
  <ReusableSingleModal v-model:isVisible="isVisibleModel" :title="formTitle" width="480px" @save="handleSave" @close="handleClose">
    <n-form :model="localFormData" label-placement="top" class="grid grid-cols-1 gap-3 mt-2">
      <n-form-item :label="$t('name')" path="name" required>
        <n-input v-model:value="localFormData.name" :placeholder="$t('please_input')" clearable />
      </n-form-item>

      <n-form-item :label="$t('status')" path="statusId" v-if="isEdit">
        <n-select v-model:value="localFormData.statusId" :options="roleStatusOptions" :placeholder="$t('please_select')" searchable clearable />
      </n-form-item>

      <n-form-item :label="$t('permissions')" path="accessPageIds">
        <div class="w-full flex flex-col gap-3">
          <div v-for="cat in permissionCategories" :key="cat.key" class="flex flex-col gap-2">
            <div class="text-sm font-semibold text-gray-600">
              {{ cat.label }}
            </div>

            <div
              v-for="page in cat.pages"
              :key="page.key"
              class="border border-gray-200 rounded-md px-3 py-2"
            >
              <div class="flex items-center justify-between">
                <div class="font-medium">{{ page.label }}</div>
                <n-switch
                  :value="hasPage(page.id)"
                  @update:value="togglePage(page, $event)"
                />
              </div>

              <div class="mt-2 grid grid-cols-3 gap-x-4 gap-y-2">
                <template v-for="action in page.actions" :key="action.id">
                  <div class="flex items-center gap-3">
                    <n-checkbox
                      :checked="hasAction(action.id)"
                      :disabled="!hasPage(page.id)"
                      @update:checked="toggleAction(action.id, $event)"
                    >
                      {{ action.label }}
                    </n-checkbox>
                  </div>
                </template>
              </div>

              <div
                v-if="page.key === 'transaction'"
                class="mt-3"
              >
                <div class="text-sm font-medium mb-2">{{ $t('access_features') }}</div>
                <div class="flex flex-col gap-2">
                  <template v-for="feature in featureOptions" :key="feature.id">
                    <div class="flex items-center gap-3">
                      <n-checkbox
                        :checked="hasFeature(feature.id)"
                        :disabled="!canEnableTransactionFeatureAdd"
                        @update:checked="toggleFeature(feature.id, $event)"
                      >
                        {{ feature.label }}
                      </n-checkbox>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-form-item>
    </n-form>
  </ReusableSingleModal>
</template>

<script setup>
import { computed, reactive, watch, onMounted } from 'vue';
import { useDropdown } from "@/composables/useDropdown";
import { useI18n } from 'vue-i18n';
import ReusableSingleModal from '@/components/ReusableSingleModal.vue';
import { useSubmitLoadingStore } from "@/store/useSubmitLoadingStore";
import { ACCESS_PAGES, ACCESS_ACTIONS, ACCESS_FEATURES } from "@/enum/accessPermission";

//#region Props & Emits
const { t } = useI18n();
const { roleStatusOptions, getRoleStatusOptions } = useDropdown();
const props = defineProps({
  isVisible: Boolean,
  formTitle: String,
  formData: Object,
  isEdit: Boolean
});
const emit = defineEmits(["close", "update:formData", "save"]);

onMounted(() => {
  getRoleStatusOptions(false);
});
//#endregion

//#region Reactive Data 
const localFormData = reactive({});
watch(
  () => props.formData,
  (v) => {
    Object.assign(localFormData, v || {});
    if (!Array.isArray(localFormData.accessPageIds)) localFormData.accessPageIds = [];
    if (!Array.isArray(localFormData.accessActionIds)) localFormData.accessActionIds = [];
    if (!Array.isArray(localFormData.accessFeatureIds)) localFormData.accessFeatureIds = [];
  },
  { immediate: true }
);

const isVisibleModel = computed({
  get: () => props.isVisible,
  set: v => emit("update:isVisible", v)
});

const PAGE_ACTION_KEYS = Object.freeze({
  role: ["listRole", "addRole", "updateRole"],
  user: ["listUser", "addUser", "updateUser"],
  brand: ["listBrand", "addBrand", "updateBrand"],
  bankProvider: ["listBankProvider", "addBankProvider", "updateBankProvider"],
  counterParty: ["listCounterParty", "addCounterParty", "updateCounterParty"],
  member: ["listMember", "addMember", "updateMember"],
  bank: ["listBank", "addBank", "updateBank"],
  transaction: ["listTransaction", "addTransaction"],
  winlose: ["listWinlose"],
});

const getActionKind = (actionKey) => {
  if (actionKey.startsWith("list")) return "list";
  if (actionKey.startsWith("add")) return "add";
  if (actionKey.startsWith("update")) return "update";
  return "other";
};

const getActionLabel = (kind) => {
  if (kind === "list") return t("view");
  if (kind === "add") return t("add");
  if (kind === "update") return t("edit");
  return kind;
};

const permissionPagesByKey = computed(() =>
  Object.fromEntries(
    Object.entries(ACCESS_PAGES).map(([pageKey, pageId]) => {
      const actionKeys = PAGE_ACTION_KEYS[pageKey] || [];
      const actions = actionKeys
        .map((actionKey) => {
          const kind = getActionKind(actionKey);
          const id = ACCESS_ACTIONS[actionKey];
          if (!id) return null;
          return {
            id,
            key: actionKey,
            kind,
            label: getActionLabel(kind),
          };
        })
        .filter(Boolean);

      return [
        pageKey,
        {
          key: pageKey,
          id: pageId,
          label: t(pageKey),
          actions,
        },
      ];
    })
  )
);

const CATEGORY_PAGE_KEYS = Object.freeze({
  system: ["role", "user"],
  master: ["brand", "bankProvider", "counterParty", "member", "bank"],
  transaction: ["transaction"],
  report: ["winlose"],
});

const permissionCategories = computed(() => [
  {
    key: "system",
    label: t("system_settings"),
    pages: CATEGORY_PAGE_KEYS.system.map((k) => permissionPagesByKey.value[k]).filter(Boolean),
  },
  {
    key: "master",
    label: t("master_data"),
    pages: CATEGORY_PAGE_KEYS.master.map((k) => permissionPagesByKey.value[k]).filter(Boolean),
  },
  {
    key: "transaction",
    label: t("transaction"),
    pages: CATEGORY_PAGE_KEYS.transaction.map((k) => permissionPagesByKey.value[k]).filter(Boolean),
  },
  {
    key: "report",
    label: t("report"),
    pages: CATEGORY_PAGE_KEYS.report.map((k) => permissionPagesByKey.value[k]).filter(Boolean),
  },
].filter((c) => c.pages.length));

const getAllowedActionIdsForPage = (pageKey) =>
  new Set((PAGE_ACTION_KEYS[pageKey] || []).map((k) => ACCESS_ACTIONS[k]).filter(Boolean));

const hasPage = (pageId) =>
  Array.isArray(localFormData.accessPageIds) && localFormData.accessPageIds.includes(pageId);

const hasAction = (actionId) =>
  Array.isArray(localFormData.accessActionIds) && localFormData.accessActionIds.includes(actionId);

const transactionPageId = ACCESS_PAGES.transaction;
const canEnableTransactionFeatureAdd = computed(() => {
  if (!hasPage(transactionPageId)) return false;
  const addId = ACCESS_ACTIONS.addTransaction;
  return !!addId && hasAction(addId);
});

const featureOptions = computed(() =>
  Object.entries(ACCESS_FEATURES).map(([key, value]) => ({
    key,
    id: value,
    label: t(key),
  }))
);

const hasFeature = (featureId) =>
  Array.isArray(localFormData.accessFeatureIds) && localFormData.accessFeatureIds.includes(featureId);

const toggleFeature = (featureId, checked) => {
  const current = Array.isArray(localFormData.accessFeatureIds) ? [...localFormData.accessFeatureIds] : [];
  const idx = current.indexOf(featureId);
  if (checked && idx === -1) current.push(featureId);
  if (!checked && idx !== -1) current.splice(idx, 1);
  localFormData.accessFeatureIds = current;
};

const togglePage = (page, enabled) => {
  const current = Array.isArray(localFormData.accessPageIds) ? [...localFormData.accessPageIds] : [];
  const idx = current.indexOf(page.id);
  if (enabled && idx === -1) current.push(page.id);
  if (!enabled && idx !== -1) current.splice(idx, 1);
  localFormData.accessPageIds = current;

  const allowed = getAllowedActionIdsForPage(page.key);
  const currentActions = Array.isArray(localFormData.accessActionIds) ? [...localFormData.accessActionIds] : [];

  if (!enabled) {
    localFormData.accessActionIds = currentActions.filter((id) => !allowed.has(id));
    if (page.key === "transaction") {
      localFormData.accessFeatureIds = [];
    }
    return;
  }

  // enable page: default check ALL its actions
  allowed.forEach((id) => {
    if (!currentActions.includes(id)) {
      currentActions.push(id);
    }
  });
  localFormData.accessActionIds = currentActions;

  if (page.key === "transaction") {
    if (canEnableTransactionFeatureAdd.value) {
      localFormData.accessFeatureIds = Object.values(ACCESS_FEATURES);
    } else {
      localFormData.accessFeatureIds = [];
    }
  }
};

const toggleAction = (actionId, checked) => {
  const current = Array.isArray(localFormData.accessActionIds) ? [...localFormData.accessActionIds] : [];
  const idx = current.indexOf(actionId);
  if (checked && idx === -1) current.push(actionId);
  if (!checked && idx !== -1) current.splice(idx, 1);
  localFormData.accessActionIds = current;
};

watch(
  () => localFormData.accessActionIds,
  () => {
    if (!Array.isArray(localFormData.accessFeatureIds)) localFormData.accessFeatureIds = [];
    if (!hasPage(transactionPageId) || !canEnableTransactionFeatureAdd.value) {
      localFormData.accessFeatureIds = [];
      return;
    }

    // when addTransaction is enabled, default select all if empty
    if ((localFormData.accessFeatureIds || []).length === 0) {
      localFormData.accessFeatureIds = Object.values(ACCESS_FEATURES);
    }
  },
  { deep: true }
);

watch(
  () => localFormData.accessPageIds,
  () => {
    if (!Array.isArray(localFormData.accessActionIds)) localFormData.accessActionIds = [];
    const selected = new Set(Array.isArray(localFormData.accessPageIds) ? localFormData.accessPageIds : []);
    const allowed = new Set();
    for (const [pageKey, pageId] of Object.entries(ACCESS_PAGES)) {
      if (!selected.has(pageId)) continue;
      for (const actionKey of PAGE_ACTION_KEYS[pageKey] || []) {
        const id = ACCESS_ACTIONS[actionKey];
        if (id) allowed.add(id);
      }
    }
    localFormData.accessActionIds = localFormData.accessActionIds.filter((id) => allowed.has(id));

    if (!selected.has(transactionPageId)) {
      localFormData.accessFeatureIds = [];
    }
  },
  { deep: true }
);
//#endregion

//#region Save / Close
const loadingStore = useSubmitLoadingStore();

const handleSave = () => {
  if (!localFormData.name) {
    window.$message?.error(t('please_fill_in_all_required_fields'));
    return;
  }

  loadingStore.startSubmit();
  const payload = {
    ...localFormData,
    accessPageIds: localFormData.accessPageIds || [],
    accessActionIds: localFormData.accessActionIds || [],
  };

  emit("save", payload);
};

const handleClose = () => emit("close");
//#endregion
</script>
