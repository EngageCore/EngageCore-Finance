<template>
  <div :class="{ 'accordion-item accordion-custom-item': depth == 0 }">
    <!-- Header with expandable button and checkbox only if it has childs -->
    <h6 class="accordion-header" :id="`heading${permission.id}`" :class="{ 'accordion-header-first': depth == 0 }">
      <div class="header-content">
        <div v-if="depth > 0 && hasChilds && isExpanded" class="form-check custom-check" @click.stop>
          <input class="form-check-input" type="checkbox" :checked="isChecked(permission.id)" @change="toggleCheck(permission.id)" />
        </div>

        <button v-if="hasChilds" class="accordion-button" :class="{ collapsed: !isExpanded }" type="button"
          data-bs-toggle="collapse" :data-bs-target="`#collapse${permission.id}`" :aria-expanded="isExpanded"
          @click="toggleExpand" :aria-controls="`collapse${permission.id}`">

          {{ props.t(permission.name) }}
        </button>
      </div>
      <div class="header-action">
        <button v-if="depth == 0 && hasChildsChilds && isExpanded" class="btn btn-sm btn-outline-primary my-2" @click="toggleAllChilds">
          {{ isAllChildsExpanded ? 'Collapse' : 'Expand' }}
        </button>
      </div>
    </h6>

    <!-- Collapsible body for child permissions -->
    <div v-if="hasChilds" :id="`collapse${permission.id}`" class="accordion-collapse collapse"
      :class="{ show: isExpanded }">
      <div>
        <!-- Render child permissions recursively if they exist -->
        <div v-if="permission.childs" class="ms-4">
          <PermissionAccordion v-for="child in permission.childs" :key="child.id" :permission="child" :depth="depth + 1" :isAllExpanded="isAllChildsExpanded" :t="t" />
        </div>
      </div>
    </div>

    <!-- Leaf node checkbox (no childs) -->
    <div v-else class="form-check">
      <label class="form-check-label" :for="permission.id">{{ props.t(permission.name) }}</label>
      <input class="form-check-input" type="checkbox" :checked="isChecked(permission.id)" @change="toggleCheck(permission.id)" :id="permission.id">
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, watch, computed } from 'vue';
import { usePermissionStore } from '@/store/permissionStore';
import { useI18n } from "vue-i18n";
import PermissionAccordion from '@/components/PermissionAccordion.vue';
const { t } = useI18n({
  useScope: 'global'
});

const props = defineProps({
  permission: {
    type: Object,
    required: true
  },
  depth: {
    type: Number,
    default: 0
  },
  isAllExpanded: {
    type: Boolean,
    default: false
  },
  t: { type: Function, required: true }
});

const permissionStore = usePermissionStore();

const isExpanded = ref(props.isAllExpanded);
const isAllChildsExpanded = ref(props.isAllExpanded);

watch(() => props.isAllExpanded, (newValue) => {
  isExpanded.value = newValue;
  isAllChildsExpanded.value = newValue;
});

const hasChilds = computed(() => {
  return props.permission.childs && props.permission.childs.length > 0;
});

const hasChildsChilds = computed(() => {
  return (
    props.permission.childs &&
    props.permission.childs.some(child => child.childs && child.childs.length > 0)
  );
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleAllChilds = () => {
  isAllChildsExpanded.value = !isAllChildsExpanded.value;
};

const toggleCheck = (id) => {
  const checked = !permissionStore.isChecked(id);
  permissionStore.toggleAllChilds(id, props.permission.childs, checked);
};

const isChecked = (id) => {
  return permissionStore.isChecked(id);
};
</script>

<style scoped>
.form-check {
  margin-bottom: 1rem;
}

.form-check-label {
  padding-top: .2rem;
  padding-left: .4rem;
}

.accordion-custom-item {
  border: 1px solid var(--default-border) !important;
  border-radius: .35rem;
  margin: 1rem 0;
}

.accordion-header-first {
  background-color: var(--primary01) !important;
  color: var(--primary-color) !important;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-action {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-right: 1rem;
  justify-content: flex-end;
}

.custom-check {
  margin: 0;
}
</style>
