# AI 代码审查规则

这是一套团队定制的 AI 代码审查规则，融合了企业 TypeScript 编码规范，旨在确保代码质量、一致性和可维护性。

## 基本原则及规则等级说明

为明确规则的重要性和执行严格程度，并采用以下标记：

- 优先考虑代码的可读性和可维护性
- 遵循一致性原则，保持代码风格统一
- **规范等级**：【必须】= MUST/REQUIRED，【推荐】= SHOULD，【可选】= MAY
  - **【必须】**：必须严格执行，违反将导致构建失败或代码审查不通过
  - **【推荐】**：强烈建议遵循，特殊情况可以申请豁免
  - **【可选】**：建议性规范，有助于提高代码质量和可维护性

## 1. TypeScript 基础规范

### 1.1 类型定义【必须】

- **明确类型**: 所有变量、函数参数和返回值必须有明确的类型定义
- **避免 any**: 除非绝对必要，否则不应使用 `any` 类型
- **接口定义 Props**: 组件 Props 必须使用命名接口定义，而非内联类型
- **类型集中管理**: 相关类型应集中在 `types` 目录下的适当文件中
- **类型断言语法**: 使用 `as Type` 语法，禁止使用 `<Type>` 语法
- **利用类型推断**: 基本类型变量应利用 TypeScript 的类型推断能力
- **接口优先**: 优先使用 interface 而非 type，除非需要使用联合类型等特性

```typescript
// ❌ 不推荐
const Component = (props: any) => { /* ... */ }
const foo = <string>bar;
let num: number = 42;
interface User { getName(): string; }

// ✅ 推荐
interface ComponentProps {
  title: string;
  onAction: () => void;
}

const Component = ({ title, onAction }: ComponentProps) => { /* ... */ }
const foo = bar as string;
const num = 42; // 自动推断
interface User {
  name: string;
  getName: () => string;
}
```

### 1.2 命名规范【必须】

- **组件命名**: 使用 PascalCase (如: `TripCard`)
- **文件命名**: 使用 kebab-case (如: `trip-card.tsx`)
- **变量/函数**: 使用 camelCase (如: `getUserData`)
- **常量**: 使用 UPPER_SNAKE_CASE (如: `API_BASE_URL`)
- **布尔值前缀**: 布尔值变量应使用 `is`、`has`、`should` 等前缀
- **类名和类型**: 使用 PascalCase 命名
- **避免下划线**: 不使用前置或后置下划线 (如: `_privateVar`)

```typescript
// ❌ 不推荐
const loading = true;
const userdata = getUserData();
const user_name = 'john';
const _privateVar = 'secret';
const myComponent = <div />;
class user {}

// ✅ 推荐
const isLoading = true;
const userData = getUserData();
const userName = 'john';
const privateVar = 'secret'; // 使用访问修饰符控制可见性
const MyComponent = <div />;
class User {}
```

### 1.3 代码格式【必须】

- **缩进**: 使用 2 个空格进行缩进
- **分号**: 语句结尾必须使用分号，不依赖自动分号插入(ASI)
- **行长度**: 单行代码不应超过 100 个字符
- **括号风格**: 开括号与声明在同一行，闭括号单独一行
- **空格使用**: 操作符两侧、逗号后应有空格，逗号前没有空格
- **花括号前空格**: 控制语句左括号前放空格，函数调用和声明不放空格
- **文件结尾空行**: 文件结尾保留一个空行
- **行尾空格**: 行尾不留空格

```typescript
// ❌ 不推荐
function test(){
  const x=y+5;
  const arr = [1,2,3];
  const obj = {clark:'kent'};
}

if(isJedi){
  fight();
}

// ✅ 推荐
function test() {
  const x = y + 5;
  const arr = [1, 2, 3];
  const obj = { clark: 'kent' };
}

if (isJedi) {
  fight();
}
```

## 2. 变量与数据结构

### 2.1 变量声明【必须】

- **const/let 使用**: 使用 `const` 声明不变变量，使用 `let` 声明可变变量
- **禁用 var**: 所有变量声明必须使用 const 或 let
- **声明顺序**: 变量先声明再使用
- **单独声明**: 每个变量单独声明，不使用逗号分隔
- **避免链式赋值**: 不使用 `let a = b = c = 1` 这样的链式赋值

```typescript
// ❌ 不推荐
var name = 'example';
const a = 1, b = 2;
let a = b = c = 1; // 链式赋值

// ✅ 推荐
const name = 'example';
const a = 1;
const b = 2;
let c = 1;
let d = c;
```

