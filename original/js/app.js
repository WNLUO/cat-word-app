// 应用状态
const state = {
    currentBook: 'CET4_1',
    currentIndex: 0,
    words: [],
    answered: false,
    score: 0,
    pureMode: false
};

// DOM 元素
const splashPage = document.getElementById('splash-page');
const wordPage = document.getElementById('word-page');
const englishWord = document.getElementById('english-word');
const optionsContainer = document.getElementById('options');
const bookSelect = document.getElementById('book-select');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const soundBtn = document.getElementById('sound-btn');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const scoreCount = document.getElementById('score-count');
const zhengbangBtn = document.getElementById('zhengbang-btn');
const zhengbangModal = document.getElementById('zhengbang-modal');
const modalClose = document.getElementById('modal-close');
const zhengbangSound = document.getElementById('zhengbang-sound');
const catImage = document.querySelector('.word-image');
const phoneticText = document.getElementById('phonetic-text');
const splashLogoArea = document.getElementById('splash-logo-area');
const splashContent = document.querySelector('.splash-content');
const splashImg = document.getElementById('splash-img');
const splashHint = document.querySelector('.splash-hint');
const pureModeSwitch = document.getElementById('pure-mode-switch');

// 图片路径
const catImages = {
    default: 'assets/cat.jpg',
    correct: 'assets/正确.jpg',
    leftWrong: 'assets/左边错误.jpg',
    middleWrong: 'assets/中间错误.jpg',
    rightWrong: 'assets/右边错误.jpg'
};

// 启动页点击进入
splashContent.addEventListener('click', () => {
    // 同时执行所有动画
    splashLogoArea.classList.add('shrink');
    splashImg.classList.add('shrink');
    splashHint.classList.add('hide');
    
    // 动画结束后切换页面
    setTimeout(() => {
        splashPage.classList.remove('active');
        wordPage.classList.add('active');
        loadWords();
    }, 850);
});

// 词库选择
bookSelect.addEventListener('change', (e) => {
    state.currentBook = e.target.value;
    state.currentIndex = 0;
    loadWords();
});

// 加载单词
function loadWords() {
    const bookData = wordsData[state.currentBook];
    if (!bookData || bookData.length === 0) {
        englishWord.textContent = '词库加载失败';
        return;
    }
    
    // 随机打乱并取前50个（避免太多）
    state.words = shuffleArray([...bookData]).slice(0, 50);
    showWord();
}

// 显示当前单词
function showWord() {
    if (state.words.length === 0) return;
    
    state.answered = false;
    const word = state.words[state.currentIndex];
    
    englishWord.textContent = word.headWord;
    // 显示音标
    phoneticText.textContent = word.usPhone ? '[' + word.usPhone + ']' : '[...]';
    
    // 生成选项（1个正确 + 2个错误）
    const options = generateOptions(word);
    renderOptions(options, word.tranCN);
    
    // 更新导航按钮状态
    prevBtn.disabled = state.currentIndex === 0;
    nextBtn.disabled = state.currentIndex === state.words.length - 1;
}

// 生成选项
function generateOptions(correctWord) {
    const options = [correctWord.tranCN];
    const otherWords = state.words.filter(w => w.headWord !== correctWord.headWord);
    
    // 随机选2个错误答案
    const shuffled = shuffleArray(otherWords);
    for (let i = 0; i < 2 && i < shuffled.length; i++) {
        options.push(shuffled[i].tranCN);
    }
    
    return shuffleArray(options);
}

// 渲染选项按钮
function renderOptions(options, correctAnswer) {
    optionsContainer.innerHTML = '';
    // 恢复默认小猫图片
    catImage.src = catImages.default;
    
    options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = truncateText(option, 8);
        btn.title = option;
        
        btn.addEventListener('click', () => {
            if (btn.classList.contains('wrong')) return; // 已经点错的按钮不能再点
            
            const word = state.words[state.currentIndex];
            
            // 播报单词读音的函数
            const speakWord = () => {
                if (word && 'speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(word.headWord);
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                    speechSynthesis.speak(utterance);
                }
            };
            
            if (option === correctAnswer) {
                // 正确
                state.answered = true;
                state.score++;
                scoreCount.textContent = state.score;
                scoreCount.classList.add('score-pop');
                setTimeout(() => scoreCount.classList.remove('score-pop'), 300);
                btn.classList.add('correct');
                
                // 纯净模式：只播报单词读音；普通模式：播放正确音效
                if (state.pureMode) {
                    speakWord();
                } else {
                    correctSound.currentTime = 0;
                    correctSound.play();
                }
                
                // 显示正确图片
                catImage.src = catImages.correct;
                // 自动下一题
                setTimeout(() => {
                    if (state.currentIndex < state.words.length - 1) {
                        state.currentIndex++;
                        showWord();
                    }
                }, 1000);
            } else {
                // 错误，标记这个按钮但允许继续选择
                btn.classList.add('wrong');
                state.score = Math.max(0, state.score - 1); // 减一，但不低于0
                scoreCount.textContent = state.score;
                scoreCount.classList.add('score-pop');
                setTimeout(() => scoreCount.classList.remove('score-pop'), 300);
                
                // 纯净模式：只播报单词读音；普通模式：播放错误音效+单词读音
                if (state.pureMode) {
                    speakWord();
                } else {
                    wrongSound.currentTime = 0;
                    wrongSound.play();
                    speakWord();
                }
                
                // 根据按钮位置显示对应错误图片
                if (index === 0) {
                    catImage.src = catImages.leftWrong;
                } else if (index === 1) {
                    catImage.src = catImages.middleWrong;
                } else {
                    catImage.src = catImages.rightWrong;
                }
            }
        });
        
        optionsContainer.appendChild(btn);
    });
}

// 发音按钮（使用 Web Speech API）
soundBtn.addEventListener('click', () => {
    const word = state.words[state.currentIndex];
    if (word && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word.headWord);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
});

// 导航按钮
prevBtn.addEventListener('click', () => {
    if (state.currentIndex > 0) {
        state.currentIndex--;
        showWord();
    }
});

nextBtn.addEventListener('click', () => {
    if (state.currentIndex < state.words.length - 1) {
        state.currentIndex++;
        showWord();
    }
});

// 工具函数
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function truncateText(text, maxLen) {
    if (!text) return '';
    // 取第一个释义
    const first = text.split(/[;；]/)[0];
    return first.length > maxLen ? first.slice(0, maxLen) + '...' : first;
}

// 蒸蚌按钮点击 - 播放语音并显示弹窗
zhengbangBtn.addEventListener('click', () => {
    zhengbangSound.currentTime = 0;
    zhengbangSound.play();
    zhengbangModal.classList.add('active');
});

// 关闭弹窗
modalClose.addEventListener('click', () => {
    zhengbangModal.classList.remove('active');
});

// 点击弹窗外部关闭
zhengbangModal.addEventListener('click', (e) => {
    if (e.target === zhengbangModal) {
        zhengbangModal.classList.remove('active');
    }
});

// 纯净模式开关
pureModeSwitch.addEventListener('change', (e) => {
    state.pureMode = e.target.checked;
});
