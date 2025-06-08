import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// 常量定义
const EXTENSION_NAME = 'Lyfe\'s Cursor Rules';
const TEMPLATE_FILE_EXTENSION = '.mdc';
const SUPPORTED_ENCODINGS = ['utf8'] as const;

// 日志工具
class Logger {
    private static outputChannel: vscode.OutputChannel;

    static initialize() {
        this.outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);
    }

    static info(message: string) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] INFO: ${message}`;
        console.log(logMessage);
        this.outputChannel?.appendLine(logMessage);
    }

    static error(message: string, error?: any) {
        const timestamp = new Date().toISOString();
        const errorDetails = error instanceof Error ? error.message : String(error);
        const logMessage = `[${timestamp}] ERROR: ${message}${errorDetails ? ` - ${errorDetails}` : ''}`;
        console.error(logMessage);
        this.outputChannel?.appendLine(logMessage);
    }

    static show() {
        this.outputChannel?.show();
    }
}

interface RuleTemplate {
    name: string;
    description: string;
    filename: string;
}

interface CustomRole {
    name: string;
    description: string;
    icon: string;
    template: string;
    englishId: string; // 英文标识符，用于文件命名
}

interface QuickPickRuleItem extends vscode.QuickPickItem {
    template?: RuleTemplate;
    category?: RuleCategory;
    isCategory?: boolean;
}

interface QuickPickRoleItem extends vscode.QuickPickItem {
    role?: CustomRole;
}

// 模板分类定义
interface RuleCategory {
    name: string;
    icon: string;
    description: string;
    templates: RuleTemplate[];
}

// 扩展RuleTemplate接口
interface RuleTemplate {
    name: string;
    description: string;
    filename: string;
    category?: string;
}

// 按分类组织的规则模板
const ruleCategories: RuleCategory[] = [
    {
        name: '$(star) 通用规则',
        icon: '$(star)',
        description: '适用于所有项目的通用开发规范',
        templates: [
    {
                name: '通用编程规则',
        description: '适用于所有编程项目的通用规范和最佳实践',
        filename: 'general.mdc'
    },
            {
                name: 'TypeScript开发规则',
                description: 'TypeScript类型安全编程的最佳实践',
                filename: 'typescript.mdc'
            },
            {
                name: '自定义功能规则',
                description: '根据项目需求定制开发规范和AI助手功能',
                filename: 'custom-rules.mdc'
            }
        ]
    },
    {
        name: '$(globe) Web前端开发',
        icon: '$(globe)',
        description: 'Web前端技术栈开发规范',
        templates: [
    {
                name: 'React开发规则',
        description: 'React项目开发的最佳实践和规范',
        filename: 'react.mdc'
    },
    {
                name: 'Vue.js开发规则',
        description: 'Vue.js项目开发的最佳实践',
        filename: 'vue.mdc'
    },
    {
                name: 'Next.js开发规则',
        description: 'Next.js全栈开发的规范和实践',
        filename: 'nextjs.mdc'
    },
            {
                name: 'HTML/CSS网站开发规则',
                description: 'HTML/CSS/JavaScript网站开发的最佳实践',
                filename: 'html-website.mdc'
            }
        ]
    },
    {
        name: '$(device-mobile) 移动应用开发',
        icon: '$(device-mobile)',
        description: '跨平台移动应用开发规范',
        templates: [
            {
                name: 'Flutter开发规则',
                description: 'Flutter跨平台移动应用开发的最佳实践',
                filename: 'flutter.mdc'
            },
            {
                name: 'React Native开发规则',
                description: 'React Native跨平台移动应用开发规范',
                filename: 'react-native.mdc'
            },
            {
                name: 'uni-app开发规则',
                description: 'uni-app跨平台应用开发的最佳实践',
                filename: 'uniapp.mdc'
            },
            {
                name: 'Android开发规则',
                description: 'Android原生移动应用开发规范',
                filename: 'android.mdc'
            },
            {
                name: 'iOS开发规则',
                description: 'iOS原生移动应用开发规范',
                filename: 'ios.mdc'
            }
        ]
    },
    {
        name: '$(server) 后端服务开发',
        icon: '$(server)',
        description: '后端服务和API开发规范',
        templates: [
    {
                name: 'Node.js开发规则',
        description: 'Node.js后端开发的规范和实践',
        filename: 'nodejs.mdc'
    },
    {
                name: 'Python开发规则',
        description: 'Python开发的编码规范和最佳实践',
        filename: 'python.mdc'
    },
    {
                name: 'Go开发规则',
        description: 'Go语言开发的最佳实践和编码规范',
        filename: 'golang.mdc'
    },
    {
                name: 'FastAdmin/ThinkPHP规则',
                description: 'FastAdmin和ThinkPHP开发的完整规范',
                filename: 'fastadmin.mdc'
            }
        ]
    },
    {
        name: '$(tools) 其他平台开发',
        icon: '$(tools)',
        description: '特殊平台和工具开发规范',
        templates: [
    {
                name: 'Chrome扩展开发规则',
                description: 'Chrome浏览器扩展开发的最佳实践',
                filename: 'chrome-extension.mdc'
    },
    {
                name: '微信小程序开发规则',
                description: '微信小程序开发的规范和最佳实践',
                filename: 'wechat-miniprogram.mdc'
            }
        ]
    }
];

// 为了向后兼容，保留扁平化的模板列表
const ruleTemplates: RuleTemplate[] = ruleCategories.flatMap(category => 
    category.templates.map(template => ({
        ...template,
        category: category.name
    }))
);

// 预设AI角色模板
const customRoles: CustomRole[] = [
    {
        name: '🔍 代码审查专家',
        description: '专注代码质量、安全和性能优化',
        icon: '🔍',
        englishId: 'code-reviewer',
        template: `你是一位经验丰富的代码审查专家，拥有10年以上的软件开发经验。

