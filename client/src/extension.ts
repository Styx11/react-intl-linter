'use strict';

import * as path from 'path';
import { ExtensionContext, window as Window } from 'vscode';
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient/node';

import { getDocumentSelector } from './lib/util';

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
			executeCommand: async (command, args, next) =>
			{
				const selected = await Window.showQuickPick(['Visual Studio', 'Visual Studio Code']);
				if (selected === undefined)
				{
					return next(command, args);
				}
				args = args.slice(0);
				args.push(selected);
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