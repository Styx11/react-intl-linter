import { Uri, window as Window } from 'vscode'
import { ExecuteCommandSignature } from "vscode-languageclient"

import { LinterCommands } from "../lib/constant"
import IntlConfigManager from '../lib/intl/IntlConfigManager'
import { getIntlMessage } from '../lib/intl/utils'
import VSCodeUIManager from '../lib/ui/VSCodeUIManager'
import { validateSpecialString } from '../lib/util/validator'

/**
 * 命令中间件 - 执行语言服务器发出的抽取中文文本为 react-intl 代码命令
 *
 * @param {string} intlConfigTemp react-intl 国际化模版配置路径
 * @param {(Uri | undefined)} workspaceIntlConfigPath 工作区 react-intl 国际化配置路径
 * @param {any[]} args 语言服务器发出该命令时给的参数
 * @param {ExecuteCommandSignature} next next 调用语言服务器的 onExecuteCommand 函数
 * @return {*}
 */
const ExtractMiddleware = async (intlConfigTemp: string, workspaceIntlConfigPath: Uri | undefined, args: any[], next: ExecuteCommandSignature) =>
{
	const rawText = args[1] as string

	if (!rawText || !workspaceIntlConfigPath) return

	// 想要替换的中文文本
	const [searchText, specialStringParams] = validateSpecialString(rawText)

	// 初始化工作区国际化配置文件
	await IntlConfigManager.getInstance().initializeIntlConfig(workspaceIntlConfigPath, intlConfigTemp)

	// 获取已有所有配置文件
	const oldConfigs = await IntlConfigManager.getInstance().readAllConfig()

	// 查找工作区是否已存在对应中文文本配置
	const intlId = IntlConfigManager.getInstance().getExistingIntlId(searchText, oldConfigs)

	// 工作区已存在对应配置
	if (intlId)
	{
		// 传给语言服务器的 onExecuteCommand 函数
		return next(LinterCommands.Extract, [...args, getIntlMessage(intlId, specialStringParams)])
	}

	// 翻译结果相关进度条
	const translateResults = await VSCodeUIManager.getInstance().getTranslateResultsWithProgress(searchText)

	// picker 选择结果
	const selectedIntlId = await VSCodeUIManager.getInstance().getIntlIdWithQuickPick(translateResults, oldConfigs[0]);

	// 获得处理后的参数，用于传给语言服务器的 onExecuteCommand 函数
	const { newArgs, customIntlId } = await VSCodeUIManager.getInstance().processArgsWithSelectResult(args, selectedIntlId, specialStringParams)

	if (!newArgs || !selectedIntlId || !translateResults.length) return

	try
	{
		// 替换文本操作可以首先实行减少用户对延迟的感知
		// 文件写入错误和文本替换并不冲突，只不过需要用户重新执行一遍替换操作来执行文件写入或手动写入文件
		next(LinterCommands.Extract, newArgs)

		// 写入配置文件，包括将搜索文本写入本地配置文件（这个操作是费时的）
		await IntlConfigManager.getInstance().writeConfigIntoWorkSpace(
			customIntlId || selectedIntlId,
			[searchText, ...translateResults],
			oldConfigs
		)
	}
	catch (e)
	{
		Window.showErrorMessage('写入国际化文件发生错误：', String(e).toString())
		console.log('write config failed', e)
	}
}

export default ExtractMiddleware