<script setup>
import { computed, h } from 'vue';
import { useTabStore } from '@/store/useTabStore';
import { useSvgIcon } from '@/hooks/icon';
import { $t } from '@/locales';
import { Icon } from '@iconify/vue';
import { NIcon } from 'naive-ui';

defineOptions({
  name: 'ContextMenu'
});

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  tabId: { type: String, required: true },
  excludeKeys: { type: Array, default: () => [] },
  disabledKeys: { type: Array, default: () => [] }
});

const visible = defineModel('visible');

const { removeTab, clearTabs, clearLeftTabs, clearRightTabs } = useTabStore();

// 原本的 SVG loader（项目自带）
const { SvgIconVNode: LocalSvg } = useSvgIcon();

/** ✅ 兼容 Iconify + 本地 svg 方法 */
function SvgIconVNode({ icon, width = 18, height = 18 }) {
  // 含 ":" 代表 Iconify 图标
  if (icon.includes(':')) {
    return () =>
      h(NIcon, null, {
        default: () => h(Icon, { icon, width, height })
      });
  }

  // 否则走本地 SVG
  return LocalSvg({ icon, fontSize: width });
}

const options = computed(() => {
  const opts = [
    {
      key: 'closeCurrent',
      label: $t('close_current'),
      icon: SvgIconVNode({ icon: 'fa6-solid:xmark' })
    },
    {
      key: 'closeOther',
      label: $t('close_other'),
      icon: SvgIconVNode({ icon: 'fa6-solid:clone' })
    },
    {
      key: 'closeLeft',
      label: $t('close_left'),
      icon: SvgIconVNode({ icon: 'fa6-solid:angles-left' })
    },
    {
      key: 'closeRight',
      label: $t('close_right'),
      icon: SvgIconVNode({ icon: 'fa6-solid:angles-right' })
    },
    {
      key: 'closeAll',
      label: $t('close_all'),
      icon: SvgIconVNode({ icon: 'fa6-solid:ban' })
    }
  ];

  const { excludeKeys, disabledKeys } = props;
  const result = opts.filter(opt => !excludeKeys.includes(opt.key));

  disabledKeys.forEach(key => {
    const opt = result.find(item => item.key === key);
    if (opt) opt.disabled = true;
  });

  return result;
});

function hideDropdown() {
  visible.value = false;
}

const dropdownAction = {
  closeCurrent: () => removeTab(props.tabId),
  closeOther: () => clearTabs([props.tabId]),
  closeLeft: () => clearLeftTabs(props.tabId),
  closeRight: () => clearRightTabs(props.tabId),
  closeAll: () => clearTabs()
};

function handleDropdown(optionKey) {
  dropdownAction[optionKey]?.();
  hideDropdown();
}
</script>

<template>
  <NDropdown
    :show="visible"
    placement="bottom-start"
    trigger="manual"
    :x="x"
    :y="y"
    :options="options"
    @clickoutside="hideDropdown"
    @select="handleDropdown"
  />
</template>

<style scoped></style>
