# KPI Glossary

Use these definitions when building or reviewing IAP analysis.

## Core Revenue Metrics

- `Paid conversion rate`: paid users / installs or eligible users
- `Trial start rate`: trials started / paywall viewers or installs
- `Trial-to-paid rate`: converted payers / trial starters
- `ARPU`: revenue / all users
- `ARPPU`: revenue / paying users
- `MRR`: monthly recurring revenue
- `ARR`: annualized recurring revenue
- `Proceeds`: net store payout after commission, refunds, and applicable taxes

## Recommended North Star

Use `realized LTV per install` as the main decision metric.

Why:

- It captures both conversion and retention.
- It reflects the value of annual plans and renewals.
- It prevents false wins where conversion rises but refunds or churn rise faster.

## Practical Formula

For subscription products, reason from this structure:

`LTV per install = paywall reach x trial start rate x trial-to-paid rate x retained net value`

Where retained net value is the sum of future renewal value after:

- store commission
- refunds
- taxes when relevant

## Churn Split

Always split churn into:

- `Voluntary churn`: user cancels because value, trust, or price is not good enough
- `Involuntary churn`: payment failure, expired card, insufficient balance, risk controls

The fixes are different, so the split matters.

## Data Hygiene

When presenting metrics, note:

- data source
- time window
- cohort vs blended view
- gross revenue vs net proceeds
- platform and market split

## Benchmark Discipline

If you include benchmark numbers in an answer:

- prefer category-specific benchmarks over whole-market averages
- qualify the year of the benchmark
- include the source URL in the answer
- avoid mixing Apple, Google Play, and blended mobile results without saying so

Current benchmark entry points verified on 2026-06-24:

- RevenueCat State of Subscription Apps 2026: built on 115,000+ apps and more than $16B in revenue
- Adapty State of in-app subscriptions 2026: based on 16,000 apps and $3B in subscription revenue

## Source URLs

- RevenueCat State of Subscription Apps 2026: https://www.revenuecat.com/state-of-subscription-apps/
- RevenueCat 2026 summary article: https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/
- Adapty State of in-app subscriptions 2026: https://adapty.io/state-of-in-app-subscriptions/
- Adapty reports hub: https://adapty.io/reports/
