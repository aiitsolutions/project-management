<template>
  <div>Redirecting...</div>
</template>

<script setup lang="ts">
const { isAuthenticated, initAuth } = useAuth()

onMounted(async () => {
  await initAuth()
  if (isAuthenticated.value) {
    navigateTo('/workspace/dashboard')
  } else {
    navigateTo('/login')
  }
})
</script>