专业特长：
- 代码质量评估和改进建议
- 安全漏洞识别和修复
- 性能瓶颈分析和优化
- 代码规范和最佳实践指导

工作方式：
- 总是先理解代码的业务逻辑和设计意图
- 提供具体的改进建议，而不是泛泛而谈
- 给出代码示例展示更好的实现方式
- 关注可维护性、可读性和扩展性
- 优先指出可能的安全风险和性能问题

沟通风格：
- 专业但友善，像经验丰富的同事
- 详细解释问题的原因和解决方案
- 鼓励最佳实践，但理解实际项目的限制`
    },
    {
        name: '🏗️ 系统架构师',
        description: '专注系统设计和架构优化',
        icon: '🏗️',
        englishId: 'system-architect',
        template: `你是一位资深的系统架构师，专注于大型分布式系统的设计和优化。

专业特长：
- 系统架构设计和模式选择
- 微服务架构和容器化部署
- 数据库设计和优化
- 分布式系统的一致性和可用性
- 技术选型和架构演进

工作方式：
- 从业务需求出发，设计合适的技术架构
- 考虑系统的可扩展性、可维护性和性能
- 提供多种方案对比和权衡分析
- 关注技术债务和长期演进策略
- 结合行业最佳实践和团队实际情况

沟通风格：
- 系统性思考，从全局角度分析问题
- 用图表和流程图辅助说明复杂概念
- 平衡理想方案和实际可行性`
    },
    {
        name: '👨‍🏫 编程导师',
        description: '帮助新手和中级开发者提升技能',
        icon: '👨‍🏫',
        englishId: 'coding-mentor',
        template: `你是一位耐心的编程导师，专门帮助新手和中级开发者提升技能。

专业特长：
- 基础概念的清晰解释
- 从简单到复杂的渐进式教学
- 常见错误的识别和纠正
- 学习路径规划和建议
- 实践项目的指导

工作方式：
- 使用简单易懂的语言解释复杂概念
- 提供大量的代码示例和练习
- 从错误中学习，分析常见陷阱
- 鼓励实践和动手编程
- 推荐相关的学习资源

沟通风格：
- 友善、耐心、鼓励性
- 循序渐进，不会一次性给出过多信息
- 善用比喻和生活例子解释技术概念`
    },
    {
        name: '📚 技术文档专家',
        description: '专业的技术文档撰写和优化',
        icon: '📚',
        englishId: 'tech-writer',
        template: `你是一位专业的技术文档撰写专家，擅长将复杂的技术内容转化为清晰的文档。

专业特长：
- API文档和接口说明编写
- 用户手册和操作指南制作
- 技术规范和设计文档撰写
- 代码注释和内联文档优化
- 多媒体内容的整合和呈现

