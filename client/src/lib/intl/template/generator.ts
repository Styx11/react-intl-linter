import { Uri, workspace } from "vscode"
import { SupportLanguage } from "../../translate/TranslateManager"
import { getWorkspaceIntlJsonPath } from "../../util"

const LanguageCode: { [key in SupportLanguage]: string } = {
	[SupportLanguage.ZH]: 'zh-CN',
	[SupportLanguage.EN]: 'en-US',
	[SupportLanguage.CHT]: 'zh-TW',
	[SupportLanguage.JP]: 'ja',
}


/**
 * 根据 本地、国际语言以及对应的文件名称格式化 react-intl 配置的 index.ts 文件
 *
 * @param {SupportLanguage[]} languages 所有语言
 * @param {string[]} names 和语言一一对应的配置文件名
 * @return {string} index.ts 代码文本
 */
const _generateIndexTemplate = (languages: SupportLanguage[], names: string[]): string =>
{
	// 导入
	const _imports = names.map(name => `import ${name} from "./${name}.json";`).join('\n')

	// 类型
	const _types = 'export type ILocales = ' + languages.map(lang => `'${LanguageCode[lang]}'`).join(' | ')

	// switch 代码
	const _switches = languages.map((lang, i) => `case ('${LanguageCode[lang]}'):\n\t\t\treturn ${names[i]};`).join('\n\t\t')

	// 导出
	const _exports = `
export default {
	${languages.map((lang, i) => `"${LanguageCode[lang]}": ${names[i]},`).join('\n\t')}
}
	`

	const template = `
/* eslint-disable import/no-anonymous-default-export */
${_imports}

${_types}

export function getLocales(lang: ILocales)
{
	switch (lang)
	{
		${_switches}
		default:
			return ${names[0]}
	}
}
${_exports}
	`

	return template
}

/**
 * 生成国际化配置的 index 文件
 *
 * @param {Uri} workspaceIntlConfigPath
 * @param {SupportLanguage[]} languages
 * @param {string[]} configNames
 */
export const initializeIntlIndexFile = async (workspaceIntlConfigPath: Uri, languages: SupportLanguage[], configNames: string[]) =>
{
	const indexPath = getWorkspaceIntlJsonPath(workspaceIntlConfigPath, 'index.ts')

	try
	{
		await workspace.fs.stat(indexPath)
	}
	catch (e)
	{
		await workspace.fs.writeFile(indexPath, Buffer.from(_generateIndexTemplate(languages, configNames)))
	}

}
