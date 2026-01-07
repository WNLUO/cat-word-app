<template>
  <div class="page word-page active">
    <!-- 头部 -->
    <div class="header">
      <div class="logo-area">
        <img src="/logo.png" alt="logo" class="header-logo">
        <span class="app-name">蒸蚌背单词</span>
      </div>
      <div class="header-right">
        
        <div class="score-display">
          <svg class="fish-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.5 10C21.5 10 22 9.5 22 8.5C22 7.5 21 6 20 6C18.5 6 16.5 8 16.5 8C16.5 8 14 5 11 5C7 5 3 9 3 12C3 15 7 19 11 19C14 19 16.5 16 16.5 16C16.5 16 18.5 18 20 18C21 18 22 16.5 22 15.5C22 14.5 21.5 14 20.5 14C19.5 14 18 13 18 12C18 11 19.5 10 20.5 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="10" r="1" fill="currentColor"/>
          </svg>
          <span class="fish-label">×</span>
          <span class="score-count" :class="{ 'score-pop': scorePop }">{{ score }}</span>
        </div>
      </div>
    </div>

    <!-- 词库选择 (自定义样式) -->
    <div class="book-selector">
      <div class="custom-select" :class="{ open: isSelectOpen }" @click="isSelectOpen = !isSelectOpen">
        <div class="select-trigger">
          <span>{{ currentBookLabel }}</span>
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="none">
            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="select-options" v-if="isSelectOpen">
          <div 
            v-for="opt in bookOptions" 
            :key="opt.value" 
            class="select-option"
            :class="{ active: currentBook === opt.value }"
            @click.stop="selectBook(opt.value)"
          >
            {{ opt.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- 单词容器 -->
    <div class="word-container">
      <div class="word-card">
        <div class="word-display">
          <span class="english-word">{{ currentWord?.headWord || 'Loading...' }}</span>
          <button @click="speakWord" class="sound-btn" title="发音">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
              <path d="M3 9V15H7L12 20V4L7 9H3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 8C16.5 8.5 17 9.5 17 12C17 14.5 16.5 15.5 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 5C20.5 6.5 21 8.5 21 12C21 15.5 20.5 17.5 19 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="phonetic-display">
          <span class="phonetic-label">美</span>
          <span class="phonetic-text">{{ phoneticText }}</span>
        </div>
      </div>

      <div class="image-container">
        <img :src="catImage" alt="配图" class="word-image">
      </div>

      <p class="hint-text">请选择正确的中文释义</p>

      <div class="options-container">
        <button
          v-for="(option, index) in options"
          :key="index"
          @click="selectOption(option, index)"
          :class="['option-btn', optionStates[index]]"
          :title="option"
        >
          {{ truncateText(option, 8) }}
        </button>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="nav-footer">
      <button @click="prevWord" :disabled="currentIndex === 0" class="nav-btn" title="上一个">
        <svg viewBox="0 0 24 24" fill="none" class="icon-svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <button @click="nextWord" :disabled="currentIndex === words.length - 1" class="nav-btn" title="下一个">
        <svg viewBox="0 0 24 24" fill="none" class="icon-svg">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    

    <!-- 音频元素 -->
    <audio ref="correctSound" src="/correct.mp3" preload="auto"></audio>
    <audio ref="wrongSound" src="/wrong.mp3" preload="auto"></audio>
    <audio ref="zhengbangSound" src="/correct.mp3" preload="auto"></audio>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import wordsData from '../words.js'

export default {
  name: 'WordPage',
  setup() {
    // 状态
    const currentBook = ref('CET4_1')
    const currentIndex = ref(0)
    const words = ref([])
    const score = ref(0)
    const showModal = ref(false)
    const options = ref([])
    const optionStates = ref(['', '', ''])
    const catImage = ref('/cat.png')
    const scorePop = ref(false)
    const isSelectOpen = ref(false)

    const bookOptions = [
      { value: 'CET4_1', label: '四级核心词汇' },
      { value: 'CET4_3', label: '四级完整词汇' },
      { value: 'CET6_1', label: '六级核心词汇' },
      { value: 'CET6_3', label: '六级完整词汇' },
      { value: 'KaoYan_1', label: '考研必考词汇' },
      { value: 'KaoYan_2', label: '考研完整词汇' }
    ]

    // 音频引用
    const correctSound = ref(null)
    const wrongSound = ref(null)
    const zhengbangSound = ref(null)

    // 语音相关状态
    let selectedVoice = null
    let voicesLoaded = false
    let currentUtterance = null

    // 计算属性
    const currentWord = computed(() => words.value[currentIndex.value])

    const phoneticText = computed(() => {
      return currentWord.value?.usPhone ? `/${currentWord.value.usPhone}/` : '/.../'
    })

    const currentBookLabel = computed(() => {
      return bookOptions.find(opt => opt.value === currentBook.value)?.label || ''
    })

    // 工具函数
    const shuffleArray = (array) => {
      const arr = [...array]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }

    const truncateText = (text, maxLen) => {
      if (!text) return ''
      let cleanText = text.replace(/^[;；\s]+/, '')
      const first = cleanText.split(/[;；]/)[0]
      return first.length > maxLen ? first.slice(0, maxLen) + '...' : first
    }

    // 初始化语音系统
    const initVoices = () => {
      if (!('speechSynthesis' in window)) {
        console.warn('浏览器不支持语音合成')
        return
      }

      const loadVoices = () => {
        const voices = speechSynthesis.getVoices()

        if (voices.length === 0) {
          return // 语音列表还未加载
        }

        // 优先选择高质量的英文语音
        selectedVoice =
          voices.find(v => v.name.includes('Google') && v.lang === 'en-US') ||
          voices.find(v => v.name.includes('Microsoft') && v.name.includes('David')) ||
          voices.find(v => v.name.includes('Microsoft') && v.lang.startsWith('en-US')) ||
          voices.find(v => v.lang === 'en-US') ||
          voices.find(v => v.lang.startsWith('en-'))

        voicesLoaded = true

        if (selectedVoice) {
          console.log('已选择语音:', selectedVoice.name, selectedVoice.lang)
        } else {
          console.warn('未找到合适的英文语音，将使用默认语音')
        }
      }

      // 立即尝试加载
      loadVoices()

      // 监听语音列表变化事件
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices
      }

      // 如果1秒后仍未加载，再次尝试
      setTimeout(() => {
        if (!voicesLoaded) {
          loadVoices()
        }
      }, 1000)
    }

    // 加载单词
    const loadWords = () => {
      const bookData = wordsData[currentBook.value]
      if (!bookData || bookData.length === 0) return
      words.value = shuffleArray([...bookData]).slice(0, 50)
      showWord()
      // 自动朗读第一个单词
      setTimeout(() => {
        speakWord()
      }, 300)
    }

    // 显示当前单词
    const showWord = () => {
      if (words.value.length === 0) return
      optionStates.value = ['', '', '']
      catImage.value = '/cat.png'
      const word = currentWord.value
      const correctAnswer = word.tranCN
      const opts = [correctAnswer]
      const otherWords = words.value.filter(w => w.headWord !== word.headWord)
      const shuffled = shuffleArray(otherWords)
      for (let i = 0; i < 2 && i < shuffled.length; i++) {
        opts.push(shuffled[i].tranCN)
      }
      options.value = shuffleArray(opts)
    }

    // 发音（优化版）
    const speakWord = (onEndCallback = null) => {
      if (!currentWord.value || !('speechSynthesis' in window)) {
        console.warn('语音功能不可用')
        if (onEndCallback && typeof onEndCallback === 'function') onEndCallback()
        return null
      }

      // 停止之前的语音
      if (currentUtterance) {
        // 移除旧的事件监听器，避免触发 onerror
        currentUtterance.onend = null
        currentUtterance.onerror = null
        speechSynthesis.cancel()
        currentUtterance = null
      }

      try {
        const utterance = new SpeechSynthesisUtterance(currentWord.value.headWord)

        // 设置语音参数
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
        utterance.lang = 'en-US'
        utterance.rate = 0.85
        utterance.pitch = 1.0
        utterance.volume = 1.0

        // 监听播放完成
        utterance.onend = () => {
          currentUtterance = null
          if (onEndCallback && typeof onEndCallback === 'function') {
            onEndCallback()
          }
        }

        // 监听错误（忽略 interrupted 错误）
        utterance.onerror = (event) => {
          // interrupted 错误是正常的（切换单词时取消上一个语音）
          if (event.error !== 'interrupted') {
            console.error('语音播放错误:', event.error)
          }
          currentUtterance = null
          if (onEndCallback && typeof onEndCallback === 'function') {
            onEndCallback()
          }
        }

        currentUtterance = utterance
        speechSynthesis.speak(utterance)

        return utterance
      } catch (error) {
        console.error('创建语音失败:', error)
        if (onEndCallback && typeof onEndCallback === 'function') onEndCallback()
        return null
      }
    }

    // 选择选项
    const selectOption = (option, index) => {
      if (optionStates.value[index] === 'wrong') return

      const correctAnswer = currentWord.value.tranCN

      // 根据点击位置显示对应图片（无论对错）
      const positionImages = ['/左边.png', '/中间.png', '/右边.png']
      catImage.value = positionImages[index] || '/cat.png'

      if (option === correctAnswer) {
        // 答对了
        optionStates.value[index] = 'correct'
        score.value++
        scorePop.value = true
        setTimeout(() => scorePop.value = false, 300)

          // 普通模式：播放正确音效，音效结束后切换到下一题并朗读
          correctSound.value.currentTime = 0

          const onCorrectSoundEnded = () => {
            // 切换到下一题
            if (currentIndex.value < words.value.length - 1) {
              currentIndex.value++
              showWord()
              // 朗读下一个单词
              setTimeout(() => {
                speakWord()
              }, 200)
            }
            correctSound.value.removeEventListener('ended', onCorrectSoundEnded)
          }
          correctSound.value.addEventListener('ended', onCorrectSoundEnded)

          correctSound.value.play()
      } else {
        // 答错了
        optionStates.value[index] = 'wrong'
        score.value--
        scorePop.value = true
        setTimeout(() => scorePop.value = false, 300)

        // 先播放错误音效，然后播放单词
          wrongSound.value.currentTime = 0

          // 监听音效播放完成事件
          const onSoundEnded = () => {
            speakWord()
            wrongSound.value.removeEventListener('ended', onSoundEnded)
          }
          wrongSound.value.addEventListener('ended', onSoundEnded)

          wrongSound.value.play()
      }
    }

    const prevWord = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        showWord()
      }
    }

    const nextWord = () => {
      if (currentIndex.value < words.value.length - 1) {
        currentIndex.value++
        showWord()
      }
    }

    const selectBook = (val) => {
      currentBook.value = val
      isSelectOpen.value = false
      currentIndex.value = 0
      loadWords()
    }

    const closeModalOutside = (e) => {
      if (e.target.classList.contains('modal')) showModal.value = false
    }

    const handleGlobalClick = (e) => {
      if (!e.target.closest('.custom-select')) isSelectOpen.value = false
    }

    watch(showModal, (newVal) => {
      if (newVal) {
        zhengbangSound.value.currentTime = 0
        zhengbangSound.value.play()
      }
    })

    onMounted(() => {
      // 初始化语音系统
      initVoices()
      // 加载单词
      loadWords()
      window.addEventListener('click', handleGlobalClick)
    })

    onUnmounted(() => {
      window.removeEventListener('click', handleGlobalClick)
    })

    return {
      currentBook,
      currentIndex,
      words,
      score,
      showModal,
      options,
      optionStates,
      catImage,
      scorePop,
      currentWord,
      phoneticText,
      correctSound,
      wrongSound,
      zhengbangSound,
      isSelectOpen,
      bookOptions,
      currentBookLabel,
      truncateText,
      speakWord,
      selectOption,
      prevWord,
      nextWord,
      selectBook,
      closeModalOutside
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: var(--shadow-sm);
}

.app-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-display {
  display: flex;
  align-items: center;
  background: var(--white);
  padding: 4px 12px;
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  gap: 4px;
}

.fish-icon {
  width: 20px;
  height: 20px;
  color: #ff9800;
  animation: fishSwim 3s ease-in-out infinite;
}

@keyframes fishSwim {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(-5deg); }
  75% { transform: translateY(2px) rotate(5deg); }
}

