# 发布指南

## 插件已创建完成！

您的"来福哥的Cursor Rules"插件已经成功创建并打包。以下是发布到VS Code Marketplace的步骤：

## 📦 当前状态

✅ 插件代码已完成  
✅ 模板文件已创建  
✅ 文档已完善  
✅ 插件已打包 (`laifuge-cursor-rules-1.0.0.vsix`)

## 🚀 发布步骤

### 1. 创建Azure DevOps账号
1. 访问 https://dev.azure.com
2. 使用Microsoft账号登录或注册

### 2. 创建Personal Access Token
1. 在Azure DevOps中，点击右上角的用户头像
2. 选择"Personal access tokens"
3. 点击"New Token"
4. 设置以下信息：
   - Name: `vscode-marketplace`
   - Organization: 选择你的组织
   - Expiration: 选择过期时间
   - Scopes: 选择"Custom defined"，然后勾选"Marketplace" -> "Manage"
5. 点击"Create"并保存生成的token

### 3. 创建发布者账号
```bash
npx vsce create-publisher laifuge
```
按提示填写信息：
- Publisher name: `laifuge`
- Display name: `来福哥`
- Description: `专注于中文开发者体验的插件开发者`

### 4. 登录发布者账号
```bash
npx vsce login laifuge
```
输入之前创建的Personal Access Token

### 5. 发布插件
```bash
npx vsce publish
```

## 🔧 本地测试

在发布前，您可以先在本地测试插件：

1. 在Cursor中按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (macOS)
2. 输入 "Extensions: Install from VSIX..."
3. 选择生成的 `laifuge-cursor-rules-1.0.0.vsix` 文件
4. 重启Cursor
5. 测试插件功能

## 📝 插件功能

您的插件包含以下功能：

### 命令
- `来福哥: 添加 .cursorrules 文件` - 添加规则模板到项目
- `来福哥: 查看所有规则模板` - 查看所有可用模板

### 模板
- 🚀 通用编程规则
- ⚛️ React开发规则  
- 🟢 Node.js开发规则
- 🐍 Python开发规则
- 💚 Vue.js开发规则

## 🎯 使用方法

1. 用户安装插件后
2. 在命令面板中输入"来福哥"
3. 选择"添加 .cursorrules 文件"
4. 从列表中选择合适的模板
5. 插件会自动将规则文件添加到项目根目录

## 📈 后续优化建议

1. **图标优化**: 创建一个128x128的专业图标
2. **模板扩展**: 添加更多技术栈的模板（如Java、Go、Rust等）
3. **自定义功能**: 允许用户创建和保存自定义模板
4. **多语言支持**: 添加英文版本的模板
5. **版本管理**: 定期更新模板内容

## 🔄 更新插件

当需要更新插件时：

1. 修改代码
2. 更新 `package.json` 中的版本号
3. 更新 `CHANGELOG.md`
4. 重新编译和打包：
   ```bash
   npm run compile
   npx vsce package
   npx vsce publish
   ```

## 📞 支持

如果在发布过程中遇到问题，可以：
1. 查看VS Code官方文档：https://code.visualstudio.com/api/working-with-extensions/publishing-extension
2. 检查Azure DevOps设置
3. 确认Personal Access Token权限

祝您发布成功！🎉