### 2.2 对象和数组【必须】

- **字面量语法**: 创建对象和数组时使用字面量语法
- **方法简写**: 使用对象方法简写和属性值简写
- **属性引号**: 只对无效标识符的属性使用引号
- **展开运算符**: 优先使用展开运算符进行对象复制和合并
- **尾随逗号**: 多行对象和数组定义使用尾随逗号

```typescript
// ❌ 不推荐
const obj = new Object();
const arr = new Array();
const bad = { 'foo': 3, 'bar': 4 };

// ✅ 推荐
const obj = { name, getValue() { return this.name; } };
const arr = [1, 2, 3];
const copy = { ...original, newProp: 'value' };
const multiLine = {
  id: 1,
  name: 'example',
  value: true,
}; // 注意尾随逗号
```

### 2.3 字符串和类型转换【推荐】

- **单引号**: 使用单引号定义字符串
- **模板字符串**: 使用模板字符串进行字符串拼接
- **禁用 eval**: 永远不要使用 eval()
- **显式转换**: 使用 String()/Number()/!! 进行显式类型转换
- **parseInt 进制**: parseInt 必须指定进制

```typescript
// ❌ 不推荐
const message = "Hello world";
const greeting = 'Hello, ' + name + '!';
const str = value + '';
const num = +inputValue;
const parsed = parseInt(value);

// ✅ 推荐
const message = 'Hello world';
const greeting = `Hello, ${name}!`;
const str = String(value);
const num = Number(inputValue);
const parsed = parseInt(value, 10);
const bool = !!value;
```

## 3. 函数与模块

### 3.1 函数设计【推荐】

- **函数大小**: 单个函数不应超过 50 行，超过应考虑拆分
- **参数数量**: 函数参数不应超过 3 个，超过应使用对象参数
- **默认参数**: 使用 ES6 默认参数语法，默认参数放在最后
- **Rest 语法**: 使用 rest 语法代替 arguments 对象
- **纯函数**: 尽可能使用纯函数，减少副作用
- **箭头函数**: 匿名函数优先使用箭头函数

```typescript
// ❌ 不推荐
function handleThings(opts = {}, name) { /* ... */ } // 默认参数不在最后
function sum() { 
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

// ✅ 推荐
function handleThings(name, opts = {}) { /* ... */ }
function sum(...args) { 
  return args.reduce((a, b) => a + b, 0); 
}

// 箭头函数示例
[1, 2, 3].map(x => x * 2);
[1, 2, 3].filter((x) => { return x > 1; });
```

### 3.2 模块导入导出【必须】

- **ES6 模块语法**: 使用 import/export 而非 require/module.exports
- **禁止通配符**: 不使用 `import * as` 导入整个模块
- **导入置顶**: 所有 import 语句必须放在文件顶部
- **合并导入**: 对同一路径的导入使用一个 import 语句
- **避免循环依赖**: 模块间不应形成循环依赖关系

```typescript
// ❌ 不推荐
import * as AirbnbStyleGuide from './AirbnbStyleGuide';
const utils = require('./utils');
import { a } from './utils';
import { b } from './utils';

// ✅ 推荐
import { es6 } from './AirbnbStyleGuide';
import foo, { named1, named2 } from 'foo';
import { a, b } from './utils';
export default es6;
```

### 3.3 解构赋值【推荐】

- **对象解构**: 访问多个对象属性时使用对象解构
- **数组解构**: 交换变量等场景使用数组解构
- **函数参数解构**: 使用解构简化函数参数
- **返回值解构**: 多个返回值时使用对象解构而非数组解构

```typescript
// ❌ 不推荐
function getFullName(user) {
  const firstName = user.firstName;
  const lastName = user.lastName;
  return `${firstName} ${lastName}`;
}

// ✅ 推荐
function getFullName({ firstName, lastName }) {
  return `${firstName} ${lastName}`;
}

// 多返回值示例
function processInput(input) {
  return { left, right, top, bottom };
}
const { left, top } = processInput(input);
```

## 4. React 开发规范

### 4.1 组件结构【推荐】

- **函数组件优先**: 优先使用函数式组件而非类组件
- **组件大小控制**: 单个组件不应超过 300 行，超过应考虑拆分
- **单一职责**: 每个组件应只负责一个功能或 UI 部分
- **组件分层**: 遵循展示组件和容器组件分离原则

