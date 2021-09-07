
// 匹配单引号/双引号内的字符串文本
export const StringReg = /'(.+)'|"(.+)"/gu

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