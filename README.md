# 音折 (YinZhe / MelodyFold)

一款基于 Tauri + TypeScript 开发的本地音乐播放器，采用三折叠界面设计，支持歌词显示、收藏、笔记等功能。

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)

> **音折** — 音乐与折叠的完美结合，三折之间，聆听无限。

## 功能特性

### 核心功能
- 🎵 **本地音乐播放** - 支持 MP3、WAV、FLAC、AAC、OGG、M4A、WMA 等格式
- 📂 **三折叠界面** - 手机窗口样式与完整界面平滑切换，窗口大小自适应
- 📝 **歌词显示** - 支持 LRC 格式歌词文件，自动同步滚动
- ⭐ **收藏功能** - 收藏喜欢的歌曲，快速访问
- 📝 **笔记功能** - 为每首歌曲添加听歌心得，自动关联

### 播放控制
- 🔀 **随机播放** - 随机打乱播放顺序
- 🔁 **循环播放** - 单曲循环或列表循环
- ⏱️ **定时关闭** - 支持 15/30/45/60 分钟定时停止
- 🔊 **音量控制** - 滑块调节音量大小

### 数据管理
- 💾 **音乐库持久化** - 自动保存播放列表，重启后自动恢复
- 📁 **文件夹扫描** - 递归扫描本地文件夹，批量导入音乐
- 💿 **多种添加方式** - 支持单文件选择、多文件选择、文件夹扫描

### 界面特性
- 🌓 **深色模式** - 支持浅色/深色/跟随系统主题
- 🎨 **现代化设计** - 简洁优雅的 UI，流畅的动画效果
- ⌨️ **键盘快捷键** - 空格播放/暂停，Ctrl+方向键切换歌曲
- 🪟 **无边框窗口** - 自定义标题栏，三按钮窗口控制

## 截图

![音折界面](screenshots/app.png)

## 下载安装

### Windows

1. 前往 [Releases](https://github.com/yourusername/yinzhe/releases) 页面
2. 下载 `音折_x.x.x_x64-setup.exe`
3. 双击运行安装程序
4. 按向导提示完成安装

### 从源码构建

#### 环境要求
- [Bun](https://bun.sh/) >= 1.0
- [Rust](https://rustup.rs/) >= 1.70
- Windows 10/11

```bash
# 克隆仓库
git clone https://github.com/yourusername/yinzhe.git
cd yinzhe

# 安装依赖
bun install

# 运行开发服务器
bun run tauri dev

# 构建生产版本
bun run tauri build
```

构建完成后，安装包位于 `src-tauri/target/release/bundle/nsis/音折_x.x.x_x64-setup.exe`

## 使用说明

### 添加音乐

**方式一：添加单个/多个文件**
1. 点击"添加本地音乐"按钮
2. 选择音乐文件（可多选）
3. 播放器会自动加载并播放

**方式二：扫描文件夹**
1. 点击"扫描文件夹"按钮
2. 选择包含音乐的文件夹
3. 自动递归扫描所有子文件夹中的音乐文件

### 歌词显示
- 将 `.lrc` 歌词文件放在与音乐文件相同的目录
- 歌词文件名与音乐文件名保持一致
- 展开三折叠界面后，右侧面板自动显示歌词

### 写笔记
1. 播放任意歌曲
2. 点击左侧"笔记"导航
3. 点击"+ 写新笔记"
4. 输入内容并保存，自动关联当前歌曲

### 数据存储
- 播放列表自动保存，重启应用后自动恢复
- 收藏和笔记数据保存在本地
- 音乐文件路径保存在 `%APPDATA%/com.yinzhe.music/playlist.json`

### 快捷键
| 快捷键 | 功能 |
|--------|------|
| `Space` | 播放/暂停 |
| `Ctrl + ←` | 上一首 |
| `Ctrl + →` | 下一首 |
| `Esc` | 折叠界面 / 关闭弹窗 |

## 项目结构

```
yinzhe/
├── src/                    # 前端源码
│   ├── main.ts            # 主逻辑
│   ├── styles.css         # 样式文件
│   └── types/             # 类型定义
├── src-tauri/             # Tauri 后端
│   ├── src/
│   │   └── lib.rs         # Rust 入口
│   ├── capabilities/      # 权限配置
│   ├── icons/             # 应用图标
│   └── Cargo.toml         # Rust 依赖
├── index.html             # 主页面
├── package.json           # Node 依赖
├── README.md              # 本文件
└── LICENSE                # Apache 2.0 协议
```

## 技术栈

- **框架**: [Tauri 2.0](https://tauri.app/) - Rust 后端 + Web 前端
- **前端**: TypeScript + 原生 DOM（无框架依赖）
- **构建工具**: Vite
- **包管理器**: Bun

## 开源协议

本项目采用 [Apache License 2.0](LICENSE) 开源协议。

```
Copyright 2024 音折 (YinZhe) Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 致谢

- [Tauri](https://tauri.app/) - 优秀的跨平台应用框架
- [Bun](https://bun.sh/) - 高性能的 JavaScript 运行时

## 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/yourusername/yinzhe/issues)
- 发送邮件至: your.email@example.com

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
"# MelodyFold" 
