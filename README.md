# T3 Code 简体中文体验版

这是用于个人体验的 T3 Code iOS 汉化仓库，源代码来自 [pingdotgg/t3code](https://github.com/pingdotgg/t3code)，遵守上游 MIT 许可证（导入后保留原始 `LICENSE`）。

## 状态

此仓库最初为空。首次初始化需执行 **Actions → Bootstrap T3 Code Source → Run workflow**。工作流从上游指定提交导入完整源码，跳过上游 CI 工作流，并只修改 iOS 客户端本地界面文案及独立构建配置。

汉化为渐进式：第一批覆盖常用导航、设置、配对、审批、对话操作；Agent 输出、文件内容、CLI 命令、模型 ID 和通信协议不会被自动翻译。

## iPhone 使用方式

手机 App 通过 Tailscale HTTPS 或其他可信 HTTPS URL 与 VPS 上的官方 `t3 serve` 配对，**不是直接与进程 socket 通信**。不依赖原作者的 T3 Connect 账号系统。

## iOS GitHub 构建

1. 用自己的 Expo 账户创建一个项目，记录 `EXPO_PROJECT_ID`，生成 `EXPO_TOKEN`。
2. 在本仓库 **Settings → Secrets and variables → Actions** 中添加：
   - Secret: `EXPO_TOKEN`；
   - Variables: `EXPO_OWNER`、`EXPO_PROJECT_ID`；
   - 可选变量：`IOS_BUNDLE_ID`（默认 `com.bboytang.t3codecn`，必须是你拥有的唯一 ID）。
3. 在 **Actions → Build T3 Code CN iOS → Run workflow** 选择 `simulator`（无需苹果证书的模拟器产物）或 `device`（安装真机的签名 IPA）。
4. 真机模式需要自己的 Apple Developer Program 会员资格，并预先在 Expo EAS 配好 iOS 凭据和测试设备；仅有 GitHub Actions 并不能绕过苹果签名。
5. 使用 EAS 构建详情中的安装链接安装；也可以按 EAS 指引下载产物。

**安全约束：** 自定义 iOS App 使用自己的 Bundle ID 和 Expo 项目 ID；关闭上游 OTA；不加载原作者的云服务配置；保留原有 RPC、权限、配对流程。请勿把苹果证书/API Key 放到仓库文件。

## 源码更新

上游更新较频繁。当前初始化会绑定到工作流指定的上游 commit；更新前建议另开分支审查，避免直接覆盖汉化。此仓库内的导入工作流不会提交 PR、Issue，也不会连接或修改 VPS。

## 说明

这是非官方个人汉化实验，尚未经过完整 iOS 真机构建/端到端连接验证。