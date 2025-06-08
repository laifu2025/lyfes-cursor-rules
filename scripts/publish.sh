#!/bin/bash

# Lyfe's Cursor Rules - 发布脚本
# 使用方法: bash scripts/publish.sh

echo "🚀 开始发布Lyfe's Cursor Rules扩展..."

# 检查是否已登录
echo "📋 检查发布者登录状态..."
if ! npx vsce ls-publishers | grep -q "lyfe"; then
    echo "❌ 未检测到发布者登录"
    echo "请先执行以下命令登录："
    echo "npx vsce login lyfe"
    echo "然后输入您的PAT令牌"
    exit 1
fi

# 编译TypeScript
echo "🔨 编译TypeScript代码..."
npm run compile

# 代码检查
echo "🔍 运行代码检查..."
npm run lint

# 创建扩展包
echo "📦 创建扩展包..."
npx vsce package

# 发布扩展
echo "🚀 发布到VS Code Marketplace..."
npx vsce publish

echo "✅ 发布完成！"
echo "🎉 用户现在可以在VS Code中搜索'Lyfe's Cursor Rules'来安装您的扩展了！" 