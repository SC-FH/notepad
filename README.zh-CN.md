# Notepad FH

[English](./README.md) | **中文**

一个基于 Vue 3 + Vite 的个人记事本与任务管理应用，数据本地存储于浏览器 IndexedDB。

## 功能特性

- **今日视图** — 查看和管理今日任务
- **任务管理** — 创建、编辑、完成任务
- **仪表盘** — 总览任务状态和进度
- **数据统计** — 通过图表可视化任务完成情况
- **历史记录** — 查看过往任务完成记录
- **PDF 导出** — 将任务数据导出为 PDF 文件
- **主题切换** — 支持自定义主题颜色
- **本地存储** — 使用 Dexie (IndexedDB) 离线存储，无需后端服务

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | [Vue 3](https://vuejs.org/) |
| 构建工具 | [Vite](https://vitejs.dev/) |
| 路由管理 | [Vue Router](https://router.vuejs.org/) |
| 数据库 | [Dexie](https://dexie.org/) (IndexedDB) |
| 图表可视化 | [Chart.js](https://www.chartjs.org/) + [vue-chartjs](https://vue-chartjs.org/) |
| PDF 生成 | [html2pdf.js](https://github.com/eKoopmans/html2pdf.js/) |
| CSS 预处理器 | [Sass](https://sass-lang.com/) |
| 类型检查 | [TypeScript](https://www.typescriptlang.org/) |

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 类型检查

```bash
npm run type-check
```

## 项目结构

```
src/
├── components/      # 公共组件
│   ├── ThemePicker.vue
│   └── PdfExportModal.vue
├── composables/     # 组合式函数
│   └── useTheme.ts
├── db/              # 数据库 (Dexie)
│   └── index.ts
├── router/          # 路由配置
│   └── index.ts
├── styles/          # 全局样式 (Sass)
│   ├── index.scss
│   ├── _variables.scss
│   ├── _mixins.scss
│   ├── _base.scss
│   ├── _layout.scss
│   ├── _components.scss
│   └── _animations.scss
├── views/           # 页面视图
│   ├── Today.vue
│   ├── Tasks.vue
│   ├── Dashboard.vue
│   ├── Stats.vue
│   ├── Statistics.vue
│   └── History.vue
├── App.vue
└── main.ts
```

## 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。
