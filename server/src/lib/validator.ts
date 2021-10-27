import { TextDocument } from "vscode-languageserver-textdocument"
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";
import * as isChinese from 'is-chinese'

import { StringRegx, DiagnosticMessage, SpecialStringRegx, inValidParamsRegx, ExtensionSource } from "./util";

const MaxDiagnosticCount = 100

/**
 * 在服务端校验文本，所有字符串内的中文文本会作为错误传出
 *
 * @param {TextDocument} textDocument - 文本映射对象
 * @return {*}  {Diagnostic[]} - 错误信息数组，需要传回给客户端
 */
export const validateMessage = (textDocument: TextDocument): Diagnostic[] =>
{
	// 出于性能考虑，需对错误信息数量做限制
	let limitDiagnosticCount = 0

	// 校验器会检查所有的大写单词是否超过 2 个字母
	const text = textDocument.getText();

	// 单引号之间/双引号之间 的字符串文本
	let match: RegExpExecArray | null;

	const diagnostics: Diagnostic[] = [];

	while ((match = StringRegx.exec(text)) && limitDiagnosticCount <= MaxDiagnosticCount)
	{
		// 匹配的全部字符串
		const rawString = match[0]

		// 单双引号之间的文本内容
		const string = match[1] || match[2]

		if (!string) continue

		// 以 react-intl= 或 $= 开头的特殊字符串匹配
		const specialStringMatch = SpecialStringRegx.exec(string)
		const invalidParams = specialStringMatch ? !!inValidParamsRegx.exec(specialStringMatch[1].trim()) : false

		if (!isChinese(string) && (!specialStringMatch || invalidParams)) continue

		limitDiagnosticCount++

		// 特殊字符串内容，如：'react-intl=你好，{name: Fred 哥}' 中的 '你好，{name: Fred 哥}'
		const specialString = specialStringMatch ? specialStringMatch[1].trim() : undefined

		// 错误信息
		const diagnostic: Diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: textDocument.positionAt(match.index),
				end: textDocument.positionAt(match.index + rawString.length)
			},
			message: `${specialString || string.trim()}${DiagnosticMessage}`,
			source: ExtensionSource,

		};
		diagnostics.push(diagnostic);
	}

	return diagnostics
}

