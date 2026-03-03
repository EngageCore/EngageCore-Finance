<script setup>
import { computed, h } from 'vue';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouterPush } from '@/hooks/router';
import { $t } from '@/locales';
import { Icon } from '@iconify/vue';
import { NIcon } from 'naive-ui';

defineOptions({
  name: 'UserAvatar'
});

const authStore = useAuthStore();
const { routerPushByKey, toLogin } = useRouterPush();

function loginOrRegister() {
  toLogin();
}

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
      label: $t('logout'),
      key: 'logout',
      icon: SvgIconVNode({ icon: 'fa6-solid:right-from-bracket', fontSize: 18 })
    }
  ];

  return opts;
});

function logout() {
  window.$dialog?.info({
    title: $t('tip'),
    content: $t('logout_confirmation_message'),
    positiveText: $t('confirm'),
    negativeText: $t('cancel'),
    onPositiveClick: () => {
      authStore.logout();
    }
  });
}

function handleDropdown(key) {
  if (key === 'logout') {
    logout();
  } else {
    // If your other options are jumps from other routes, they will be directly supported here
    routerPushByKey(key);
  }
}
</script>

<template>
  <NButton v-if="!authStore.isLogin" quaternary @click="loginOrRegister">
    {{ $t('login_register') }}
  </NButton>
  <NDropdown v-else placement="bottom" trigger="click" :options="options" @select="handleDropdown">
    <div>
      <ButtonIcon>
        <SvgIcon icon="fa6-solid:circle-user" class="text-icon-large" />
        <span class="text-16px font-medium">{{ authStore.userInfo.userName }}</span>
      </ButtonIcon>
    </div>
  </NDropdown>
</template>

<style scoped></style>
