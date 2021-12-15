
// 特殊字符串参数对象
// 例如：'react-intl=你好，{name: Fred 哥}' 中的 {name: 'Fred 哥'}
export type SpecialStringParams = { [key: string]: string; }

// 特殊字符串里面的参数
export const ParamsRegx = /\{\s*([A-Za-z_]+):\s*([^\}\n]+)\s*\}/gu

/**
 * 获取格式化后的查询字符串和参数
 *
 * @param {string} target
 * @return {*}  {([string, SpecialStringParams[]] | undefined)}
 */
export const validateSpecialString = (target: string): [string, SpecialStringParams[]] =>
{
	const params = formatSpecialStringParams(target)
	const searchText = formatSearchText(target)

	return [searchText, params]
}

/**
 * 获取特殊字符串的参数数组
 *
 * @param {string} target 特殊字符串中的文本内容
 * @return {*}  {SpecialStringParams[]}
 */
const formatSpecialStringParams = (target: string): SpecialStringParams[] =>
{

	let match: RegExpExecArray | null

	const params: SpecialStringParams[] = []

	while ((match = ParamsRegx.exec(target)))
	{
		const key = match[1]
		const value = match[2]

		if (params.find(p => key in p))
		{
			throw new Error(`参数的 key 值（${key}）只唯一！`)
		}

		params.push({ [key]: value })
	}

	return params
}



/**
 * 获取特殊字符串中要拿去翻译的文本
 * 例如：'你好，{name: Fred 哥}' -> '你好，{name}'
 *
 * @param {string} target
 * @return {*}  {string}
 */
const formatSearchText = (target: string): string =>
{
	return target.replace(ParamsRegx, '{$1}')
}


/**
 * 将特殊字符串内的参数对象转化为代码字符串
 *
 * @param {SpecialStringParams[]} params 参数对象数组
 * @return {*}  {string} 合并后的字符串，例如 "{name: '约翰', title: '老师'}"
 */
export const specialStringParams2String = (params: SpecialStringParams[]): string =>
{
	const sourceObj = params.reduce((accObj, curParams: SpecialStringParams) =>
	{
		return { ...accObj, ...curParams }
	}, {})

	const targetStr = Object.keys(sourceObj)
		.map(key => `${key}: ${sourceObj[key]}`)
		.join(', ')

	return `{ ${targetStr} }`
}