```typescript
// ❌ 不推荐 - 职责过多
function TripCard({ trip }) {
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  
  // 获取评论、处理点赞、渲染UI等多种职责
  // ...大量代码...
}

// ✅ 推荐 - 职责分离
function TripCard({ trip, isLiked, onLike, comments }) {
  // 仅负责渲染UI
  return (
    <Card>
      <CardHeader title={trip.title} />
      <CardContent>{trip.description}</CardContent>
      <LikeButton isLiked={isLiked} onClick={onLike} />
      <CommentSection comments={comments} />
    </Card>
  );
}
```

### 4.2 类组件规范【可选】

- **可访问性修饰符**: 必须设置类成员的可访问性修饰符(public/private/protected)
- **成员排序**: 遵循 static > instance, field > constructor > method, public > protected > private 的排序规则

```typescript
// ✅ 推荐
class TripManager {
  public static defaultDuration = 7;
  private trips: Trip[];
  
  public constructor(initialTrips: Trip[] = []) {
    this.trips = initialTrips;
  }
  
  public addTrip(trip: Trip): void {
    this.trips.push(trip);
  }
  
  private validateTrip(trip: Trip): boolean {
    return !!trip.destination;
  }
}
```

### 4.3 Hooks 使用【必须】

- **规则遵循**: 严格遵循 React Hooks 规则（顶层调用、条件限制）
- **自定义 Hooks**: 复杂逻辑应抽取为自定义 Hooks
- **依赖数组**: `useEffect`、`useMemo`、`useCallback` 必须正确设置依赖数组
- **状态设计**: 避免冗余状态，相关状态应合并

```typescript
// ❌ 不推荐 - 依赖数组不完整
useEffect(() => {
  fetchUserData(userId);
}, []); // 缺少 userId 依赖

// ✅ 推荐
useEffect(() => {
  fetchUserData(userId);
}, [userId]);
```

### 4.4 性能优化【推荐】

- **列表渲染**: 列表项必须提供稳定的 `key` 属性
- **避免内联函数**: 事件处理函数应使用 `useCallback` 包装
- **避免不必要渲染**: 使用 `React.memo`、`useMemo` 优化渲染性能
- **懒加载组件**: 使用 `React.lazy` 和 `Suspense` 实现组件懒加载
- **数组高阶方法**: 使用 map、filter、reduce 等方法代替传统循环

```typescript
// ❌ 不推荐 - 每次渲染创建新函数
return <Button onClick={() => handleClick(id)} />

// ✅ 推荐
const handleButtonClick = useCallback(() => {
  handleClick(id);
}, [id, handleClick]);

return <Button onClick={handleButtonClick} />

// ❌ 不推荐 - 使用传统循环
const doubledValues = [];
for (let i = 0; i < numbers.length; i++) {
  doubledValues.push(numbers[i] * 2);
}

// ✅ 推荐 - 使用数组高阶方法
const doubledValues = numbers.map(num => num * 2);
```

## 5. Next.js 最佳实践

### 5.1 路由与页面【推荐】

- **路由组织**: 遵循 Next.js 的 App Router 约定
- **布局复用**: 适当使用 layout.tsx 复用页面布局
- **元数据管理**: 每个页面应设置适当的 metadata
- **静态生成优先**: 尽可能使用静态生成而非服务端渲染

### 5.2 数据获取【推荐】

- **服务器组件**: 优先使用服务器组件获取数据
- **缓存策略**: 合理设置数据缓存策略
- **错误处理**: 实现 error.tsx 处理数据获取错误
- **加载状态**: 实现 loading.tsx 提供加载状态 UI

```typescript
// ❌ 不推荐 - 客户端获取数据
'use client'

import { useEffect, useState } from 'react'

export default function Page() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])
  
  // ...
}

// ✅ 推荐 - 服务器组件获取数据
export default async function Page() {
  const data = await fetch('https://api.example.com/data').then(res => res.json())
  
  return <MainContent data={data} />
}
```

## 6. 状态管理

### 6.1 Context API 使用【推荐】

- **适当粒度**: Context 应按功能域划分，避免单一大 Context
- **性能考虑**: 避免频繁更新的状态放入 Context
- **默认值设计**: Context 应提供合理的默认值
- **类型安全**: Context 必须有明确的 TypeScript 类型

```typescript
// ❌ 不推荐 - 粒度过大
const AppContext = createContext<{
  user: User | null;
  trips: Trip[];
  destinations: Destination[];
  preferences: Preferences;
  // ...更多无关联状态
}>({});

// ✅ 推荐 - 按域划分
const UserContext = createContext<{
  user: User | null;
  updateUser: (user: User) => void;
}>({ user: null, updateUser: () => {} });

const TripContext = createContext<{
  trips: Trip[];
  addTrip: (trip: Trip) => void;
}>({ trips: [], addTrip: () => {} });
```

