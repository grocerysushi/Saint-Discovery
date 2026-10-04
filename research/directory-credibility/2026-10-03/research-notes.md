# Directory credibility pass — October 3, 2026

## Scope and method

AI-assisted source comparison and site maintenance. No qualified human historical, theological, liturgical, or educational review was performed or credited. No ecclesiastical endorsement was obtained or implied.

Inventoried the effective source references for all 641 published biographies, including their separate context contributions and calendar qualifications. The inventory validates reference structure and records existing review dates; it does not reread or independently substantiate all 1,008 unique references. Targeted primary-source reading in this pass covers Mary Magdalene, Christopher, George, and John Paul II. Their existing accounts already contain important qualifications; the new records honestly identify added explanations as clarifications rather than inventing prior factual errors.

## Claim-level source comparisons

### Mary Magdalene

- Source: [Holy See explanation of the 2016 liturgical change](https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2016/06/10/160610c.html), particularly its discussion of older Western identification of multiple Gospel women and the reformed liturgy's identification of Mary of Magdala.
- Source: [Congregation for Divine Worship, new preface commentary](https://www.vatican.va/roman_curia/congregations/ccdds/documents/il-nuovo-prefazio-maddalena-articolo_en.pdf), sections on July 22 and the change from obligatory memorial to feast.
- Evidence distinction: Gospel identity and later liturgical/devotional reception are separate. An older painting or devotional account does not establish that different Gospel women were one person.
- Calendar finding: the 2016 action changed the rank, not the recurring July 22 date. The English preface commentary has an apparent isolated June/July typographical inconsistency; the repeated July references and official explanation establish July 22. No erroneous June date was copied into the site.

### Christopher

- Source: [Vatican News saint entry for July 25](https://www.vaticannews.va/en/saints/07/25/st--christopher--martyr.html), narrative explicitly introducing the river crossing as a legend.
- Evidence distinction: the devotional episode helps explain imagery and patronage; it cannot establish the exact conversation, birthplace, or lifespan. Veneration and the factual accuracy of each later episode are separate questions.
- Calendar finding: a dated Vatican News saint listing establishes what that directory lists. It is not, by itself, a General Roman Calendar entry or a universal obligatory memorial.

### George

- Source: [Vatican News saint entry for April 23](https://www.vaticannews.va/en/saints/04/23/st--george--martyr.html), discussion of the dragon legend and its symbolism.
- Evidence distinction: later legendary narrative and medieval English patronage describe reception, not new documentation of events in the ancient martyr's life.
- Calendar finding: the recurring April 23 date and the rank or actual observance in a particular jurisdiction/year must be kept separate.

### John Paul II

- Source: [Holy See biography](https://www.vatican.va/content/john-paul-ii/en/biografia/documents/hf_jp-ii_spe_20190722_biografia.html), chronology and death date.
- Source: [USCCB liturgical entry](https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar/saint-john-paul-ii), introduction on the 2014 General Roman Calendar addition and optional memorial, death date in the biography, and October 22, 1978 inauguration homily.
- Source: [USCCB 2026 calendar](https://www.usccb.org/resources/2026cal.pdf), printed page 41: October 22 lists John Paul II as an optional memorial, using the bracket notation explained in the introduction.
- Evidence distinction: a biographical chronology supports dates and events. Interpretive assessments of a pontificate's effects require additional evidence. Poetry, recollections, legislation, and teaching documents are different genres and should not be assigned identical authority.
- Calendar finding: October 22 is distinct from April 2, 2005, the date of death, and from the liturgical rank of feast.

## General calendar guidance

[USCCB annual calendar overview](https://www.usccb.org/committees/divine-worship/liturgical-calendar) describes the annual identification of celebrations, rank, and liturgical color. The [2026 calendar](https://www.usccb.org/resources/2026cal.pdf), printed pages 3–6, explains its General Roman/U.S. basis, notation, local additions, and annual exceptions. Printed page 6, note 2 directs diocesan/provincial calendars to add local dedications and particular saints' commemorations.

The site guide explains scope, recurring dates versus observances in a particular year, rank, edition, and calendar-system identification. Saint of the Day remains a daily directory reading selection and does not replace a parish's approved Mass calendar.

## Link retrieval and limits

The final targeted audit checked 13 distinct source URLs from the four selected biographies. Twelve returned HTTP 200. The USCCB John Paul II HTML entry returned HTTP 403 to the audit request, although its text was accessible and read through the web research tool. This is recorded as a retrieval issue, not proof of a false reference. The accessible official 2026 PDF provides a second calendar reference. An initially considered Archdiocese of Baltimore page returned HTTP 500 and was replaced in the new site links with the USCCB PDF.

Full results, timestamps, URLs, and the directory-wide structural inventory are in source-inventory.json. Link availability alone is never recorded as historical verification. No repeated bulk requests were made to force access to the blocked page.

## Changes and recovery

The public log records one technical correction (using the latest actual content revision in structured data and the sitemap), one directory-wide calendar-label clarification, and four biography-specific evidence/calendar clarifications. Its start date is explicit; it does not fabricate a reconstruction of older edits.

Maintainer instructions in docs/directory-editorial-maintenance.md require claim-level evidence, actual before/after records, and permission plus completed, scoped, version-specific review before publishing a human credit. No emails were sent or reviewer identities invented during this work.

The changes remain local until committed and deployed. No database, authentication, existing blog article, or production deployment was changed by this pass.
