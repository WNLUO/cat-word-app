<template>
  <div id="app">
    <SplashPage v-if="currentPage === 'splash'" @enter="enterWordPage" />
    <WordPage v-else />
  </div>
</template>

<script>
import { ref } from 'vue'
import SplashPage from './components/SplashPage.vue'
import WordPage from './components/WordPage.vue'

export default {
  name: 'App',
  components: {
    SplashPage,
    WordPage
  },
  setup() {
    const currentPage = ref('splash')

    const enterWordPage = () => {
      currentPage.value = 'word'
    }

    return {
      currentPage,
      enterWordPage
    }
  }
}
</script>

<style>
:root {
  /* Colors */
  --primary-color: #f06292;
  --primary-dark: #d81b60;
  --bg-gradient-start: #e8f4f8;
  --bg-gradient-end: #fdf6e3;
  --text-main: #333333;
  --text-secondary: #666666;
  --text-light: #888888;
  --white: #ffffff;
  --correct-green: #4caf50;
  --wrong-red: #f44336;
  
  /* Spacing & Layout */
  --header-height: 70px;
  --border-radius-lg: 20px;
  --border-radius-md: 12px;
  --border-radius-sm: 8px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 15px rgba(0,0,0,0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: linear-gradient(180deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
  color: var(--text-main);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

button {
  font-family: inherit;
  outline: none;
}

#app {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 50px rgba(0,0,0,0.05);
}
</style>
