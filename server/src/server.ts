import
{
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	InitializeResult,
	CodeActionParams,
	Range,
	DidChangeConfigurationParams,
	DidOpenTextDocumentParams,
	DidChangeTextDocumentParams,
	DidCloseTextDocumentParams,
	TextDocumentSyncKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

// 关键点1： 初始化 LSP 连接对象
const connection = createConnection(ProposedFeatures.all);

// 关键点2： 创建文档集合对象，用于映射到实际文档
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) =>
{
	// 明确声明插件支持的语言特性
	const result: InitializeResult = {
		capabilities: {
			// 代码诊断/修复
			codeActionProvider: true,
			textDocumentSync: {
				openClose: true,
				// 启用文档增量更新同步
				change: TextDocumentSyncKind.Incremental
			},
			executeCommandProvider: {
				commands: []
			}
		},
	};
	return result;
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();

function validate(document: TextDocument): void
{
	connection.sendDiagnostics({
		uri: document.uri,
		version: document.version,
		diagnostics: [
			Diagnostic.create(Range.create(0, 0, 0, 10), 'Something is wrong here', DiagnosticSeverity.Warning)
		]
	});
}

//当文档打开后触发
connection.onDidOpenTextDocument((params: DidOpenTextDocumentParams) =>
{
	// params.uri提供了文档的唯一地址。如果文档储存在硬盘上，那么就会是一个file类型的URI
	// params.text——提供了文档一开始的内容
});

// 文档的文本内容发生了改变时触发。
connection.onDidChangeTextDocument((params: DidChangeTextDocumentParams) =>
{
	// params.uri提供了文档的唯一地址。
	// params.contentChanges 包含文档的变动内容
});

// 文档关闭后触发。
connection.onDidCloseTextDocument((params: DidCloseTextDocumentParams) =>
{
	// params.uri提供了文档的唯一地址。
});

// 代码诊断/修复
connection.onCodeAction((params: CodeActionParams) =>
{
	return [];
});

// 执行命令
connection.onExecuteCommand(async (params) =>
{
	// 弹出一个输入框
	connection.workspace.applyEdit({
		documentChanges: [
		]
	});
});

// 用户修改配置文件时
connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) =>
{
	//...
});
