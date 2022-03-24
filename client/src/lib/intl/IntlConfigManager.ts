import { ProgressLocation, Uri, window } from "vscode"

import ConfigManager, { LinterConfigItem } from "../../config/ConfigManager"
import { SupportLanguage } from "../translate/TranslateManager";
import IntlConfigVisitor, { IntlConfigFactory } from "./IntlConfigVisitor";
import { initializeIntlIndexFile } from "./template/generator";

// 此单例用于统一管理（本地语言、国际语言）国际化配置文件，包括校验用户配置是否合法，初始化配置文件，以及配置文件的写入等
export default class IntlConfigManager
{
	private static _instance: IntlConfigManager;

	// 用户配置的所有语言
	private _configLangs: SupportLanguage[];

	// 用户配置的所有文件名
	private _configNames: string[];

	private _configVisitor: IntlConfigVisitor[];

	static getInstance()
	{
		if (!this._instance)
		{
			this._instance = new IntlConfigManager()
		}
		return this._instance
	}

	protected constructor()
	{
		this._configLangs = []
		this._configNames = []
		this._configVisitor = []
	}

	/**
	 * 校验用户配置的国际化文件名是否合法
	 *
	 * @private
	 * @memberof IntlConfigManager
	 */
	private validIntlConfigSetting(): void
	{
		const localLanguage = ConfigManager.getInstance().getConfig(LinterConfigItem.localLanguage)
		const intlLanguage = ConfigManager.getInstance().getConfig(LinterConfigItem.intlLanguage)
		const localLanguageConfigName = ConfigManager.getInstance().getConfig(LinterConfigItem.localLanguageConfigName)
		const intlLanguageConfigName = ConfigManager.getInstance().getConfig(LinterConfigItem.intlLanguageConfigName)

		if (
			!localLanguage
			|| !localLanguageConfigName
			|| !intlLanguageConfigName.length
			|| intlLanguageConfigName.length !== intlLanguage.length
		)
		{
			throw new Error('国际化相关设置错误，请检查插件相关配置')
		}

		// 所有受支持的语言
		const langs = Object.values(SupportLanguage)

		if (langs.every((lang) => localLanguage !== lang)) throw new Error('本地语言不受支持，请检查插件相关配置')

		if (intlLanguage.some(intl => !langs.includes(intl))) throw new Error('国际语言不受支持，请检查插件相关配置')

		this._configLangs = [localLanguage, ...intlLanguage]

		this._configNames = [localLanguageConfigName, ...intlLanguageConfigName]
	}

	/**
	 * 初始化所有配置文件（包括本地语言和国际语言配置文件）
	 *
	 * @param {Uri} workspaceIntlConfigPath - 工作区配置文件路径
	 * @param {string} intlTempPath - 国际化配置模版路径
	 * @return {*}  {Promise<void>}
	 * @memberof IntlConfigManager
	 */
	public async initializeIntlConfig(workspaceIntlConfigPath: Uri, intlTempPath: string): Promise<void>
	{
		this.validIntlConfigSetting()

		this._configVisitor = IntlConfigFactory(workspaceIntlConfigPath, this._configNames)

		await Promise.all([
			...this._configVisitor.map(visitor => visitor.initializeWorkplaceIntlConfig(intlTempPath)),
			initializeIntlIndexFile(workspaceIntlConfigPath, this._configLangs, this._configNames),
		])
	}

	/**
	 * 读取所有各语言对应的国际化配置
	 *
	 * @return {*}  {Promise<Record<string, string>[]>}
	 * @memberof IntlConfigManager
	 */
	public async readAllConfig(): Promise<Record<string, string>[]>
	{
		return await Promise.all(
			this._configVisitor.map(visitor => visitor.readConfig())
		)
	}

	/**
	 * 本地语言文本是否已存在配置中，若存在则返回对应的 intl id
	 *
	 * @param {string} localText - 想要转换的本地语言文本
	 * @param {Record<string, string>[]} configs - 所有语言配置文件
	 * @return {*}  {(string | undefined)}
	 * @memberof IntlConfigManager
	 */
	public getExistingIntlId(localText: string, configs: Record<string, string>[]): string | undefined
	{
		if (!configs.length) return

		const _configs = configs.slice()

		const localConfig = _configs.shift() as Record<string, string>

		const intlId = Object.keys(localConfig).find(key => localConfig[key] === localText)

		const allConfigsExisted = intlId ? _configs.every(c => intlId in c) : false

		return allConfigsExisted ? intlId : undefined

	}

	/**
	 * 更新所有国际化配置文件
	 *
	 * @param {string} intlId - 国际化配置 id
	 * @param {string[]} translationResults - 所有翻译结果，包括本地语言（即代码中需要替换的本地语言字符串）
	 * @param {Record<string, string>[]} configs - 所有的已有国际化配置（和翻译结果一一对应，本地语言总是位于第一个）
	 * @return {*}  {Promise<void>}
	 * @memberof IntlConfigManager
	 */
	public async writeConfigIntoWorkSpace(intlId: string, translationResults: string[], configs: Record<string, string>[]): Promise<void>
	{
		const _result = translationResults.slice()
		const _config = configs.slice()
		await window.withProgress({
			cancellable: false,
			location: ProgressLocation.Window,
			title: `正在写入国际化配置...`,
		}, async () =>
		{
			await Promise.all(
				this._configVisitor.map(visior => visior.updateConfig(intlId, _result.shift() || '', _config.shift()))
			)
		})
	}
}
