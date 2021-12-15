// @desc configuration 配置管理对象

import { workspace } from 'vscode'
import { CONFIG_SECTION } from './constant'

export const enum IntlCodeType
{
	REACT_INTL = 'react-intl',
	VUE_I18N = 'vue-i18n',
}

// 配置项目，与 package.json 保持一致
export const enum LinterConfigItem
{
	zhConfigName = 'zhConfigName',
	enConfigName = 'enConfigName',
	intlConfigPath = 'intlConfigPath',
	intlCode = 'intlCode',
}

// 配置接口
export interface LinterConfig
{
	[LinterConfigItem.zhConfigName]: string;    // 中文配置文件名
	[LinterConfigItem.enConfigName]: string;    // 英文配置文件名
	[LinterConfigItem.intlConfigPath]: string;  // 国际化配置文件夹路径
	[LinterConfigItem.intlCode]: IntlCodeType;  // 国际化代码模版
}

// 默认配置，与 package.json 中的默认配置保持一致
const _defaultConfig: { [key in LinterConfigItem]: LinterConfig[key] } =
{
	[LinterConfigItem.zhConfigName]: 'zh_CN',
	[LinterConfigItem.enConfigName]: 'en_US',
	[LinterConfigItem.intlConfigPath]: 'src/intl',
	[LinterConfigItem.intlCode]: IntlCodeType.REACT_INTL,
}

export default class ConfigManager
{
	private static _instance: ConfigManager

	static getInstance()
	{
		if (!this._instance)
		{
			this._instance = new ConfigManager()
		}
		return this._instance
	}

	protected constructor() { }

	public getConfig<T extends LinterConfigItem>(item: T): LinterConfig[T]
	{
		const workspaceConfig = workspace.getConfiguration().get<LinterConfig>(CONFIG_SECTION)
		return workspaceConfig ? workspaceConfig[item] : _defaultConfig[item]
	}
}
