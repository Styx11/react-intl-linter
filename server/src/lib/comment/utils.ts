import { EnableComment, EnableCommentRules } from "./rules";

// 匹配行注释
const lineCommentRegex = /(?:^|\s)\/\/(.+?)$/gms

// 匹配块注释
const blockCommentRegex = /\/\*(.*?)\*\//gms;

// 匹配行注释和块注释
const commentRegex = new RegExp(`(?:${lineCommentRegex.source})|(?:${blockCommentRegex.source})`, 'gms');


/**
 * 获取字符串中多个注释的内容
 *
 * @param {string} target 目标字符串
 * @return {*}  {string[]} 注释内容，可有多个，比如块注释后跟一个行注释
 */
const getCommentContent = (target: string): string[] =>
{
	let match: RegExpExecArray | null;
	const contentList: string[] = []

	while ((match = commentRegex.exec(target)))
	{
		const content = (match[1] || match[2] || '').replace(/\*|\n/g, '').trim()
		// 倒序插入内容（同一行的多个注释以最后一个注释为准）
		content && contentList.unshift(content)
	}

	return contentList
}

/**
 * 获取字符串中最后一个内容为 Enable Comment 的注释内容
 *
 * @param {string} target
 * @return {*}  {(EnableComment | undefined)}
 */
export const getEnableComment = (target: string): EnableComment | undefined =>
{
	const commentList = getCommentContent(target)
	return commentList.find(comment => comment in EnableCommentRules) as EnableComment | undefined
}
