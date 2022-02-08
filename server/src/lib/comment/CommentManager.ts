import { EnableComment, EnableCommentRules } from "./rules";
import { getEnableComment } from "./utils";


// 代码原始文本中的换行符
const LINE_BREAK = '\n'

interface CommentContent
{
	comment: EnableComment;
	line: number;
}

interface DocumentInfo
{
	// 文件原始文本（包括换行符）
	rawContent: string;
	// 规则相关注释信息数组
	commentContent: CommentContent[]
}

/**
 * 处理注释规则的单例 Singleton，其中因为每行文本以 \n 结尾，所以 \n 的数量即为代码的行数
 * 参考 issue https://github.com/Styx11/react-intl-linter/issues/10
 *
 * @class CommentManager
 */
class CommentManager
{
	private static _instance: CommentManager;

	// 文件 uri 对应 DocumentInfo 的 map
	private _uriContentMap: { [key: string]: DocumentInfo | undefined };

	public static getInstance()
	{
		if (!this._instance)
		{
			this._instance = new CommentManager()
		}
		return this._instance
	}

	protected constructor()
	{
		this._uriContentMap = {}
	}

	/**
	 * 根据文档内容获取 DoucmentInfo
	 *
	 * @private
	 * @param {string} content
	 * @memberof CommentManager
	 */
	private _getDocumentInfo = (content: string): DocumentInfo =>
	{
		const _commentContent = content
			.split(LINE_BREAK)
			.reduce((acc: CommentContent[], cur: string, idx: number) =>
			{
				const comment = getEnableComment(cur)
				return !comment ? acc : acc.concat({
					comment,
					line: idx,
				})
			}, [])
		return {
			rawContent: content,
			commentContent: _commentContent,
		}
	}

	/**
	 * 设置文件 uri 对应文档信息
	 *
	 * @param {string} uri 文档 uri
	 * @param {string} content 文档中的原始文本
	 * @memberof CommentManager
	 */
	public setUriDocument = (uri: string, content: string) =>
	{
		if (!this._uriContentMap[uri] || this._uriContentMap[uri]?.rawContent !== content)
		{
			this._uriContentMap[uri] = this._getDocumentInfo(content)
		}
		return this
	}

	/**
	 * 找到目标句子当前行之前最近的、且在其作用域范围内的 Enable 注释（包括当前行，比如 ri-linter-enable-line）
	 *
	 * @private
	 * @param {number} line 目标字符串行数
	 * @return {CommentContent} 最近的 EnableComment 内容（包括行数）
	 * @memberof CommentManager
	 */
	private _findNearestEnablComment = (uri: string, line: number): CommentContent | undefined =>
	{
		const commentContent = this._uriContentMap[uri]?.commentContent
		if (!Array.isArray(commentContent) || !commentContent.length) return

		const nearestComment = commentContent
			.filter(content => line - content.line >= 0)
			.sort((a, b) => b.line - a.line)
			.find(comment => EnableCommentRules[comment.comment].checkAvailable(line, comment.line))

		return nearestComment
	}


	/**
	 * 目标字符串在 Enable Comment 规则下是否需要抛出警告
	 *
	 * @param {string} uri 文档对象 uri
	 * @param {string} targetLine 目标字符串所在行数
	 * @return {boolean} linter 是否能够抛出警告
	 * @memberof CommentManager
	 */
	public checkEnableCommentRules = (uri: string, targetLine: number): boolean =>
	{
		const enableComment = this._findNearestEnablComment(uri, targetLine)
		const enableRule = enableComment ? EnableCommentRules[enableComment.comment].enable : true

		return enableRule
	}
}

export default CommentManager