### 6.2 状态更新【必须】

- **不可变性**: 状态更新必须保持不可变性
- **批量更新**: 相关状态应批量更新
- **异步状态**: 异步操作状态应包含 loading/error 状态
- **状态重置**: 组件卸载时应重置相关状态
- **Promise 处理**: 禁止对条件语句中的 promise 误用，需要用 await 获取返回值

```typescript
// ❌ 不推荐 - Promise 误用
async function foo() {
  if (promise(1)) { // 恒为真，因为 promise 对象总是 truthy
    // Do something
  }
}

// ✅ 推荐
async function foo() {
  if (await promise(1)) {
    // Do something
  }
}
```

## 7. 安全与性能

### 7.1 安全实践【必须】

- **输入验证**: 所有用户输入必须经过验证
- **XSS 防护**: 避免直接使用 `dangerouslySetInnerHTML`
- **API 密钥保护**: 敏感信息不应出现在客户端代码中
- **认证检查**: 受保护路由必须验证用户身份

### 7.2 性能优化【推荐】

- **图片优化**: 使用 Next.js 的 Image 组件优化图片加载
- **字体优化**: 使用 next/font 优化字体加载
- **代码分割**: 适当使用动态导入分割代码
- **预取策略**: 合理使用预取提升用户体验

```typescript
// ❌ 不推荐 - 未优化图片
<img src="/images/large-photo.jpg" alt="景点图片" />

// ✅ 推荐 - 使用 Next.js Image 组件
import Image from 'next/image';

<Image 
  src="/images/large-photo.jpg"
  alt="景点图片"
  width={800}
  height={600}
  placeholder="blur"
  priority={isHero}
/>
```

## 8. 移动端适配

### 8.1 响应式设计【推荐】

- **移动优先**: 采用移动优先的响应式设计
- **视口设置**: 正确设置 viewport meta 标签
- **媒体查询**: 使用标准断点的媒体查询
- **触摸优化**: 确保触摸目标足够大(至少 44px)

### 8.2 iOS 适配【推荐】

- **安全区域**: 正确处理 iOS 安全区域
- **触感反馈**: 适当使用触感反馈增强体验
- **滚动行为**: 优化 iOS 滚动体验
- **状态栏**: 正确处理 iOS 状态栏样式

```typescript
// ❌ 不推荐 - 忽略安全区域
.footer {
  position: fixed;
  bottom: 0;
  height: 50px;
}

// ✅ 推荐 - 考虑安全区域
.footer {
  position: fixed;
  bottom: 0;
  height: calc(50px + env(safe-area-inset-bottom, 0px));
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

## 9. 代码质量保障

### 9.1 注释规范【必须】

- **单行注释**: 使用 `//` 进行单行注释，注释前加一个空格
- **多行注释**: 使用 `/* */` 进行多行注释
- **JSDoc 注释**: 使用 `/** */` 为函数、类、接口等添加文档注释
- **TODO/FIXME 标记**: 使用 `// TODO:` 和 `// FIXME:` 标记待办事项
- **注释内容**: 解释"为什么"而不是"是什么"，代码本身应该表达"是什么"

```typescript
// 好的示例

// 这是单行注释
/* 这是多行注释
   可以跨越多行 */

// TODO: 需要实现这个功能
// FIXME: 这里有性能问题需要修复

/**
 * 计算两点之间的距离
 * @param {Point} point1 - 第一个点
 * @param {Point} point2 - 第二个点
 * @returns {number} 两点之间的欧几里得距离
 */
function calculateDistance(point1: Point, point2: Point): number {
  // 使用勾股定理计算距离
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

### 9.2 比较和条件【推荐】

- **严格相等**: 使用 `===` 和 `!==` 而不是 `==` 和 `!=`
- **显式比较**: 布尔值使用简写，字符串和数字显式比较
- **三元表达式**: 避免嵌套三元表达式
- **条件语句块**: 即使只有一行代码也使用大括号
- **可选链操作符**: 使用 `?.` 替代 `&&` 链式判断
- **非空断言**: 禁止在 optional chaining 后使用非空断言

```typescript
// ❌ 不推荐
if (isValid == true) { /* */ }
if (name) { /* */ } // 当 name 为空字符串时也会判断为 false
const foo = a ? b : c ? d : e; // 嵌套三元
if (test) return false;
console.log(foo && foo.a && foo.a.b && foo.a.b.c);
console.log(foo?.bar!);

