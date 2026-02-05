<template>
  <Loader />
  <div class="page">
    <!-- Public Layout Header -->
    <Header />
    <SideBar />
    <div class=" app-content" :class="{'main-content':  breadcrumbs[1].name != 'landing'}">
      <div :class="{ 'container-fluid': breadcrumbs[1].name != 'landing' }">
        <Breadcrumb />
        <router-view />
      </div>
    </div>


  </div>
</template>

<script setup>
import Header from '../components/Header.vue'
import SideBar from '../components/SideBar.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import Loader from '../components/Loader.vue'
import { useRoute, useRouter } from 'vue-router';
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

</script>
