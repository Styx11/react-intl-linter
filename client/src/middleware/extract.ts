import { Uri, window as Window } from 'vscode'
import { ExecuteCommandSignature } from "vscode-languageclient"

import { getIntlMessage, LinterCommands } from "../lib/constant"
import { getIntlConfig, initializeWorkplaceIntlConfig, writeConfigIntoWorkSpace, writeResultIntoIntlConfig } from "../lib/file"
import { getExistingIntl, getIntlIdWithQuickPick, getTranslateResultsWithProgress, processArgsWithSelectResult } from "../lib/util"

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
	// 想要替换的中文文本
	const searchText = args[1] as string

	// 初始化工作区国际化配置文件
	await initializeWorkplaceIntlConfig(intlConfigTemp, workspaceIntlConfigPath)

	// 获取已有配置文件
	const [zhConfig, enConfig] = await getIntlConfig(workspaceIntlConfigPath)

	// 查找工作区是否已存在对应中文文本配置
	const { intlId, zhText, enText } = getExistingIntl(searchText, zhConfig, enConfig)

	// 工作区已存在对应配置
	if (intlId && zhText && enText)
	{
		// 传给语言服务器的 onExecuteCommand 函数
		return next(LinterCommands.Extract, [...args, getIntlMessage(intlId)])
	}

	// 翻译结果相关进度条
	const translateResults = await getTranslateResultsWithProgress(searchText)

	// picker 选择结果
	const [selectedIntlId, translationText] = await getIntlIdWithQuickPick(translateResults, zhConfig);

	// 获得处理后的参数，用于传给语言服务器的 onExecuteCommand 函数
	const { newArgs, customIntlId } = await processArgsWithSelectResult(args, selectedIntlId)

	if (!newArgs || !selectedIntlId || !translationText) return

	try
	{
		// 替换文本操作可以首先实行减少用户对延迟的感知
		// 文件写入错误和文本替换并不冲突，只不过需要用户重新执行一遍替换操作来执行文件写入或手动写入文件
		next(LinterCommands.Extract, newArgs)

		// 获取新的 intl 配置文件
		const [newZhConfig, newEnConfig] = await writeResultIntoIntlConfig(
			customIntlId || selectedIntlId,
			searchText,
			translationText,
			zhConfig,
			enConfig
		)

		// 在这里执行写入配置文件操作（这个操作是费时的）
		await writeConfigIntoWorkSpace(newZhConfig, newEnConfig, workspaceIntlConfigPath)
	}
	catch (e)
	{
		Window.showErrorMessage('写入国际化文件发生错误！')
		console.log('write config failed', e)
	}
}

export default ExtractMiddleware