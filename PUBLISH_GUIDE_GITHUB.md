# 使用GitHub账号发布VS Code扩展 - 简化指南

## 🎯 免费发布，无需信用卡！

### 第一步：准备GitHub账号

1. **如果有GitHub账号**：直接使用现有账号
2. **如果没有GitHub账号**：
   - 访问 https://github.com
   - 免费注册账号（无需信用卡）

### 第二步：创建发布者账号

1. **访问VS Code Marketplace管理页面**：
   - 地址：https://marketplace.visualstudio.com/manage
   
2. **使用GitHub登录**：
   - 点击 "Sign in with GitHub"
   - 授权访问权限

3. **创建发布者**：
   - Publisher ID: `laifuge`
   - Display Name: `来福哥`
   - Description: `专注于中文开发者的编程工具和模板`

### 第三步：获取访问令牌

**重要**：使用GitHub登录后，您需要的是 **Marketplace的访问令牌**，不是Azure的PAT令牌！

1. **在Marketplace管理页面**：
   - 找到 "Personal Access Tokens" 部分
   - 点击 "Create Token"
   - 选择权限：All accessible organizations
   - 复制并保存令牌
9ZJTBw6r3hoaqSx0movEtJl7MMktW22rIcX1wAQMndzwtZXG9C3KJQQJ99BFACAAAAAAAAAAAAASAZDO4DWh
### 第四步：发布扩展

```bash
# 登录发布者账号（使用Marketplace令牌，不是Azure PAT）
npx vsce login laifuge

# 输入刚才获取的Marketplace令牌

# 发布扩展
npx vsce publish
```

## ✅ 完全免费的优势

- ✅ 无需信用卡
- ✅ 无需Azure云服务
- ✅ 使用熟悉的GitHub账号
- ✅ 同样的发布效果

## 🔧 如果仍然要求信用卡

如果在任何步骤中遇到信用卡要求：

1. **立即停止当前流程**
2. **检查是否误点击了付费服务**
3. **寻找 "Continue with free" 或 "Skip" 选项**
4. **使用不同浏览器或无痕模式重试**

## 📞 需要帮助？

如果在GitHub方案中遇到任何问题，请告诉我具体在哪一步，我会立即帮您解决！

---

**记住**：发布VS Code扩展是完全免费的，永远不需要绑定信用卡！ 