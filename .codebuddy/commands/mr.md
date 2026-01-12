---
description: "智能代码提交工具。自动分析变更内容，生成规范的 commit message，执行构建验证，创建发版分支并推送。当用户提到"提交代码"、"commit"、"发版"、"release"、"创建MR"、"merge request"、"上线"、"发布"时使用此技能。"
argument-hint: "[custom-prompt]"
---
# 📦 智能发版流程
 
分析变更历史，自动更新版本号和changelog，执行构建验证并创建发版MR。
 
## 📊 发版信息收集
 
### 工作区和分支状态
!`git status --porcelain && echo "--- Current Branch ---" && git branch --show-current && echo "--- Remote Status ---" && git fetch origin && git status -uno`
 
### 当前版本信息
!`echo "Package.json version:" && jq -r '.publishConfig.customPackage.version // .version' package.json`
 
### Changelog结构检查
!`echo "Current CHANGELOG.md:" && head -20 CHANGELOG.md 2>/dev/null || echo "CHANGELOG.md 不存在"`
 
### 最近提交历史
!`git log --oneline -10 --format="%s"`
 
### 未发布变更检查
!`grep -n "未发布" CHANGELOG.md | head -5 || echo "无未发布标记"`
 
## 🎯 发版策略
 
### 版本号规则
遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：
- `major.minor.patch` - 主版本.次版本.修订版本
- **Major**: 破坏性变更 (BREAKING CHANGE)
- **Minor**: 新功能 (feat)  
- **Patch**: 修复和改进 (fix, docs, chore等)
 
### 分支命名规范
- `publish/v{版本号}` - 发版分支
- 例如: `publish/v1.0.12`

### Commit Message 规范
格式: `type(scope): description`

| 前缀 | 类型 | 版本影响 |
|------|------|----------|
| `feat` | 新功能 | minor |
| `fix` | 修复 | patch |
| `docs` | 文档 | patch |
| `refactor` | 重构 | patch |
| `test` | 测试 | patch |
| `chore` | 构建/工具 | patch |
| `BREAKING CHANGE` | 破坏性变更 | major |
 
## 🚀 自动化流程
 
1. **执行构建验证**（确保代码质量）
2. **分析变更类型确定版本号**
3. **创建发版分支**（如在主分支）
4. **更新package.json版本号**
5. **更新CHANGELOG.md**（移除"未发布"标记，添加发布日期）
6. **生成发版提交信息**
7. **暂存并所有提交变更（git add .）**
8. **推送到远程**
9. **输出 MR 创建链接**
 
### 构建验证步骤
```bash
npm run build     # 构建验证（包含lint检查）
npm run test      # 测试验证（如存在）
```

### 合并后打 Tag（MR 合并后执行）
```bash
git checkout main
git pull origin main
git tag v1.0.x
git push origin v1.0.x
```
 
### 额外补充说明
 
$1

---
**开始智能发版流程...**