// ✅ 推荐
if (isValid === true) { /* */ }
if (name !== '') { /* */ }
if (collection.length > 0) { /* */ }

const foo = a ? b : (c ? d : e); // 使用括号明确优先级

if (test) {
  return false;
}

console.log(foo?.a?.b?.c);
```

## 09. 项目特定规则

### 09.1 数据处理【推荐】

- **日期处理**: 使用统一的日期处理库(如 date-fns)
- **地理数据**: 地理坐标必须使用标准格式(经度,纬度)
- **多语言支持**: 文本应使用 i18n 系统而非硬编码
- **货币处理**: 金额必须指定货币类型并正确格式化

### 09.2 UI 组件规范【推荐】

- **设计系统**: 遵循项目设计系统，使用预定义组件
- **无障碍**: 组件必须符合 WCAG 2.1 AA 级标准
- **动画效果**: 动画应考虑 reduced motion 偏好
- **主题支持**: 支持亮色/暗色主题切换

## 10. 代码审查与自动化

### 10.1 审查清单【必须】

- **功能完整性**: 代码是否完整实现需求
- **代码质量**: 是否符合本文档规范
- **性能影响**: 是否引入性能问题
- **安全隐患**: 是否存在安全风险
- **测试覆盖**: 是否有足够的测试

### 10.2 审查反馈【推荐】

- **具体问题**: 指出具体问题而非笼统评价
- **解决方案**: 提供改进建议而非仅指出问题
- **优先级**: 区分必须修复和建议改进的问题
- **知识分享**: 分享相关最佳实践和学习资源

### 10.3 自动化检查【必须】

- **ESLint 配置**: 启用 TypeScript、React、Next.js 相关规则
- **自定义规则**: 根据项目需求添加自定义规则
- **严重级别**: 区分 error 和 warning 级别规则
- **忽略规则**: 明确记录规则忽略原因
- **CI 集成**: 在 CI 流程中集成代码检查

### 10.4 预提交检查【必须】

- **预提交钩子**: 使用 husky 配置 git pre-commit 钩子
- **自动格式化**: 使用 prettier 自动格式化代码
- **类型检查**: 运行 TypeScript 类型检查
- **测试运行**: 执行单元测试和集成测试

## 11. AI 代码审查应用

### 11.1 AI 审查范围【推荐】

- **代码风格**: 检查命名、格式、结构等是否符合规范
- **潜在问题**: 识别可能的 bug、性能问题、安全漏洞
- **最佳实践**: 推荐更优的实现方式和设计模式
- **文档完整性**: 检查注释和文档是否充分

### 11.2 AI 审查流程【推荐】

- **提交前审查**: 在代码提交前使用 AI 进行初步审查
- **PR 审查辅助**: 在 PR 阶段使用 AI 辅助人工审查
- **持续改进**: 根据 AI 反馈持续优化代码库
- **学习资源**: 利用 AI 提供的学习资源提升团队能力

### 11.3 AI 审查限制【必须】

- **最终决策权**: AI 建议需经人工确认，最终决策权在开发团队
- **上下文理解**: 认识到 AI 可能缺乏完整业务上下文的理解
- **规则优先级**: 当 AI 建议与团队规则冲突时，以团队规则为准
- **持续更新**: 定期更新 AI 审查规则，适应项目发展

## 附录：规则快速参考

### 必须遵循的核心规则

1. 使用 TypeScript 类型系统，避免 any
2. 遵循命名规范（PascalCase、camelCase、kebab-case）
3. 保持代码格式一致（缩进、分号、空格）
4. 使用 ES6+ 特性（const/let、箭头函数、解构赋值）
5. 组件单一职责，避免过大组件
6. 正确使用 React Hooks，特别是依赖数组
7. 保持状态更新的不可变性
8. 验证所有用户输入，防止安全漏洞
9. 编写清晰的注释和文档
10. 实施自动化代码检查

### 推荐的最佳实践

1. 函数组件优先于类组件
2. 服务器组件获取数据优于客户端获取
3. 按功能域划分 Context
4. 优化图片和字体加载
5. 移动优先的响应式设计
6. 提供详细的代码审查反馈
7. 使用 AI 辅助代码审查流程

通过遵循这些规则，我们可以确保代码库的质量、一致性和可维护性，同时提高开发效率和团队协作
