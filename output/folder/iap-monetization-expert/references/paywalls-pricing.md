# Paywalls and Pricing

Use this file for packaging, paywall, trial, pricing, and experiment design.

## Packaging Patterns

Common utility app patterns:

- subscription unlocks all premium features
- free core usage plus premium limits removal
- subscription plus ad removal
- annual subscription with optional lifetime anchor
- consumables only when usage is naturally metered

Prefer packaging that matches the product's value cadence.

## Paywall Principles

- Show the paywall at a value moment, not only at app launch.
- Sell the outcome, not the feature list.
- Keep package choice simple.
- Make the recommended plan visually obvious.
- Reduce trust friction with clear cancellation language and restore access.

## Plan Mix

Common mix:

- weekly or monthly for low-friction entry
- annual for best long-term LTV
- lifetime only as an anchor or niche option

Annual plans usually matter most for LTV. Short plans can help starts but often worsen churn and refunds.

## Current Benchmark Notes

Use benchmark reports as context, not as universal truth.

Verified on 2026-06-24:

- RevenueCat's 2026 report says its dataset covers 115,000+ apps and more than $16B in revenue.
- Adapty's 2026 report says its dataset covers 16,000 apps and $3B in subscription revenue.
- Adapty's 2026 report homepage also highlights that weekly subscriptions generate 56% of all app revenue in its dataset and that 90% of trial starts happen on day 0.

Treat these as broad market signals. For decisions, still segment by category, platform, geo, and app maturity.

## Trials and Intro Offers

Use trials when the premium value needs time to be experienced.

Good cases:

- scanner or OCR flows with repeat usage
- productivity tools with habit formation
- products where premium quality is obvious after several sessions

Be careful with trials when:

- the app solves a one-off task
- the value is fully consumed on day one
- the business already has high accidental-start risk

## Pricing Guidance

When recommending price changes:

- evaluate local purchasing power
- compare against alternative ways the user can solve the job
- account for trust and category maturity
- protect existing payer experience when raising price

Do not recommend one universal price for every region.

## Experiment Design

For pricing or paywall tests:

- primary metric: realized LTV per install
- common guardrails: refund rate, renewal retention, uninstall rate, support complaints
- segment by platform, geo, and acquisition channel
- avoid calling winners on day-zero conversion alone

## Good Deliverables

When the user asks for a recommendation, prefer:

- a plan mix recommendation
- paywall copy and structure changes
- a trial or offer recommendation
- an A/B matrix with one clear primary metric

## Source URLs

- RevenueCat State of Subscription Apps 2026: https://www.revenuecat.com/state-of-subscription-apps/
- RevenueCat 2026 summary article: https://www.revenuecat.com/blog/growth/subscription-app-trends-benchmarks-2026/
- Adapty State of in-app subscriptions 2026: https://adapty.io/state-of-in-app-subscriptions/
- Adapty reports hub: https://adapty.io/reports/
