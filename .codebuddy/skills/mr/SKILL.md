---
name: mr
description: 智能代码提交工具。自动分析变更内容，生成规范的 commit message，执行构建验证，创建发版分支并推送。当用户提到"提交代码"、"commit"、"发版"、"release"、"创建MR"、"merge request"、"上线"、"发布"时使用此技能。
---

# MR - 智能代码提交

自动化代码提交与发版流程，包含变更分析、构建验证、版本管理和 MR 创建。

## 工作流程

### 1. 状态检查

```bash
# 工作区状态
git status --porcelain

# 当前分支
git branch --show-current

# 同步远程
git fetch origin && git status -uno

# 当前版本
jq -r '.version // .publishConfig.customPackage.version // "未找到"' package.json 2>/dev/null || echo "无 package.json"

# 最近提交
git log --oneline -5
```

### 2. 变更分析

分析 `git diff --cached` 或 `git diff` 输出，识别变更类型：

| 前缀 | 类型 | 版本影响 |
|------|------|----------|
| `feat` | 新功能 | minor |
| `fix` | 修复 | patch |
| `docs` | 文档 | patch |
| `refactor` | 重构 | patch |
| `test` | 测试 | patch |
| `chore` | 构建/工具 | patch |
| `BREAKING CHANGE` | 破坏性变更 | major |

### 3. 生成 Commit Message

格式: `type(scope): description`

示例:
- `feat(auth): 添加微信登录功能`
- `fix(api): 修复用户查询接口超时问题`
- `refactor(utils): 优化日期处理函数`

### 4. 构建验证（发版时）

```bash
npm run build
npm run lint 2>/dev/null || true
npm run test 2>/dev/null || true
```

### 5. 提交流程

#### 普通提交
```bash
git add .
git commit -m "type(scope): description"
git push origin $(git branch --show-current)
```

#### 发版提交
```bash
# 创建发版分支
git checkout -b publish/v1.0.1

# 更新版本号
npm version patch --no-git-tag-version  # 或 minor/major

# 更新 CHANGELOG.md（在顶部添加）
# ## [1.0.1] - 2026-01-12
# ### Added/Fixed/Changed

# 提交
git add .
git commit -m "chore(release): v1.0.1"
git push origin publish/v1.0.1
```

### 6. 创建 MR

推送后输出 MR 链接：
- GitHub: `https://github.com/{owner}/{repo}/compare/main...{branch}`
- GitLab: `https://gitlab.com/{owner}/{repo}/-/merge_requests/new?source_branch={branch}`

### 7. 合并后打 Tag（MR 合并后）

```bash
git checkout main
git pull origin main
git tag v1.0.1
git push origin v1.0.1
```

## 快捷命令

```bash
# 快速提交
git add . && git commit -m "fix: 修复问题" && git push

# 一键发版
npm version patch --no-git-tag-version && git add . && git commit -m "chore(release): v$(jq -r '.version' package.json)" && git push
```

## 注意事项

1. 发版前必须通过构建验证
2. 版本号遵循语义化版本规范
3. CHANGELOG.md 需同步更新
4. 重要发版打 Tag 便于回退
