---
title: "Admob"
source: "https://help.toponad.net/cn/docs/Lrvw6L"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-07-14"
category_path: ["三方广告平台配置指南", "Admob"]
content_sha256: "6b57db7c3e9e9ab68e404a29b5b8a217fdcefc828a8065d7b20d2dc435476e75"
knowledge_role: "reference_only"
has_article_body: true
---

# Admob

**重要：**

**1、从Admob SDK版本V7.42.0开始，AdMob要求开发者将他们的AdMob应用ID添加到plist中**[**>>详情说明**](https://developers.google.com/admob/ios/quick-start#update_your_infoplist)**。**

**2、**Topon SDK **v6.2.80**及以上支持**Admob合作平台出价(Partner Bidding)**功能，请更新相应版本的SDK。

## Step1. 创建Admob账号

(1) [**注册并登录**](https://admob.google.com/home/)Admob账号



(2) 确认账号状态是否正常
注：需要设定付款方式才可以测试到Admob的正式广告，Admob的正式广告建议不能使用测试机直接频繁测试，详细测试方式请参考Step7。



## Step2. 创建Admob应用和广告单元

### 1. 添加应用

应用若不在AppStore或Google play上架也可使用Admob创收，但若应用曾经被Google play下架，在申诉成功前则不能再使用Admob创收。



### 2. 添加广告单元

**(1) 根据应用广告场景需要创建对应的广告单元类型。**



**(2) 添加广告单元(合作平台出价=否)**

① 如果您要创建Admob**常规**广告单元(非合作平台出价），**不要勾选合作平台出价**



② 您可以给每个Admob**常规**广告单元设置需要的底价



**(2) 添加广告单元(合作平台出价=是)**

如果您要创建Admob**竞价**广告单元ID，需要勾选**合作平台出价**



注：集成测试时不要使用admob的正式ID测试，特别是不要使用测试设备点击admob正式ID广告，否则可能会被误判为假量封号（建议参考Topon的[**测试指引**](https://help.toponad.net/cn/docs/ce-shi-zhi-yin)或使用[**admob官方测试ID**](https://developers.google.com/admob/android/test-ads)测试）

## Step3. 开通Admob的Report API

(1) 开通Admob的Report API需要获取发布商id和访问权限口令两个参数。

| 参数名称 | 说明 |
| --- | --- |
| 发布商id | 每个admob账号对应一个发布商ID |
| 访问权限口令 | 即密钥口令，在Topon开发者后台填写报表API时可直接点击获取 |

① 打开Topon开发者后台页面（广告平台→变现平台→Admob→编辑→报表API“已开通”）

② 点击**登录Google Admob**可自动获取**发布商id、访问权限口令**



③ 若点击API授权**无法获取参数**，需按以下步骤操作：

<1> 确认您的admob账号是否已经产生数据，若从未产生过数据的admob账号，暂时无法绑定，此时先在Topon后台选择报表API“未开通”，后续产生数据后再重新关联。（选择未开通只是暂时无法将admob数据拉取回来Topon后台，不会影响广告的正常展示）

<2> 若确认admob账号已经产生数据，则[登陆您的admob账号](https://myaccount.google.com/data-and-privacy)，我的账号 > 数据和隐私设置 > 第三方应用和服务，看看有没有授权过“google play Android developer”。

<3> 如果已经授权过了，点击还是没反应，则撤销“google play Android developer”的访问再重新授权一次。然后再重新点击“获取access token”，重新获取access token





## Step3(1). 开通自动创建广告源功能

Admob支持自动创建广告源功能，在编辑广告平台时，需要选择自动创建广告源为“是”，并重新进行Google账号授权。登录Google账号之后，按照授权流程允许权限后才可使用自动创建功能。

  

## Step4. Topon平台配置Admob广告位说明

AdMob广告单元跟Topon的广告类型对应关系如下：

| AdMob-广告单元 | Topon-广告类型 |
| --- | --- |
| 横幅广告 | 横幅广告 |
| 插页式广告 | 插屏广告 |
| 插页式激励广告 | 激励视频 |
| 激励广告 | 激励视频 |
| 原生高级广告 | 原生广告 |
| 开屏广告 | 开屏广告 |

(更多Topon支持聚合的广告平台，其广告类型与Topon后台配置的广告类型，对应关系速查可见此[汇总文档](https://help.toponad.net/cn/docs/SfGJi6))

## Step5. 在Topon开发者后台上绑定Admob

### 1. 获取Admob应用ID和Unit ID

以下Admob的2个参数需要配置在Topon开发者后台才能通过Topon展示Admob广告以及通过Topon开发者后台展示Admob的数据：

| 参数名称 | 说明 |
| --- | --- |
| APP ID | admob每个应用对应的唯一的应用ID |
| Unit ID | admob每个广告单元对应的唯一的广告单元ID |

- APP ID

应用→应用设置→应用ID（即APP ID）



- Unit ID

应用→广告单元→广告单元ID（即Unit ID)



### 2. 将Admob的参数配置在Topon

添加广告源：

**登录Topon后台→聚合管理→添加广告源（admob）**

(1) 填写Topon应用对应的admob应用的**应用ID（APP ID）**

(2) 填写Topon应用广告位对应的admob应用广告单元的**广告单元ID（Unit ID）**

(3) 在Topon添加Admob**合作平台出价(Partner Bidding)**的广告源

① 在Topon开发者后台，在聚合管理页面添加Admob Partner bidding广告源。在添加Admob 广告源时，头部竞价选择**合作平台出价(Partner bidding)**

****

② 在Topon添加Admob广告源时，头部竞价选项需要根据Admob的广告单元投放类型进行选择：

| 创建Admob广告源单元 | 对应Topon头部竞价选项 |
| --- | --- |
| 勾选“**合作平台出价**”，在Admob的**广告单元投放类型=合作平台出价** | 合作平台出价(Partner bidding） |
| 不勾选“**合作平台出价**”，在Admob的**广告单元投放类型=标准** | 否 |

(4) 针对Admob的原生广告可以在Topon后台设置Admob的原生广告的素材长宽比(需要更新Topon SDK V5.5.8及以上版本）

| 素材长宽比(Media Aspect Ratio) | 说明 |
| --- | --- |
| 未指定 | 默认选项。Admob将返回：横屏尺寸、竖屏尺寸、正方形式尺寸 |
| 任意尺寸 | Admob将返回：横屏尺寸、竖屏尺寸、正方形式尺寸 |
| 横屏尺寸 | Admob只返回横屏尺寸 |
| 竖屏尺寸 | Admob只返回竖屏尺寸 |
| 正方形尺寸 | Admob只返回正方形尺寸(接近1: 1的素材尺寸) |

### 3. 使用Admob预估排序价格(可选)

新版本Admob SDK（Android 21.1.0 & iOS 9.10.0及以上版本）支持返回**展示机会层级的广告收入**，[查看介绍](https://support.google.com/admob/answer/11322405) Topon SDK v6.2.20及以上版本支持基于Admob SDK的历史**展示机会层级的广告收入**对Admob广告源动态调整排序价格。

**(1) Admob后台开启展示机会层级的广告收入**

① 访问 [**https://apps.admob.com**](https://apps.admob.com/)，登录您的 AdMob 帐号。

② 在边栏中点击**设置**。

③ 点击**帐号信息**标签页。

④ 点击**展示机会层级广告收入**切换开关即可开启此设置。



**(2) 更新Topon SDK**

Topon SDK v6.2.20及以上版本支持

**(3) 在Topon打开Admob预估排序价格功能**

① 添加Admob广告源时打开**预估排序价格**



② 打开预估排序价格的Admob广告源会放置在**竞价广告源**下方（常规广告源上方）



##

## Step6. 将Admob adapter添加进应用代码

[参考TopOn SDK集成说明文档](/cn/docs/bPMOE6)

## Step7. Admob测试流程

注意：集成测试时不要多次使用admob的正式ID测试，特别是不要使用测试设备点击admob正式ID广告，否则可能会被误判为假量封号（建议参考TopOn的测试指引或使用admob官方测试ID测试）

**1. 测试前提条件**

①必须VPN到**美国**地区（原因是美国地区有更好填充，更容易测试到。其他国家也可以，但是可能填充会较低，不建议使用中国网络测试，原因是中国大概率没有填充）。

请确认自己的VPN地区是否成功切换到美国，很多情况下VPN没有成功生效，实际发出请求的地区仍然是中国内地，这种情况仍然是无填充的。

②手机上下载有GP商店

③登录有效的GP账号

**2. 使用TopOn测试ID或者测试模式确认集成没有问题。**

**（1）方法一：使用TopOn调试模式（推荐）**

参考文档，设置代码：

- [安卓](/cn/docs/5xiiue#3._%E9%80%9A%E8%BF%87%E8%B0%83%E8%AF%95%E6%A8%A1%E5%BC%8F%E6%B5%8B%E8%AF%95%E5%B9%BF%E5%91%8A)
- [iOS](/cn/docs/down_ru-he-ce-shi-guang-gao-rKsm?search=1#2.1_%E8%B0%83%E8%AF%95%E6%A8%A1%E5%BC%8F)



**（2）方法二：使用TopOn debug UI（推荐）**

- [安卓](/cn/docs/5xiiue)
- [iOS](/cn/docs/ce-shi-gong-ju-Beta-DLyz)

**（3）方法三：使用TopOn测试ID。**

- [iOS测试ID](/cn/docs/ce-shi-ID)
- 安卓暂不提供测试ID，可以使用上面2个方法。

**（4）****方法四：在Admob后台，添加测试设备测试。**

在admob后台添加测试设备，使用正式ID测试。

添加测试设备路径（点击右侧链接跳转）：[Google AdMob](https://apps.admob.com/v2/settings/test-devices/list)

**如果无法显示广告，请根据日志的错误码排查问题。**

- [iOS错误码说明](/cn/docs/2HXlmO#1._TopOn%E9%94%99%E8%AF%AF%E7%A0%81%E4%BF%A1%E6%81%AF%E8%AF%B4%E6%98%8E)
- [安卓错误码说明](/cn/docs/qYfOSS)

以上四个方法（方法一到方法四），任一方法，使用测试ID或者测试模式正常后，即集成正常。

**3. 集成正常后，使用正式ID测试（注意不要多次请求，建议尽量用测试id测试）**

注意：一般来说，只要集成没有问题，即使用上述第二步能测试到广告，配置ID也正确的话，短时间内，单设备无填充，是正常的！！不建议多次重复尝试！！用正式ID重复大量多次请求测试的话，容易被Admob判定虚假流量封禁。

如果是正式ID无法展示，排查步骤：

（首先需要注意已经满足第一点的前提条件，即：VPN到美国；测试设备上安装有Google Play等GP框架服务；登录gmail邮箱）

1）检查TopOn后台的广告源配置

首先确认admob的应用ID和代码位是否配置正确。

然后排查广告类型是否匹配正确。

如：开屏是否匹配开屏等。TopOn和Admob[广告样式匹配参考链接](/cn/docs/SfGJi6)

2）Admob后台信息确认（影响到正式ID是否能拿到Admob的填充）

a. 补充Admob后台付款项付款资料：收款账户是否填写完整。

b. 确认是否设置app-ads.txt。途径：应用 > app.ads.txt



c.（对于创建时间较久的账户）确认Pin码已填写。（影响到正式ID是否能拿到Admob的填充）



3）使用美国VPN测试。

4）如果是安卓应用，需要确认已经在谷歌商店正式上线。注意是否曾经被下架或者邮箱是否收到应用提示信息。

如果是iOS应用，需要确认已经在苹果商店正式上线一段时间（刚上线一段时间Admob可能检测不到）

5）添加测试设备测试正式ID

在admob后台添加测试设备，使用正式ID测试。

添加测试设备路径：[Google AdMob](https://apps.admob.com/v2/settings/test-devices/list)

6）确认是否广告位价格太高没有广告填充。-->创建价格为0.01的无底价广告位。或者在谷歌后台设置无底价的广告位。

7）广告位ID创建时间太长：新建Admob的ID，使用美国VPN，进行测试（手机清除缓存，时间调整到2小时后）；尝试更换设备测试。

广告位ID创建时间太短：等待2小时后测试。

8）如果应用已经集成了TopOn SDK并且已上线，可使用TopOn高级功能-日志分析查看请求失败的报错码，并对应解决问题。

TopOn后台路径：高级功能 > 日志分析，筛选对应应用、广告位、广告平台。

9）按照测试的log里面的错误码错误码问题

- [iOS错误码说明](/cn/docs/2HXlmO#1._TopOn%E9%94%99%E8%AF%AF%E7%A0%81%E4%BF%A1%E6%81%AF%E8%AF%B4%E6%98%8E)

- [安卓错误码说明](/cn/docs/qYfOSS)

10）如果以上都无法定位问题，[请与Admob联系](https://support.google.com/admob/gethelp)

## GMA Next-Gen SDK接入说明

## 常见问题

**(1) 如何为应用设置admob的 app-ads.txt ?**

如果不为应用设置admob的 app-ads.txt ，可能会影响admob的填充甚至无填充。

① 获取admob的app-ads.txt ，途径：登录admob后台-应用-所有应用-app-ads.txt-如何为应用设置 app-ads.txt-点击复制



② 将刚复制的app-ads.txt添加到您的开发者网站的根目录（例如：sampledomain.com/app-ads.txt）。请确保您输入的域名与 Google Play 或 App Store 中列出的域名完全一致。


