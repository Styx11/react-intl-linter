
// 激活插件的语言文件，与根目录下的 package.json 中的 activationEvents 保持一致
export const ActivationLanguage = [
	"onLanguage:plaintext",
	"onLanguage:typescript",
	"onLanguage:typescriptreact",
	"onLanguage:javascriptreact",
	"onLanguage:javascript",
	"onLanguage:html",
	"onLanguage:vue"
]

// 翻译结果 Map 缓存，将在 deactive 的时候清除
export const TranslationResultMap = new Map<string, string[]>()

export const getIntlMessage = (intlId: string) => `intl.formatMessage({ id: '${intlId}' })`

export const CUSTOM_INTL_ID_REGX = /[A-Z_]+/g

// json 文件的缩进数
export const JSON_SPACE = 4

// 自定义国际化内容选项
export const CUSTOM_PICK_OPTION = '自定义'

// 选择国际化文本 placeholder
export const CUSTOM_PICK_PLACEHOLDER = '请选择用来替换的国际化文本 id 内容'

// 自定义国际化输入框 placeholder
export const CUSTOM_INPUT_PLACEHOLDER = '请输入自定义的国际化 id 内容'

// 自定义 intl id 校验失败信息
export const INVALID_CUSTOM_ID_MESSAGE = '国际化 id 只能由大写字符或下划线组成'

// intl id 中的非法字符
export const INVALID_INTL_ID_CHARACTER = /[^A-Za-z\s]/ig