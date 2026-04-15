<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { fetchSettings } = useSettings()

onMounted(() => {
  fetchSettings()
})
</script>