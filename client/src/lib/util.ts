import { window as Window, ProgressLocation } from 'vscode'
import { DocumentSelector } from 'vscode-languageclient'

import
{
	ActivationLanguage,
	CUSTOM_INPUT_PLACEHOLDER,
	CUSTOM_INTL_ID_REGX,
	CUSTOM_PICK_OPTION,
	CUSTOM_PICK_PLACEHOLDER,
	getIntlMessage,
	INVALID_CUSTOM_ID_MESSAGE
} from './constant'

// 获取用以区分相同翻译结果的 intl id 对应的数字
// 例如 HELLO_01 和 HELLO_02
const getIntlIdCount = (number: number): string =>
{
	const numStr = number.toString()
	if (numStr.length === 1) return `0${number}`
	return numStr
}

// 获取 package.json 文件配置的激活事件 activationEvents 对应的语言
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

// 获取文本翻译结果 - 通过 进度弹框 的形式
export const getTranslateResultsWithProgress = async (searchText: string): Promise<string[]> =>
{
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
			return await new Promise<string[]>((resolve) =>
				setTimeout(() => resolve(['Visual Studio', 'Visual Studio Code']), 1500)
			)
		})
	}
	catch (e: any)
	{
		Window.showErrorMessage('文本翻译错误', e)
		throw e
	}
}

// 根据要搜索的中文文本获取已有的国际化配置内容，包括 id 和英文文本
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

// 通过 pick 选择想要的 intl.formatMessage({ id: ... }) 的 id 文本
export const getIntlIdWithQuickPick = async (
	translateResults: string[],
	intlConfig?: Record<string, string>,
): Promise<[string | undefined, string | undefined]> =>
{
	const _intlIdOptions = translateResults.map(tr => tr.toUpperCase().split(' ').join('_'))

	let intlId = await Window.showQuickPick([..._intlIdOptions, CUSTOM_PICK_OPTION], { placeHolder: CUSTOM_PICK_PLACEHOLDER })

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

	// 具体的英文翻译文本 doesn't matter
	return [intlId, translateResults && translateResults[0]]
}

// 将选择后的国际化代码附加到 onExecuteCommand 参数中返回
export const processArgsWithSelectResult = async (
	args: any[],
	selectedIntlId?: string
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
					newArgs: [...args, getIntlMessage(inputBoxContent)],
					customIntlId: inputBoxContent
				}
			}
		default:
			return {
				newArgs: [...args, getIntlMessage(selectedIntlId)],
			}
	}
}