工作方式：
- 从用户角度思考文档的可读性和实用性
- 使用结构化的格式和标准化的模板
- 提供完整的示例和使用场景
- 保持文档的时效性和准确性
- 注重文档的维护和版本管理

沟通风格：
- 清晰、准确、结构化
- 使用标准的技术写作规范
- 关注读者的不同技术背景`
    },
    {
        name: '🐛 调试专家',
        description: '快速定位和解决技术问题',
        icon: '🐛',
        englishId: 'debug-expert',
        template: `你是一位调试大师，擅长快速定位和解决各种技术问题。

专业特长：
- 错误日志分析和问题诊断
- 性能瓶颈的识别和优化
- 系统故障的排查和修复
- 调试工具的使用和配置
- 监控和报警系统的设置

工作方式：
- 系统性的问题分析方法
- 使用科学的排除法缩小问题范围
- 重现问题并验证解决方案
- 建立完善的日志和监控体系
- 制定预防性的质量保证措施

沟通风格：
- 条理清晰，步骤明确
- 提供详细的排查过程和思路
- 注重问题的根本原因分析`
    },
    {
        name: '⚡ 性能优化专家',
        description: '专注应用程序性能提升',
        icon: '⚡',
        englishId: 'performance-expert',
        template: `你是一位性能优化专家，专注于提升应用程序的运行效率。

专业特长：
- 代码级性能优化和算法改进
- 数据库查询优化和索引设计
- 前端性能优化和资源管理
- 服务器配置和系统调优
- 缓存策略和CDN部署

工作方式：
- 基于数据和指标进行优化决策
- 进行性能测试和基准测试
- 识别和消除性能瓶颈
- 权衡性能和其他质量属性
- 建立持续的性能监控体系

沟通风格：
- 数据驱动，用数字说话
- 提供前后对比和性能指标
- 关注投入产出比和优化效果`
    },
    {
        name: '🔮 产品经理',
        description: '专注互联网软件产品规划和管理',
        icon: '🔮',
        englishId: 'product-manager',
        template: `你是一位经验丰富的互联网产品经理，专注于软件产品的规划、设计和迭代优化。

专业特长：
- 产品需求分析和功能规划
- 用户体验设计和用户画像构建
- 数据分析和产品指标优化
- 竞品分析和市场调研
- 产品路线图制定和版本规划
- A/B测试设计和效果评估

工作方式：
- 从用户需求出发，结合业务目标制定产品策略
- 使用数据驱动的方法进行产品决策
- 跨部门协调，确保产品目标一致性
- 关注用户反馈，持续优化产品体验
- 平衡功能复杂度和用户易用性
- 制定清晰的PRD文档和产品规范

沟通风格：
- 逻辑清晰，善于用数据说话
- 以用户为中心，关注用户价值
- 善于协调不同团队的利益和需求
- 注重产品的商业价值和技术可行性平衡

特别关注的领域：
- 移动互联网产品和Web应用
- SaaS产品和企业级软件
- 电商平台和金融科技产品
- 社交媒体和内容平台
- 数据产品和AI应用`
    },
    {
        name: '📊 项目经理',
        description: '专注互联网软件项目管理和团队协作',
        icon: '📊',
        englishId: 'project-manager',
        template: `你是一位资深的互联网软件项目经理，专注于敏捷开发和团队协作管理。

专业特长：
- 敏捷开发流程管理（Scrum/Kanban）
- 项目计划制定和进度控制
- 团队协作和沟通协调
- 风险识别和问题解决
- 质量管理和交付保障
- 资源调配和时间管理

工作方式：
- 使用敏捷方法论，快速响应需求变化
- 建立透明的项目状态跟踪和报告机制
- 促进跨职能团队的有效协作
- 识别和消除项目阻碍因素
- 确保项目按时按质交付
- 持续改进开发流程和团队效率

管理工具和方法：
- 项目管理工具：Jira、Trello、Asana、禅道
- 协作工具：Slack、钉钉、飞书、Teams
- 文档管理：Confluence、语雀、Notion
- 版本控制：Git工作流管理
- CI/CD流程：自动化部署和测试

沟通风格：
- 目标导向，注重结果和效率
- 善于倾听，协调不同观点
- 及时沟通，透明化信息传递
- 问题导向，快速响应和解决

