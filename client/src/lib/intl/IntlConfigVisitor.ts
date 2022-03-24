import path from "path";
import { Uri, workspace } from "vscode";
import { JSON_SPACE } from "../constant";
import { getWorkspaceIntlJsonPath } from "../util";

const TEMP_CONFIG_NAME = '/template_config.json'

/**
 * 某个语言对应的国际化配置管理类
 * 负责单个国际化配置的 初始化、查询和更新
 *
 * @class IntlConfigVisitor
 */
export default class IntlConfigVisitor
{
	// 国际化配置的工作区路径
	private _workspacePath: Uri;

	constructor(workspacePath: Uri)
	{
		this._workspacePath = workspacePath
	}

	/**
	 * 初始化本 visitor 对应的工作区配置文件
	 *
	 * @param {string} intlTempPath
	 * @return {*}  {Promise<void>}
	 * @memberof IntlConfigVisitor
	 */
	public async initializeWorkplaceIntlConfig(intlTempPath: string): Promise<void>
	{
		try
		{
			await workspace.fs.stat(this._workspacePath)
		}
		catch (e)
		{
			await workspace.fs.copy(Uri.file(path.join(intlTempPath, TEMP_CONFIG_NAME)), this._workspacePath)
		}
	}

	/**
	 * 读取本 visitor 对应的工作区配置
	 *
	 * @return {*}  {Promise<Record<string, string>>}
	 * @memberof IntlConfigVisitor
	 */
	public async readConfig(): Promise<Record<string, string>>
	{
		const rawConfig = await workspace.fs.readFile(this._workspacePath)

		return await Promise.resolve<Record<string, string>>(JSON.parse(rawConfig.toString()))
	}

	/**
	 * 将翻译内容写入现有工作区的国际化配置中
	 * 并按 keys 排序后返回新的配置对象
	 *
	 * @private
	 * @param {string} intlId - 国际化 id
	 * @param {string} text - 写入的文本
	 * @param {Record<string, string>} [config] - 旧的国际化配置
	 * @return {*}  {Promise<Record<string, string>>}
	 * @memberof IntlConfigVisitor
	 */
	private async insertConfig(intlId: string, text: string, config?: Record<string, string>): Promise<Record<string, string>>
	{
		const _config: Record<string, string> = {}

		// 处理新的国际化配置内容
		// 包括写入新对象，重新将 key 排序
		const updatedConfig = await new Promise<Record<string, string>>((resolve, reject) =>
		{
			if (!config) return reject()

			config[intlId] = text
			Object
				.keys(config)
				.sort(new Intl.Collator('en-US').compare)
				.forEach(id => _config[id] = config[id])

			resolve(_config)
		})

		return updatedConfig
	}

	/**
	 * 将配置文件写入工作区
	 *
	 * @private
	 * @param {Record<string, string>} config
	 * @return {*}  {Promise<void>}
	 * @memberof IntlConfigVisitor
	 */
	private async writeConfig(config: Record<string, string>): Promise<void>
	{
		const wpPath = this._workspacePath
		await workspace.fs.writeFile(wpPath, Buffer.from(JSON.stringify(config, null, JSON_SPACE)))
	}

	/**
	 * 更新配置文件
	 *
	 * @param {string} intlId - 国际化配置 id
	 * @param {string} text - 写入配置的文本
	 * @param {Record<string, string>} [config] - 现有配置
	 * @return {*}  {Promise<void>}
	 * @memberof IntlConfigVisitor
	 */
	public async updateConfig(intlId: string, text: string, config?: Record<string, string>): Promise<void>
	{
		const sortedConfig = await this.insertConfig(intlId, text, config)
		await this.writeConfig(sortedConfig)
	}

}


/**
 * 工厂函数，用于创建国际化配置路径对应的「管理类」数组
 * 每个「管理类」负责该国际化配置的各项操作
 *
 * @param {Uri} workspaceIntlConfigPath - 工作区国际化文件夹路径名
 * @param {string} configPathNames - 所有配置文件名数组（包括本地语言配置和国际语言配置，本地语言路径名在数组第一位）
 * @return {*}  {IntlConfigVisitor[]}
 */
export function IntlConfigFactory(
	workspaceIntlConfigPath: Uri,
	configPathNames: string[]
): IntlConfigVisitor[]
{
	return configPathNames.map(name => new IntlConfigVisitor(getWorkspaceIntlJsonPath(workspaceIntlConfigPath, `${name}.json`)))
}
