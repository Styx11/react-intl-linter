'use strict';

import * as path from 'path';
import { ExtensionContext, Uri, window as Window, workspace } from 'vscode';
import { ExecuteCommandSignature, LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient/node';

import ConfigManager, { LinterConfigItem } from './lib/ConfigManager';
import { LinterCommands, TranslationResultMap } from './lib/constant';
import { getDocumentSelector } from './lib/util/utils';
import DisableFileMiddleware from './middleware/disable-file';
import DisableLineMiddleware from './middleware/disable-line';
import ExtractMiddleware from './middleware/extract';

let client: LanguageClient;

export async function activate(context: ExtensionContext): Promise<void>
{
	// 指明语言服务器路径
	// 因为我们只能将 client 目录下的文件作为 extension 发布，所以需要复制 server/out 下的文件至 client/out/server 下
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

	// 国际化配置模版路径
	const intlConfigTemp = context.asAbsolutePath(path.join('client', 'src', 'lib', 'intl'))

	// 工作区的真实文件路径
	const workspaceFolderPath = workspace.workspaceFolders && workspace.workspaceFolders[0]

	// 工作区国际化配置文件夹路径
	const workspaceIntlConfigFolerPath = ConfigManager.getInstance().getConfig(LinterConfigItem.intlConfigPath)
	const workspaceIntlConfigPath = workspaceFolderPath && Uri.joinPath(workspaceFolderPath.uri, workspaceIntlConfigFolerPath)

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
			// 执行从语言服务器发送的要执行的命令
			executeCommand: async (command: string, args: any[], next: ExecuteCommandSignature) =>
			{
				try
				{
					switch (command)
					{
						case LinterCommands.Extract:
							await ExtractMiddleware(intlConfigTemp, workspaceIntlConfigPath, args, next);
							break;
						case LinterCommands.DisableLine:
							DisableLineMiddleware(args, next);
							break;
						case LinterCommands.DisableFile:
							DisableFileMiddleware(args, next);
							break;
						default:
							return
					}
				}
				catch (e)
				{
					Window.showErrorMessage(`抽取文本发生错误 ${e}`);
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
	// 清除翻译缓存
	TranslationResultMap.clear()

	if (!client)
	{
		return undefined;
	}
	return client.stop();
}