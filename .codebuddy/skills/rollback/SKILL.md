---
name: rollback
description: 代码版本回退工具。安全回退到上一次提交或指定版本，支持 revert（安全）和 reset（紧急）两种模式。当用户提到"回退"、"回滚"、"rollback"、"撤销提交"、"恢复版本"、"undo commit"时使用此技能。
---

# Rollback - 代码版本回退

安全的代码回退工具，支持多种回退策略。

## 回退前信息收集

```bash
# 当前 HEAD
git log --oneline -5

# 版本标签
git tag --sort=-version:refname | head -5

# 上一个 Tag
git describe --tags --abbrev=0 2>/dev/null || echo "无 Tag"

# 工作区状态
git status --porcelain
```

## 回退策略

| 场景 | 方式 | 风险 |
|------|------|------|
| 回退上一次提交 | `git revert` | 🟢 安全 |
| 回退到指定版本 | `git revert` | 🟢 安全 |
| 紧急回滚 | `git reset --hard` | 🔴 高风险 |
| 查看旧版本 | `git checkout` | 🟢 安全 |

## 回退方式

### 方式一：Revert（推荐）

创建新提交来撤销变更，保留完整历史。

```bash
# 回退上一次提交
git revert HEAD --no-edit

# 回退指定提交
git revert <commit-hash> --no-edit

# 回退多个提交（从新到旧）
git revert --no-commit HEAD~3..HEAD
git commit -m "revert: 回退最近3次提交"

# 推送
git push origin $(git branch --show-current)
```

### 方式二：Reset（紧急情况）

⚠️ **警告：会丢失提交历史，团队协作需通知所有成员**

```bash
# 软回退（保留代码修改）
git reset --soft HEAD~1

# 硬回退（丢弃代码修改）
git reset --hard HEAD~1

# 回退到指定提交
git reset --hard <commit-hash>

# 强制推送（⚠️ 危险）
git push -f origin $(git branch --show-current)
```

### 方式三：回退到 Tag

```bash
# 查看 Tag
git tag --sort=-version:refname

# 切换到指定 Tag
git checkout v1.0.0

# 从 Tag 创建新分支
git checkout -b hotfix/from-v1.0.0 v1.0.0
```

## 回退后验证

```bash
# 确认 HEAD
git log --oneline -3

# 确认版本
jq -r '.version' package.json 2>/dev/null

# 重新构建
npm run build
```

## 快捷命令

```bash
# 撤销上一次提交（安全）
git revert HEAD --no-edit && git push

# 查看可回退版本
git log --oneline -10

# 查看某提交内容
git show <commit-hash> --stat
```

## 注意事项

1. **优先使用 revert** - 保留历史便于追溯
2. **reset 需确认** - 会影响协作者
3. **强推需通知** - `git push -f` 前通知团队
4. **回退后验证** - 确保构建通过
