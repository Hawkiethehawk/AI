---
title: "iOS"
source: "https://help.toponad.net/cn/docs/iOS-9PTJ"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "常见问题", "iOS"]
content_sha256: "f3fa37b4cabe81c9c9ecc0977d4cc31a6996e5138f1b18280adcc463b02ac792"
knowledge_role: "reference_only"
has_article_body: true
---

# iOS

## ● 横幅广告

### ● 横幅广告展示时出现高度被裁剪的情况，如何设置横幅广告尺寸？

**答：** 由于某些平台（如穿山甲、优量汇、Mintegral等）的横幅广告有固定尺寸限制，我们建议采取以下步骤配置横幅广告位：

1. **选择合适的尺寸比例：** 配置横幅广告位时，选择与广告尺寸比例相近的模板。例如，如果配置的穿山甲横幅广告尺寸为 640x100，为了填满屏幕宽度，可以计算广告高度 H = (屏幕宽度 \* 100) / 640，然后在加载广告时，设置 `extra` 参数中的尺寸为 (屏幕宽度, H)。
2. **检查尺寸匹配：** 确保调用接口时传递的尺寸和后台配置的尺寸匹配，以避免裁剪问题。为了获得最佳展示效果，建议在同一个横幅广告位中，所有广告源的尺寸设置尽量一致或差异尽可能小。例如，避免设置高度为 90 和 260 的广告源，以减少高度差异。

### ● 自动刷新配置会跟其他广告平台冲突吗？

答：TopOn 后台提供了自动定时刷新的配置选项。为了避免与广告平台的自动刷新设置冲突，请确保关闭广告平台中的广告位自动刷新选项。这样可以避免展示数据异常的问题。

## ● 原生广告

### ● 原生自渲染信息流点击没有反应。

**答：** 请检查以下几个步骤：

1. **注册点击事件的控件：** 确保不要将父视图和 `dislikeButton` 注册到点击事件中，以免点击关闭广告时也触发点击效果。
2. **绑定视图控件：** 确保正确绑定自渲染视图与 SDK 内部视图控件之间的关系。
3. **调用渲染视图方法：** 确保已经调用了渲染视图的方法以正确显示广告内容。

复制代码

```
// 1、注册点击事件的控件
- (void)registerClickableViewArray:(NSArray *)registerClickViewArray;

//2、绑定自渲染视图跟SDK内部视图控件的关系
+ (instancetype)loadPrepareInfo: (void(^)(ATNativePrepareInfo *prepareInfo))loadPrepareInfoBlock;

//3、调用渲染视图方法
- (void) rendererWithConfiguration:(ATNativeADConfiguration*)configuration selfRenderView:(UIView *_Nullable)selfRenderView nativeADView:(ATNativeADView *)nativeADView;
```

### ● 渲染 AdMob 的原生自渲染广告时，为什么控件的显示与 XIB 约束不一致？

**答：** 目前不支持使用 XIB 等拖线控件的方式集成 AdMob 的原生自渲染广告。请使用手动布局的方式进行集成，以确保控件的显示符合预期。

### ● 原生广告展示数据异常。

**答：** 广告平台对广告展示素材有特定要求。请检查以下内容以确保广告正常展示：

1. **素材要求：** 确保原生广告的素材符合广告平台的展示要求。
2. **MediaView 检查：** 对于模板广告，广告返回对象中会包含 `MediaView`。请确保 `MediaView` 能够正常显示广告内容。

更多关于原生广告的信息，您可以[点击此处](/cn/docs/upRFvP)。

### ● 广告加载不完整，图片或视频显示不出来。

**答：** 这个问题可能是因为应用未启用 `NSAppTransportSecurity`。请按照以下步骤解决：

1. 打开 `info.plist` 文件。
2. 添加以下配置：

复制代码

```
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true></true>
</dict>
```

## ● 插屏广告

### ● 支持插屏广告，用户点击后广告消失吗？

答：目前不支持该功能。

## ● 激励视频广告

### ● 看完激励视频广告后，为什么没有收到奖励？

**答：** 这种问题通常是由于广告播放状态异常，导致没有触发平台的奖励发放规则。为了解决这个问题，建议按照以下步骤操作：

1. **检查日志：** 查看出现问题时的日志，检查是否有关于播放错误的日志信息。
2. **分析问题：** 根据日志信息分析问题的根本原因。

获取更多关于激励视频广告的信息，请[点击这里](/cn/docs/CK7G9L)。

## ● 开屏广告

