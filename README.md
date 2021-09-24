<div align="center">

![](https://s3.bmp.ovh/imgs/2021/09/c9214e94371f0e22.png)
# react-intl-linter💡
自动替换中文字符串为 react-intl 代码的 VS Code 插件，Market 👉 [Link](https://marketplace.visualstudio.com/items?itemName=styx11.react-intl-linter)

</div>


## 功能

这个插件可以自动检测代码中的**中文字符串**，通过 CodeAction 该插件可以自动翻译并选择替换的 intl 代码，另外插件会自动更新配置文件
- 中文字符串提示
- 自动检测已有国际化配置是否已包含目标文本
- 翻译目标文本至英文，用户可以选择或自定义 intl id 内容
- 插件自动更新对应的 react-intl 配置文件
- 替换中文字符串为`intl.formatMessage({ id: ... })`

## 使用
*注意：* 此插件默认在工作区`src/intl`目录下存放国际化配置文件

### 文本不存在已有配置
当一个中文文本既不存在已有国际化配置，也没有翻译缓存时，该插件会翻译文本生成用来替换的 react-intl 代码，并修改国际化配置
![](https://s3.bmp.ovh/imgs/2021/09/26497bcd6aded4c0.gif)

### 文本不存在已有配置，但存在翻译缓存
若文本已存在翻译缓存，但不存在已有配置，该插件会替换文本为 react-intl 代码，并修改国际化配置
![](https://s3.bmp.ovh/imgs/2021/09/6f05013aca01e4b5.gif)

### 本文已存在现有配置
插件会检查文本是否已有对应国际化配置，若有会直接替换为对应 react-intl 代码
![](https://s3.bmp.ovh/imgs/2021/09/4d62fb749425d312.gif)


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