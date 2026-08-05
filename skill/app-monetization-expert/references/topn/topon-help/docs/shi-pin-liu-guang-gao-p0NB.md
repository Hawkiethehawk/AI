---
title: "视频流广告"
source: "https://help.toponad.net/cn/docs/shi-pin-liu-guang-gao-p0NB"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2026-06-22"
category_path: ["TopOn SDK接入指南", "iOS接入指南", "广告样式", "视频流广告"]
content_sha256: "49d12c44bf0bd244b5af44d5f84d07a2194b9400f85c729c5403f21f6aed9b72"
knowledge_role: "reference_only"
has_article_body: true
---

# 视频流广告

## **1**. 介绍

**TopOn iOS SDK v6.3.35版本**开始支持视频流广告。视频流广告会在应用内容视频播放器顶部的单独视频播放器中播放。由您控制内容视频播放，而 SDK 负责处理广告播放。广告会在应用内容视频播放器之上的单独视频播放器中播放。具体渲染样式如下：



## **2**. API说明

### 2.1 广告加载

**ATAdManager:** 激励视频广告的管理类

| 方法 | 说明 |
| --- | --- |
| - (**void**)loadADWithPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra controlDataParam:(NSDictionary \* **\_Nullable**)param playhead:(**id** **\_Nullable**)playhead delegate:(**id**ATMediaVideoDelegate>)delegate mediaVideoContainerView:(UIView \*)containerView viewController:(UIViewController \*)viewController | placementID：广告位 controlDataParam：控制广告参数，具体可看代码例子 playhead：如果是IMA的话，就是IMAAVPlayerContentPlayhead对象 delegate：回调对象 mediaVideoContainerView：广告播放容器 viewController：跳转ViewController |

示例代码展示：

复制代码

```
#import
#import
// 加载激励视频广告
  - (void)loadAd {
    NSMutableDictionary *extra = @{}.mutableCopy;
    //内部浏览器打开
    extra[kATAdMediaVideoExtraKeyInternalBrowser] = @YES;
    //隐藏倒计时
    extra[kATAdMediaVideoExtraKeyHideCountDown] = @NO;
    //加载视频广告超时时间
    extra[kATAdMediaVideoExtraKeyLoadVideoTimeout] = @8;
    //广告要不要自动播放，对VMAP才有效
    extra[kATAdMediaVideoExtraKeyAutoPlayAdBreaks] = @NO;
    //关闭当前播放信息
    extra[kATAdMediaVideoExtraKeyDisableNowPlayingInfo] = @YES;

    self.videoView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, self.view.bounds.size.width, 300)];
    self.contentPlayhead = [[IMAAVPlayerContentPlayhead alloc] initWithAVPlayer:self.contentPlayer];
    [[ATAdManager sharedManager] loadADWithPlacementID:@"your rv placementId" extra:extra controlDataParam:@{@"your key":@"your url"} playhead:self.contentPlayhead delegate:self mediaVideoContainerView:self.videoView viewController:self];

}
```

### 2.2 展示广告

| 方法 | 说明 |
| --- | --- |
| - (ATMediaVideoOffer\*)mediaVideoObjectWithPlacementID:(NSString\*)placementID showConfig:(ATShowConfig \* **\_Nullable**)showConfig; | 如果需要offer对象，可以从该方法获取 |

**ATMediaVideoOffer**\*\*:\*\* MediaVideo视频流广告的展示操作类，通过上述方法获取。

| 方法 | 说明 |
| --- | --- |
| - (**void**)showWithPlacementID:(NSString \*)placementID; | 展示广告 |
| - (**id**)customNetworkObj; | 获取平台广告对象 |
| - (**void**)start; | 开始播放广告 |
| - (**void**)pause; | 暂停广告 |
| - (**void**)resume; | 恢复广告 |
| - (**void**)destory; | 销毁广告 |
| - (**void**)contentComplete; | 内容播放结束 |

示例代码展示：

复制代码

```
- (void)showMediaVideoAd {
    [_offer destory];
    _offer = nil;

    ATShowConfig *showConfig = ATShowConfig.new;
    showConfig.showCustomExt = @"testShowCustomExt";
    self.offer = [[ATAdManager sharedManager] mediaVideoObjectWithPlacementID:self.currentPlacementIDInfoModel.placementIDString showConfig:showConfig];
    [self.offer showWithPlacementID:self.currentPlacementIDInfoModel.placementIDString];
}
```

复制代码

### 2.4 代理协议回调

**ATAdLoadingDelegate**代理方法

