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
    },
    {
        name: '🟢 Node.js开发规则',
        description: 'Node.js后端开发的规范和实践',
        filename: 'nodejs.cursorrules'
    },
    {
        name: '🐍 Python开发规则',
        description: 'Python开发的编码规范和最佳实践',
        filename: 'python.cursorrules'
    },
    {
        name: '💚 Vue.js开发规则',
        description: 'Vue.js项目开发的最佳实践',
        filename: 'vue.cursorrules'
    }
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Lyfe\'s Cursor Rules插件已激活');

    // 注册添加规则命令
    let addRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.addCursorRules', async () => {
        await addCursorRules(context);
    });

    // 注册查看规则列表命令
    let listRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.listRules', async () => {
        await listAllRules(context);
    });

    context.subscriptions.push(addRulesCommand, listRulesCommand);

    // 显示欢迎信息
    vscode.window.showInformationMessage('🎉 Lyfe\'s Cursor Rules插件已准备就绪！');
}

async function addCursorRules(context: vscode.ExtensionContext) {
    try {
        console.log('开始执行 addCursorRules 函数');
        
        // 获取当前工作区
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('请先打开一个工作区！');
            return;
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        console.log('工作区路径:', workspaceRoot);

        // 显示调试信息
        vscode.window.showInformationMessage('正在加载模板列表...');

        // 创建快速选择菜单
        const quickPickItems = ruleTemplates.map(template => ({
            label: template.name,
            description: template.description,
            detail: `将创建 .cursorrules 文件到项目根目录`,
            template: template
        }));

        console.log('模板选项数量:', quickPickItems.length);

        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: '选择要添加的Cursor Rules模板',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selected) {
            console.log('用户取消了选择');
            return;
        }

        console.log('用户选择了:', selected.template.filename);

        // 获取模板文件路径
        const templatePath = path.join(context.extensionPath, 'templates', selected.template.filename);
        const targetPath = path.join(workspaceRoot, '.cursorrules');
        
        console.log('模板文件路径:', templatePath);
        console.log('目标文件路径:', targetPath);

        // 检查模板文件是否存在
        if (!fs.existsSync(templatePath)) {
            vscode.window.showErrorMessage(`模板文件不存在: ${templatePath}`);
            return;
        }

        // 检查目标文件是否已存在
        if (fs.existsSync(targetPath)) {
            const overwrite = await vscode.window.showWarningMessage(
                '.cursorrules文件已存在，是否要覆盖？',
                '覆盖', '取消'
            );
            if (overwrite !== '覆盖') {
                return;
            }
        }

        // 读取模板内容并写入目标文件
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        fs.writeFileSync(targetPath, templateContent, 'utf8');

        console.log('文件写入成功');

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
        console.error('插件执行错误:', error);
        vscode.window.showErrorMessage(`添加规则文件失败: ${error}`);
    }
}

async function listAllRules(context: vscode.ExtensionContext) {
    try {
        // 创建一个新的未命名文档来显示所有规则
        const content = generateRulesOverview();
        
        const doc = await vscode.workspace.openTextDocument({
            content: content,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
        
    } catch (error) {
        vscode.window.showErrorMessage(`显示规则列表失败: ${error}`);
    }
}

function generateRulesOverview(): string {
    let content = `# Lyfe's Cursor Rules模板集合\n\n`;
    content += `> 这是一个为中文开发者优化的Cursor Rules模板集合\n\n`;
    
    ruleTemplates.forEach((template, index) => {
        content += `## ${index + 1}. ${template.name}\n\n`;
        content += `**描述**: ${template.description}\n\n`;
        content += `**文件名**: \`${template.filename}\`\n\n`;
        content += `---\n\n`;
    });
    
    content += `## 使用方法\n\n`;
    content += `1. 使用命令面板（Ctrl+Shift+P / Cmd+Shift+P）\n`;
    content += `2. 输入"Lyfe"或"添加 .cursorrules 文件"\n`;
    content += `3. 选择适合你项目的规则模板\n`;
    content += `4. 规则文件将自动添加到项目根目录\n\n`;
    content += `## 自定义规则\n\n`;
    content += `你可以根据项目需要修改生成的 \`.cursorrules\` 文件，添加项目特定的规则和约定。\n\n`;
    content += `---\n\n`;
    content += `💡 **提示**: 这些规则旨在提升你与Cursor AI的协作效率，让AI更好地理解你的代码风格和项目要求。\n`;
    
    return content;
}

export function deactivate() {
    console.log('Lyfe\'s Cursor Rules插件已停用');
}