.fish-label {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 1px;
}

.score-count {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  min-width: 20px;
  text-align: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.score-count.score-pop {
  transform: scale(1.5);
}

/* 自定义选择框样式 */
.book-selector {
  padding: 10px 20px;
  position: relative;
  z-index: 50;
}

.custom-select {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.select-trigger {
  padding: 10px 16px;
  border-radius: 12px;
  background: var(--white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
  border: 1px solid rgba(0,0,0,0.05);
}

.custom-select.open .select-trigger {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(240, 98, 146, 0.1);
}

.arrow-icon {
  width: 18px;
  height: 18px;
  color: var(--text-light);
  transition: transform 0.3s;
}

.custom-select.open .arrow-icon {
  transform: rotate(180deg);
}

.select-options {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
  z-index: 100;
  border: 1px solid rgba(0,0,0,0.05);
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.select-option {
  padding: 12px 16px;
  font-size: 14px;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.select-option:hover {
  background: rgba(240, 98, 146, 0.05);
  color: var(--primary-color);
}

.select-option.active {
  background: var(--primary-color);
  color: var(--white);
}

.word-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  max-width: 100%;
}

.word-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.word-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.english-word {
  font-size: 42px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.phonetic-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.5);
  padding: 4px 12px;
  border-radius: 20px;
}

.phonetic-label {
  background: #d4e4df;
  color: #3f5e55;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.phonetic-text {
  font-size: 16px;
  color: var(--text-secondary);
}

.sound-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: var(--primary-color);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(240, 98, 146, 0.3);
}

.image-container {
  margin: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 240px;
}

.word-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hint-text {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 15px;
}

/* 选项容器：一行三个 */
.options-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 500px;
}

.option-btn {
  padding: 12px 4px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--white);
  color: var(--text-secondary);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60px;
  word-break: break-all;
}