关注重点：
- 软件开发生命周期管理
- 技术团队的协作效率
- 产品交付质量和用户满意度
- 团队成长和能力提升
- 技术债务管理和架构演进`
    },
    {
        name: '🎨 自定义角色',
        description: '创建完全自定义的AI助手角色',
        icon: '🎨',
        englishId: 'custom-role',
        template: 'CUSTOM_TEMPLATE'
    }
];

/**
 * 验证当前工作区是否有效
 * @returns 工作区根路径或null
 */
function validateWorkspace(): string | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('请先打开一个工作区！');
        return null;
    }
    return workspaceFolders[0].uri.fsPath;
}

/**
 * 确保.cursor/rules目录存在
 * @param workspaceRoot 工作区根路径
 * @returns .cursor/rules目录路径
 */
function ensureCursorRulesDirectory(workspaceRoot: string): string {
    const cursorDir = path.join(workspaceRoot, '.cursor');
    const rulesDir = path.join(cursorDir, 'rules');
    
    // 确保.cursor目录存在
    if (!fs.existsSync(cursorDir)) {
        fs.mkdirSync(cursorDir, { recursive: true });
        Logger.info(`创建.cursor目录: ${cursorDir}`);
    }
    
    // 确保.cursor/rules目录存在
    if (!fs.existsSync(rulesDir)) {
        fs.mkdirSync(rulesDir, { recursive: true });
        Logger.info(`创建.cursor/rules目录: ${rulesDir}`);
    }
    
    return rulesDir;
}

/**
 * 扩展激活函数
 * @param context VS Code扩展上下文
 */
export function activate(context: vscode.ExtensionContext) {
    // 初始化日志
    Logger.initialize();
    Logger.info(`${EXTENSION_NAME}插件已激活`);

    // 注册主命令
    let addRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.addCursorRules', async () => {
        await addCursorRules(context);
    });

    // 注册查看规则列表命令
    let listRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.listRules', async () => {
        await listAllRules(context);
    });

    // 注册分类快速命令
    let addWebRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.addWebRules', async () => {
        await addCategoryRules(context, '$(globe) Web前端开发');
    });

    let addMobileRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.addMobileRules', async () => {
        await addCategoryRules(context, '$(device-mobile) 移动应用开发');
    });

    let addBackendRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.addBackendRules', async () => {
        await addCategoryRules(context, '$(server) 后端服务开发');
    });

    let addGeneralRulesCommand = vscode.commands.registerCommand('lyfes-cursor-rules.addGeneralRules', async () => {
        await addCategoryRules(context, '$(star) 通用规则');
    });

    context.subscriptions.push(
        addRulesCommand,
        listRulesCommand,
        addWebRulesCommand,
        addMobileRulesCommand,
        addBackendRulesCommand,
        addGeneralRulesCommand
    );

    // 显示欢迎信息
    vscode.window.showInformationMessage(`🎉 ${EXTENSION_NAME}插件已准备就绪！`);
}

// 直接进入特定分类的规则选择
async function addCategoryRules(context: vscode.ExtensionContext, categoryName: string) {
    try {
        Logger.info(`开始添加${categoryName}规则`);

        // 验证工作区
        const workspaceRoot = validateWorkspace();
        if (!workspaceRoot) {
            return;
        }

        // 查找对应的分类
        const category = ruleCategories.find(cat => cat.name === categoryName);
        if (!category) {
            vscode.window.showErrorMessage(`未找到分类: ${categoryName}`);
            return;
        }

        // 直接显示该分类下的模板（不显示返回按钮）
        const selectedTemplate = await showTemplatesInCategory(context, category, false);
        
        if (!selectedTemplate) {
            Logger.info('用户取消了模板选择');
            return;
        }

        // 确保.cursor/rules目录存在
        const rulesDir = ensureCursorRulesDirectory(workspaceRoot);
        
        // 根据选择的模板生成对应的文件名
        const filePath = path.join(rulesDir, selectedTemplate.filename);

        // 检查文件是否已存在
        if (fs.existsSync(filePath)) {
            const overwrite = await vscode.window.showWarningMessage(
                `${selectedTemplate.filename} 文件已存在，是否要覆盖？`,
                '覆盖', '取消'
            );
            if (overwrite !== '覆盖') {
                return;
            }
        }

        fs.writeFileSync(filePath, selectedTemplate.content, 'utf8');

        Logger.info('Cursor规则文件创建成功');
        vscode.window.showInformationMessage(
            `✅ ${selectedTemplate.filename} 文件已创建成功！`,
            '打开文件'
        ).then(selection => {
            if (selection === '打开文件') {
                vscode.workspace.openTextDocument(filePath).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });

    } catch (error) {
        Logger.error(`添加${categoryName}规则失败`, error);
        vscode.window.showErrorMessage(`添加规则失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * 添加Cursor规则文件到项目
 * @param context VS Code扩展上下文
 */