| 方法 | 说明 |
| --- | --- |
| **didFinishLoadingADWithPlacementID:** | 对应广告位广告加载成功回调 placementId：广告位Id |
| **didFailToLoadADWithPlacementID: error:** | 对应广告位广告加载失败回调 placementId：广告位Id error：广告加载失败信息 |
| **didStartLoadingADSourceWithPlacementID: extra:** | 对应广告位中某一个广告源开始加载广告的回调 placementId：广告位Id extra：广告附加参数 |
| **didFinishLoadingADSourceWithPlacementID: extra:** | 对应广告位中某一个广告源加载广告成功的回调 placementId：广告位Id extra：广告附加参数 |
| **didFailToLoadADSourceWithPlacementID: extra: error:** | 对应广告位中某一个广告源加载广告失败的回调 placementId：广告位Id extra：广告附加参数 error：广告加载失败信息 |
| **didStartBiddingADSourceWithPlacementID: extra:** | 对应广告位中某一个广告源竞价广告开始竞价的回调 placementId：广告位Id extra：广告附加参数 |
| **didFinishBiddingADSourceWithPlacementID: extra:** | 对应广告位中某一个广告源竞价广告竞价成功的回调 placementId：广告位Id extra：广告附加参数 |
| **didFailBiddingADSourceWithPlacementID: extra: error:** | 对应广告位中某一个广告源竞价广告竞价失败的回调 placementId：广告位Id extra：广告附加参数 error：竞价广告失败信息 |

**ATMediaVideoDelegate**代理方法

| 回调函数 | 回调函数意义 |
| --- | --- |
| - (**void**)mediaVideoDidStartPlayingForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | ad play starts 广告开始播放 |
| - (**void**)mediaVideoDidEndPlayingForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告播放结束 |
| - (**void**)mediaVideoDidFailToPlayForPlacementID:(NSString \*)placementID error:(NSError \*)error extra:(NSDictionary \*)extra; | 广告播放失败 |
| - (**void**)mediaVideoDidClickForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告被点击 |
| - (**void**)mediaVideoAdPauseForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告被暂停 |
| - (**void**)mediaVideoAdResumeForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告被回复 |
| - (**void**)mediaVideoAdSkipedForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告被跳过 |
| - (**void**)mediaVideoAdForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra event:(**id**)event; | 广告回调事件 |
| - (**void**)mediaVideoAdTappedForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告视频区域被点击 |
| - (**void**)mediaVideoAdDidProgressForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra mediaTime:(NSTimeInterval)mediaTime totalTime:(NSTimeInterval)totalTime; | 广告播放进度 |
| - (**void**)mediaVideoAdDidStartBufferingForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告开始缓存 |
| - (**void**)mediaVideoAdDidBufferToMediaTimeForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra mediaTime:(NSTimeInterval)mediaTime; | 广告已缓存 |
| - (**void**)mediaVideoAdPlaybackReadyForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 广告已准备好 |
| - (**void**)mediaVideoAdRequestContentPauseForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 请求内容暂停 |
| - (**void**)mediaVideoAdRequestContentResumeForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 请求内容恢复 |
| - (**void**)mediaVideoAdBreakReadyForPlacementID:(NSString \*)placementID extra:(NSDictionary \*)extra; | 返回 IMA kIMAAdEvent\_*AD\_BREAK\_READY event* |

### 2.4 其他API说明

- 视频流广告可以通过回调信息获取该广告缓存请求时传入的自定义extra内容。
- getMediaVideoAd获取的广告缓存（MediaVideoAd）是与请求时传入的ATVideoAdPlayer对象绑定

## **3**. 示例代码

