<template>
  <div 
    class="skeleton-item" 
    :style="{ 
      width: width, 
      height: height, 
      borderRadius: radius 
    }"
    :class="variant"
  >
    <div class="skeleton-shimmer"></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '20px' },
  radius: { type: String, default: '8px' },
  variant: { type: String, default: 'rect' } // 'rect', 'circle', 'text'
})
</script>

<style scoped>
.skeleton-item {
  position: relative;
  background: #f1f5f9;
  overflow: hidden;
}

.skeleton-item.text {
  height: 12px;
  margin: 8px 0;
}

.skeleton-item.circle {
  border-radius: 50%;
}

.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
