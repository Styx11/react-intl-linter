'use strict';

import
{
	CodeAction, CodeActionKind, Command, createConnection, TextDocumentEdit,
	TextDocuments, TextDocumentSyncKind, TextEdit, TextDocumentChangeEvent, ProposedFeatures, CodeActionParams, ExecuteCommandParams, Diagnostic
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { validateMessage } from './lib/validator';
import CommentManager from './lib/comment/CommentManager';
import { getCodeActionMessage, debounce, ContentChangeDelay, ExtensionSource, LinterCommands } from './lib/util';

const connection = createConnection(ProposedFeatures.all);
connection.console.info(`Sample server running in node ${process.version}`);

// 关键点2： 创建文档集合对象，用于映射到实际文档
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
documents.listen(connection);

connection.onInitialize(() =>
{
	// 声明语言服务器支持的特性
	return {
		capabilities: {
			codeActionProvider: true,
			textDocumentSync: {
				openClose: true,
				change: TextDocumentSyncKind.Incremental
			},
			executeCommandProvider: {
				commands: [LinterCommands.Extract]
			}
		}
	};
});

// 打开一个文件时
documents.onDidOpen((event: TextDocumentChangeEvent<TextDocument>) =>
{
	const document = event.document
	CommentManager.getInstance().setUriDocument(document.uri, document.getText())
	const diagnostics = validateMessage(document)
	connection.sendDiagnostics({ uri: document.uri, version: document.version, diagnostics })
});

// 当文件内容改变时
documents.onDidChangeContent(debounce((event: TextDocumentChangeEvent<TextDocument>) =>
{
	const document = event.document
	CommentManager.getInstance().setUriDocument(document.uri, document.getText())
	const diagnostics = validateMessage(document)
	connection.sendDiagnostics({ uri: document.uri, version: document.version, diagnostics })
}, ContentChangeDelay));

// 正在 Code Action 中处理的错误
let CodeActionDiagnostic: Diagnostic | null

// code action 事件
// 触发时机：光标变化时（点击文本或通过键盘移动光标）
// 返回：如果光标所在范围包含有错误信息（diagnostic）则会在 params.context.diagnostics 中存入一个非空数组，里面就有我们需要的 diagnostic 信息
connection.onCodeAction((params: CodeActionParams) =>
{
	const { diagnostics } = params.context
	const textDocument = documents.get(params.textDocument.uri);

	// 光标所在文本不包含错误信息时返回
	if (!Array.isArray(diagnostics) || !diagnostics.length || !textDocument) return undefined

	const diagnostic = CodeActionDiagnostic = diagnostics[0]

	// 用于 CodeAction 的文本和原始引号之间的文本
	const [codeActionMessage, rawMessage] = getCodeActionMessage(diagnostic.message);

	// 过滤其他插件发出的错误信息
	if (!diagnostic || !rawMessage || diagnostic.source !== ExtensionSource) return

	// 点击 CodeAction 后发出的指令会被 client middleware 捕获并处理
	return [
		CodeAction.create(
			codeActionMessage,
			Command.create(codeActionMessage, LinterCommands.Extract, textDocument.uri, rawMessage),
			CodeActionKind.QuickFix,
		)
	];
});

// Code Action 指令经 client middleware 处理后执行
connection.onExecuteCommand(async (params: ExecuteCommandParams) =>
{
	if (params.command !== LinterCommands.Extract || params.arguments === undefined)
	{
		return;
	}

	const textDocument = documents.get(params.arguments[0]);
	const newText = typeof params.arguments[2] === 'string' && params.arguments[2]

	if (textDocument === undefined || !newText || !CodeActionDiagnostic)
	{
		return;
	}

	connection.workspace.applyEdit({
		documentChanges: [
			TextDocumentEdit.create({ uri: textDocument.uri, version: textDocument.version }, [
				TextEdit.replace(CodeActionDiagnostic.range, newText)
			])
		]
	}).then(() => CodeActionDiagnostic = null)
});

connection.listen();
