# Homepage liturgical calendar

The banner is separate from both the directory's feast-date metadata and the
site's fixed quiz-derived theme. It shows the principal U.S. Roman Rite
celebration for the visitor's local **civil date**, with Ascension on Sunday.
It is a reading aid, not an ordo for a particular parish, religious order or Mass.
The provinces retaining Thursday Ascension are not the selected calendar.
The details panel states the scope, browser timezone, sources and review date.

## Provenance and license

Calendar calculation uses reduced factual output from the established
[LiturgicalCalendarAPI](https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI),
version 5.7, tagged revision `91d391f8cca97a2688f68cabe74c5231ebacc181`,
by John Romano D'Orazio and contributors. Its Apache-2.0 license is distributed
at public/licenses/liturgical-calendar-api.txt and linked in the banner.
The snapshot records request settings, engine version, retrieval time and SHA256.
We modify/reduce the output to date, celebration, event identity and colors;
readings, prayers, bibliographic readings references and API messages are omitted.
No third-party executable dependency is added to the site and visitors never
contact the calendar API.

Authoritative validation references (not redistributed calendar compilations):
- [USCCB 2026 calendar](https://www.usccb.org/resources/2026cal.pdf)
- [USCCB 2027 calendar](https://www.usccb.org/resources/2027cal.pdf)
- [GIRM 346–347: liturgical colors](https://www.usccb.org/prayer-and-worship/the-mass/general-instruction-of-the-roman-missal/girm-chapter-6)
- [Universal Norms on the Liturgical Year and Calendar](https://www.liturgyoffice.org/Calendar/Info/GNLY.pdf)

USCCB PDFs are copyrighted; none of their calendars, readings or prose are
copied into the repository. They are the independent authority for exception
checks. The runtime snapshot comes from the Apache-licensed calculation engine.

## Selection and reviewed corrections

Choose the highest-ranking principal event (grade 3 or higher), otherwise the
weekday (grade 0). A commemoration in Lent or optional memorial must not displace
that weekday. Exclude `is_vigil_mass` events for the following day; keep Easter
Vigil itself but explicitly label its color as applying after nightfall, not to
a daytime Easter Mass. Holy Thursday similarly explains the evening Mass.

Two v5.7 output gaps are explicitly corrected using annual USCCB notes:
2026-06-13 and 2027-06-05 contain coinciding memorials reduced to optional rank
but no weekday entry. Show the documented green Ordinary Time weekday, with a
note. These are exact reviewed dates, not a general season fallback.
All Souls adds the U.S. permitted white and black alternatives to violet.
Advent III and Lent IV default to violet and label rose as optional. The
calendar value stays white where appropriate; gold is only a decorative accent.

Fixtures cover Oct 1/2 white, Oct 3 optional Marian white with weekday green,
Sunday suppressions, Lent commemorations, Joseph/Annunciation, Palm Sunday,
the Triduum, Sunday Ascension, Immaculate Heart conflicts, and the 2027
Annunciation transfer to April 5. Optional local choices remain explicitly local.

## Maintenance and failures

`npm run calendar:refresh` is an explicit editorial maintenance command.
It fetches only public API data. It rejects unexpected engine versions/settings,
incomplete years, missing principal days and failed exception fixtures before
writing the cache. Run unit, SEO and browser tests before committing a refresh.
Adding a year requires reviewing that year's official changes and fixtures,
then updating the supported years and review date. There is no daily live fetch.

Coverage is 2026–2027. An unavailable date/year shows **Calendar unavailable**
and **Color not verified**. API outages cannot affect a shipped reviewed cache;
an attempted failed refresh leaves it intact. No fallback aesthetic color is
represented as a liturgical fact. The server renders a neutral, fixed-size
local-date placeholder; hydration reads the visitor's date without mismatched
server markup. Midnight scheduling uses the next local calendar date (including
23/25-hour DST days); visibility changes catch up after sleep or timezone changes.
The optional date picker is visibly labeled **Calendar preview**, with a
return-to-today control, and changes only this banner.
