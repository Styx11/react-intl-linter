import { URLSearchParams } from 'url';
import { v4 as uuidv4 } from 'uuid';
import md5 from 'blueimp-md5';
import axios from 'axios';

export interface BaiduResponse
{
	from: string;
	to: string;
	trans_result: Array<{ src: string; dst: string }>;
	error_code?: number;
}

/**
 * this module is used to get baidu translation resource
 * including sentence translation and the dictionary resource
 *
 * @param {string} query - 查询字符串
 * @param {boolean} [isChinese] - 查询字符串是否为中文
 * @return {*} string - 请求链接
 */
export const getBaiduSource = (query: string, isChinese?: boolean): string =>
{
	const q = query.toLocaleLowerCase();
	const appid = '20191014000341469';
	const key = '4GEOkedoeuLlSiwypAoD';
	const baidu = 'http://api.fanyi.baidu.com/api/trans/vip/translate';
	const from = 'auto';
	const to = isChinese ? 'en' : 'zh'; // to can't be auto
	const salt = uuidv4(); // UUID
	const str = appid + q + salt + key;
	const dict = '1'

	// 获取 md5 加密后的 sign
	const sign = md5(str);

	// 构建参数
	// 这里也会做 URL encode 操作
	const search = new URLSearchParams({
		q,
		from,
		to,
		appid,
		salt,
		sign,
		dict,
	}).toString();

	const source = `${baidu}?${search}`;

	return source;
};


/**
 * 翻译中文文本，错误将会被抛出
 *
 * @param {string} query - 将要翻译的中文文本
 * @return {*}  {Promise<string[]>} - 翻译结果数组
 */
export const getZhTranslation = async (query: string): Promise<string[]> =>
{
	if (!query) return []

	const source = getBaiduSource(query, true)

	const result = await axios.get<BaiduResponse>(source)

	const {
		trans_result,
		error_code,
	} = result.data

	if (result.data.error_code) throw new Error('翻译错误码' + error_code)

	console.log('translationResult', result)

	return trans_result.map(r => r.dst)
}