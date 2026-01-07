<template>
  <div class="page splash-page active">
    <div class="splash-header">
      <div class="splash-logo-area" :class="{ shrink: isAnimating }">
        <img :src="logoImage" alt="logo" class="splash-header-logo">
        <span class="splash-app-name">蒸蚌背单词</span>
      </div>
    </div>
    <div class="splash-content" @click="handleClick">
      <img :src="splashImage" alt="欢迎" class="splash-image" :class="{ shrink: isAnimating }">
      <p class="splash-hint" :class="{ hide: isAnimating }">点击开始</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import logoImage from '../assets/images/logo.png'
import splashImage from '../assets/images/splash.png'

export default {
  name: 'SplashPage',
  emits: ['enter'],
  setup(props, { emit }) {
    const isAnimating = ref(false)

    const handleClick = () => {
      isAnimating.value = true

      setTimeout(() => {
        emit('enter')
      }, 850)
    }

    return {
      isAnimating,
      handleClick,
      logoImage,
      splashImage
    }
  }
}
</script>

<style scoped>
.page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.splash-page {
  /* Using global background */
}

.splash-header {
  display: flex;
  justify-content: center;
  padding: 40px 20px 20px;
}

.splash-logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-logo-area.shrink {
  position: fixed;
  top: 15px;
  left: 20px;
  flex-direction: row;
  gap: 8px;
  z-index: 100;
  opacity: 0; /* Fade out as it transitions to next page header style */
  pointer-events: none;
}

.splash-header-logo {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: var(--shadow-md);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-logo-area.shrink .splash-header-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.splash-app-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-main);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.splash-logo-area.shrink .splash-app-name {
  font-size: 18px;
  font-weight: 600;
}

.splash-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 20px;
}

.splash-image {
  max-width: 90%;
  max-height: 55vh;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top center;
}

.splash-image.shrink {
  transform: scale(0.05) translateY(-200px);
  opacity: 0;
}

.splash-hint {
  color: var(--text-light);
  font-size: 18px;
  margin-top: 25px;
  animation: pulse 2s infinite;
  transition: opacity 0.5s ease;
}

.splash-hint.hide {
  opacity: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
