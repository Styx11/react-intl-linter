<div align="center">

![](https://s3.bmp.ovh/imgs/2021/10/06051d4647fc92de.png)
# react-intl-linter💡
自动替换中文字符串为 react-intl 代码的 VS Code 插件，Market 👉 [Link](https://marketplace.visualstudio.com/items?itemName=styx11.react-intl-linter)

</div>


## 功能

该插件可以自动检测代码中的**中文字符串**，并通过 CodeAction 翻译并生成对应的的 intl 代码，另外插件会自动更新配置文件
- 中文字符串提示
- 自动检测已有国际化配置是否已包含目标文本
- 翻译目标文本至英文，用户可以选择或自定义 intl id 内容
- 插件自动更新对应的 react-intl 配置文件
- 替换中文字符串为`intl.formatMessage({ id: ... })`

### 本文已存在现有配置
插件会优先检查工作区中是否存在该文本对应的国际化配置，若有会直接替换为对应 react-intl 代码
![](https://s3.bmp.ovh/imgs/2021/09/4d62fb749425d312.gif)

### 文本不存在已有配置
当一个中文文本既不存在已有国际化配置，也没有翻译缓存时，该插件会翻译文本生成对应的的 react-intl 代码，并自动修改国际化配置
![](https://s3.bmp.ovh/imgs/2021/09/26497bcd6aded4c0.gif)

## 使用
*注意：此插件默认在工作区`src/intl`目录下存放国际化配置文件*

本插件默认工作区采用以下形式的 react-intl 国际化配置

供 `IntlProvider` 使用的 `index` 文件
```ts
// src/intl/index.ts
import zh_CN from "./zh_CN.json";
import en_US from "./en_US.json";

export type ILocales = 'en-US' | 'zh-CN'

export function getLocales(lang: ILocales)
{
	switch (lang)
	{
		case ('en-US'):
			return en_US
		case ('zh-CN'):
			return zh_CN
		default:
			return en_US
	}
}

export default {
	"en-US": en_US,
	"zh-CN": zh_CN
}
```
以及对应的国际化 json 文件
```json
// src/intl/zh_CN.json
{
	"HELLO": "你好",
}

// src/intl/en_US.json
{
	"HELLO": "Hello",
}
```

### 基本使用
在 React 中最基本的使用是识别一个中文字符串
```ts
const intl = useIntl()

const message = '你好'
// 👇
const message = intl.formatMessage({ id: 'HELLO' })
```
或者使用`react-intl=`或`$=`标识符表示这段文本含有特殊字符串（isChinese 无法判断含有特殊字符的文本为中文字符）
```ts
const intl = useIntl()

const message = '$=你好'
// 👇
const message = intl.formatMessage({ id: 'HELLO' })
```

当然在 JSX 元素内部你需要给这个字符串加上大括号表示这是一段 JS 代码
```ts
import React from 'react'
import { useIntl } from 'react-intl'

const Element = () =>
{
	const intl = useIntl()

	return <div>
		{'你好'}
		// 👇
		{intl.formatMessage({ id: 'HELLO' })}
	</div>
}
```

### Simple Argument
本插件支持 react-intl 简单的参数语法 [Message Syntax](https://formatjs.io/docs/core-concepts/icu-syntax/)

关于本插件对该功能的实现可以参考 issue [#4](https://github.com/Styx11/react-intl-linter/issues/4)

![](https://s3.bmp.ovh/imgs/2021/10/3df04aafd0903159.gif)

其中我们使用普通的对象字面量来声明句子中的参数：

```ts
// 目标特殊文本
const message = 'react-intl=你好，{name: "约翰"}'
// 👇
// 替换后的 react-intl 代码
const intl = intl.formatMessage({ id: "HELLO_NAME" }, {name: "约翰"})

// 拿去翻译的结果，真正的内容由参数传递
const transTarget = '你好，{name}'

// 处理后供选择的 intlId
const intlId = 'HELLO_NAME'
// 翻译后的中文结果
const transZHResult = '你好，{name}'
// 翻译后的英文结果
const transENResult = 'Hello, {name}'

```

🚨注意：因为百度翻译会将驼峰字符串转化为普通的字符串形式
```ts
'totalPage'
// 👇
'totalpage'
```
所以我们目前只能把驼峰属性名改为普通的字符串形式或使用下划线

## 配置
本插件提供了诸如国际化配置文件夹路径、国际化配置文件名称和不同框架下的国际化代码等配置项可供用户在 `settings.json` 文件下自定义：

配置项|类型|默认值|描述
-----|-----|------|----
reactIntlLinter.zhConfigName|`string`|`zh_CN`|中文配置 json 文件名（不包括后缀）
reactIntlLinter.enConfigName|`string`|`en_US`|英文国际化配置 json 文件名（不包括后缀）
reactIntlLinter.intlConfigPath|`string`|`src/intl`|国际化配置文件夹路径名（相对于工作区根路径）
reactIntlLinter.intlCode|`react-intl`\|`vue-i18n`|`react-intl`|目标国际化框架，支持 `react-intl`，`vue-i18n`。`react-intl` 对应代码为 `intl.formatMessage({id: ...})` ，`vueI18n` 对应代码为 `$t('id')`

其中，因为国际化代码还需要适配简单Message Syntax参数的使用（即使以上两种国际化框架使用的是同一参数语法），所以目前无法通过代码字符串的方式进行配置

修改配置后，你需要重启 VS Code

## Sponsor
由于我使用的翻译借口是需要收费的😅，所以如果这个插件你用的爽的话或许可以 Buy me a Coffee☕️

![](https://s3.bmp.ovh/imgs/2021/12/ed04d7e65151baef.jpeg) ![](https://s3.bmp.ovh/imgs/2021/12/e21aa23150ba2e13.jpeg)

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Debug

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a document in 'plain text' language mode.
  - Activate code action on the error on the first line.

## License
Apache License 2.0