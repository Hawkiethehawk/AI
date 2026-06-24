# Platform Mechanics

Use this file when the task depends on store behavior, subscription state, or infra choices.

## App Store and Google Play Basics

For digital features unlocked inside the app, default to store-native billing unless a jurisdiction-specific rule clearly changes that analysis.

Core platform topics:

- subscription groups, base plans, and offers
- grace period and billing retry
- server notifications
- refunds and restore flows
- compliance wording on price, renewal, and cancellation

## Current Sourced Facts

These facts were verified against official pages on 2026-06-24:

- Apple says the App Store Small Business Program reduces commission to 15% on paid apps and in-app purchases for eligible developers.
- Apple says auto-renewable subscriptions move to the 15% rate after a subscriber accumulates one year of paid service, and that if a subscription lapses for more than 60 days the paid-service clock resets.
- Apple documents Billing Grace Period and says access can continue while Apple attempts to recover payment, avoiding interruption if recovery happens within the grace period.
- Google Play's help center says automatically renewing subscriptions are charged a 15% service fee regardless of annual developer revenue.
- Google Play documents recovery as grace period followed by account hold, and RTDN as the real-time backend notification channel.

## Subscription Lifecycle

Think in four stages:

1. purchase or trial start
2. activation and value delivery
3. renewal or payment failure
4. churn, recovery, or win-back

## Dunning

When payment fails:

- keep access during grace period when appropriate
- use notifications and lifecycle messaging to recover payment
- track recovery separately from normal retention

This is an operations lever, not just a finance detail.

For Apple, use Billing Grace Period and App Store Server Notifications V2.
For Google Play, use grace period, account hold handling, and RTDN over Pub/Sub.

## Settlement vs Real-Time Data

Separate:

- store settlement data for net proceeds and finance truth
- real-time subscription tooling or analytics for funnel analysis

Do not reconcile finance using dashboard estimates alone.

## Subscription Infrastructure

Common tooling categories:

- entitlement and purchase validation
- cross-platform subscription state
- paywall experimentation
- cohort and lifecycle analytics

Examples often considered by teams:

- RevenueCat
- Adapty
- Superwall
- Qonversion

Recommend tooling based on the team's need for:

- implementation speed
- experimentation depth
- analytics depth
- ownership of backend logic

## Compliance Reminders

Call out these recurring risks:

- unclear auto-renew language
- missing restore access flow
- misleading weekly pricing
- promises on the paywall that the product cannot deliver

Apple's subscriptions page explicitly calls for clear renewal price disclosure, access to restore or sign in for current subscribers, and links to Terms of Use and Privacy Policy.

## Source URLs

- Apple auto-renewable subscriptions overview: https://developer.apple.com/app-store/subscriptions/
- Apple Small Business Program: https://developer.apple.com/app-store/small-business-program/
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple Billing Grace Period: https://developer.apple.com/help/app-store-connect/manage-subscriptions/enable-billing-grace-period-for-auto-renewable-subscriptions/
- Apple App Store Server Notifications V2: https://developer.apple.com/documentation/appstoreservernotifications/app-store-server-notifications-v2
- Apple restore purchases: https://developer.apple.com/documentation/storekit/restoring-purchased-products
- Google Play Billing overview: https://developer.android.com/google/play/billing
- Google Play subscriptions overview: https://developer.android.com/google/play/billing/subscriptions
- Google Play subscription lifecycle: https://developer.android.com/google/play/billing/lifecycle/subscriptions
- Google Play RTDN reference: https://developer.android.com/google/play/billing/rtdn-reference
- Google Play integration guide: https://developer.android.com/google/play/billing/integrate
- Google Play price changes: https://developer.android.com/google/play/billing/price-changes
- Google Play service fees: https://support.google.com/googleplay/android-developer/answer/112622?hl=en
- Google Play Billing version deprecation FAQ: https://developer.android.com/google/play/billing/deprecation-faq
