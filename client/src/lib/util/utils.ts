import { window as Window, ProgressLocation, QuickPickItem } from 'vscode'
import { DocumentSelector } from 'vscode-languageclient'
import { getBaiduZhTranslation } from '../translate/baidu'

import
{
	ActivationLanguage,
	CUSTOM_INPUT_PLACEHOLDER,
	CUSTOM_INTL_ID_REGX,
	CUSTOM_PICK_OPTION,
	CUSTOM_PICK_OPTION_DESC,
	CUSTOM_PICK_PLACEHOLDER,
	INVALID_CUSTOM_ID_MESSAGE,
	INVALID_INTL_ID_CHARACTER,
	LinterCode,
	LinterCodeWithParams,
	TranslationResultMap
} from '../constant'
import { SpecialStringParams } from './validator'
import ConfigManager, { LinterConfigItem } from '../ConfigManager'

/**
 * 通过数字获取用以区分相同翻译结果的 intl id
 * 例如 HELLO_01 和 HELLO_02
 *
 * @param {number} number
 * @return {*}  {string}
 */
const getIntlIdCount = (number: number): string =>
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

/**
* 获取 package.json 文件配置的激活事件 activationEvents 对应的语言
*
* @return {*}  {DocumentSelector} - 客户端支持的语言
*/
export const getDocumentSelector = (): DocumentSelector =>
{
	const languagePrefix = /onLanguage:/
	const activationEvents = ActivationLanguage
	return activationEvents.reduce((prevLangs: DocumentSelector, curAction: string) =>
	{
		if (!languagePrefix.test(curAction)) return prevLangs
		const language = curAction.replace(languagePrefix, '')
		return language ? prevLangs.concat({ scheme: 'file', language: language }) : prevLangs
	}, [])
};

/**
* 获取文本翻译结果 - 通过 进度弹框 的形式
*
* @param {string} searchText
* @return {*}  {Promise<string[]>}
*/
export const getTranslateResultsWithProgress = async (searchText: string): Promise<string[]> =>
{
	// 是否有缓存
	const cacheResult = TranslationResultMap.get(searchText)
	if (Array.isArray(cacheResult)) return cacheResult

	try
	{
		return await Window.withProgress({
			cancellable: false,
			location: ProgressLocation.Notification,
			title: `正在获取“${searchText}”的翻译结果...`,
		}, async () =>
		{
			// 获取供选择的 Options
			// 这是最终的返回结果
			const result = await getBaiduZhTranslation(searchText)
			Array.isArray(result) && result.length && TranslationResultMap.set(searchText, result)
			return result
		})
	}
	catch (e: any)
	{
		Window.showErrorMessage('文本翻译错误', e)
		throw e
	}
}

/**
* 根据要搜索的中文文本获取已有的国际化配置内容，包括 id 和英文文本
*
* @param {string} searchText - 搜索的中文文本
* @param {Record<string, string>} [zhConfig] - 中文国际化配置
* @param {Record<string, string>} [enConfig] - 英文国际化配置
* @return {*}  { intlId?: string; zhText?: string, enText?: string } - 返回可选的，已有的国际化 id、中文文本、英文文本
*/
export const getExistingIntl = (
	searchText: string,
	zhConfig?: Record<string, string>,
	enConfig?: Record<string, string>
): { intlId?: string; zhText?: string, enText?: string } =>
{
	if (!zhConfig || !enConfig) return {}

	const intlId = Object.keys(zhConfig).find(record => zhConfig[record] === searchText)
	const enText = intlId && enConfig[intlId]
	const zhText = intlId && zhConfig[intlId]

	return {
		intlId,
		enText,
		zhText,
	}
}

/**
 * 通过 pick 选择想要的 intl.formatMessage({ id: ... }) 的 id 文本
 *
 * @param {string[]} translateResults - 翻译结果数组
 * @param {Record<string, string>} [intlConfig] - 国际化配置（传中文国际化配置即可）
 * @return {*}  {(Promise<[string | undefined, string | undefined]>)}
 */
export const getIntlIdWithQuickPick = async (
	translateResults: string[],
	intlConfig?: Record<string, string>,
): Promise<[string | undefined, string | undefined]> =>
{
	// intl id 对应 translation result 的 map
	// intlId -> translateResult
	const intlResultMap = new Map<string, string>()

	// 包含描述信息和细节的 quick pick
	// 参考 https://stackoverflow.com/questions/62312943/vscode-use-quickpick-list-items-with-description
	const quickPickOptions: QuickPickItem[] = translateResults.map(re =>
	{
		const intlId = getCleanIntlId(re)
		intlResultMap.set(intlId, re)
		return {
			label: intlId,
			detail: `对应翻译结果：${intlResultMap.get(intlId) || '无'}`
		}
	})

	// 自定义选项
	const customPickOption: QuickPickItem = { label: CUSTOM_PICK_OPTION, description: CUSTOM_PICK_OPTION_DESC }

	const pickedIntlOption = await Window.showQuickPick([...quickPickOptions, customPickOption], { placeHolder: CUSTOM_PICK_PLACEHOLDER })

	// 选中的 option 对应的 intl id
	let intlId = pickedIntlOption?.label

	// 自定义 id 会选择第一个翻译结果
	// 否则取 intlId 对应的翻译结果
	const translateResult = !!intlId
		? (intlId !== CUSTOM_PICK_OPTION && intlResultMap.get(intlId)) ? intlResultMap.get(intlId) : translateResults && translateResults[0]
		: undefined

	// 用户选择的 id 有可能已存在，我们会给它加上数字用以区分
	if (intlConfig && intlId && (intlId in intlConfig) && intlId !== CUSTOM_PICK_OPTION)
	{
		let idCount = 1
		while (`${intlId}_${getIntlIdCount(idCount)}` in intlConfig)
		{
			idCount++
		}
		intlId = `${intlId}_${getIntlIdCount(idCount)}`
	}

	return [intlId, translateResult]
}

/**
 * 将选择后的国际化代码附加到 onExecuteCommand 参数中返回
 *
 * @param {any[]} args - executeCommand 参数
 * @param {string} [selectedIntlId] - 选择的国际化 id
 * @param {SpecialStringParams[]} [specialStringParams] - 若该字符为包含参数的特殊字符，这个参数表示参数数组
 * @return {*}  {(Promise<{
 * 	newArgs?: any[] | undefined;
 * 	customIntlId?: string;
 * }>)} - 处理后的新的参数和可选的自定义 id
 */
export const processArgsWithSelectResult = async (
	args: any[],
	selectedIntlId?: string,
	specialStringParams?: SpecialStringParams[],
): Promise<{
	newArgs?: any[] | undefined;
	customIntlId?: string;
}> =>
{
	// 选择国际化代码内容
	switch (selectedIntlId)
	{
		case undefined:
			return {}
		case CUSTOM_PICK_OPTION:
			{
				// 自定义国际化代码（不是自定义翻译结果）
				const inputBoxContent = await Window.showInputBox({
					placeHolder: CUSTOM_INPUT_PLACEHOLDER,
					validateInput: (val: string) => CUSTOM_INTL_ID_REGX.test(val) ? undefined : INVALID_CUSTOM_ID_MESSAGE
				})
				if (!inputBoxContent) return {}

				return {
					newArgs: [...args, getIntlMessage(inputBoxContent, specialStringParams)],
					customIntlId: inputBoxContent
				}
			}
		default:
			return {
				newArgs: [...args, getIntlMessage(selectedIntlId, specialStringParams)],
			}
	}
}