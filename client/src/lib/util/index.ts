import path = require("path");
import { Uri } from "vscode";
import { DocumentSelector } from 'vscode-languageclient'

import { ActivationLanguage } from '../constant'

/**
* 获取工作区下国际化配置文件 json 路径
*
* @param {Uri} workspaceIntlConfigPath 工作区根目录
* @param {string} jsonPath 国际化的 json 路径
* @return {*}  {Uri}
*/
export const getWorkspaceIntlJsonPath = (workspaceIntlConfigPath: Uri, jsonPath: string): Uri =>
{
	return Uri.joinPath(workspaceIntlConfigPath, path.join('/' + jsonPath))
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
