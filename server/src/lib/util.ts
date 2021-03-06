
// 匹配单引号/双引号内的字符串文本
// 单个字符 . 的匹配默认是贪婪的，所以当有多个带引号的句子在一行时，匹配结果就会是从第一个引号开始到最后一个引号结束，所以要用 [^'\n]+ 和 [^"\n]+ 去匹配
// 例如 const message = `${'添加'}hellllllo${'添加'}` 会匹配为 添加'}hellllllo${'添加
export const StringRegx = /'([^'\n]*)'|"([^"\n]*)"/gu

// 标识特殊字符串前缀，表示含有特殊字符需要 react-intl-linter 识别  'react-intl=你好，{name: 约翰}' 或  '$=你好，{name: 约翰}'
export const SpecialStringRegx = /^(?:react-intl|\$)=([^\n]+)/u

// 特殊字符串里面的非法参数，若有一个非法参数则不抛出 codeAction
export const inValidParamsRegx = /\{\s*([A-Za-z_]+):\s*\}/u

// 错误信息
export const DiagnosticMessage = ' can be transferred to intl code'

// debounce 文本更新回调时间 ms
export const ContentChangeDelay = 600

export const ExtensionSource = 'react-intl-linter'

/**
 * 获取 CodeAction 信息，包含引号之间的中文文本
 *
 * @param {string} message
 * @return {*}  {[string, string]} - 【codeAction 信息，引号之间的中文文本】
 */
export const getCodeActionMessage = (message: string): [string, string] =>
{
	const rawMessage = message.replace(DiagnosticMessage, '')
	const codeActionMessage = `抽取 "${rawMessage}" 为 react-intl 国际化内容`

	return [codeActionMessage, rawMessage]
}

/**
 * 获取 end 位置开头的字符串在 target 字符串中的第几行（行数从零开始）
 *
 * @param {string} target 原始字符串
 * @param {number} [end] 目标字符串开始位置
 * @return {*}  {number} 目标字符串在原始字符串上的行数
 */
export const getLineCount = (target: string, end?: number): number =>
{
	return target.slice(0, end).split('\n').length - 1
}

/**
 * debounce for fn
 * @param fn target function
 * @param wait wait millisecond
 */
// tslint:disable-next-line: ban-types
export const debounce = (fn: Function, wait: number): ((...args: any[]) => void) =>
{
	let timer: any = 0
	return (...args: any[]) =>
	{
		if (timer)
		{
			clearTimeout(timer)
		}

		timer = setTimeout(() =>
		{
			fn(...args)
		}, wait)
	}
}