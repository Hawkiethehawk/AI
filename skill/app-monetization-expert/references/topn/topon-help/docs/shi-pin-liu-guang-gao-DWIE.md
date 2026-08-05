---
title: "视频流广告"
source: "https://help.toponad.net/cn/docs/shi-pin-liu-guang-gao-DWIE"
captured_at: "2026-07-21T08:07:23Z"
site_modified: "2025-07-22"
category_path: ["TopOn SDK接入指南", "Android 接入指南", "广告样式", "视频流广告"]
content_sha256: "848940a68342085aa98f781fe1beeb04781c0a8904beb4d28b2b186a3a84765f"
knowledge_role: "reference_only"
has_article_body: true
---

# 视频流广告

## 1. 集成建议

视频流广告会在位于应用内容视频播放器顶部的单独视频播放器中播放。由您控制内容视频播放，TopOn SDK负责处理广告播放。具体渲染样式如下：



> - 通过`ATAdInfo#getUrlTagParams()`可以获取该广告缓存请求时传入的自定义Tag Key-Value Map
> - 通过`ATMediaVideo#getMediaVideoAd()`获取到的广告缓存**MediaVideoAd**是与请求时传入的**ATVideoAdPlayer**绑定的
> - 请参阅[这里](https://developers.google.com/interactive-media-ads/docs/sdks/android/client-side)查看关于IMA SDK的更多信息

> - 通过`TUAdInfo#getUrlTagParams()`可以获取该广告缓存请求时传入的自定义Tag Key-Value Map
> - 通过`TUMediaVideo#getMediaVideoAd()`获取到的广告缓存**TMediaVideoAd**是与请求时传入的**TUVideoAdPlayer**绑定的
> - 请参阅[这里](https://developers.google.com/interactive-media-ads/docs/sdks/android/client-side)查看关于IMA SDK的更多信息

---

## 2. 加载广告

java
复制代码

```
ATMediaVideoConfig.Builder atMediaVideoConfigBuilder = new ATMediaVideoConfig.Builder();
ATMediaVideo mATMediaVideo = new ATMediaVideo(activity, "your placement id",
         mVideoPlayerWithAdPlayback.getVideoAdPlayer(), atMediaVideoConfigBuilder.build());
mATMediaVideo.setAdListener(new ATMediaVideoEventListener() {
    @Override
    public void onMediaVideoAdLoaded() { }

    @Override
    public void onMediaVideoAdLoadFailed(AdError adError) { }

    @Override
    public void onMediaVideoAdClick(ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdResume(ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdPause(ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdStart(ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdEnd(ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdPlayError(AdError adError, ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdSkiped(ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdTapped(ATAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdProgress(float v, double v1) { }
});
//IMA Event Listener
mATMediaVideo.setIMAEventListener(new OnIMAEventListener() {
    @Override
    public void onEvent(Object adEvent) { }
});
mATMediaVideo.loadAd();
```

java
复制代码

```
TUMediaVideoConfig.Builder tuMediaVideoConfigBuilder = new TUMediaVideoConfig.Builder();
TUMediaVideo mTUMediaVideo = new TUMediaVideo(activity, "your placement id",
         mVideoPlayerWithAdPlayback.getVideoAdPlayer(), tuMediaVideoConfigBuilder.build());
mTUMediaVideo.setAdListener(new TUMediaVideoEventListener() {
    @Override
    public void onMediaVideoAdLoaded() { }

    @Override
    public void onMediaVideoAdLoadFailed(AdError adError) { }

    @Override
    public void onMediaVideoAdClick(TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdResume(TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdPause(TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdStart(TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdEnd(TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdPlayError(AdError adError, TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdSkiped(TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdTapped(TUAdInfo adInfo) { }

    @Override
    public void onMediaVideoAdProgress(float v, double v1) { }
});
//IMA Event Listener
mTUMediaVideo.setIMAEventListener(new OnIMAEventListener() {
    @Override
    public void onEvent(Object adEvent) { }
});
mTUMediaVideo.loadAd();
```

---

## 3. 展示广告

> - **VMAP**广告展示前需要调用`MediaVideoAd#setContentProgressProvider(Object contentProgressProvider)`传入IMA SDK **ContentProgressProvider**对象，避免影响VMAP广告展示
> - **MediaVideoAd**展示前需要调用`MediaVideoAd#setContainer(ViewGroup container)`传入广告展示容器，该容器建议覆盖在**PlayerView上层**，避免影响广告点击
> - **VMAP**广告需要等待触发**IMA Event AD\_BREAK\_READY**后才能调用`MediaVideoAd#start()`展示广告

java
复制代码

```
if (mATMediaVideo.isAdReady()) {
    if (mMediaVideoAd != null) {
        //destroy showing media video ad
            mMediaVideoAd.onDestroy();
            mMediaVideoAd = null;
    }
    //reset player state and content video play position
    mVideoPlayerWithAdPlayback.resetInnerVideoPlayerAndParams();

    ATShowConfig showConfig = new ATShowConfig.Builder().scenarioId("your scenario id").build();
    mMediaVideoAd = mATMediaVideo.getMediaVideoAd(showConfig);

    mVideoPlayerWithAdPlayback.setReadyToPlayContent(true);
    //must setContainer(container) before start()
    if (mVideoPlayerWithAdPlayback.getAdUiContainer() != null) {
        mVideoPlayerWithAdPlayback.getAdUiContainer().removeAllViews();
    }
    //need setContainer
    mMediaVideoAd.setContainer(mVideoPlayerWithAdPlayback.getAdUiContainer());
    //setContentProgressProvider(VMAP need)
    mMediaVideoAd.setContentProgressProvider(mVideoPlayerWithAdPlayback.getContentProgressProvider());
    //Call setOnIMAEventListener to bind MediaVideoAd and OnIMAEventListener
    mMediaVideoAd.setOnIMAEventListener(new OnIMAEventListener() {
        @Override
        public void onEvent(Object adEvent) {
            /**
             * do content resume、pause and start、destroy MediaVideoAd
             */
            if (adEvent instanceof AdEvent) {
                switch (((AdEvent) adEvent).getType()) {
                    case LOADED:
                        // AdEventType.LOADED will be fired when ads are ready to be
                        // played. AdsManager.start() begins ad playback. This method is
                        // ignored for VMAP or ad rules playlists, as the SDK will
                        // automatically start executing the playlist.
                        break;
                    case CONTENT_PAUSE_REQUESTED:
                        // AdEventType.CONTENT_PAUSE_REQUESTED is fired immediately before
                        // a video ad is played.
                        mVideoPlayerWithAdPlayback.pauseContentForAdPlayback();
                        break;
                    case CONTENT_RESUME_REQUESTED:
                        // AdEventType.CONTENT_RESUME_REQUESTED is fired when the ad is
                        // completed and you should start playing your content.
                        mVideoPlayerWithAdPlayback.resumeContentAfterAdPlayback();
                        break;
                    case PAUSED:
                        break;
                    case RESUMED:
                        break;
                    case AD_BREAK_READY:
                        // AdEventType.AD_BREAK_READY will be fired when VMAP ads are ready to be played.
                        // For VAMP ads, mMediaVideoAd.start() must be called after AdEventType.AD_BREAK_READY
                        if (mMediaVideoAd != null) {
                            mMediaVideoAd.start();
                        }
                        break;
                    case ALL_ADS_COMPLETED:
                        if (mMediaVideoAd != null) {
                            mMediaVideoAd.onDestroy();
                            mMediaVideoAd = null;
                        }
                        mVideoPlayerWithAdPlayback.resumeContentAfterAdPlayback();
                        mVideoPlayerWithAdPlayback.setReadyToPlayContent(false);
                        break;
                    case AD_BREAK_FETCH_ERROR:
                        // A CONTENT_RESUME_REQUESTED event should follow to trigger content playback.
                        if (mMediaVideoAd != null) {
                            mMediaVideoAd.onDestroy();
                            mMediaVideoAd = null;
                        }
                        mVideoPlayerWithAdPlayback.resumeContentAfterAdPlayback();
                        mVideoPlayerWithAdPlayback.setReadyToPlayContent(false);
                        break;
                    default:
                        break;
                }
            }
        }
    });
    if (mMediaVideoAd != null) {
        if (!mMediaVideoAd.isVMAPOffer()) {
            //VAST just load start
            mMediaVideoAd.start();
        } else {
            //VAMP wait OnIMAEventListener#AD_BREAK_READY call
        }
    }
}
```

java
复制代码

```
if (mTUMediaVideo.isAdReady()) {
    if (mMediaVideoAd != null) {
        //destroy showing media video ad
            mMediaVideoAd.onDestroy();
            mMediaVideoAd = null;
    }
    //reset player state and content video play position
    mVideoPlayerWithAdPlayback.resetInnerVideoPlayerAndParams();

    TUShowConfig showConfig = new TUShowConfig.Builder().scenarioId("your scenario id").build();
    mMediaVideoAd = mTUMediaVideo.getMediaVideoAd(showConfig);

    mVideoPlayerWithAdPlayback.setReadyToPlayContent(true);
    //must setContainer(container) before start()
    if (mVideoPlayerWithAdPlayback.getAdUiContainer() != null) {
        mVideoPlayerWithAdPlayback.getAdUiContainer().removeAllViews();
    }
    //need setContainer
    mMediaVideoAd.setContainer(mVideoPlayerWithAdPlayback.getAdUiContainer());
    //setContentProgressProvider(VMAP need)
    mMediaVideoAd.setContentProgressProvider(mVideoPlayerWithAdPlayback.getContentProgressProvider());
    //Call setOnIMAEventListener to bind MediaVideoAd and OnIMAEventListener
    mMediaVideoAd.setOnIMAEventListener(new OnIMAEventListener() {
        @Override
        public void onEvent(Object adEvent) {
            /**
             * do content resume、pause and start、destroy MediaVideoAd
             */
            if (adEvent instanceof AdEvent) {
                switch (((AdEvent) adEvent).getType()) {
                    case LOADED:
                        // AdEventType.LOADED will be fired when ads are ready to be
                        // played. AdsManager.start() begins ad playback. This method is
                        // ignored for VMAP or ad rules playlists, as the SDK will
                        // automatically start executing the playlist.
                        break;
                    case CONTENT_PAUSE_REQUESTED:
                        // AdEventType.CONTENT_PAUSE_REQUESTED is fired immediately before
                        // a video ad is played.
                        mVideoPlayerWithAdPlayback.pauseContentForAdPlayback();
                        break;
                    case CONTENT_RESUME_REQUESTED:
                        // AdEventType.CONTENT_RESUME_REQUESTED is fired when the ad is
                        // completed and you should start playing your content.
                        mVideoPlayerWithAdPlayback.resumeContentAfterAdPlayback();
                        break;
                    case PAUSED:
                        break;
                    case RESUMED:
                        break;
                    case AD_BREAK_READY:
                        // AdEventType.AD_BREAK_READY will be fired when VMAP ads are ready to be played.
                        // For VAMP ads, mMediaVideoAd.start() must be called after AdEventType.AD_BREAK_READY
                        if (mMediaVideoAd != null) {
                            mMediaVideoAd.start();
                        }
                        break;
                    case ALL_ADS_COMPLETED:
                        if (mMediaVideoAd != null) {
                            mMediaVideoAd.onDestroy();
                            mMediaVideoAd = null;
                        }
                        mVideoPlayerWithAdPlayback.resumeContentAfterAdPlayback();
                        mVideoPlayerWithAdPlayback.setReadyToPlayContent(false);
                        break;
                    case AD_BREAK_FETCH_ERROR:
                        // A CONTENT_RESUME_REQUESTED event should follow to trigger content playback.
                        if (mMediaVideoAd != null) {
                            mMediaVideoAd.onDestroy();
                            mMediaVideoAd = null;
                        }
                        mVideoPlayerWithAdPlayback.resumeContentAfterAdPlayback();
                        mVideoPlayerWithAdPlayback.setReadyToPlayContent(false);
                        break;
                    default:
                        break;
                }
            }
        }
    });
    if (mMediaVideoAd != null) {
        if (!mMediaVideoAd.isVMAPOffer()) {
            //VAST just load start
            mMediaVideoAd.start();
        } else {
            //VAMP wait OnIMAEventListener#AD_BREAK_READY call
        }
    }
}
```

---

## 4. 广告场景统计

> [**统计场景到达率**](https://help.toponad.com/cn/docs/1RWLAv)， 呈现在后台的数据 数据报表 -> 漏斗分析报表 -> 到达广告场景 ，建议您在正确的地方进行调用
>
> 1. 先调用`entryAdScenario()`
> 2. 再调用`isAdReady()`
> 3. 最后调用`getMediaVideoAd()`

| 方法 | 说明 |
| --- | --- |
| void entryAdScenario(String placementId, String scenarioId) | 进入业务场景当前广告位缓存状态统计，具体用法查看[广告场景](https://help.toponad.com/cn/docs/1RWLAv) placementId: 广告位ID scenarioId: 广告场景ID（非必传，传null会统计到默认场景） |

java
复制代码

```
ATMediaVideo.entryAdScenario("your placement id", "your scenario id");
if (mATMediaVideo.isAdReady()) {
   ...
   ATShowConfig showConfig = new ATShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mMediaVideoAd = mATMediaVideo.getMediaVideoAd(showConfig);
   ...
}
```

java
复制代码

```
TUMediaVideo.entryAdScenario("your placement id", "your scenario id");
if (mTUMediaVideo.isAdReady()) {
   ...
   TUShowConfig showConfig = new TUShowConfig.Builder()
                .scenarioId("your scenario id")
                .build();
    mMediaVideoAd = mTUMediaVideo.getMediaVideoAd(showConfig);
   ...
}
```

---

## 5. 接入参考

示例代码：[Demo](https://github.com/toponteam/TPN-Android-Demo)的MediaVideoActivity.java
