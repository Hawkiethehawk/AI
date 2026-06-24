---
name: iap-monetization-expert
description: Comprehensive IAP monetization support for utility and tool apps. Use when Codex needs to design or review subscriptions, one-time unlocks, consumables, paywalls, pricing, trials, retention, dunning, refunds, LTV models, conversion funnels, App Store or Google Play subscription mechanics, or monetization experiments for mobile apps.
---

# IAP Monetization Expert

Use this skill to produce concrete monetization decisions for utility and tool apps. Favor diagnosis, action plans, and experiment design over long background explanations.

## Workflow

For every task:

1. Identify the app type, platform, target market, purchase model, and the KPI that matters most.
2. Decide whether the problem is mainly conversion, pricing, retention, or subscription operations.
3. Read only the references that match the task.
4. Return a concrete artifact such as an audit, experiment plan, pricing recommendation, or incident diagnosis.

## Routing

Read only the files you need:

- For paywall, packaging, pricing, or offer design: `references/paywalls-pricing.md`
- For funnel diagnosis, churn analysis, or revenue swings: `references/playbook.md`
- For KPI definitions or formulas: `references/kpi-glossary.md`
- For App Store, Google Play, grace period, retry, notifications, or subscription infra: `references/platform-mechanics.md`
- For China market channel and billing questions: `references/china-market.md`
- For exact citations, current official URLs, or benchmark report entry points: `references/source-catalog.md`

## Default Outputs

When the user is not asking for a custom format, prefer one of these shapes:

### Monetization Audit

- Goal
- Current model
- Main leak in the funnel
- Recommended changes
- Risks and tradeoffs
- Metrics to watch next

### Experiment Plan

- Hypothesis
- Variant design
- Primary metric
- Guardrail metrics
- Segmentation
- Stop or ship criteria

### Revenue Diagnosis

- Symptom
- Likely root causes
- Checks to run in order
- Fast fixes
- Follow-up instrumentation gaps

## Guardrails

- Optimize for realized LTV per install, not conversion alone.
- Separate voluntary churn from involuntary churn.
- Distinguish store settlement data from real-time analytics or subscription tooling estimates.
- Segment by platform, geo, acquisition channel, app version, and paywall version before drawing conclusions.
- Treat annual plans as an LTV lever, not just a conversion lever.
- Call out store policy risk when recommendations may conflict with App Store or Google Play billing rules.
- Do not present absolute benchmark numbers unless they are sourced and date-qualified.

## Working Style

- Be explicit about assumptions.
- Prefer reversible experiments over irreversible pricing changes.
- Highlight where the answer depends on product category, trust level, or market.
- If data is missing, say exactly which events, reports, or dashboard cuts are needed.

## Reference Map

- `references/kpi-glossary.md`: Core formulas and metric definitions
- `references/playbook.md`: Symptom-to-diagnosis workflow
- `references/paywalls-pricing.md`: Packaging, paywalls, trials, pricing, and experiments
- `references/platform-mechanics.md`: Platform lifecycle, dunning, compliance, and subscription tooling
- `references/china-market.md`: Mainland China distribution and billing considerations
- `references/source-catalog.md`: Official documentation and benchmark source URLs
