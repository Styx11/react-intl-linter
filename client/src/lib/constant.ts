import { IntlCodeType } from "./ConfigManager"
import { SpecialStringParams, specialStringParams2String } from "./util/validator"

// 激活插件的语言文件，与根目录下的 package.json 中的 activationEvents 保持一致
export const ActivationLanguage = [
	"onLanguage:typescript",
	"onLanguage:typescriptreact",
	"onLanguage:javascriptreact",
	"onLanguage:javascript",
	"onLanguage:html",
	"onLanguage:vue"
]

// 从语言服务器发出的要执行的插件命令
export enum LinterCommands
{
	Extract = 'react-intl-linter.extract',          // 抽取中文字符串为 react-intl 代码
	DisableLine = 'react-intl-linter.disable-line', // 在中文代码前一行添加 ri-lint-disable-nextline 注释
	DisableFile = 'react-intl-linter.disable-file', // 在当前文件开始行添加 ri-lint-disable 注释
}

// intlCode 配置对应的代码 formatter 函数
export const LinterCode: { [key in IntlCodeType]: (intlId: string) => string } = {
	[IntlCodeType.REACT_INTL]: (intlId: string) => `intl.formatMessage({ id: '${intlId}' })`,
	[IntlCodeType.VUE_I18N]: (intlId: string) => `$t('${intlId}')`,
}

export const LinterCodeWithParams: { [key in IntlCodeType]: (intlId: string, params: SpecialStringParams[]) => string } = {
	[IntlCodeType.REACT_INTL]:
		(intlId: string, params: SpecialStringParams[]) => `intl.formatMessage({ id: '${intlId}' }, ${specialStringParams2String(params)})`,
	[IntlCodeType.VUE_I18N]:
		(intlId: string, params: SpecialStringParams[]) => `$t('${intlId}', ${specialStringParams2String(params)})`,
}

// 翻译结果 Map 缓存，将在 deactive 的时候清除
export const TranslationResultMap = new Map<string, string[]>()

export const CUSTOM_INTL_ID_REGX = /[A-Z_]+/

// json 文件的缩进数
export const JSON_SPACE = 4

// 自定义国际化内容选项
export const CUSTOM_PICK_OPTION = '自定义'

// 自定义 pick option 描述信息
export const CUSTOM_PICK_OPTION_DESC = '自定义 id，这会默认选择第一个翻译结果'

// 选择国际化文本 placeholder
export const CUSTOM_PICK_PLACEHOLDER = '请选择用来替换的国际化代码 id 内容'

// 自定义国际化输入框 placeholder
export const CUSTOM_INPUT_PLACEHOLDER = '请输入自定义的国际化代码 id 内容'

// 自定义 intl id 校验失败信息
export const INVALID_CUSTOM_ID_MESSAGE = '国际化代码 id 只能由大写字符或下划线组成'

// intl id 中的非法字符
export const INVALID_INTL_ID_CHARACTER = /[^A-Za-z\s]/ig

// configuration 配置域名
export const CONFIG_SECTION = 'reactIntlLinter'