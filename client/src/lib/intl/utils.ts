import ConfigManager, { IntlCodeType, LinterConfigItem } from "../../config/ConfigManager"
import { INVALID_INTL_ID_CHARACTER } from "../constant"
import { SpecialStringParams, specialStringParams2String } from "../util/validator"

// intlCode 配置对应的代码 formatter 函数
const LinterCode: { [key in IntlCodeType]: (intlId: string) => string } = {
	[IntlCodeType.REACT_INTL]: (intlId: string) => `intl.formatMessage({ id: '${intlId}' })`,
	[IntlCodeType.VUE_I18N]: (intlId: string) => `$t('${intlId}')`,
}

const LinterCodeWithParams: { [key in IntlCodeType]: (intlId: string, params: SpecialStringParams[]) => string } = {
	[IntlCodeType.REACT_INTL]:
		(intlId: string, params: SpecialStringParams[]) => `intl.formatMessage({ id: '${intlId}' }, ${specialStringParams2String(params)})`,
	[IntlCodeType.VUE_I18N]:
		(intlId: string, params: SpecialStringParams[]) => `$t('${intlId}', ${specialStringParams2String(params)})`,
}

/**
 * 通过数字获取用以区分相同翻译结果的 intl id
 * 例如 HELLO_01 和 HELLO_02
 *
 * @param {number} number
 * @return {*}  {string}
 */
export const getIntlIdCount = (number: number): string =>
{
	const numStr = number.toString()
	if (numStr.length === 1) return `0${number}`
	return numStr
}

/**
 * 去掉翻译结果中的特殊字符串，只保留英文字母和空格作为 intl id
 *
 * @param {string} translationResult - 翻译结果
 * @return {*}  {string}
 */
export const getCleanIntlId = (translationResult: string): string =>
{
	return translationResult
		.replace(INVALID_INTL_ID_CHARACTER, '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '_')
}

/**
* 获取 react-intl 代码
*
* @param {string} intlId
* @param {SpecialStringParams[]} [params] 特殊字符串参数
* @return {*}
*/
export const getIntlMessage = (intlId: string, params?: SpecialStringParams[]) =>
{
	const intlCodeType = ConfigManager.getInstance().getConfig(LinterConfigItem.intlCode)
	if (Array.isArray(params) && params.length)
	{
		return LinterCodeWithParams[intlCodeType](intlId, params)
	}
	return LinterCode[intlCodeType](intlId)
}
