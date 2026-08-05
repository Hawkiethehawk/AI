---
title: "错误码及FAQ"
source: "https://help.toponad.net/cn/docs/cuo-wu-ma-ji-FAQ"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "Unity接入指南", "集成基础说明", "错误码及FAQ"]
content_sha256: "c52917a3130d19927a3d93d34eb39eca19241ec26a5624368dfc84438ed37d9f"
knowledge_role: "reference_only"
has_article_body: true
---

# 错误码及FAQ

TopOn Unity SDK的错误码及FAQ指引请参考：

| 系统平台 | 说明 |
| --- | --- |
| TopOn Android SDK | [查看](/cn/docs/55cxNt) |
| TopOn iOS SDK | [查看](/cn/docs/2HXlmO) |

**问：** 编译报错“call to undeclared function 'typeof'; ISO C99 and later do not support implicit function declarations -Wimplicit-function-declaration”具体如图所示



**答：** 由于C++版本的问题导致了，Build Settings -> Apple Clang - Language -> C Language Dialect -> 修改为c11，如果所示。



**问：** Unity导出来后，打包遇到了 Missing signing identifier at "xxxxxx/Frameworks/libswiftCore.dylib"，怎么解决。



**答：** 按下面步骤进行操作

1. 选择 **Unity-iPhone** 项目
2. 选择 **UnityFramework** 这个 **Target**
3. 点击选择 **Build Settings**
4. 在搜索框输入 **swift**
5. 设置 "**Always Embed Swift Standard Libraries**" 选项为 "**No**"

提示：是更改 **UnityFramework** 这个 **Target**，而不是 **Unity-iPhone** 这个 **Target**。

**问：** 遇到错误“Invalid Bundle. The bundle at 'Marooned.app/Frameworks/UnityFramework.framework' contains disallowed file 'Frameworks'.”

**答：** 在Build Phases下新增Run Script，并添加以下代码：

c
复制代码

```
cd "${CONFIGURATION_BUILD_DIR}/${UNLOCALIZED_RESOURCES_FOLDER_PATH}/Frameworks/UnityFramework.framework/"
if [[ -d "Frameworks" ]]; then
```
