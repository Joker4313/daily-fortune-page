# 摸鱼日报 (Daily Fortune Page)

一个展示每日运势、农历信息、星座运势和名言的摸鱼小工具页面。

## ✨ 主要功能

*   显示公历和农历日期。
*   展示每日宜忌（基于农历）。
*   根据用户选择或自动检测显示对应星座的今日运势。
*   每日随机名言。
*   支持将当前页面内容导出为图片。
*   （未来可能）背景图片功能。

## 🛠️ 技术栈

*   React
*   Vite
*   TypeScript
*   Tailwind CSS
*   TianAPI (天行数据)作为外部数据源

## ⚙️ 项目结构概览

```
daily-fortune-page/
├── public/                  # 静态资源
├── src/
│   ├── app/                 # 核心页面组件 (例如 page.tsx, globals.css)
│   ├── assets/              # 图片等静态资源
│   ├── components/          # UI 组件
│   │   ├── features/        # 特定功能的组件 (例如 DailyFortune, BingWallpaper)
│   │   └── ui/              # 通用UI组件 (例如 Button, Card from shadcn/ui)
│   ├── constants.ts         # 应用常量
│   ├── hooks/               # 自定义 React Hooks (例如 useFortuneData)
│   ├── lib/                 # 工具函数 (例如 dateUtils, fortuneUtils)
│   ├── services/            # API 服务调用 (例如 tianapi.ts, bingImage.ts)
│   ├── types/               # TypeScript 类型定义
│   ├── main.tsx             # 应用入口文件
│   └── vite-env.d.ts        # Vite 环境变量类型定义
├── .gitignore               # Git 忽略文件配置
├── index.html               # HTML 入口文件
├── package.json             # 项目依赖和脚本
├── pnpm-lock.yaml           # pnpm 依赖锁定文件
├── postcss.config.js        # PostCSS 配置文件
├── tailwind.config.js       # Tailwind CSS 配置文件
├── tsconfig.json            # TypeScript 根配置文件
├── tsconfig.app.json        # TypeScript 应用特定配置
├── tsconfig.node.json       # TypeScript Node环境特定配置 (例如Vite配置)
└── vite.config.ts           # Vite 配置文件
```

## 🚀 使用教程

### 1. 环境准备

确保你已经安装了 [Node.js](https://nodejs.org/) (建议 LTS 版本) 和 [pnpm](https://pnpm.io/)。

### 2. API Key 配置

本项目使用天行数据 (TianAPI) 获取运势和名言等信息。你需要在项目根目录下创建一个 `.env` 文件，并填入你的 TianAPI Key：

```env
VITE_TIANAPI_KEY=你的天行API_KEY
```

**注意**: 之前我们将 API 调用迁移到了服务器端模拟路由。在实际的 Vite + React 项目中，如果真的要实现服务器端缓存和 API 调用，你需要一个真实的后端服务。上述 `.env` 文件中的 `VITE_TIANAPI_KEY` 是用于前端直接调用 API 的方式。如果所有 API 调用都通过你自己的后端（未在此项目中完全实现），那么后端服务需要配置相应的 API Key。

### 3. 安装依赖

在项目根目录下运行：

```bash
pnpm install
```

### 4. 运行开发服务器

```bash
pnpm dev
```

项目将在本地启动，通常地址为 `http://localhost:5173` (具体端口以 Vite 输出为准)。

### 5. 构建项目

```bash
pnpm build
```

构建后的静态文件会输出到 `dist` 目录。

## 📝 注意事项

*   由于星座运势等 API 可能有调用频率限制，请合理使用。
*   服务器端 API 路由 (`src/app/api/...`) 是在之前假设项目为 Next.js 时创建的，在当前的 Vite + React 环境下，它们不会作为后端服务运行。如需实现真正的后端逻辑和服务器端缓存，需要单独搭建后端服务（如 Express.js）或使用 Serverless Functions。
