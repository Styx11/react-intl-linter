<div align="center">

![](./icon.png)
# react-intl-linter💡
自动替换中文字符串为 react-intl 代码的 VS Code 插件

</div>


## 功能

这个插件可以自动检测打开的文件中的包裹在单/双引号之间的**中文文本**，并提供用户一个提示，用户可以点击提示进行中文文本翻译并选择写入的 intl 内容，插件会自动更新配置文件
- 中文字符串提示
- 自动检测已有国际化配置是否已包含目标文本
- 翻译目标文本至英文，用户可以选择或自定义 intl id 内容
- 替换中文字符串为`intl.formatMessage({ id: ... })`


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