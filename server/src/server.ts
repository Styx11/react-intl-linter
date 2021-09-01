'use strict';

import
{
	CodeAction, CodeActionKind, Command, createConnection, Position, TextDocumentEdit,
	TextDocuments, TextDocumentSyncKind, TextEdit, TextDocumentChangeEvent, ProposedFeatures
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { validateMessage } from './lib/validator';

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
				commands: ['sample.fixMe']
			}
		}
	};
});

// 打开一个文件时
documents.onDidOpen((event: TextDocumentChangeEvent<TextDocument>) =>
{
	const document = event.document
	const diagnostics = validateMessage(document)
	connection.sendDiagnostics({ uri: document.uri, version: document.version, diagnostics })
});

// 当文件内容改变时
documents.onDidChangeContent((event: TextDocumentChangeEvent<TextDocument>) =>
{
	const document = event.document
	const diagnostics = validateMessage(document)
	connection.sendDiagnostics({ uri: document.uri, version: document.version, diagnostics })
});

connection.onCodeAction((params) =>
{
	const textDocument = documents.get(params.textDocument.uri);
	if (textDocument === undefined)
	{
		return undefined;
	}
	const title = 'With User Input';
	return [CodeAction.create(title, Command.create(title, 'sample.fixMe', textDocument.uri), CodeActionKind.QuickFix)];
});

connection.onExecuteCommand(async (params) =>
{
	if (params.command !== 'sample.fixMe' || params.arguments === undefined)
	{
		return;
	}

	const textDocument = documents.get(params.arguments[0]);
	if (textDocument === undefined)
	{
		return;
	}
	const newText = typeof params.arguments[1] === 'string' ? params.arguments[1] : 'Eclipse';
	connection.workspace.applyEdit({
		documentChanges: [
			TextDocumentEdit.create({ uri: textDocument.uri, version: textDocument.version }, [
				TextEdit.insert(Position.create(0, 0), newText)
			])
		]
	});
});

connection.listen();
