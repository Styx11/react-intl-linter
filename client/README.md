<div align="center">

# react-intl-linterð¡
èªå¨æ¿æ¢ä¸­æå­ç¬¦ä¸²ä¸º react-intl ä»£ç ç VS Code æä»¶

</div>


## åè½

è¿ä¸ªæä»¶å¯ä»¥èªå¨æ£æµæå¼çæä»¶ä¸­çåè£¹å¨å/åå¼å·ä¹é´ç**ä¸­æææ¬**ï¼å¹¶æä¾ç¨æ·ä¸ä¸ªæç¤ºï¼ç¨æ·å¯ä»¥ç¹å»æç¤ºè¿è¡ä¸­æææ¬ç¿»è¯å¹¶éæ©åå¥ç intl åå®¹ï¼æä»¶ä¼èªå¨æ´æ°éç½®æä»¶
- ä¸­æå­ç¬¦ä¸²æç¤º
- èªå¨æ£æµå·²æå½éåéç½®æ¯å¦å·²åå«ç®æ ææ¬
- ç¿»è¯ç®æ ææ¬è³è±æï¼ç¨æ·å¯ä»¥éæ©æèªå®ä¹ intl id åå®¹
- æ¿æ¢ä¸­æå­ç¬¦ä¸²ä¸º`intl.formatMessage({ id: ... })`


## Structure

```
.
âââ client // Language Client
â   âââ src
â   â   âââ extension.ts // Language Client entry point
âââ package.json // The extension manifest.
âââ server // Language Server
    âââ src
        âââ server.ts // Language Server entry point
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