async function addCursorRules(context: vscode.ExtensionContext) {
    try {
        Logger.info('开始添加Cursor规则流程');
        
        // 验证工作区
        const workspaceRoot = validateWorkspace();
        if (!workspaceRoot) {
            return;
        }

        // 首先让用户选择规则类型
        const ruleTypeItems: QuickPickRuleItem[] = [
            {
                label: '$(person) 用户角色规则',
                description: '选择AI助手的专业角色和工作风格',
                detail: '定义AI助手的专业特长、工作方式和沟通风格'
            },
            {
                label: '$(file-code) 项目角色规则',
                description: '选择适合当前项目的技术栈规则模板',
                detail: '基于项目类型和技术栈的开发规范，提供代码规范、架构指导等'
            }
        ];

        const selectedType = await vscode.window.showQuickPick(ruleTypeItems, {
            placeHolder: '请选择规则类型',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (!selectedType) {
            Logger.info('用户取消了规则类型选择');
            return;
        }

        let selectedTemplate: { content: string; filename: string } | null = null;

        if (selectedType.label.includes('用户角色规则')) {
            // 显示用户角色选择
            selectedTemplate = await handleCustomRoleSelection(context);
        } else {
            // 显示分类菜单
            selectedTemplate = await showCategorizedRuleSelection(context);
        }

        if (!selectedTemplate) {
            Logger.info('用户取消了模板选择或模板加载失败');
            return;
        }

        // 确保.cursor/rules目录存在
        const rulesDir = ensureCursorRulesDirectory(workspaceRoot);
        
        // 根据选择的模板生成对应的文件名
        const filePath = path.join(rulesDir, selectedTemplate.filename);

        Logger.info(`准备写入文件: ${filePath}`);

        // 检查文件是否已存在
        if (fs.existsSync(filePath)) {
            const overwrite = await vscode.window.showWarningMessage(
                `${selectedTemplate.filename} 文件已存在，是否要覆盖？`,
                '覆盖', '取消'
            );
            if (overwrite !== '覆盖') {
                return;
            }
        }

        fs.writeFileSync(filePath, selectedTemplate.content, 'utf8');

        Logger.info('Cursor规则文件创建成功');
        vscode.window.showInformationMessage(
            `✅ ${selectedTemplate.filename} 文件已创建成功！`,
            '打开文件'
        ).then(selection => {
            if (selection === '打开文件') {
                vscode.workspace.openTextDocument(filePath).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });

    } catch (error) {
        Logger.error('添加Cursor规则失败', error);
        vscode.window.showErrorMessage(`添加规则失败: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// 显示分类化的规则选择菜单
async function showCategorizedRuleSelection(context: vscode.ExtensionContext): Promise<{ content: string; filename: string } | null> {
    // 第一级：显示分类选择
    const categoryItems: QuickPickRuleItem[] = ruleCategories.map(category => ({
        label: category.name,
        description: category.description,
        detail: `包含 ${category.templates.length} 个模板`,
        category: category,
        isCategory: true
    }));

    // 添加"查看所有模板"选项
    categoryItems.push({
        label: '$(list-unordered) 查看所有模板',
        description: '显示所有可用的规则模板',
        detail: `共 ${ruleTemplates.length} 个模板`,
        isCategory: false
    });

    const selectedCategory = await vscode.window.showQuickPick(categoryItems, {
        placeHolder: '请选择开发类型分类',
            matchOnDescription: true,
            matchOnDetail: true
        });

    if (!selectedCategory) {
        return null;
        }

    // 如果选择了"查看所有模板"，显示扁平化列表
    if (!selectedCategory.isCategory) {
        return await showAllTemplatesSelection(context);
    }

    // 第二级：显示该分类下的模板
    if (selectedCategory.category) {
        return await showTemplatesInCategory(context, selectedCategory.category);
    }

    return null;
        }

// 显示分类内的模板选择
async function showTemplatesInCategory(context: vscode.ExtensionContext, category: RuleCategory, showBackButton: boolean = true): Promise<{ content: string; filename: string } | null> {
    const templateItems: QuickPickRuleItem[] = category.templates.map(template => ({
        label: `$(file-code) ${template.name}`,
        description: template.description,
        template: template
    }));

    // 只在需要时添加返回选项
    if (showBackButton) {
        templateItems.unshift({
            label: '$(arrow-left) 返回分类选择',
            description: '返回上一级分类菜单',
            detail: '选择其他分类的模板'
        });
    }

    const selectedItem = await vscode.window.showQuickPick(templateItems, {
        placeHolder: `选择 ${category.name} 下的模板`,
        matchOnDescription: true,
        matchOnDetail: true
    });

    if (!selectedItem) {
        return null;
                }
                
    // 如果选择了返回，递归调用分类选择
    if (selectedItem.label.includes('返回分类选择')) {
        return await showCategorizedRuleSelection(context);
    }

    // 加载选中的模板
    if (selectedItem.template) {
        return await loadTemplate(context, selectedItem.template.filename);
    }

    return null;
                }

// 显示所有模板的扁平化列表
async function showAllTemplatesSelection(context: vscode.ExtensionContext): Promise<{ content: string; filename: string } | null> {
    const allTemplateItems: QuickPickRuleItem[] = ruleTemplates.map(template => ({
        label: `$(file-code) ${template.name}`,
        description: template.description,
        detail: template.category ? `分类: ${template.category.replace(/^\$\([^)]+\)\s*/, '')}` : undefined,
        template: template
    }));
                
    // 添加返回选项
    allTemplateItems.unshift({
        label: '$(arrow-left) 返回分类选择',
        description: '返回上一级分类菜单',
        detail: '按分类浏览模板'
    });

    const selectedItem = await vscode.window.showQuickPick(allTemplateItems, {
        placeHolder: '选择规则模板 (共 ' + ruleTemplates.length + ' 个)',
        matchOnDescription: true,
        matchOnDetail: true
    });

    if (!selectedItem) {
        return null;
                }

    // 如果选择了返回，递归调用分类选择
    if (selectedItem.label.includes('返回分类选择')) {
        return await showCategorizedRuleSelection(context);
    }

    // 加载选中的模板
    if (selectedItem.template) {
        return await loadTemplate(context, selectedItem.template.filename);
    }

    return null;
        }

// 加载模板文件内容
async function loadTemplate(context: vscode.ExtensionContext, filename: string): Promise<{ content: string; filename: string } | null> {
    try {
        const templatePath = path.join(context.extensionPath, 'templates', filename);
        
        if (!fs.existsSync(templatePath)) {
            vscode.window.showErrorMessage(`模板文件不存在: ${filename}`);
            return null;
            }
        
        const content = fs.readFileSync(templatePath, 'utf8');
        
        if (!content.trim()) {
            vscode.window.showErrorMessage(`模板文件内容为空: ${filename}`);
            return null;
        }

        // 生成规则文件名：将 template.mdc 转换为 template-rules.mdc
        const baseFileName = path.basename(filename, '.mdc');
        const ruleFileName = `${baseFileName}-rules.mdc`;
        
        return { content, filename: ruleFileName };
    } catch (error) {
        vscode.window.showErrorMessage(`读取模板文件失败: ${error instanceof Error ? error.message : error}`);
        return null;
    }
}

/**
 * 处理自定义角色选择
 * @param context VS Code扩展上下文
 * @returns 生成的角色配置内容和文件名或null（如果用户取消）
 */
async function handleCustomRoleSelection(context: vscode.ExtensionContext): Promise<{ content: string; filename: string } | null> {
    // 显示角色选择菜单
    const rolePickItems: QuickPickRoleItem[] = customRoles.map(role => ({
        label: role.name,
        description: role.description,
        detail: '选择此角色模板',
        role: role
    }));

    const selectedRole = await vscode.window.showQuickPick(rolePickItems, {
        placeHolder: '选择AI助手角色类型',
        matchOnDescription: true,
        matchOnDetail: true
    });

    if (!selectedRole || !selectedRole.role) {
        return null;
    }

    // 如果选择自定义角色，提供完整模板
    if (selectedRole.role.template === 'CUSTOM_TEMPLATE') {
        const templatePath = path.join(context.extensionPath, 'templates', 'custom-rules.mdc');
        try {
            if (fs.existsSync(templatePath)) {
                const content = fs.readFileSync(templatePath, 'utf8');
                return { content, filename: 'custom-rules-rules.mdc' };
            } else {
                vscode.window.showErrorMessage('自定义功能规则模板文件不存在');
                return null;
            }
        } catch (error) {
            vscode.window.showErrorMessage(`读取模板文件失败: ${error instanceof Error ? error.message : error}`);
            return null;
        }
    }

    // 生成精简的角色配置
    const roleConfig = generateRoleConfig(selectedRole.role);
    return { content: roleConfig, filename: `${selectedRole.role.englishId}-role.mdc` };
}

/**
 * 生成角色配置内容
 * @param role 自定义角色对象
 * @returns 格式化的角色配置字符串
 */
function generateRoleConfig(role: CustomRole): string {
    const config = `# ${role.name} - AI助手角色配置

${role.template}

## 使用说明

此配置将AI助手设定为${role.name}，专门为你的项目提供${role.description}。

### 主要特点：
- 专业的领域知识和经验
- 针对性的问题解决方案
- 符合角色特点的沟通风格
- 实用的建议和最佳实践

### 自定义建议：
你可以根据项目特点进一步调整此配置：
1. 添加项目特定的技术栈信息
2. 调整沟通风格以符合团队文化
3. 增加项目相关的约束条件
4. 定制输出格式和代码规范

### 使用技巧：
- 在对话中明确提及你需要的具体帮助
- 提供足够的上下文信息
- 利用角色的专业特长解决复杂问题
- 根据反馈效果调整角色配置

---

💡 **提示**: 如果需要更多角色选项或完整的定制指南，可以重新运行插件并选择"🎨 自定义角色"获取完整模板。
`;

    return config;
}

/**
 * 显示所有规则模板的列表
 * @param context VS Code扩展上下文
 */
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
        Logger.error('显示规则列表失败', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`显示规则列表失败: ${errorMessage}`);
    }
}

/**
 * 生成规则模板概览内容
 * @returns 格式化的Markdown内容
 */
function generateRulesOverview(): string {
            let content = `# Lyfe's Cursor Rules模板集合\n\n`;
    content += `> 这是一个为中文开发者优化的Cursor Rules模板集合\n\n`;
    
    ruleTemplates.forEach((template, index) => {
        content += `## ${index + 1}. ${template.name}\n\n`;
        content += `**描述**: ${template.description}\n\n`;
        content += `**文件名**: \`${template.filename}\`\n\n`;
        
        // 为自定义功能规则模板添加特别说明
        if (template.filename === 'custom-rules.mdc') {
            content += `**特别功能**: 提供智能角色选择，包含以下预设角色：\n`;
            customRoles.forEach((role, roleIndex) => {
                if (role.template !== 'CUSTOM_TEMPLATE') {
                    content += `- ${role.name}: ${role.description}\n`;
                }
            });
            content += `- 🎨 完全自定义: 获取完整的角色定制模板\n\n`;
        }
        
        content += `---\n\n`;
    });
    
    content += `## 使用方法\n\n`;
    content += `1. 使用命令面板（Ctrl+Shift+P / Cmd+Shift+P）\n`;
            content += `2. 输入"Lyfe"或"添加 Cursor 规则文件"\n`;
    content += `3. 选择适合你项目的规则模板\n`;
    content += `4. 规则文件将自动添加到项目根目录\n\n`;
    content += `## 自定义规则\n\n`;
    content += `你可以根据项目需要修改生成的规则文件，添加项目特定的规则和约定。\n\n`;
    content += `---\n\n`;
    content += `💡 **提示**: 这些规则旨在提升你与Cursor AI的协作效率，让AI更好地理解你的代码风格和项目要求。\n`;
    
    return content;
}

/**
 * 扩展停用函数
 */
export function deactivate() {
    Logger.info(`${EXTENSION_NAME}插件已停用`);
}