.option-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  color: var(--primary-color);
}

.option-btn.correct {
  background: var(--correct-green) !important;
  color: var(--white) !important;
}

.option-btn.wrong {
  background: var(--wrong-red) !important;
  color: var(--white) !important;
}

.nav-footer {
  display: flex;
  justify-content: space-around;
  padding: 15px 30px;
  background: var(--white);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
}

.nav-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #f5f5f5;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn .icon-svg {
  width: 28px;
  height: 28px;
}

.nav-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: var(--white);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}


.zhengbang-btn {
  background: var(--white);
  border: 1px solid var(--primary-color);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: var(--primary-color);
  cursor: pointer;
}

/* 弹窗样式 */
.modal {
  display: flex;
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: var(--white);
  border-radius: 24px;
  padding: 30px;
  width: 100%;
  max-width: 340px;
  position: relative;
}

.modal-close-btn {
  position: absolute;
  top: 15px; right: 15px;
  width: 30px; height: 30px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  text-align: center;
  font-size: 20px;
  margin-bottom: 4px;
}

.modal-subtitle {
  text-align: center;
  font-size: 13px;
  color: var(--text-light);
  margin-bottom: 24px;
}

.modal-images {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.modal-img-item img {
  width: 120px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  margin-bottom: 8px;
}

@media (max-width: 400px) {
  .english-word { font-size: 32px; }
  .option-btn { font-size: 12px; min-height: 54px; }
}
</style>