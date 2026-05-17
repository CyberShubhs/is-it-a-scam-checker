# UTM tagging guidelines

GA4 "Unassigned" traffic almost always means we shared a link without UTM
parameters and GA4 could not figure out which campaign it belonged to. Use
the patterns below whenever you share Scam Checker outside the site.

## Pattern

```
https://scamchecker.app/<page>?utm_source=<where>&utm_medium=<how>&utm_campaign=<why>
```

Optional but recommended for ad/social campaigns: `utm_content` (creative
variant) and `utm_term` (paid keyword).

Rules of thumb:

- Keep names `lower_snake_case` and consistent — GA4 treats `Reddit`,
  `reddit`, and `Reddit_post` as different sources.
- Prefer one campaign name per launch ("scam_checker_launch") rather than
  ad-hoc per-post names.
- Never put PII or internal identifiers in UTM params; they are visible to
  anyone with the link.

## Ready-to-paste examples

### GitHub profile / READMEs

```
https://scamchecker.app/?utm_source=github&utm_medium=profile&utm_campaign=scam_checker_launch
```

### Medium article

```
https://scamchecker.app/check?utm_source=medium&utm_medium=article&utm_campaign=scam_awareness
```

### Dev.to article

```
https://scamchecker.app/check?utm_source=devto&utm_medium=article&utm_campaign=scam_awareness
```

### Reddit community post

```
https://scamchecker.app/have-i-been-scammed?utm_source=reddit&utm_medium=community&utm_campaign=scam_help
```

### LinkedIn post / share

```
https://scamchecker.app/?utm_source=linkedin&utm_medium=social&utm_campaign=scam_checker_launch
```

### Newsletter blast

```
https://scamchecker.app/blog?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_scam_alerts
```

### Hacker News / Show HN

```
https://scamchecker.app/?utm_source=hackernews&utm_medium=community&utm_campaign=show_hn
```

### ChatGPT-shared answer

```
https://scamchecker.app/?utm_source=chatgpt&utm_medium=referral&utm_campaign=ai_assistant
```

## Don't

- Don't reuse `utm_campaign=launch` across unrelated launches — GA4 cannot
  separate the reports later.
- Don't use spaces or `+` in any UTM field; use `_`.
- Don't tag internal links between Scam Checker pages — UTM tags overwrite
  the user's real session source.
- Don't put email addresses, names, or any identifier in `utm_term`.

## Why this matters

Untagged shares show up under **Unassigned / (other)** in GA4 because GA4
cannot tell whether the click came from Reddit, a Slack DM, or a newsletter.
Tagging fixes that and lets us know which channels actually drive checks and
reports.
