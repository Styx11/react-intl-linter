
// 常见语种表可参考 baidu 翻译 api：https://fanyi-api.baidu.com/doc/21

import axios from "axios"
import ConfigManager, { LinterConfigItem } from "../../config/ConfigManager"
import { getCleanIntlId } from "../intl/utils"
import { BaiduResponse, getBaiduSource } from "./baidu"
import { capitalize } from "./util"

// 翻译结果 Map 缓存，将在 deactive 的时候清除
export const TranslationResultMap = new Map<string, string[]>()

// 支持的所有国际化目标语言
export enum SupportLanguage
{
	ZH = 'zh',    // 中文
	EN = 'en',    // 英语
	CHT = 'cht',  // 繁体中文
	JP = 'jp',    // 日文
}

export default class TranslateManager
{
	private static _instance: TranslateManager

	// 本地语言
	private _localLanguage: SupportLanguage

	// 目标国际语言
	private _intlLanguages: SupportLanguage[]

	// 本地语言到所有国际语言的翻译 Token
	private _translateQuerys: string[]

	// 用于生成 intl id 的英文文本
	// 来源可能为：
	//   1. 本地语言即为英文
	//   2. 国际语言中含有英文，我们在翻译结果中取值
	//   3. 以上情况都不成立，我们会自行翻译一次英文
	private _intlIdENText: string

	static getInstance()
	{
		if (!this._instance)
		{
			this._instance = new TranslateManager()
		}
		return this._instance
	}

	protected constructor()
	{
		const localLanguage = ConfigManager.getInstance().getConfig(LinterConfigItem.localLanguage)

		const intlLanguages = ConfigManager.getInstance().getConfig(LinterConfigItem.intlLanguage)

		if (intlLanguages.includes(localLanguage as any)) throw new Error('目标语言不能与本地语言相同，请检查您的配置文件')

		this._localLanguage = localLanguage

		this._intlLanguages = [...new Set<SupportLanguage>(intlLanguages)]

		this._translateQuerys = []

		this._intlIdENText = ''
	}

	/**
	 * 根据目标国际化语言生成翻译链接数组
	 *
	 * @private
	 * @param {string} query - 目标文本
	 * @return {*}  {string[]} - 翻译 api 数组
	 * @memberof TranslateManager
	 */
	private getTranslateSourceQueue(query: string): string[]
	{
		if (!this._translateQuerys.length)
		{
			this._translateQuerys = this._intlLanguages.map(il => getBaiduSource(query, this._localLanguage, il))
		}
		return this._translateQuerys
	}

	/**
	 * 获取所有 本地语言到国际化语言 的翻译结果
	 *
	 * @param {string} query - 本地目标文本
	 * @return {*}  {Promise<string[]>}
	 * @memberof TranslateManager
	 */
	public async getTranslationResult(query: string): Promise<string[]>
	{
		if (!query) return []

		let enSource = ''

		// 获取 intl id 的英文文本
		if (this._localLanguage === SupportLanguage.EN)
		{
			this._intlIdENText = query
		}
		else if (!this._intlLanguages.includes(SupportLanguage.EN))
		{
			console.log('we fetch en text manually')
			enSource = getBaiduSource(query, this._localLanguage, SupportLanguage.EN)
		}

		const sources = this.getTranslateSourceQueue(query)

		const axiosRes = await Promise.all([
			...sources.map(source => axios.get<BaiduResponse>(source)),
			...(enSource ? [axios.get<BaiduResponse>(enSource)] : []),
		])

		const result = axiosRes.map(res =>
		{
			const {
				to,
				trans_result,
				error_code,
			} = res.data

			if (res.data.error_code) throw new Error('翻译错误码' + error_code)

			const dst = trans_result[0] ? trans_result[0].dst : ''

			if (to === SupportLanguage.EN) this._intlIdENText = dst

			return capitalize(dst)
		})

		// 如果我们人工获取了英文文本，则需要把它从结果数组里面去除
		enSource ? result.pop() : result

		return result

	}

	public getIntlId(): string
	{
		return getCleanIntlId(this._intlIdENText)
	}

}
