<script setup>
import { useRoute } from 'vue-router'
import AdminLayout from './layout/AdminLayout.vue'

const route = useRoute()
</script>

<template>
  <router-view v-if="route.meta.publicLayout" />
  <AdminLayout v-else>
    <router-view />
  </AdminLayout>
</template>
