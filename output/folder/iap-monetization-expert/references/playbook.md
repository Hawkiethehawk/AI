# Diagnostics Playbook

Use this file when the user is asking why revenue, conversion, churn, or refunds changed.

## First Pass

Start with five cuts before recommending changes:

1. Platform: iOS vs Android
2. Market: country or pricing region
3. Acquisition: organic vs paid, plus channel
4. Product version: app version and paywall version
5. Plan mix: weekly, monthly, annual, lifetime

## If Paid Conversion Dropped

Check in this order:

1. Did traffic mix change toward lower-intent users?
2. Did paywall placement, copy, or default plan change?
3. Did prices, trials, or intro offers change?
4. Did product fetch, billing, or paywall load errors rise?
5. Did a specific geo, platform, or app version cause the drop?

Typical fixes:

- restore the previous paywall variant
- move the paywall closer to the value moment
- reduce package complexity
- repair billing or product fetch issues

## If Trial Starts Are High but Trial-to-Paid Is Weak

Likely causes:

- users start trial without experiencing the core value
- trial length does not fit the product's time-to-value
- trial expiry reminders are missing
- the product solves a one-off job and does not create repeat value

Typical fixes:

- improve post-purchase onboarding
- force exposure to premium value during trial
- test trial length and reminder timing
- test annual-first positioning if monthly churn is severe

## If Renewals Dropped

Split the issue first:

- voluntary churn
- involuntary churn

Then inspect:

- first renewal cohort
- plan-specific retention
- cancellation reasons
- grace period and retry recovery
- recent changes in product value or trust

## If Refund Rate Rose

Check:

- misleading paywall framing
- accidental purchase risk, especially with weekly plans
- mismatch between promise and delivered value
- geo-specific or payment-specific spikes

Do not solve refund issues by suppressing refunds. Fix the root cause.

## If Revenue Moved but Root Cause Is Unclear

Walk the tree from top to bottom:

`Revenue = new users x paywall reach x start rate x trial-to-paid x retained net value`

At each branch, ask:

- was this a traffic quality problem?
- was this a product or monetization problem?
- was this a billing or reporting problem?

## Output Style

Return diagnosis in this format:

- Symptom
- Most likely causes ranked
- Evidence already visible
- Checks still needed
- Fastest safe action
- Longer-term fix
