---
# 注意不要修改本文头文件，如修改，CodeBuddy（内网版）将按照默认逻辑设置
type: always
---
# global.md

This file provides guidance to CodeBuddy when working with code in this repository.

## 项目概述

we3D 是一个基于腾讯云开发 (CloudBase) 的 AI 生图生 3D Web 应用，整合混元、豆包等多种 AI 模型，提供文生图和图生 3D 的一站式创作体验。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| UI 组件库 | TDesign React |
| 3D 渲染 | Three.js + React Three Fiber |
| 状态管理 | Zustand |
| 构建工具 | Vite |
| 后端服务 | CloudBase 云函数 (Node.js 18) |
| 数据库 | CloudBase NoSQL |
| 文件存储 | CloudBase 云存储 |
| 部署 | CloudBase 静态网站托管 |

## 常用命令

```bash
# 开发
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 构建生产版本 (tsc + vite build)
npm run preview      # 预览生产构建

# 代码质量
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint 代码检查
npm run format       # Prettier 格式化

# 云函数部署 (使用 CloudBase MCP 工具)
# 通过 getFunctionList 查询 → createFunction/updateFunctionCode 部署

# 静态网站部署
# npm run build → uploadFiles 工具部署到 CloudBase 静态托管
```

## 代码架构

```
src/
├── components/          # React 组件 (按功能模块划分)
│   ├── Layout/          # 布局组件 (Header)
│   ├── LeftPanel/       # 左侧: 提示词、模型选择、参数
│   ├── CenterCanvas/    # 中央: 图像网格、进度
│   ├── RightPanel/      # 右侧: 3D 预览、下载
│   ├── PaymentModal/    # 支付弹窗
│   ├── AdminPanel/      # 管理员面板
│   └── UI/              # 通用 UI 组件
├── hooks/               # 自定义 Hooks
│   ├── useGeneration.ts # 图像/3D 生成逻辑
│   ├── useModels.ts     # 模型管理
│   ├── usePayment.ts    # 支付流程
│   └── useUIFeedback.ts # UI 反馈 (toast/loading)
├── stores/              # Zustand 状态管理
│   ├── appStore.ts      # 应用主状态
│   └── adminStore.ts    # 管理员状态
├── services/            # API 服务层
│   └── cloudbase.ts     # CloudBase SDK 封装
├── types/index.ts       # TypeScript 类型定义
└── styles/global.css    # CSS 变量、主题

functions/               # CloudBase 云函数
├── text2img/            # 文生图代理
├── img2model3d/         # 图生 3D 代理
├── modelProxy/          # 模型管理 (AK/SK 加密)
├── createOrder/         # 创建支付订单
├── payCallback/         # 支付回调处理
└── orderQuery/          # 订单状态查询
```

## 核心模块

### 前端三栏布局
- **左侧 (280px)**: 提示词输入、模型选择、参数设置
- **中央 (弹性)**: 生成图像网格、进度条
- **右侧 (360px)**: 3D 预览器、付费下载

### 云函数职责
| 云函数 | 职责 |
|--------|------|
| `text2img` | 调用 AI 模型生成图像，密钥不暴露前端 |
| `img2model3d` | 图像转 3D 模型 |
| `modelProxy` | 管理员配置模型 URL/AK/SK |
| `createOrder` | 创建支付订单 |
| `payCallback` | 支付异步通知 |
| `orderQuery` | 订单状态查询 |

### 数据库集合
- `models`: AI 模型配置
- `generations`: 用户生成记录
- `orders`: 支付订单
- `download_permissions`: 下载权限

## CloudBase 环境

- **环境 ID**: `ai-generator-1gp9p3g64d04e869`
- **云函数目录**: `./functions`
- **MCP 服务器**: `@cloudbase/cloudbase-mcp@latest`

## Git 工作流

### 提交规范
格式: `type(scope): description`

类型: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### 版本控制 Skills
- **`@mr`**: 智能代码提交，自动分析变更生成 commit message，支持发版流程
- **`@rollback`**: 代码版本回退，支持 revert（安全）和 reset（紧急）模式

### 发版流程
1. 构建验证: `npm run build`
2. 创建发版分支: `git checkout -b publish/v1.0.x`
3. 更新版本号: `npm version patch --no-git-tag-version`
4. 提交: `git commit -m "chore(release): v1.0.x"`
5. 推送并创建 MR
6. 合并后打 Tag: `git tag v1.0.x && git push origin v1.0.x`

### 版本回退
```bash
# 安全回退（推荐）
git revert HEAD --no-edit && git push

# 紧急回滚
git reset --hard HEAD~1 && git push -f  # ⚠️ 需通知团队
```

## 变更记录

每次修改后更新 `devlog.md`（时间倒序，最新在顶部）
