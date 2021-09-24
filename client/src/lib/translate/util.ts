
/**
 * 讲英文字符串第一个字符转为大写
 *
 * @param {string} string
 * @return {*}
 */
export const capitalize = (string: string) =>
{
	return string.charAt(0).toUpperCase() + string.slice(1);
}
