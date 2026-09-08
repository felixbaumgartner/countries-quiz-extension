# Quality baseline and release roadmap

This is a verified reliability and usability improvement, not a claim that the extension is finished or independently certified. “AAA” has no defined quality threshold for a browser extension.

## Implemented in 2.1.1

| Area | Previous failure | Result |
| --- | --- | --- |
| Extension compatibility | Settings/stats used blocked inline JavaScript | External scripts and Chrome tab navigation; no extra permissions |
| Answer lifecycle | Repeated keyboard input could score twice or skip feedback | One accepted submission per question; native buttons and explicit navigation |
| Saved progress | Concurrent read/modify/write operations could lose updates | A shared Web Lock serializes mutations; background worker saves survive popup closure |
| Review | Duplicates, misleading success notices, stale empty launch requests | Unique valid review entries, atomic resolution, playable empty-review fallback |
| Filters | Fewer than four matching countries blocked play | Target respects filters; distractors expand to the full dataset when necessary |
| Data joins | Four country names failed to match regional metadata | Region/difficulty lookup covers all 196 dataset entries |
| Accessibility and layout | Generic answer labels, simulated buttons, hidden toggles, clipped navigation | Native controls, accurate mode states, focus indicators, 320/400px layouts, scrollable question area |
| Development | No runnable test setup | Locked dev dependencies, syntax/CSP checks, behavioral tests, real-extension browser tests and CI |

## Verification

- `npm run check`: JavaScript syntax, local script references, absence of inline scripts/handlers in runtime pages, storage-only permission, aligned package/manifest versions.
- `npm test`: engine transitions, all filter/mode combinations, region joins, saved settings recovery, review cleanup, initialization preservation and cross-context score updates.
- `npm run test:browser`: real Chromium extension pages and service worker; keyboard answer/Next, mode switching, score reload, settings persistence and validation, timer expiry, stats, review, JSON download, reset, stale review startup and closing a quiz after submission. Screenshots cover light/dark feedback, stats, settings and narrow layout.
- Manual screenshot inspection complements the browser's layout assertions. The automated runner opens popup.html as an extension page; native toolbar anchoring and operating-system screen readers still need manual acceptance testing.

Browser checks use isolated profiles, not the user's browsing profile. Flags are still fetched from an external CDN, so these checks do not certify every flag asset or offline behavior.

## Next release priorities

1. **Offline assets and failure recovery.** Bundle licensed flag SVGs with attribution, verify every asset, stop timed questions when required media fails, and test fully offline operation. Today flags need a network connection.
2. **Verified educational content.** Assign stable country IDs, attach authoritative sources and review dates to capitals/facts, and define treatment of multiple capitals and disputed territories. Regional joins are repaired; the underlying factual claims have not all been independently verified.
3. **Accessibility acceptance.** Test with NVDA/VoiceOver, zoom, high contrast and the real toolbar popup. Visual flag quizzes need meaningful non-spoiling descriptions or an alternative mode; generic image labels alone do not make them screen-reader accessible.
4. **Learning design.** Add deliberate spaced review, clear session goals and progress over time. Evaluate these with learners before adding more metrics or gamification.
5. **Release discipline.** Build an allowlisted distributable ZIP, add data migration/corruption recovery and import validation, then prepare store screenshots, privacy disclosures and a release checklist. Do not package development profiles, node_modules or tests into a store upload.

The extension uses only the `storage` permission. Progress stays in local extension storage; flag requests go to flagcdn.com. Resetting statistics preserves settings, and exported JSON contains local progress/settings.

## Platform references

- [Chrome extension Content Security Policy](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy): extension scripts must comply with MV3 restrictions.
- [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs): opening an extension page with `tabs.create` needs no additional tab permission.
- [Web Locks specification](https://www.w3.org/TR/web-locks/): serializing shared-resource operations across contexts.
- [Chrome storage](https://developer.chrome.com/docs/extensions/reference/api/storage): extension-local persistence and its limits.
