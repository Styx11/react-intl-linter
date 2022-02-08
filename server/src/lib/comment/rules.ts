
// 和是否启用 linter 警告相关的注释
export enum EnableComment
{
	ENABLE = 'ri-lint-enable', // 解析该注释之后的中文时，插件发出警告
	DISABLE = 'ri-lint-disable', // 解析该注释之后的中文时，插件不发出警告
	ENABLE_LINE = 'ri-lint-enable-line', // 解析该注释当前行的中文时，插件发出警告
	DISABLE_LINE = 'ri-lint-disable-line', // 解析该注释当前行的中文时，插件不发出警告
	ENABLE_NEXT_LINE = 'ri-lint-enable-next-line', // 解析该注释后下一行的中文时，插件发出警告
	DISABLE_NEXT_LINE = 'ri-lint-disable-next-line', // 解析该注释下一行的中文时，插件不发出警告
}

// Enable Comment 规则内容
// sentLine: number - 句子所在行数
// commentLine: number - 注释所在行数
interface EnableRule
{
	// 检查该规则是否可用（是否在该规则作用范围内）
	checkAvailable: (sentLine: number, commentLine: number) => boolean;
	// 解析某行中文时，是否能够抛出警告；
	enable: boolean;
}

// 和是否启用 linter 警告相关的规则函数
export const EnableCommentRules: { [key in EnableComment]: EnableRule } = {
	[EnableComment.ENABLE]: {
		checkAvailable: (_sl: number, _cl: number) => _sl > _cl,
		enable: true,
	},
	[EnableComment.DISABLE]: {
		checkAvailable: (_sl: number, _cl: number) => _sl > _cl,
		enable: false,
	},
	[EnableComment.ENABLE_LINE]: {
		checkAvailable: (_sl: number, _cl: number) => _sl === _cl,
		enable: true,
	},
	[EnableComment.DISABLE_LINE]: {
		checkAvailable: (_sl: number, _cl: number) => _sl === _cl,
		enable: false,
	},
	[EnableComment.ENABLE_NEXT_LINE]: {
		checkAvailable: (_sl: number, _cl: number) => _sl - 1 === _cl,
		enable: true,
	},
	[EnableComment.DISABLE_NEXT_LINE]: {
		checkAvailable: (_sl: number, _cl: number) => _sl - 1 === _cl,
		enable: false,
	}
}
