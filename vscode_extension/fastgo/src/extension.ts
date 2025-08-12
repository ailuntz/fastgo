// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import { i18n, t } from './i18n/i18n';

// Template style options for user selection
function getTemplateOptions() {
	return [
		{ label: t('templates.default'), value: 0 },
		{ label: t('templates.mihoyo'), value: 1 },
		{ label: t('templates.steam'), value: 2 },
		{ label: t('templates.hacker'), value: 3 },
		{ label: t('templates.apple'), value: 4 },
		{ label: t('templates.cyberpunk'), value: 5 },
		{ label: t('templates.galaxy'), value: 6 },
		{ label: t('templates.matrix'), value: 7 },
		{ label: t('templates.neon'), value: 8 },
		{ label: t('templates.corporate'), value: 9 },
		{ label: t('templates.retro'), value: 10 }
	];
}

// Get configuration values with user input fallback
async function getConfiguration(): Promise<{baseUrl: string, defaultTemplateStyle: number, pathPrefix: string, containerPath: string} | null> {
	const config = vscode.workspace.getConfiguration('fastgo');

	let baseUrl = config.get<string>('baseUrl');
	let pathPrefix = config.get<string>('pathPrefix');

	// Check if baseUrl is missing
	if (!baseUrl) {
		baseUrl = await vscode.window.showInputBox({
			prompt: t('config.serverUrl.prompt'),
			placeHolder: t('config.serverUrl.placeholder'),
			ignoreFocusOut: true,
			validateInput: (val) => {
				if (!val || !val.trim()) return t('config.serverUrl.empty');
				if (!val.startsWith('http://') && !val.startsWith('https://')) return t('config.serverUrl.invalid');
				return null;
			}
		});
		
		if (!baseUrl) {
			return null; // User cancelled
		}
		
		// Save baseUrl permanently to config
		await config.update('baseUrl', baseUrl, vscode.ConfigurationTarget.Global);
		showAutoClosingInfoMessage(t('config.serverUrl.saved'), 3000);
	}
	
	// Check if pathPrefix is missing
	if (!pathPrefix) {
		pathPrefix = await vscode.window.showInputBox({
			prompt: t('config.pathPrefix.prompt'),
			placeHolder: t('config.pathPrefix.placeholder'),
			ignoreFocusOut: true,
			validateInput: (val) => {
				if (!val || !val.trim()) return t('config.pathPrefix.empty');
				// Support both Unix/Linux paths (/path) and Windows paths (C:\path)
				if (!val.startsWith('/') && !(/^[A-Za-z]:[\\\/]/.test(val))) {
					return t('config.pathPrefix.invalid');
				}
				return null;
			}
		});
		
		if (!pathPrefix) {
			return null; // User cancelled
		}
		
		// Save pathPrefix permanently to config
		await config.update('pathPrefix', pathPrefix, vscode.ConfigurationTarget.Global);
		showAutoClosingInfoMessage(t('config.pathPrefix.saved'), 3000);
	}
	
	return {
		baseUrl,
		defaultTemplateStyle: config.get<number>('defaultTemplateStyle', 0),
		pathPrefix,
		containerPath: config.get<string>('containerPath', '/app/fastgo')
	};
}

// Check if path is valid for sharing (contains prefix)
function isPathValidForSharing(filePath: string, pathPrefix: string): boolean {
	if (!pathPrefix) {
		return false;
	}
	
	// Normalize paths for comparison (handle Windows vs Unix path separators)
	const normalizedFilePath = filePath.replace(/\\/g, '/');
	const normalizedPathPrefix = pathPrefix.replace(/\\/g, '/');
	
	return normalizedFilePath.startsWith(normalizedPathPrefix);
}

// Convert local path to container path
function convertToContainerPath(filePath: string, pathPrefix: string, containerPath: string): string {
	if (!pathPrefix) {
		return filePath;
	}
	
	// Normalize paths for comparison (handle Windows vs Unix path separators)
	const normalizedFilePath = filePath.replace(/\\/g, '/');
	const normalizedPathPrefix = pathPrefix.replace(/\\/g, '/');
	
	// Replace the path prefix with container path
	const containerFilePath = normalizedFilePath.replace(normalizedPathPrefix, containerPath);
	
	// Ensure container path uses Unix-style separators (for Docker container)
	return containerFilePath.replace(/\\/g, '/');
}

// Auto-closing message functions
function showAutoClosingInfoMessage(message: string, timeoutMs: number = 3000): void {
	const disposable = vscode.window.showInformationMessage(message, t('common.close'));
	
	// Auto-close after specified timeout
	setTimeout(() => {
		disposable.then(() => {
			// Message will be automatically dismissed
		});
	}, timeoutMs);
}

