import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface RuleTemplate {
    name: string;
    description: string;
    filename: string;
}

// 预定义的规则模板
const ruleTemplates: RuleTemplate[] = [
    {
        name: '🚀 通用编程规则',
        description: '适用于所有编程语言的通用最佳实践',
        filename: 'general.cursorrules'
    },
    {
        name: '⚛️ React开发规则',
        description: 'React项目开发的最佳实践和规范',
        filename: 'react.cursorrules'
    }
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Lyfe\'s Cursor Rules插件已激活');

    // 调试信息
    vscode.window.showInformationMessage('🎉 Lyfe\'s Cursor Rules插件已激活！点击确定后将自动弹出选择菜单进行测试。', '确定').then(() => {
        vscode.commands.executeCommand('lyfes-cursor-rules.addCursorRules');
    });

    // 注册添加规则命令
    let addRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.addCursorRules', async () => {
        await addCursorRules(context);
    });

    context.subscriptions.push(addRulesCommand);
}

async function addCursorRules(context: vscode.ExtensionContext) {
    try {
        console.log('🔍 开始调试 addCursorRules 函数');
        
        // 检查扩展路径
        console.log('📁 扩展路径:', context.extensionPath);
        
        // 检查模板目录
        const templatesDir = path.join(context.extensionPath, 'templates');
        console.log('📂 模板目录:', templatesDir);
        
        if (!fs.existsSync(templatesDir)) {
            vscode.window.showErrorMessage(`❌ 模板目录不存在: ${templatesDir}`);
            return;
        }
        
        // 列出模板目录中的文件
        const files = fs.readdirSync(templatesDir);
        console.log('📄 模板文件:', files);
        vscode.window.showInformationMessage(`发现模板文件: ${files.join(', ')}`);

        // 获取当前工作区
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('⚠️ 请先打开一个工作区！');
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        console.log('🏠 工作区路径:', workspaceRoot);

        // 创建快速选择菜单
        const quickPickItems = ruleTemplates.map(template => ({
            label: template.name,
            description: template.description,
            detail: `将创建 .cursorrules 文件到项目根目录`,
            template: template
        }));

        console.log('📋 创建了选择项，数量:', quickPickItems.length);
        
        // 先显示一个信息提示
        vscode.window.showInformationMessage('即将显示模板选择菜单...');

        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: '选择要添加的Cursor Rules模板',
            matchOnDescription: true,
            matchOnDetail: true,
            canPickMany: false
        });

        if (!selected) {
            console.log('❌ 用户取消了选择');
            vscode.window.showInformationMessage('操作已取消');
            return;
        }

        console.log('✅ 用户选择了:', selected.template.filename);

        // 直接写入一个简单的测试内容
        const targetPath = path.join(workspaceRoot, '.cursorrules');
        const testContent = `# ${selected.template.name}\n\n这是一个测试内容，来自Lyfe's Cursor Rules插件。\n\n选择的模板: ${selected.template.filename}\n创建时间: ${new Date().toLocaleString()}`;
        
        fs.writeFileSync(targetPath, testContent, 'utf8');
        
        console.log('✅ 文件写入成功');

        // 显示成功信息并询问是否打开文件
        const openFile = await vscode.window.showInformationMessage(
            `✅ 成功添加 ${selected.template.name} 到项目！`,
            '打开文件', '关闭'
        );

        if (openFile === '打开文件') {
            const document = await vscode.workspace.openTextDocument(targetPath);
            await vscode.window.showTextDocument(document);
        }

    } catch (error) {
        console.error('❌ 插件执行错误:', error);
        vscode.window.showErrorMessage(`添加规则文件失败: ${error}`);
    }
}

export function deactivate() {
    console.log('Lyfe\'s Cursor Rules插件已停用');
}