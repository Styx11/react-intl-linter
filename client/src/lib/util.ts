import { window as Window, ProgressLocation } from 'vscode'
import { DocumentSelector } from 'vscode-languageclient'

import { ActivationLanguage, CUSTOM_PICK_OPTION } from './constant'

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
	return await Window.withProgress({
		cancellable: false,
		location: ProgressLocation.Notification,
		title: `正在获取“${searchText}”的翻译结果...`,
	}, async () =>
	{
		// 获取供选择的 Options
		// 这是最终的返回结果
		return await new Promise<string[]>((resolve) =>
			setTimeout(() => resolve(['Visual Studio', 'Visual Studio Code', CUSTOM_PICK_OPTION]), 3000)
		)
	})
}
