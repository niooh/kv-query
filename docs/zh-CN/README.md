<p align="center">
  <img src="../figures/logo.png" alt="kv-query logo" width="160px"/>
  <br>
  <a href="../../README.md">English</a> | 简体中文
</p>

一个轻量键值对查询工具，使用简单的文本格式存储和检索条目。<br>
已知最常见的查询模式是直接的 **键 -> 值** 查找。但在实际使用中，经常需要多个键指向同一个值，一个键匹配多个值，或是对键进行部分匹配。<br>
本项目正是为了应对这些场景：***用最少的输入获得所需结果，同时保持思维模型简单***。

## 特点

- 易于编写的键值条目，例如 `"tag1 | tag2" value`
- 支持精确或部分关键字搜索，AND/OR 逻辑
- 高性能：可快速查询和渲染数以万计的条目
- **Web UI**：单个 HTML 文件，提供命令行风格的界面
- **终端 CLI**：单个原生二进制文件
> **注意：** Web UI 和终端 CLI 是独立、可选的界面。无需同时配置两者。

## 数据来源

两个界面的初始数据都是一个扁平的数组，键和值交替排列：

- **Web UI** <- `data/raw.js`（首次启动时加载，之后保存在 `localStorage` 中）

```js
// [k1, v1, k2, v2, ...]
export const KV_DATA = [
  "apple | fruit | red", "A sweet red fruit",
  "banana | fruit | yellow", "A long yellow fruit",
  …
];
```

- **终端 CLI** <- `data/raw.nim`（直接编译进二进制文件）

```nim
# [k1, v1, k2, v2, ...]
const KV_DATA* = [
  "apple | fruit | red", "A sweet red fruit",
  "banana | fruit | yellow", "A long yellow fruit",
  …
];
```

---

## Web UI（浏览器使用）

### 启动 Server

需要安装 Node.js ≥ 22.18.0。

```bash
# git clone https://github.com/niooh/kv-query.git && cd kv-query/

npm install
npm run dev
```

### 构建

```bash
npm run build  # 输出到 dist/index.html
```

这会将所有资源内联到单个 `index.html`，可离线运行。

### 使用方法

#### 命令

在输入框中输入命令，结果会显示在下方。

| 命令 | 描述 |
|------|-----|
| `help` | 显示所有命令 |
| `help <cmd>` / `<cmd> -h` | 显示特定命令的帮助 |
| `get -a` / `ls` | 列出所有条目，按使用频率排序 |
| `get -s [terms]` | 精确匹配，OR 逻辑 |
| `get -sa [terms]` | 精确匹配，AND 逻辑 |
| `get -c [terms]` | 包含匹配，OR 逻辑 |
| `get -ca [terms]` | 包含匹配，AND 逻辑 |
| `add <key> <value>` | 在末尾添加新条目 |
| `clear` | 清空面板所有输出 |
| `edit` | 打开包含完整数据的文本区域供手动编辑 |
| `import` | 替换（`-a` 为追加）来自文件或编辑器的数据 |
| `export` | 下载为文本或复制到剪贴板 |

点击结果值可将其复制到剪贴板并自动增加使用频率，最常用的条目会排到前面。  
使用 `help <cmd>`（例如 `help edit`）查看每个命令的完整详情和示例。

#### `edit / import / export` 的文本格式

Web UI 的 `edit`、`import` 和 `export` 命令使用如下文本格式：

````
"tag1 | tag2 | tag3" the value text
"multi-line key" ```
Line 1
Line 2
```
// 注释和空行会被忽略
---
"multi-line key" 5
````

- `---` 之上的部分包含键值条目（单行或多行）。
- `---` 之下的部分是频率数据（仅显示频率大于 0 的条目）。
- 键用双引号括起来，支持转义字符，例如 `\"`、`\\`。
- 值从闭合引号和一个空格之后开始，可以包含任意字符。

### 数据持久化

Web UI 将其数据（条目 + 频率）存储在 `localStorage` 中。首次启动时会从 `data/raw.js` 加载默认数据集。

---

## 终端 CLI（独立可执行文件）

### 注意
- 此终端 CLI 在运行时不可编辑数据，只查询一个由 `data/raw.nim` 构建的预编译索引。
- 这里仅提供基本功能。如果您想要更智能的特性，例如编辑后自动重构建，并视复制功能为优先项，请查看 [kv-copy](https://github.com/niooh/kv-copy) 项目。

### 构建

需要安装 Nim ≥ 2.0.0（例如 2.2.6 版）。

```bash
npm run build:bin  # 输出到 dist/kv_query
```

### 使用方法

```bash
./dist/kv_query <cmd> [terms]
```

### 命令

| 命令 | 描述 |
|------|------|
| `-h` | 显示帮助 |
| `ls` | 列出所有条目 |
| `<mode> [terms]` | 查询并直接打印结果 |
| `c <mode> [terms]` | 查询并使用 OSC 52 将所选值复制到剪贴板 |

### 模式

`<mode>` 必须是以下之一：

| 模式 | 匹配类型 | 逻辑 |
|------|----------|------|
| `-s` | 精确 | OR |
| `-sa` | 精确 | AND |
| `-c` | 包含 | OR |
| `-ca` | 包含 | AND |

### 示例

```
$ ./dist/kv_query -s fruit
  apple | fruit | red  A sweet red fruit
  banana | fruit | yellow  A long yellow fruit
  tomato | fruit | red  vegetable : Botanically a fruit, culinarily a vegetable
  grape | fruit | purple  Small round fruit for wine

$ ./dist/kv_query c -c yellow
  1 banana | fruit | yellow  A long yellow fruit
Copied.
```

## 参与贡献

如果你想为此代码库做出贡献，请阅读 [Contributing Guide](../../.github/CONTRIBUTING.md)。
