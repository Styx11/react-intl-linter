
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

// 自定义国际化内容选项
export const CUSTOM_PICK_OPTION = '自定义'

// 自定义国际化输入框内容
export const CUSTOM_INPUT_CONTENT = "intl.formatMessage({ id: '' })"

// 选择国际化文本 placeholder
export const CUSTOM_PICK_PLACEHOLDER = '请选择用来替换的国际化文本'

// 自定义国际化输入框 placeholder
export const CUSTOM_INPUT_PLACEHOLDER = '请输入自定义的国际化文本内容'