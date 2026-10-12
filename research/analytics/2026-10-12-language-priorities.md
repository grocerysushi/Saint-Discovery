# Language priorities — October 12, 2026

Read from the signed-in Google Analytics UI, property **Saint Discovery Quiz (522468250)**, account 131600271. Report: User attributes → Demographic details; primary dimension changed from Country to **Language**. Date range: **September 14–October 11, 2026** (last 28 complete days). Report showed 100% of available data.

Used the existing **Reader pages - production** comparison: hostname exactly `www.saintdiscoveryquiz.com`, page path excluding `/admin`, and Test data filter name excluding Traffic. This is an existing saved comparison; no permanent Analytics settings were changed. Unmarked historical owner traffic cannot be removed retrospectively.

Production readers: **6,532 active users**, 6,127 engaged sessions, 64.15% engagement rate, 4m 39s average engagement per active user. All Users had 6,541 active users. The filtered figures below drive the recommendation.

| Browser/device language | Active users | Share | Engaged sessions | Engagement rate | Average engagement/user |
| --- | ---: | ---: | ---: | ---: | ---: |
| English | 6,151 | 94.17% | 5,827 | 64.05% | 4m 42s |
| Spanish | 90 | 1.38% | 94 | 71.21% | 4m 36s |
| German | 34 | 0.52% | 33 | 63.46% | 4m 08s |
| Chinese | 31 | 0.47% | 2 | 5.71% | 51s |
| French | 31 | 0.47% | 26 | 61.90% | 5m 26s |
| Italian | 27 | 0.41% | 20 | 62.50% | 4m 14s |
| Swedish | 17 | 0.26% | 17 | 77.27% | 4m 45s |
| Portuguese | 16 | 0.24% | 14 | 77.78% | 3m 54s |
| Dutch | 15 | 0.23% | 17 | 73.91% | 4m 33s |
| Polish | 13 | 0.20% | 12 | 92.31% | 3m 33s |

Other reported active users: Hungarian 9; Croatian 8; Czech 8; Finnish 6; Indonesian 6; Japanese 6; Slovenian 6; Danish 5; Korean 5; Arabic 4; Norwegian Bokmål 4; Romanian 4; Russian 3; Slovak 3; Vietnamese 3; Lithuanian 2; Armenian 1; Catalan 1; Greek 1; Maltese 1; Welsh 0. Filipino was not shown and is an additional convenience option, not an Analytics-backed priority. The report did not distinguish simplified/traditional Chinese; both are offered without claiming separate demand.

## Decision and limits

Prioritize **Spanish, German, French** in the header. Spanish has the clearest current demand. German is next by volume; French has much stronger measured engagement than Chinese at the same volume. Chinese's low engagement could itself reflect a language barrier; it remains easily available and should not be dismissed. Italian is a useful next candidate for maintained localization.

Language means the browser/device language setting, not a verified native language or nationality. Existing English-only content biases the audience; these small non-English samples do not estimate total addressable demand. Engagement differences are observational, not proof of cause. No search-volume or revenue estimates were inferred.

First release: user-selected, clearly labeled Google website translation of public pages, including content and the quiz. Use native language names. No automatic redirect based on geography or browser settings. This supplies broad reading access before undertaking editorial maintenance of hundreds of biographies and blog posts. It opens Google's translated view on a separate host and does not create translated pages in our search index. Email signup and account actions remain on the English site.

Next phase: professionally reviewed Spanish translations on owned language URLs if selection/use supports the investment; then German/French. Review after a month of actual usage. `language_select` records `selected_language` and `translation_method` on the original production site; a selection is intent, not proof that Google's page loaded or a translated quiz completed. Existing hostname restrictions intentionally prevent the proxy from adding duplicate GA traffic.

References: [GA4 Language definition](https://support.google.com/analytics/answer/13785913?hl=en), [User attributes report](https://support.google.com/analytics/answer/12948931), [Google website translation](https://support.google.com/translate/answer/2534559?hl=en). Google notes that website translation is unavailable in some regions. No deprecated embedded widget or unofficial translation API was installed.