### ● 点击开屏广告后，广告详情没有跳转，广告展示页也关闭了。

**答：** 这个问题可能有两个原因：

1. **缺少导航栏控制器：** 开屏广告的应用内跳转使用的是 `push` 方式。如果当前控制器没有导航栏控制器，跳转可能会失败。解决方法是为当前控制器添加一个导航栏控制器。
2. **广告展示页被关闭：** 点击广告后，如果广告展示页被 `dismiss` 移除，则广告详情页无法展示。请检查开屏广告的关闭回调中是否有移除当前展示控制器的操作，确保该操作不会干扰广告详情页的展示。

### ● 开屏广告顶部被遮挡或底部的 `logoView` 视图被遮挡。

**答：** 为避免开屏广告顶部或底部被遮挡的问题，请确保传入正确的控制器：

1. **没有 UITabBarController：** 如果您的界面没有 `UITabBarController`，请传入 `UINavigationController` 作为展示控制器。
2. **有 UITabBarController：** 如果界面中有 `UITabBarController`，请传入 `UITabBarController` 作为展示控制器。

您可以选择相关方法进行调用。

## ● 其他问题

### ● 为什么新创建的 AdMob 广告一直没有填充？

**答：** AdMob 对新创建的广告流量有一定限制，因此刚创建的广告位在初期可能填充率较低。为了验证广告集成是否正确，可以使用 AdMob 的测试广告位 ID 进行测试。使用测试广告位 ID 可以确保您的集成配置无误，并排除填充问题。

### ● 广告加载成功，但调用 `showAPI` 后无法展示广告。

**Error Domain=com.google.admob Code=17 "The provided view controller is already presenting another view controller."**

- **原因：** 这个错误通常发生在一个已经展示了其他视图控制器的控制器上再次调用 `present` 方法。即一个控制器在已经 `presented` 的情况下再次尝试展示另一个控制器。
- **解决办法：** 使用其他控制器（例如当前的栈顶控制器）来展示广告素材。确保所用的控制器没有在展示其他控制器。

**Attempt to present AdVc on VC whose view is not in the window hierarchy!**

- **原因：** 这个错误表示尝试展示的视图控制器（即 `self`）的视图不在窗口层次结构中，通常是因为视图控制器的视图尚未被添加到任何视图层次结构中。
- **解决办法：** 使用 `[UIApplication sharedApplication].keyWindow.rootViewController` 而不是 `self` 来展示您的视图控制器。另外，确保视图控制器的视图在 `viewDidAppear` 方法中展示，这样可以保证视图已经完全加载并添加到视图层次结构中。

如果您遇到的并非上面的示例， 解决这个问题需要通过控制台日志进行排查。关键步骤如下：

1. **检查展示失败回调：** 查看代理中的展示失败回调（注意：横幅广告和原生信息流广告可能没有该回调）。根据失败提示进行相应的调整和修复。
2. **查看代理和错误日志：** 如果没有代理或代理没有错误打印，需要仔细检查日志中的关键信息。定位到控制台信息后的错误打印，进一步解决问题。如果仍无法解决，可以将日志反馈给我们进行进一步分析。

复制代码

```
💚💚 ATAdLogger(UA_6.1.88) Message:
API invocation info:
*****************************
{
    "ad_type" = xxxxx;
    api = show;
    "placement_id" = xxxxx;
    result = start;
}
```

###

### ● 展示的广告是黑屏或图片不全

答：解决此问题可以按照以下步骤进行排查：

1. **检查 plist 设置：** 广告平台下发的素材可能是 HTTP 的，请确保 `plist` 文件中的设置允许 HTTP 请求。可以添加以下配置：

   复制代码

   ```
   <key>NSAppTransportSecurity</key>
   <dict>
       <key>NSAllowsArbitraryLoads</key>
       <true></true>
   </dict>
   ```
2. **检查网络环境：** 确保网络环境正常。网络异常可能导致素材加载失败或加载过慢，进而导致黑屏或图片不全。
3. **反馈素材问题：** 使用抓包工具获取广告素材信息，并反馈给广告平台，让他们检查素材的正确性或屏蔽问题广告。可以通过广告中的 logo 图标获取素材地址，然后进行截图、录屏等操作，以便于广告平台排查。

### ● 展示的广告没有关闭按钮

**答：** 解决此问题可以按照以下步骤进行排查：

