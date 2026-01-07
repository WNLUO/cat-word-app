# 蒸蚌背单词 - Vue 版本

这是一个基于 Vue 3 的英语单词学习应用，从原始 HTML/JavaScript 项目转换而来。

## 项目结构

```
word-app/
├── src/
│   ├── assets/          # 静态资源
│   │   ├── images/      # 图片资源
│   │   └── media/       # 音频资源
│   ├── components/      # Vue 组件
│   │   ├── SplashPage.vue    # 启动页组件
│   │   └── WordPage.vue      # 单词学习页组件
│   ├── App.vue          # 根组件
│   ├── main.js          # 入口文件
│   └── words.js         # 单词数据
├── index.html           # HTML 模板
├── package.json         # 项目配置
└── vite.config.js       # Vite 配置
```

## 功能特性

- ✅ 启动页动画过渡
- ✅ 多个词库选择（四级、六级、考研）
- ✅ 单词发音（Web Speech API）
- ✅ 答题反馈（正确/错误音效和动画）
- ✅ 得分系统
- ✅ 纯净模式切换
- ✅ 响应式设计

## 安装和运行

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3001

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 技术栈

- Vue 3 - 使用 Composition API
- Vite - 快速的开发构建工具
- JavaScript ES6+
- CSS3 动画

## 转换说明

从原始 HTML 项目转换为 Vue 项目的主要变化：

1. **组件化**：将页面拆分为 `SplashPage` 和 `WordPage` 两个组件
2. **响应式数据**：使用 Vue 的 `ref` 和 `computed` 管理状态
3. **事件处理**：使用 Vue 的事件系统替代原生 DOM 事件
4. **样式隔离**：使用 scoped CSS 实现组件样式隔离
5. **模块化**：使用 ES6 模块系统组织代码
