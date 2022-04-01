<p align="center">
	<img src = 'https://s3.bmp.ovh/imgs/2022/03/d585cb1e11fe32cd.png' height="150"/>
</p>

<div align="center">

<h1 style='font-family:"FreeMono", monospace;'>react intl linter</h1>

![GitHub Repo stars](https://img.shields.io/github/stars/Styx11/react-intl-linter?style=social) <a href="https://marketplace.visualstudio.com/items?itemName=styx11.react-intl-linter" target="__blank"><img src="https://img.shields.io/visual-studio-marketplace/v/styx11.react-intl-linter.svg?color=eee&labelColor=2667B2&amp;label=VS%20Code%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version" /></a> ![GitHub](https://img.shields.io/github/license/Styx11/react-intl-linter?color=eee&labelColor=A2C348)

自动替换中文字符串为 react-intl 代码的 VS Code 插件，Market 👉 [Link](https://marketplace.visualstudio.com/items?itemName=styx11.react-intl-linter)

</div>

## 目录

* [介绍](#介绍)
	* [背景](#背景)
	* [工作流程](#工作流程)
	* [文本已存在现有配置](#文本已存在现有配置)
	* [文本不存在已有配置](#文本不存在已有配置)
* [使用](#使用)
	* [基本使用](#基本使用)
	* [Simple Argument](#Simple-Argument)
	* [Disabling Rules](#Disabling-Rules)
	* [注意](#注意)
* [多语言支持](#多语言支持)
	* [语言代码](#语言代码)
	* [例子](#例子)
* [配置](#配置)
* [Sponsor](#Sponsor)
* [Structure](#Structure)
* [Debug](#Debug)
* [License](#License)

## 介绍

该插件可以自动检测代码中的**中文字符串**，通过 CodeAction 翻译并生成对应的 intl 代码，另外插件会自动更新国际化配置文件。

### 背景
我在开发公司项目的时候会有国际化的需求，但是这个过程**异常繁琐且痛苦**，尤其是当一个 UI 里面含有大量文本时🤮。因为我们需要收集所有中文文本将他们翻译为英文，然后还要有一个配置文件对应的 intl id（也就是 `intl.formatMessage(id: ...)` 的 `id` 属性），最后再将它们一个一个填入配置文件中（为了规范化我们甚至还要对配置文件按照名称去排序😓）。所以我认为有必要开发一个自动化插件帮助我们解决以上所有问题！

### 工作流程

本插件作为 VSCode 语言类插件，工作流程如下：
1. 检测中文、特殊字符串并提示
2. 查看现有国际化配置是否已包含目标文本
3. 翻译文本至目标语言，用户可以选择或自定义 intl id 内容
4. 插件自动更新对应的国际化配置文件（配置会按照 `id` 名称进行排序）
5. 替换字符串为`intl.formatMessage({ id: ... })`代码

你可以直接将本插件应用到现有的前端项目中，也可以从一开始就将它加入到项目的 Bootstrap 里，插件会优先检查本地文本是否已经存在于已有的国际化配置文件中，如果没有，插件会自动为你生成所需的配置。它甚至可以根据本地语言和国际语言生成 react-intl 所需的 `index` 文件！

### 文本已存在现有配置
插件会优先检查工作区中是否存在该文本对应的国际化配置，若有会直接替换为对应 react-intl 代码
![](https://s3.bmp.ovh/imgs/2021/09/4d62fb749425d312.gif)

### 文本不存在已有配置
当一个中文文本既不存在已有国际化配置时，该插件会翻译文本生成对应的的 react-intl 代码，并自动修改国际化配置
![](https://s3.bmp.ovh/imgs/2021/09/26497bcd6aded4c0.gif)

## 使用
*注意：此插件默认在工作区`src/intl`目录下存放国际化配置文件，并默认用户使用的本地语言为**中文**，目标的国际语言为**英文***

🌐本插件提供了**多语言**支持并将其设计得足够灵活，如果你想自定义本地语言和目标国际语言，可以参考 [多语言支持](#多语言支持)

本插件默认工作区采用以下形式的 react-intl 国际化配置

1. 供 `IntlProvider` 使用的 `index` 文件（插件也可以自动生成）
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
2. 对应的国际化 json 文件
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
另外也可以使用`react-intl=`或`$=`标识符表示这段文本**含有特殊字符串**，或者这是一段除了中文外的**其他语言的文本**（isChinese 无法判断含有特殊字符的文本为中文字符）
```ts
const intl = useIntl()

const message = '$=Hello'
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

### Disabling Rules
类似于 ESLint，本插件也允许你在文件中使用注释来临时禁止规则出现警告：
```ts
// ri-lint-disable

const message = '这段话被禁止抛出警告'

// ri-lint-enable
```

可以在你的文件中使用以下格式的行注释或块注释在某一特定的行上禁用所有规则：
```ts
const message = '这段话被禁止抛出警告' // ri-lint-disable-line

// ri-lint-disable-next-line
const message_01 = '这段话被禁止抛出警告'

/* ri-lint-disable-next-line */
const message_02 = '这段话被禁止抛出警告'

const message_03 = '这段话被禁止抛出警告' /* ri-lint-disable-line */
```

注释规则遵循 **就近原则**，也就是说，一个句子之前如果有多个注释，那么它会应用离他最近的那个注释（包括句子那一行的）
```ts
// ri-lint-disable

// ri-lint-enable-next-line
const messsage = '这段话被禁止抛出警告' // ri-disable-line
```

你可以通过 CodeAction 方便地为句子添加规则注释：
[![HtwECT.gif](https://s4.ax1x.com/2022/02/10/HtwECT.gif)](https://imgtu.com/i/HtwECT)

以下是本插件目前支持的所有规则注释：
```ts
/* ri-lint-enable */  // 解析该注释之后的中文时，插件发出警告
/* ri-lint-disable */ // 解析该注释之后的中文时，插件不发出警告
/* ri-lint-enable-line */ // 解析该注释当前行的中文时，插件发出警告
/* ri-lint-disable-line */ // 解析该注释当前行的中文时，插件不发出警告
/* ri-lint-enable-next-line */ // 解析该注释后下一行的中文时，插件发出警告
/* ri-lint-disable-next-line */ // 解析该注释下一行的中文时，插件不发出警告
```

### 注意
⚠️因为百度翻译会将驼峰字符串转化为普通的字符串形式
```ts
'totalPage'
// 👇
'totalpage'
```
所以我们会统一将驼峰命名形式的参数转为下划线命名的形式
```ts
// 目标特殊文本
const message = '$=我说：{rawMessage: "你好"}'
// 👇
// 替换后的 react-intl 代码
const intl = intl.formatMessage({ id: "I_SAID_RAWMESSAGE" }, {raw_message: "你好"})

// 对应配置
// en_US
{
	"I_SAID_RAWMESSAGE": "I said: {raw_message}"
}
// zh_CN
{
	"I_SAID_RAWMESSAGE": "我说: {raw_message}"
}
```

## 多语言支持
*关于多语言的实现可参考 [issue#11](https://github.com/Styx11/react-intl-linter/issues/11)*

本插件将语言分为了两个概念：一是**本地语言**，二是**国际语言**。

本地语言表示用户使用的语言，它代表了本地文本的语言类型；国际语言表示用户想要覆盖到的所有外国语言类型，比如我们的本地语言为中文，我想要支持中英文的国际化，那么英文就是国际语言。

两种类型会影响我们对文本的翻译，因为我们要基于它们构建一对多的翻译 Token 并得到对应它们的翻译结果。

举个例子🌰，如果我们的本地语言是中文，国际语言包括英文、日文和繁体中文，那么它们的关系会是这样的：

<img src="https://s3.bmp.ovh/imgs/2022/03/f0b3a625ddbcba59.png" width="600"/>

用户使用本插件时可以灵活地组合本地语言和国际语言，插件会根据你的设置对这些国际化配置文件进行管理

<img src="https://s3.bmp.ovh/imgs/2022/03/c42ea11777c28a3f.png" width="600"/>

### 语言代码

下面是我们现在支持的所有语言以及它们对应的语言代码，用户可以使用这些语言代码进行相应的配置：

语言名称|代码
------|----
中文|zh
英语|en
日语|jp
繁体中文|cht

用户可以配置`"localLanguage"`和`"localLanguageConfigName"`来分别表示`本地语言`和`本地语言配置文件名`；

配置`"intlLanguage"`和`"intlLanguageConfigName"`来表示`国际语言数组`和`国际语言配置文件名数组`

需要注意的是：用户配置的`"intlLanguage"`数组和`"intlLanguageConfigName"`数组要**严格地一一对应**，否则插件无法正确的将文本写入对应的配置文件中。

### 例子

举个例子🌰，我们有以下配置文件：
```json
// .vscode/settings.json
{
    "reactIntlLinter.localLanguage": "en", // 本地语言为英语
    "reactIntlLinter.localLanguageConfigName": "en_US", // 本地语言配置文件名
    "reactIntlLinter.intlLanguage": [
        "zh", // 国际语言有中文和繁体中文
        "cht"
    ],
    "reactIntlLinter.intlLanguageConfigName": [
        "zh_CN", // 国际语言配置对应的文件名
        "zh_TW"
    ],
    "reactIntlLinter.intlConfigPath": "src/intl",
}
```
以上的配置表明我们的本地语言为**英文**，我们想要覆盖到**中文**和**繁体中文**的国际化，插件会自动将翻译文本写入到对应文件中，效果会是下面这样的：
![](https://s3.bmp.ovh/imgs/2022/03/71c25e6b448ecb9c.gif)

## 配置
本插件提供了诸如国际化配置文件夹路径、国际化配置文件名称和不同框架下的国际化代码等配置项可供用户在 `settings.json` 文件下自定义：

配置项|类型|默认值|描述
-----|-----|------|----
localLanguage|`string`|`'zh'`|本地语言代码 [语言代码](#语言代码)
localLanguageConfigName|`string`|`'zh_CN'`|本地语言配置 json 文件名（不包括后缀）
intlLanguage|`array`|`['en']`|国际语言代码数组 [语言代码](#语言代码)
intlLanguageConfigName|`array`|`['en_US']`|国际语言配置 json 文件名数组（不包括后缀）
intlConfigPath|`string`|`src/intl`|国际化配置文件夹路径名（相对于工作区根路径）
intlCode|`react-intl`\|`vue-i18n`|`react-intl`|目标国际化框架，支持 `react-intl`，`vue-i18n`。`react-intl` 对应代码为 `intl.formatMessage({id: ...})` ，`vueI18n` 对应代码为 `$t('id')`

其中，因为国际化代码还需要适配简单Message Syntax参数的使用（即使以上两种国际化框架使用的是同一参数语法），所以目前无法通过代码字符串的方式进行配置

***修改配置后，你需要重启 VS Code***

## Sponsor
由于我使用的翻译接口是需要收费的😅，所以如果这个插件你用的爽的话或许可以 Buy me a Coffee☕️

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