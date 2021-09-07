'use strict';

import * as path from 'path';
import { ExtensionContext, window as Window, Uri, workspace } from 'vscode';
import { ExecuteCommandSignature, LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient/node';

import { getIntlMessage } from './lib/constant';
import { getIntlConfig, initializeWorkplaceIntlConfig, writeConfigIntoWorkSpace, writeResultIntoIntlConfig } from './lib/file';
import { getDocumentSelector, getExistingIntl, getIntlIdWithQuickPick, getTranslateResultsWithProgress, processArgsWithSelectResult } from './lib/util';

let client: LanguageClient;

export async function activate(context: ExtensionContext): Promise<void>
{
	// 指明语言服务器路径
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

	// 国际化配置模版路径
	const intlConfigTemp = context.asAbsolutePath(path.join('client', 'src', 'lib', 'intl'))

	// 工作区的真实文件路径
	const workspaceFolderPath = workspace.workspaceFolders && workspace.workspaceFolders[0]

	// 工作区国际化配置文件夹路径
	const workspaceIntlConfigPath = workspaceFolderPath && Uri.joinPath(workspaceFolderPath.uri, path.join('/src', 'intl'))


	// 语言服务器配置
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc, options: { cwd: process.cwd() } },
		debug: { module: serverModule, transport: TransportKind.ipc, options: { execArgv: ['--nolazy', '--inspect=6011'], cwd: process.cwd() } }
	};

	// 客户端配置
	let clientOptions: LanguageClientOptions = {
		documentSelector: getDocumentSelector(),
		diagnosticCollectionName: 'react-intl-linter',
		revealOutputChannelOn: RevealOutputChannelOn.Never,
		progressOnInitialization: true,
		middleware: {
			// 样例中间件
			executeCommand: async (command: string, args: any[], next: ExecuteCommandSignature) =>
			{
				// 想要替换的中文文本
				const searchText = args[1] as string

				// 初始化工作区国际化配置文件
				await initializeWorkplaceIntlConfig(intlConfigTemp, workspaceIntlConfigPath)

				// 获取已有配置文件
				const [zhConfig, enConfig] = await getIntlConfig(workspaceIntlConfigPath)

				// 查找工作区是否已存在对应中文文本配置
				const { intlId, zhText, enText } = getExistingIntl(searchText, zhConfig, enConfig)

				// 工作区已存在对应配置
				if (intlId && zhText && enText)
				{
					// 传给语言服务器的 onExecuteCommand 函数
					return next(command, [...args, getIntlMessage(intlId)])
				}

				// 翻译结果相关进度条
				const translateResults = await getTranslateResultsWithProgress(searchText)

				// picker 选择结果
				const [selectedIntlId, translationText] = await getIntlIdWithQuickPick(translateResults, zhConfig);

				// 获得处理后的参数，用于传给语言服务器的 onExecuteCommand 函数
				const { newArgs, customIntlId } = await processArgsWithSelectResult(args, selectedIntlId)

				if (!newArgs || !selectedIntlId || !translationText) return

				try
				{
					// 替换文本操作可以首先实行减少用户对延迟的感知
					// 文件写入错误和文本替换并不冲突，只不过需要用户重新执行一遍替换操作来执行文件写入或手动写入文件
					next(command, newArgs)

					// 获取新的 intl 配置文件
					const [newZhConfig, newEnConfig] = await writeResultIntoIntlConfig(
						customIntlId || selectedIntlId,
						searchText,
						translationText,
						zhConfig,
						enConfig
					)

					// 在这里执行写入配置文件操作（这个操作是费时的）
					await writeConfigIntoWorkSpace(newZhConfig, newEnConfig, workspaceIntlConfigPath)
				}
				catch (e)
				{
					Window.showErrorMessage('写入国际化文件发生错误！')
					console.log('write config failed', e)
				}
			}
		}
	};

	try
	{
		client = new LanguageClient('React-Intl-Linter', serverOptions, clientOptions);
	} catch (err)
	{
		Window.showErrorMessage(`The extension couldn't be started. See the output channel for details.`);
		return;
	}
	client.registerProposedFeatures();

	context.subscriptions.push(
		client.start(),
	);
}

export function deactivate(): Thenable<void> | undefined
{
	if (!client)
	{
		return undefined;
	}
	return client.stop();
}