具体可参考[Demo](https://github.com/toponteam/TopOn-iOS-Pod-Demo/blob/master/AnyThinkSDKDemo/AnyThinkSDKDemo/MediaVideo/ATMediaVideoViewController.m)中的ATMediaVideoViewController.m

复制代码

```
- (IMAAVPlayerContentPlayhead *)setUpContentPlayer {
  // Load AVPlayer with path to our content.
  NSURL *contentURL = [NSURL URLWithString:kTestAppContentUrl_MP4];
  self.contentPlayer = [AVPlayer playerWithURL:contentURL];

  // Create a player layer for the player.
  AVPlayerLayer *playerLayer = [AVPlayerLayer playerLayerWithPlayer:self.contentPlayer];

  // Size, position, and display the AVPlayer.
  playerLayer.frame = self.videoView.layer.bounds;
  [self.videoView.layer addSublayer:playerLayer];

  // Set up our content playhead and contentComplete callback.
    IMAAVPlayerContentPlayhead *contentPlayhead = [[IMAAVPlayerContentPlayhead alloc] initWithAVPlayer:self.contentPlayer];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(contentDidFinishPlaying:)
                                               name:AVPlayerItemDidPlayToEndTimeNotification
                                             object:self.contentPlayer.currentItem];
    return contentPlayhead;
}

- (void)loadAd {

    [[ATAPI sharedInstance] setCustomData:self.currentPlacementIDInfoRuleModel.groupRuleDic forPlacementID:self.currentPlacementIDInfoModel.placementIDString];

    if (!self.videoView.superview) {
        [self.view addSubview:self.videoView];
        self.contentPlayhead = [self setUpContentPlayer];
    }

    [self.contentPlayer seekToTime:kCMTimeZero completionHandler:^(BOOL finished) {

    }];
    NSMutableDictionary *extra = @{}.mutableCopy;
    //内部浏览器打开
    extra[kATAdMediaVideoExtraKeyInternalBrowserViewController] = self;
    //隐藏倒计时
    extra[kATAdMediaVideoExtraKeyHideCountDown] = @NO;
    //加载视频广告超时时间
    extra[kATAdMediaVideoExtraKeyLoadVideoTimeout] = @8;
    //广告要不要自动播放，对VMAP才有效
    extra[kATAdMediaVideoExtraKeyAutoPlayAdBreaks] = @NO;
    //关闭当前播放信息
    extra[kATAdMediaVideoExtraKeyDisableNowPlayingInfo] = @YES;

    [[ATAdManager sharedManager] loadADWithPlacementID:self.currentPlacementIDInfoModel.placementIDString extra:extra controlDataParam:@{@"description_url":@"description_url"} delegate:self mediaVideoContainerView:self.videoView viewController:self];
}

- (void)showAd {
    if (![[ATAdManager sharedManager] adReadyForPlacementID:self.currentPlacementIDInfoModel.placementIDString]) {
        return;
    }

    ATShowConfig *showConfig = [[ATShowConfig alloc] initWithScene:nil showCustomExt:@"testShowCustomExt"];
    self.offer = [[ATAdManager sharedManager] mediaVideoObjectWithPlacementID:self.currentPlacementIDInfoModel.placementIDString showConfig:showConfig delegate:self];

    [[ATAdManager sharedManager] entryMediaVideoScenarioWithPlacementID:self.currentPlacementIDInfoModel.placementIDString scene:@"11"];

    id customNetworkObj = [self.offer customNetworkObj];
    id adsManager = [self.offer adsManager];

    [self.contentPlayer seekToTime:kCMTimeZero completionHandler:^(BOOL finished) {

    }];

    UIView *myTransparentTapOverlay = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 300, 250)];
    myTransparentTapOverlay.backgroundColor = [UIColor yellowColor];
    UIButton *myPauseButton = [[UIButton alloc] initWithFrame:CGRectMake(0, 0, 50, 10)];
    // Substitute "myTransparentTapOverlay" and "myPauseButton" with the elements
    // you want to register as video controls overlays.
    // Make sure to register before ad playback starts.
    IMAFriendlyObstruction *overlayObstruction =
          [[IMAFriendlyObstruction alloc] initWithView:myTransparentTapOverlay
                                               purpose:IMAFriendlyObstructionPurposeNotVisible
                                        detailedReason:@"This overlay is transparent"];
    IMAFriendlyObstruction *pauseButtonObstruction =
          [[IMAFriendlyObstruction alloc] initWithView:myPauseButton
                                               purpose:IMAFriendlyObstructionPurposeMediaControls
                                        detailedReason:@"This is the video player pause button"];

    [self.offer registerFriendlyObstruction:overlayObstruction];
    [self.offer registerFriendlyObstruction:pauseButtonObstruction];
    [self.offer unregisterAllFriendlyObstructions];
    if (self.offer.type == ATMediaVideoOfferTypeVMAP) {
        [self.offer contentPlayhead:self.contentPlayhead];
    } else if (self.offer.type == ATMediaVideoOfferTypeVAST) {
        [self.offer start];
    }
}
```

注意事项

- 请自行管理好load时传入的参数mediaVideoContainerView的展示和销毁逻辑，避免出现错乱。
- 请自行管理好ATMediaVideoOffer对象的销毁逻辑，避免出现错乱。
- **VMAP广告**需要等待触发IMA Event AD\_BREAK\_READY后才能调用ATMediaVideoOffer start展示广告
