<template>
  <div class="d-md-flex d-block align-items-center justify-content-between my-4 page-header-breadcrumb"
    v-if="breadcrumbs[0].name != 'chat' && breadcrumbs[1].name != 'landing'">
    <h1 class="page-title fw-medium fs-24 mb-0 text-primary">{{ $t(lastCrumbName) }}</h1>
    <div class="ms-md-1 ms-0">
      <!-- <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li v-for="(crumb, index) in breadcrumbs" :key="index" class="breadcrumb-item"
            :class="{ active: index === breadcrumbs.length - 1 }">
            <router-link v-if="index < breadcrumbs.length - 1" :to="crumb.path">{{ $t(crumb.name) }}</router-link>
            <span v-else>{{ $t(crumb.name) }}</span>
          </li>
        </ol>
      </nav> -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

const route = useRoute();
const router = useRouter();

const breadcrumbs = computed(() => {
  const matched = route.matched.filter((record) => record.meta.breadcrumb);
  const crumbs = [];

  matched.forEach((record) => {
    const breadcrumb = record.meta.breadcrumb;
    if (Array.isArray(breadcrumb)) {
      breadcrumb.forEach((crumb, index) => {
        const path = index === 0 ? record.path : `${crumbs[index - 1].path}/${crumb.toLowerCase().replace(/\s+/g, '-')}`;
        crumbs.push({ name: crumb, path });
      });
    } else {
      crumbs.push({ name: breadcrumb, path: record.path });
    }
  });

  return crumbs;
});

const lastCrumbName = computed(() => {
  const lastCrumb = breadcrumbs.value[breadcrumbs.value.length - 1];
  return lastCrumb ? lastCrumb.name : '';
});
</script>

<style scoped>
/* Add your styles here */
</style>
