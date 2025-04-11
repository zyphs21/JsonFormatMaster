# JSON 格式化大师

一个功能强大的 JSON 格式化工具，支持节点展开收起，并且能够处理嵌套的 JSON 字符串。

## 功能特点

- ✨ 格式化并美化 JSON 字符串
- 🌲 支持 JSON 节点展开和收起
- 🔄 能够处理嵌套的 JSON 字符串（JSON 值中的 JSON 字符串）
- 🔍 直观的树状结构展示
- 📋 一键复制格式化后的 JSON
- 🌓 支持亮色/暗色模式（跟随系统设置）

## 技术栈

- React 18
- TypeScript
- Tailwind CSS
- Vite

## 安装和运行

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 使用说明

1. 将 JSON 字符串粘贴到左侧输入框中
2. 点击"格式化 JSON"按钮
3. 在右侧查看格式化后的结果
4. 可以点击节点前的箭头展开或收起 JSON 节点
5. 如果需要解析嵌套的 JSON 字符串，请勾选"解析嵌套 JSON 字符串"选项

## 嵌套 JSON 解析示例

例如，以下 JSON 包含嵌套的 JSON 字符串：

```json
{
  "name": "产品",
  "metadata": "{\"version\":\"1.0\",\"details\":{\"created\":\"2023-01-01\"}}"
}
```

开启"解析嵌套 JSON 字符串"功能后，会将嵌套的 JSON 字符串解析为对象：

```json
{
  "name": "产品",
  "metadata": {
    "version": "1.0",
    "details": {
      "created": "2023-01-01"
    }
  }
}
```

## 许可证

MIT
