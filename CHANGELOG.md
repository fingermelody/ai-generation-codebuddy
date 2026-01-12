# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-01-12

### Added
- 新增 `mr` Command - 智能代码提交工具，支持自动分析变更、生成规范 commit message、发版流程
- 新增 `rollback` Command - 代码版本回退工具，支持 revert（安全）和 reset（紧急）两种模式
- 更新 `global.md` - 添加 Git 工作流和版本控制说明

### Changed
- 将 `mr` 和 `rollback` 从 Skill 格式重构为 Command 格式，支持 `/mr` 和 `/rollback` 显式调用

## [1.0.0] - 2026-01-12

### Added
- 初始版本
- AI 生图生 3D Web 应用基础功能
- CloudBase 云函数集成（text2img、img2model3d、modelProxy 等）
- React + TypeScript + TDesign 前端架构
- Three.js 3D 预览功能
