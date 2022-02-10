import { Diagnostic, ExecuteCommandParams, TextDocumentEdit, TextEdit, _, _Connection } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { EnableComment } from "../comment/rules";

const LINE_BREAK = '\n'

// 从语言服务器发出的要执行的插件命令
export enum LinterCommands
{
	Extract = 'react-intl-linter.extract',          // 抽取中文字符串为 react-intl 代码
	DisableLine = 'react-intl-linter.disable-line', // 在中文代码前一行添加 ri-lint-disable-nextline 注释
	DisableFile = 'react-intl-linter.disable-file', // 在当前文件开始行添加 ri-lint-disable 注释
}

type CommandCallback = (
	cnt: _Connection<_, _, _, _, _, _, _>,
	doc: TextDocument,
	params: ExecuteCommandParams,
	diagnostic?: Diagnostic,
) => Promise<any>

// 命令回调函数
export const ExecuteCommandMap: { [key in LinterCommands]: CommandCallback } = {
	[LinterCommands.Extract]: async (
		connection: _Connection<_, _, _, _, _, _, _>,
		document: TextDocument,
		params: ExecuteCommandParams,
		diagnostic?: Diagnostic,
	) =>
	{
		if (!Array.isArray(params.arguments) || !params.arguments.length) return

		const newText = typeof params.arguments[2] === 'string' && params.arguments[2]

		if (!newText || !diagnostic) return

		// 替换中文为 intl 国际化代码
		await connection.workspace.applyEdit({
			documentChanges: [
				TextDocumentEdit.create({ uri: document.uri, version: document.version }, [
					TextEdit.replace(diagnostic.range, newText)
				])
			]
		})
	},
	[LinterCommands.DisableLine]: async (
		connection: _Connection<_, _, _, _, _, _, _>,
		document: TextDocument,
		_,
		diagnostic?: Diagnostic,
	) =>
	{
		if (!diagnostic) return

		const rawText = document.getText()
		// 当前中文文本所在位置
		const diagnosticOffset = document.offsetAt(diagnostic.range.start)
		// 离当前文本最近的换行符
		const breakOffset = rawText.slice(0, diagnosticOffset).lastIndexOf(LINE_BREAK)
		// 当前文本行之前 tab 的空格（保持对齐）
		const tabSpace = rawText.slice(breakOffset + 1, diagnosticOffset).match(/\s*/)
		const customTabSpace = tabSpace ? tabSpace[0] : ''

		// 在当前中文行之前的一行加入 ri-lint-disable-next-line 注释，并保持锁进相同
		await connection.workspace.applyEdit({
			documentChanges: [
				TextDocumentEdit.create({ uri: document.uri, version: document.version }, [
					TextEdit.insert(document.positionAt(breakOffset), LINE_BREAK + customTabSpace + '// ' + EnableComment.DISABLE_NEXT_LINE)
				])
			]
		})
	},
	[LinterCommands.DisableFile]: async (
		connection: _Connection<_, _, _, _, _, _, _>,
		document: TextDocument,
	) =>
	{
		// 在文件开头首行加入 ri-lint-disable 注释
		await connection.workspace.applyEdit({
			documentChanges: [
				TextDocumentEdit.create({ uri: document.uri, version: document.version }, [
					TextEdit.insert(document.positionAt(0), '// ' + EnableComment.DISABLE + LINE_BREAK)
				])
			]
		})
	},
}

export const isCommand = (command: string): command is LinterCommands =>
{
	return command in ExecuteCommandMap
}

export const LinterCodeActionMessage: { [key in LinterCommands]: string } = {
	[LinterCommands.Extract]: '',
	[LinterCommands.DisableLine]: 'Disable react-intl-linter for this line',
	[LinterCommands.DisableFile]: 'Disable react-intl-linter for entire file',
}
