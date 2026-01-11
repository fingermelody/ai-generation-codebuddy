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

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 云函数部署
```bash
# 使用 CloudBase CLI 部署云函数
tcb fn deploy <function-name>

# 部署所有云函数
tcb fn deploy
```

### 静态网站部署
```bash
# 构建并部署到 CloudBase 静态托管
npm run build
tcb hosting deploy ./dist -e <env-id>
```

## 代码架构

```
we3D/
├── src/                          # 前端源代码
│   ├── components/               # React 组件
│   │   ├── Layout/               # 布局组件 (Header)
│   │   ├── LeftPanel/            # 左侧面板 (提示词、模型选择、参数)
│   │   ├── CenterCanvas/         # 中央画布 (图像网格、进度)
│   │   ├── RightPanel/           # 右侧面板 (3D 预览、下载)
│   │   ├── PaymentModal/         # 支付弹窗
│   │   ├── AdminPanel/           # 管理员面板 (模型配置)
│   │   └── UI/                   # 通用 UI 组件
│   │       ├── LoadingOverlay    # 全局加载遮罩
│   │       ├── StatusIndicator   # 状态指示器
│   │       ├── ConfirmDialog     # 确认对话框
│   │       └── Tooltip           # 工具提示
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useModels.ts          # 模型管理
│   │   ├── useGeneration.ts      # 图像/3D 生成
│   │   ├── usePayment.ts         # 支付流程
│   │   └── useUIFeedback.ts      # UI 反馈
│   ├── stores/                   # Zustand 状态管理
│   │   ├── appStore.ts           # 应用主状态
│   │   └── adminStore.ts         # 管理员状态
│   ├── services/                 # API 服务层
│   │   └── cloudbase.ts          # CloudBase SDK 封装
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts              # 所有类型定义
│   └── styles/                   # 全局样式
│       └── global.css            # CSS 变量、主题
├── functions/                    # CloudBase 云函数
│   ├── text2img/                 # 文生图代理
│   ├── img2model3d/              # 图生 3D 代理
│   ├── modelProxy/               # 模型管理 (AK/SK 加密存储)
│   ├── createOrder/              # 创建支付订单
│   ├── payCallback/              # 支付回调处理
│   └── orderQuery/               # 订单状态查询
├── rules/                        # 开发规则文件
├── task/                         # 需求文档
└── cloudbaserc.json              # CloudBase 配置
```

## 核心模块说明

### 前端三栏布局
- **左侧面板 (280px)**: 提示词输入、模型选择、参数设置、历史记录
- **中央画布 (弹性)**: 生成图像网格展示、进度条、批量操作
- **右侧面板 (360px)**: 3D 预览器、输出格式选择、付费下载

### 云函数职责
| 云函数 | 职责 |
|--------|------|
| `text2img` | 调用 AI 模型 API 生成图像，密钥不暴露前端 |
| `img2model3d` | 调用 AI 模型 API 将图像转换为 3D 模型 |
| `modelProxy` | 管理员配置模型 URL、AK/SK，返回可用模型列表 |
| `createOrder` | 创建支付订单，调用微信/支付宝统一下单 |
| `payCallback` | 处理支付异步通知，更新订单状态 |
| `orderQuery` | 查询订单状态和用户购买历史 |

### 数据库集合
| 集合名 | 用途 |
|--------|------|
| `models` | AI 模型配置（URL、AK/SK、状态） |
| `generations` | 用户生成记录（图像、3D 模型） |
| `orders` | 支付订单 |
| `download_permissions` | 下载权限 |

## 关键开发规范

### 命名规范
- **组件**: PascalCase (`TripCard`)
- **文件**: kebab-case (`trip-card.tsx`)
- **变量/函数**: camelCase (`getUserData`)
- **常量**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### TypeScript 要求
- 所有变量、函数参数和返回值必须有明确类型
- 避免使用 `any`，组件 Props 使用命名接口
- 类型集中在 `src/types/` 目录

### React Hooks 规则
- 严格遵循 Hooks 规则（顶层调用）
- `useEffect`、`useMemo`、`useCallback` 必须正确设置依赖数组
- 复杂逻辑抽取为自定义 Hooks

### 状态管理
- 使用 Zustand 管理全局状态
- 状态更新保持不可变性
- 按功能域划分 store

## CloudBase 环境

- **环境 ID**: `ai-generator-1gp9p3g64d04e869`
- **云函数目录**: `./functions`
- **MCP 服务器**: `@cloudbase/cloudbase-mcp@latest`

## 变更记录管理

每次修改后必须更新 `devlog.md`：
- 使用 `replace_in_file` 在文件顶部添加新记录
- 采用时间倒序存储（最新在顶部）
- 时间格式: `[YYYY-MM-DD HH:MM]`
- 严禁删除历史记录

## Git 提交规范

格式: `type(scope): description`

类型: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

示例: `feat(auth): 添加用户登录功能`
