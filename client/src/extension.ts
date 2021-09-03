'use strict';

import * as path from 'path';
import { ExtensionContext, window as Window } from 'vscode';
import { ExecuteCommandSignature, LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient/node';

import { CUSTOM_INPUT_CONTENT, CUSTOM_PICK_OPTION, CUSTOM_PICK_PLACEHOLDER } from './lib/constant'
import { getDocumentSelector, getTranslateResultsWithProgress } from './lib/util';

let client: LanguageClient;

export function activate(context: ExtensionContext): void
{
	// 指明语言服务器路径
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));

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
				const searchText = args[1] as string

				// 翻译结果相关进度条
				const translateResults = await getTranslateResultsWithProgress(searchText)

				// picker 选择结果
				const selected = await Window.showQuickPick(translateResults, { placeHolder: CUSTOM_PICK_PLACEHOLDER });

				if (selected === undefined) return

				// 选择自定义国际化内容（不是自定义翻译结果）
				else if (selected === CUSTOM_PICK_OPTION)
				{
					const inputBoxContent = await Window.showInputBox({
						value: CUSTOM_INPUT_CONTENT,
						placeHolder: CUSTOM_PICK_PLACEHOLDER,
					})
					if (!inputBoxContent) return

					args = [...args, inputBoxContent]
				}
				else
				{
					args = [...args, selected]
				}

				return next(command, args);
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