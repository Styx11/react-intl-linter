
// 匹配单引号/双引号内的字符串文本
// 单个字符 . 的匹配默认是贪婪的，所以当有多个带引号的句子在一行时，匹配结果就会是从第一个引号开始到最后一个引号结束，所以要用 [^'\n]+ 和 [^"\n]+ 去匹配
// 例如 const message = `${'添加'}hellllllo${'添加'}` 会匹配为 添加'}hellllllo${'添加
export const StringReg = /'([^'\n]+)'|"([^"\n]+)"/gu

// 错误信息
export const DiagnosticMessage = ' is a Chinese sentence'

// debounce 文本更新回调时间 ms
export const ContentChangeDelay = 700

// CodeAction 延迟显示时间 ms
export const CodeActionDelay = 260

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