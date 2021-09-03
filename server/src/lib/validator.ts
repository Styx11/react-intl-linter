import { TextDocument } from "vscode-languageserver-textdocument"
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import * as isChinese from 'is-chinese'

import { StringReg, DiagnosticMessage } from "./util";

export const validateMessage = (textDocument: TextDocument): Diagnostic[] =>
{
	// 校验器会检查所有的大写单词是否超过 2 个字母
	const text = textDocument.getText();

	// 单引号之间/双引号之间 的字符串文本
	let match: RegExpExecArray | null;

	const diagnostics: Diagnostic[] = [];

	while ((match = StringReg.exec(text)))
	{
		// 匹配的全部字符串
		const rawString = match[0]

		// 单双引号之间的文本内容
		const string = match[1] || match[2]

		if (!isChinese(string)) continue

		// 错误信息
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(match.index),
				end: textDocument.positionAt(match.index + rawString.length)
			},
			message: `${string.trim()}${DiagnosticMessage}`,
			source: 'react-intl-linter',

		};
		diagnostics.push(diagnostic);
	}

	return diagnostics
}