import * as path from 'path';
import * as pkg from '../../package.json';
import { workspace, ExtensionContext } from 'vscode';

import
{
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind,
	DocumentSelector,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export const ClientId = 'React-Intl-Linter-Client'

export const ClientName = 'React Intl Linter Client'

// 获取 package.json 文件配置的激活事件 activationEvents 对应的语言
const getDocumentSelector = (): DocumentSelector =>
{
	const languagePrefix = /onLanguage:/
	const activationEvents = pkg.activationEvents
	if (!Array.isArray(activationEvents) || !activationEvents.length) return
	return activationEvents.reduce((prevLangs: DocumentSelector, curAction: string) =>
	{
		if (!languagePrefix.test(curAction)) return prevLangs
		const language = curAction.replace(languagePrefix, '')
		return language ? prevLangs.concat({ scheme: 'file', language: language }) : prevLangs
	}, [])
};


// VS Code 插件向外暴露两个函数：activate, deactivate 分别在插件激活/关闭时触发
export function activate(context: ExtensionContext)
{
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// 服务端配置信息
	// 对于 Node 形式的插件，只需要定义入口文件即可，vscode 会帮我们管理好进程的状态
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// 定义插件在什么时候生效
		documentSelector: getDocumentSelector(),
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		ClientId,
		ClientName,
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

export function deactivate(): Thenable<void> | undefined
{
	if (!client)
	{
		return undefined;
	}
	return client.stop();
}