function showAutoClosingWarningMessage(message: string, timeoutMs: number = 2000): void {
	const disposable = vscode.window.showWarningMessage(message, t('common.close'));
	
	// Auto-close after specified timeout
	setTimeout(() => {
		disposable.then(() => {
			// Message will be automatically dismissed
		});
	}, timeoutMs);
}

function showAutoClosingErrorMessage(message: string, timeoutMs: number = 5000): void {
	const disposable = vscode.window.showErrorMessage(message, t('common.close'));
	
	// Auto-close after specified timeout
	setTimeout(() => {
		disposable.then(() => {
			// Message will be automatically dismissed
		});
	}, timeoutMs);
}

function showSuccessMessage(message: string): void {
	// For success messages (like share/upload links), show for 3 minutes to allow copying
	const disposable = vscode.window.showInformationMessage(
		message, 
		{ modal: false }, 
		t('common.copyToClipboard'), 
		t('common.close')
	);
	
	// Auto-close after 3 minutes (180000 ms)
	const autoCloseTimer = setTimeout(() => {
		// The message will be automatically dismissed by VS Code after this timeout
	}, 180000);
	
	// Handle user button clicks
	disposable.then((selection) => {
		clearTimeout(autoCloseTimer);
		if (selection === t('common.copyToClipboard')) {
			// Extract the link from the message
			const linkMatch = message.match(/(https?:\/\/[^\s]+)/);
			if (linkMatch) {
				vscode.env.clipboard.writeText(linkMatch[1]);
				showAutoClosingInfoMessage(t('common.copiedToClipboard'), 2000);
			}
		}
	});
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Initialize i18n
	i18n.init(context.extensionPath);

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!');

	// Hello World 命令
	context.subscriptions.push(
		vscode.commands.registerCommand('helloworld.helloWorld', () => {
		vscode.window.showInformationMessage(t('helloWorld.message'));
		})
	);

	// 语言切换命令
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.switchLanguage', async () => {
			const currentLocale = i18n.getCurrentLocale();
			const languages = [
				{ 
					label: `${currentLocale === 'zh-cn' ? '✅ ' : ''}中文 (简体)`, 
					value: 'zh-cn',
					description: currentLocale === 'zh-cn' ? '当前语言 Current' : ''
				},
				{ 
					label: `${currentLocale === 'en' ? '✅ ' : ''}English`, 
					value: 'en',
					description: currentLocale === 'en' ? '当前语言 Current' : ''
				}
			];
			
			const selected = await vscode.window.showQuickPick(languages, {
				placeHolder: 'Select Language / 选择语言',
				ignoreFocusOut: true
			});
			
			if (selected && selected.value !== currentLocale) {
				i18n.setLocale(selected.value);
				
				// Save language preference to workspace/global settings
				const config = vscode.workspace.getConfiguration('fastgo');
				await config.update('language', selected.value, vscode.ConfigurationTarget.Global);
				
				vscode.window.showInformationMessage(
					selected.value === 'zh-cn' ? '✅ 已切换到中文，重新加载窗口以完全生效' : '✅ Language switched to English, reload window for full effect',
					selected.value === 'zh-cn' ? '重新加载窗口' : 'Reload Window'
				).then(choice => {
					if (choice) {
						vscode.commands.executeCommand('workbench.action.reloadWindow');
					}
				});
			}
		})
	);

	// 创建分享链接命令
	context.subscriptions.push(
	vscode.commands.registerCommand('extension.createShareLink', async (uri: vscode.Uri) => {
		const filePath = uri.fsPath;
		const config = await getConfiguration();
		
		if (!config) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		// Check if path is valid for sharing
		if (!isPathValidForSharing(filePath, config.pathPrefix)) {
			showAutoClosingInfoMessage(t('share.pathNotValid'), 4000);
			return;
		}

		// 1. 输入最大下载次数
		const maxDownloadsInput = await vscode.window.showInputBox({
		prompt: t('share.maxDownloads.prompt'),
		placeHolder: t('share.maxDownloads.placeholder'),
		ignoreFocusOut: true,
		validateInput: (val) => {
			if (val && isNaN(Number(val))) return t('common.numberOnly');
			return null;
		}
		});

		if (maxDownloadsInput === undefined) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		// 2. 输入过期时间（小时）
		const expireInInput = await vscode.window.showInputBox({
		prompt: t('share.expireTime.prompt'),
		placeHolder: t('share.expireTime.placeholder'),
		ignoreFocusOut: true,
		validateInput: (val) => {
			if (val && isNaN(Number(val))) return t('common.numberOnly');
			return null;
		}
		});

		if (expireInInput === undefined) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		// 3. 选择模板样式
		const templateOptions = getTemplateOptions();
		const templateChoice = await vscode.window.showQuickPick(
			templateOptions.map(opt => ({
				label: opt.label,
				description: t('share.template.description', { value: opt.value.toString() }),
				value: opt.value
			})),
			{
				placeHolder: t('share.template.placeholder', {
					defaultTemplate: templateOptions.find(opt => opt.value === config.defaultTemplateStyle)?.label || 'Default'
				}),
				canPickMany: false,
				ignoreFocusOut: true
			}
		);

		if (!templateChoice) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		const expire_in_hours = 
		expireInInput ? parseInt(expireInInput) : 24;
		const expire_in = expire_in_hours * 3600;
		const max_downloads = maxDownloadsInput ? parseInt(maxDownloadsInput) : 3;
		const template_style = templateChoice ? templateChoice.value : config.defaultTemplateStyle;

		// Convert local path to container path
		const containerFilePath = convertToContainerPath(filePath, config.pathPrefix, config.containerPath);

		const payload = {
		real_path: containerFilePath,
		max_downloads,
		expire_in,
		template_style
		};

		try {
		const res = await sendRequest(`${config.baseUrl}/api/admin/download`, payload);
		const fullLink = `${config.baseUrl}/${res.link}`;  // 拼接完整的链接
		showSuccessMessage(t('share.success', { link: fullLink }));
		} catch (err) {
		showAutoClosingErrorMessage(t('common.createFailed', { error: (err as Error).message }));
		}
	})
	);

	// 创建上传链接命令
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.createUploadLink', async (uri: vscode.Uri) => {
		const filePath = uri.fsPath;
		const config = await getConfiguration();
		
		if (!config) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		// Check if path is valid for sharing
		if (!isPathValidForSharing(filePath, config.pathPrefix)) {
			showAutoClosingInfoMessage(t('share.pathNotValid'), 4000);
			return;
		}

		const stats = fs.lstatSync(filePath);

		// 如果是文件，则使用其所在目录；如果是目录，则直接用它
		const realPath = stats.isFile() ? path.dirname(filePath) : filePath;

		// 1. 输入过期时间（小时）
		const expireInInput = await vscode.window.showInputBox({
		prompt: t('upload.expireTime.prompt'),
		placeHolder: t('upload.expireTime.placeholder'),
		ignoreFocusOut: true,
		validateInput: (val) => {
			if (val && isNaN(Number(val))) return t('common.numberOnly');
			return null;
		}
		});

		if (expireInInput === undefined) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		// 2. 输入最大容量
		const gbNumInput = await vscode.window.showInputBox({
		prompt: t('upload.capacity.prompt'),
		placeHolder: t('upload.capacity.placeholder'),
		ignoreFocusOut: true,
		validateInput: (val) => {
			if (val && isNaN(Number(val))) return t('common.numberOnly');
			return null;
		}
		});

		if (gbNumInput === undefined) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		// 3. 选择模板样式
		const templateOptions = getTemplateOptions();
		const templateChoice = await vscode.window.showQuickPick(
			templateOptions.map(opt => ({
				label: opt.label,
				description: t('upload.template.description', { value: opt.value.toString() }),
				value: opt.value
			})),
			{
				placeHolder: t('upload.template.placeholder', {
					defaultTemplate: templateOptions.find(opt => opt.value === config.defaultTemplateStyle)?.label || 'Default'
				}),
				canPickMany: false,
				ignoreFocusOut: true
			}
		);

		if (!templateChoice) {
			showAutoClosingWarningMessage(t('common.cancelled'));
			return;
		}

		const expire_in_hours = expireInInput ? parseInt(expireInInput) : 24;
		const expire_in = expire_in_hours * 3600;
		const gb_num = gbNumInput ? parseInt(gbNumInput) : 2;
		const template_style = templateChoice ? templateChoice.value : config.defaultTemplateStyle;

		// Convert local path to container path
		const containerRealPath = convertToContainerPath(realPath, config.pathPrefix, config.containerPath);

		const payload = {
		real_path: containerRealPath,
		gb_num,
		expire_in,
		template_style
		};

		try {
		const res = await sendRequest(`${config.baseUrl}/api/admin/upload`, payload);
		const fullLink = `${config.baseUrl}/${res.link}`;  // 拼接完整的链接
		showSuccessMessage(t('upload.success', { link: fullLink }));
		} catch (err) {
		showAutoClosingErrorMessage(t('common.createFailed', { error: (err as Error).message }));
		}

		})
	);
}

function sendRequest(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const { hostname, port, pathname } = new URL(url);

    const options: http.RequestOptions = {
      hostname,
      port: port || 80,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error(t('common.invalidJson')));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
