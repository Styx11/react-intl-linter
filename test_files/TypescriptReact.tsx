// ri-lint-disable
"UPPERCASE TEXT"

'一个文本'

// ri-lint-enable
"这是另一个文本"

'这是一个特殊的文件'

// ri-lint-disable
'react-intl=你好，{status: 无敌的}{name: Fred 哥}';

'$=你好，{nameTitle: Fred 哥}' // ri-lint-enable-line

'$=共 {total: 100} 条记录，第 {page: 1}/{totalPage: 10} 页'

'$=添加'

// ri-lint-enable
'添加'

const tabTest = () =>
{
    const validMessage = true
        ? 'test disabling linter for line in tab case'
        : '这是一个测试'
}

// https://github.com/Styx11/react-intl-linter/issues/7
const validMessage = true ? '' : '你好'; const followMessage = true ? '你好' : ''

const message = `${"添加"}hellllllo${"添加"}` /* ri-lint-disable-line */

const testMsg = `${'添加'}hellllllo${'一个文本'}hellllllo{"这是另一个文本"}`

"English!!!"