---
title: "三方广告平台常见问题"
source: "https://help.toponad.net/cn/docs/BsWWBqAU"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-03-12"
category_path: ["三方广告平台配置指南", "三方广告平台常见问题"]
content_sha256: "623fc082f53026c5488d3d5f24f521f67fd4b7265de865cb8d9454e3eafd71da"
knowledge_role: "reference_only"
has_article_body: true
---

# 三方广告平台常见问题

## 1. 开通报表API常见错误

| 广告平台 | 错误码 | 报错原因 | 解决方案 |
| --- | --- | --- | --- |
| Admob | 403 Permission Denied | 对指定资源的访问遭拒。 | 如果您的项目未启用 AdMob API，通常就会发生这种情况。请访问 Google Cloud 控制台以启用 AdMob API。 |
| 403 Access Denied | 有效用户对指定资源的访问权限遭拒。 | 登录 [Google AdMob控制台](https://admob.google.com/v2/home)，确认当前账号是否具备访问权限，如需详细了解用户角色和查看权限，请参阅[Admob官方文档](https://support.google.com/admob/answer/2784628?hl=zh-Hans)一文。 |
| 429 Resource Exhausted | 已超出配额限制，访问被限制 | 访问[配额页面](https://developers.google.com/admob/api/quotas?hl=zh-cn)以了解配额限制，并请检查是否在其他平台使用此授权。 |
| Meta | {"error":{"message":"An access token is required to request this resource.","type":"OAuthException","code":104,"fbtrace\_id":"AUiaAUBmRnj4g7brGDeLgcE"}} | 授权过期 | 重新进行OAuth授权并保存配置。重新配置后请稍晚时间再查看API数据。 |
| “Facebook has detected that [your app] isn't using a secure connection to transfer information error when using read\_audience\_network\_insights scope." | Facebook 检测到 [您的应用程序] 在使用范围时没有使用安全连接来传输信息错误 | 确保您的企业已加入获利管理工具，并且您至少创建了一处资产。 |
| "Reading insights of a Page, business, app, domain or event source group not owned by the querying user or application." | 阅读不属于查询用户或应用程序的页面、业务、应用程序、域或事件源组。 | 查看企业设置以确保您请求的数据归您查询的企业所有。 |
| "Bad arg: All applications should have a property" | 所有应用程序都应该归属于一个资源组 | 确保您的企业已加入获利管理工具，并且您至少创建了一处资产。 |
| Mintegral | {"code":"system.error.skey"} | TopOn后台skey参数配置与Mintegral的配置不一致 | 请检查当前API配置是否与三方后台一致。 |
| {"code":"system.error.sign"} | TopOn后台“密匙”参数配置与Mintegral的“secret”参数配置不一致 | 请检查当前API配置是否与三方后台一致。 |
| pangle | {"Code":"101","Message":"身份验证失败","Data":{}} | 身份验证失败 | 请检查在TopOn 开发者后台填写的参数(用户ID、Role ID、Secure Key)是否正确 |
| {"code":107,"data":[],"message":"无访问权限"} | 无访问权限 | 请检查当前API配置是否与三方后台一致。 |
| {"code":11,"data":[],"message":"系统错误"} | 系统错误 | 三方系统故障,请稍后重试。 |
| {"code":100,"data":[],"message":""} | 未知错误 | 三方系统故障,请稍后重试。 |
| Applovin | Authentication Failed | 身份验证失败 | 请检查当前API配置的参数是否与三方后台一致。 |
| UnityAds | {"errors":[{"msg":"organization not found"}]} | organization\_core\_id 没有找到 | 检查TopOn后台配置的Organization core ID与三方平台是否一致 |
| [Unitiads]query failed, origin : {"errors":[{"msg":"invalid access token"}]} | 无效的授权 | 请检查在TopOn开发者后台填写的API Key  与三方平台的此参数是否一致 |
| Digital Turbine(Fyber) | code=401 body={"message":"An error occurred"} | 参数配置错误 | 确保在TopOn后台填写的参数(ublisher ID、Consumer Key、Consumer Secret)是否与三方平台的参数一致 |
| Chartboost & Helium | {"appId":"","adLocation":"","impressionsDelivered":0,"clicksDelivered":0,"videoCompletedDelivered":0,"moneyEarned":0,"countryCode":"","errMsg":"{\"code\":401,\"message\":\"401 Unauthorized: Invalid authentication\",\"status\":\"Unauthorized\"}\n"} | 参数配置错误 | 确保在TopOn后台填写的参数(用户ID、用户签名)是否与三方平台的参数一致 |
| TapTap | {"code":403,"message":"PERMISSION\_ERROR","trace\_id":"","data":null} | 参数配置错误 | 确保在TopOn后台填写的参数(用户ID、用户签名)是否与三方平台的参数一致 |
| ironSource | {"code":400,"errorMessage":"Multiple errors were found","name":"MultipleValidationsError","errors":[{"value":"1331","msg":"Invalid field secretkey","param":"secretkey","location":"headers"},{"value":"213123","msg":"Invalid field refreshtoken","param":"refreshtoken","location":"headers"}]} | 无效字段 secretkey和token | 确保在TopOn后台填写的参数( secretkey和token)是否与三方平台的参数一致 |
| Ironsource resp: {"code":400,"errorMessage":"Multiple errors were found","name":"MultipleValidationsError","errors":[{"value":"1331","msg":"Invalid field secretkey","param":"secretkey","location":"headers"}]} | 无效字段 secretkey | 确保在TopOn后台填写的参数(secretkey)是否与三方平台的参数一致 |
| {"code":400,"errorMessage":"Multiple errors were found","name":"MultipleValidationsError","errors":[{"value":"e51432806e8f241dcb34a026818393b122321","msg":"Invalid field refreshtoken","param":"refreshtoken","location":"headers"}]} | 无效字段 token | 确保在TopOn后台填写的参数(token)是否与三方平台的参数一致 |
| Liftoff | [Vungle]query failed, origin : 400: Bad Request | 参数配置错误 | 确保在TopOn后台填写的参数(Account ID、Reporting API Key)是否与三方平台的参数一致 |
| Inmobi | {"respList":null,"InmobiErrorResp":{"error":true,"errorList":[{"code":"INVALID\_USERNAME\_KEY\_COMBINATION","message":"Invalid username or api key. Authentication Failed"}]}} | 无效的用户名密钥 | 请检查在TopOn开发者后台填写的Client ID (Email)参数与三方后台的参数是否一致 |
| {"error":true,"errorList":[{"code":"AUTH0\_OBTAIN\_TOKEN\_FAILED","message":"Unable to fetch token from auth0 API for iam admin app"}]} | 自动获取token失败 | 请检查在TopOn开发者后台填写的Secret Key与三方后台的Client Secret (Api Key)参数是否一致 |
| Maio | [{"Country":"","PublisherMediaSdkId":"","PublisherZoneSdkId":"","SalesData":null,"ErrMsg":"{\"code\":401,\"message\":\"ApiId is invalid.\"}"}] | 参数配置错误 | 确保在TopOn后台填写的参数(API ID和API Key)是否与三方平台的参数一致 |
| Start.io | {"logs":[{"severity":"error","messageCode":"SA102","message":"Unauthenticated"}],"data":[],"next":""} | 参数配置错误 | 确保在TopOn后台填写的参数(Partner ID和Token)是否与三方平台的参数一致 |
| vK(MyTarget) | {"Data":null,"Error":{"error":{"code":"invalid\_token","message":"Unknown access token"}}} | 参数配置错误 | 确保在TopOn后台填写的参数(Permanent Access Token)是否与三方平台的参数一致 |
| Yandex | yandex resp code=401,msg= | Token 错误 | 确保在TopOn后台填写的参数(Statistics API )是否与三方平台的参数一致 |
| Google Ad Manager | PermissionError.PERMISSION\_DENIED | 账号没有权限 | 确认用户角色是否具备报表访问权限，如多次报错可向Google Ad Manager的客户经理咨询如何启用此功能。 |
| Verve | {"errors":"","status":"","reports":null} | 参数配置错误 | 确保在TopOn后台填写的参数(Api KeyI )是否与三方平台的参数一致 |
| Bigo | {"code":"102","msg":"developerId not exist","result":null,"status":-1} | 开发者ID 配置错误 | 确保在TopOn后台填写的参数(开发者ID )是否与三方平台的参数一致 |
| {"code":"101","msg":"sign check failed !","status":-1} | Token 配置错误 | 确保在TopOn后台填写的参数(Token )是否与三方平台的参数一致 |
| Sigmob | [{"requests":0,"impressions":0,"clicks":0,"revenue":0,"placementId":"","app\_id":"","ErrMsg":"{\"msg\": \"Found 123123's Secret Key ERROR!!!\"}"}] | Secret Key或 Public Key配置错误 | 确保在TopOn后台填写的参数(Secret Key和 Public Key)是否与三方平台的参数一致 |
| Helium | Helium resp code=401 msg=401 Unauthorized | 参数配置错误 | 确保在TopOn后台填写的参数(用户ID、用户签名)是否与三方平台的参数一致 |
| A4G | {"AFFILIATEID":0,"STARTDATE":"","ENDDATE":"","data":null,"errorCode":"Wrong API Key OR affiliate id"} | 参数配置错误 | 确保在TopOn后台填写的参数(账号ID、API Key)是否与三方平台的参数一致 |
| ReklamUp | {"data":null,"messageKey":"error.invalidApiKey","message":"Invalid api key.","errorCode":"UNKNOWN"} | 参数配置错误 | 确保在TopOn后台填写的参数(ReklamUp API token )是否与三方平台的参数一致 |
| PremiumAds | {"error":"Token not found"} | 参数配置错误 | 确保在TopOn后台填写的参数(PremiumAds Access Token )是否与三方平台的参数一致 |
| TaurusX | {"data":null,"message":"Invalid Token","status":400,"total":null} | 参数配置错误 | 确保在TopOn后台填写的参数(TaurusX Token)是否与三方平台的参数一致 |
| Smaato | getAccessToken statusCode=401 error=invalid\_client | 参数配置错误 | 确保在TopOn后台填写的参数(Smaato Client ID、Smaato Client Secret)是否与三方平台的参数一致 |
| 穿山甲 | {"Code":"101","Message":"身份验证失败","Data":{}} | 身份验证失败 | 请检查在TopOn 开发者后台填写的参数(用户ID、Role ID、Secure Key)是否正确 |
| {"code":107,"data":[],"message":"无访问权限"} | 无访问权限 | 请检查当前API配置是否与三方后台一致。 |
| {"code":11,"data":[],"message":"系统错误"} | 系统错误 | 三方系统故障,请稍后重试。 |
| {"code":100,"data":[],"message":""} | 未知错误 | 三方系统故障,请稍后重试。 |
| 腾讯广告 | {"code":130002,"message":"Your request is rejected.Please sign the Compliance Statement."} | 尚未签署数据保护协议 | 访问三方平台（<https://adnet.qq.com/>） 完成《数据保护协议》的线上签署后再继续使用Media API。若多次出现此报错，可发送邮件至优量汇官方邮箱（ADNET@tencent.com）或与您对接的运营经理联系协助。 |
| {"code":130003,"message":"Your request is rejected.Please sign the Data Protection Agreement."} | 请求被拒绝，因为未签署合规承诺函。 | 请您尽快访问开发者平台（<https://e.qq.com/dev>） 完成《合规承诺函》的线上签署后再继续使用Media API。若多次出现此报错，可发送邮件至优量汇官方邮箱（ADNET@tencent.com）或与您对接的运营经理联系协助。 |
| 百度联盟 | HTTP ERROR 401 failed to verify signature | 请检查当前公钥或私钥配置与百度后台的配置不匹配 | 请检查当前公钥或私钥配置是否正确且与百度后台对应。 |
| HTTP ERROR 403   user is not exist | Access Key参数配置与百度后台的配置不匹配 | 请检查在TopOn开发者后台填写的Access Key是否正确。 |
| TTP ERROR 500 | 服务错误 | 三方系统故障,请稍后重试 |
| 快手 | {"result":10104,"error\_msg":"没有操作权限","page\_info":{"current\_page":0,"page\_size":0,"total\_count":0},"data":null} | 没有操作权限 | 没有操作权限，请检查配置或联系快手开通报表API权限。 如已开启，则检查TopOn后台参数(账户ID、AccessKey、SecurityKey)配置与快手的配置是否一致 |
| "result":10103,"error\_msg":"签名过期"} | 签名过期 | 请重新授权 |
| 游可赢 | Topon,query daily report failed | 参数配置错误 | 确保在TopOn后台填写的参数(公司帐号ID、Token)是否与三方平台的参数一致 |
| 京媒平台 | 错误码：303 错误信息：缺少参数 redirect\_uri 请求ID：444f7492fe9845c9acc53aa3872a1d19 | 参数配置错误 | 确保在TopOn后台填写的参数(公司ID、AppKey、App Secret )是否与三方平台的参数一致 |
| 趣盟 | {"code":102,"message":"无效用户","data":[]} | 参数配置错误 | 确保在TopOn后台填写的参数(密钥)是否与三方平台的参数一致 |
| vivo广告联盟 | {"code":20001,"message":"身份验证失败, 无效accountName","data":null} | 参数配置错误 | 确保在TopOn后台填写的参数(Vivo账户名称、Secret Key)是否与三方平台的参数一致 |
| OPPO广告联盟 | {"code":300001,"msg":"","message":"请求头缺少token字段","data":null} | 参数配置错误 | 确保在TopOn后台填写的参数(Client ID、Client Secret)是否与三方平台的参数一致 |
| 小米Columbus | invalid token | 参数配置错误 | 确保在TopOn后台填写的参数(Reporting API Token)是否与三方平台的参数一致 |
| 阿里妈妈Tanx | {"Body":"{\"error\_response\":{\"code\":29,\"msg\":\"Invalid app Key\",\"sub\_code\":\"isv.appkey-not-exists\",\"request\_id\":\"15rkrkwhrfbui\"}}"} | 参数配置错误 | 确保在TopOn后台填写的参数(App Key、App Secret、Access)是否与三方平台的参数一致 |
| 美数AdMateX | {"status":0,"msg":"签名错误1","data":[]} | 参数配置错误 | 确保在TopOn后台填写的参数(账户ID、Token)是否与三方平台的参数一致 |
| 爱奇艺 | {"code":102,"message":"无效的user\_id","totalCount":0,"data":null} | 参数配置错误 | 确保在TopOn后台填写的参数(账户ID、Access Token)是否与三方平台的参数一致 |
| 倍孜 | {"msg":"AppKey无效.","code":401} | 参数配置错误 | 确保在TopOn后台填写的参数(App Key、Secret)是否与三方平台的参数一致 |
| {"success":false,"message":"该用户不存在，请注册","code":500,"result":null,"timestamp":1764154730886} | User Name配置错误 | 确保此参数与创建“章鱼广告”时的账户邮箱一致 |
| {"success":false,"message":"授权码错误","code":500,"result":null,"timestamp":1764154857865} | Auth Code 配置错误 | 确保此参数与创建“章鱼广告”的账户的“授权码”一致 |
