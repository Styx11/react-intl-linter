import { window as Window, ProgressLocation, QuickPickItem } from 'vscode'
import { CUSTOM_INPUT_PLACEHOLDER, CUSTOM_INTL_ID_REGX, CUSTOM_PICK_OPTION, CUSTOM_PICK_OPTION_DESC, CUSTOM_PICK_PLACEHOLDER, INVALID_CUSTOM_ID_MESSAGE } from '../constant';
import { getIntlIdCount, getIntlMessage } from '../intl/utils';

import TranslateManager, { TranslationResultMap } from "../translate/TranslateManager";
import { SpecialStringParams } from '../util/validator';

// 此单例包含所有和 VSCode UI 相关的操作
export default class VSCodeUIManager
{
	private static _instance: VSCodeUIManager;

	static getInstance()
	{
		if (!this._instance)
		{
			this._instance = new VSCodeUIManager()
		}
		return this._instance
	}

	/**
	 * 获取文本翻译结果 - 通过 进度弹框 的形式
	 *
	 * @param {string} searchText
	 * @return {*}  {Promise<string[]>}
	 */
	public async getTranslateResultsWithProgress(searchText: string): Promise<string[]>
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
				const result = await TranslateManager.getInstance().getTranslationResult(searchText)
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
	 * 通过 pick 选择想要的 intl.formatMessage({ id: ... }) 的 id 文本
	 *
	 * @param {string[]} translateResults - 翻译结果数组
	 * @param {Record<string, string>} [intlConfig] - 国际化配置（传本地国际化配置即可）
	 * @return {*}  {(Promise<[string | undefined, string | undefined]>)}
	 */
	public async getIntlIdWithQuickPick(
		translateResults: string[],
		intlConfig?: Record<string, string>,
	): Promise<string | undefined>
	{
		const labelDetailSuffix = (translateResults.length > 1 ? '等' : '')

		// 包含描述信息和细节的 quick pick
		// 参考 https://stackoverflow.com/questions/62312943/vscode-use-quickpick-list-items-with-description
		const quickPickOptions: QuickPickItem = {
			label: TranslateManager.getInstance().getIntlId(),
			detail: `对应翻译结果：${(translateResults[0] + labelDetailSuffix) || '无'}`
		}

		// 自定义选项
		const customPickOption: QuickPickItem = { label: CUSTOM_PICK_OPTION, description: CUSTOM_PICK_OPTION_DESC }

		const pickedIntlOption = await Window.showQuickPick([quickPickOptions, customPickOption], { placeHolder: CUSTOM_PICK_PLACEHOLDER })

		// 选中的 option 对应的 intl id
		let intlId = pickedIntlOption?.label

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

		return intlId
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
	public async processArgsWithSelectResult(
		args: any[],
		selectedIntlId?: string,
		specialStringParams?: SpecialStringParams[],
	): Promise<{
		newArgs?: any[] | undefined;
		customIntlId?: string;
	}>
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

}