- **广告类型:** 不同广告类型的关闭按钮显示时间可能不同。例如，激励视频广告通常在广告观看结束后才显示关闭按钮。请检查广告位设置，确保允许出现关闭按钮。
- **广告平台设置:** 对于其他广告类型，检查广告平台是否有关闭按钮的设置，并确认该设置是否正确。
- **自渲染信息流广告:** 如果使用的是自渲染信息流广告，确保广告素材已正确渲染并显示。

### ● 广告没有回调。

**答：** 解决此问题的步骤如下：

1. **确认 SDK 初始化：** 请确保正确导入并初始化 TopOn iOS SDK。检查 SDK 的文档，确保所有初始化步骤都已正确执行。
2. **检查监听对象配置：** 确保您在代码中为广告加载设置了适当的代理（delegate）。每个广告位需要单独配置代理，以确保能够接收到相应的回调。

### ● App打包提交App Store时失败

答：如果您的应用程序导入SDK后，在打包提交App Store时报如下错误：



这是因为苹果提审只接受Arm架构，不支持x86等架构，某些SDK中包含了x86架构。解决如下： 在**Build Phase** -> **New Run Scrip Phase**



添加**new Run Script Phase**之后，会出现**Run Script**，然后在里面添加一段代码，如下：

复制代码

```
APP_PATH="${TARGET_BUILD_DIR}/${WRAPPER_NAME}"

# This script loops through the frameworks embedded in the application and
# removes unused architectures.
find "$APP_PATH" -name '*.framework' -type d | while read -r FRAMEWORK
do
    FRAMEWORK_EXECUTABLE_NAME=$(defaults read "$FRAMEWORK/Info.plist" CFBundleExecutable)
    FRAMEWORK_EXECUTABLE_PATH="$FRAMEWORK/$FRAMEWORK_EXECUTABLE_NAME"
    echo "Executable is $FRAMEWORK_EXECUTABLE_PATH"

    EXTRACTED_ARCHS=()

    for ARCH in $ARCHS
    do
        echo "Extracting $ARCH from $FRAMEWORK_EXECUTABLE_NAME"
        lipo -extract "$ARCH" "$FRAMEWORK_EXECUTABLE_PATH" -o "$FRAMEWORK_EXECUTABLE_PATH-$ARCH"
        EXTRACTED_ARCHS+=("$FRAMEWORK_EXECUTABLE_PATH-$ARCH")
    done

    echo "Merging extracted architectures: ${ARCHS}"
    lipo -o "$FRAMEWORK_EXECUTABLE_PATH-merged" -create "${EXTRACTED_ARCHS[@]}"
    rm "${EXTRACTED_ARCHS[@]}"

    echo "Replacing original executable with thinned version"
    rm "$FRAMEWORK_EXECUTABLE_PATH"
    mv "$FRAMEWORK_EXECUTABLE_PATH-merged" "$FRAMEWORK_EXECUTABLE_PATH"

done
```

添加完脚本代码块后，勾选上**Run script only when installing**，重新打包提交即可。 如下图:



### ● 收不到服务端激励回调排查

1.首先请根据下面文档地址进行配置，请看完文档对比示例链接与您填入的链接是否匹配：

<https://help.toponad.net/cn/docs/msbnkj>

2.TopOn后台填入服务端激励链接后，点击其他输入框，可以测试连接是否通畅，如不通畅请回到第一步进行检查。



3. 客户端打开TopOn SDK 日志开关，请求激励广告，并成功触发激励回调，客户端搜索控制台日志：`onRewardedVerify`

发送激励请求成功：onRewardedVerify--succeed

发送激励请求失败：retry---error.code:

如果成功，说明服务端可以收到来自我方服务器的请求。

如果失败，检查打印客户端参数（appid 、appkey、激励自定义字符串），是否正确

4.如果成功，服务端仍然没有收到请求

首先检查客户端传入的数据类型是不是字符串，是不是通过我们的key传入字典的。如果客户端确认参数没有问题，再看下服务端是否开启防火墙，导致我们的请求被拦截。如果没有开启防火墙，请客户端参考抓包rrd路径，在打印onRewardedVerify--succeed 之后观察响应码是不是 200，如果不是 200，回到上一步检查参数。

5. 若客户端参数经检查正确，还retry---error.code ，请抓包(最后路径为 rrd )将请求参数交给我们进行排查。

### ● CocoaPods 安装失败

1. dependency were found, but they required a higher minimum deployment target.

项目iOS最低支持版本不够，请调整主工程(游戏)targets以及pods工程中的targets最低支持的版本，或参考iOS Demo工程进行处理。
