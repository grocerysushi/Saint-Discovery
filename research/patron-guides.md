# Everyday-life saint guides

Prepared September 16, 2026. Five topics were explicitly requested by the site owner: students, parents, nurses, grief, and difficult decisions. A sixth, blacksmiths, was added after reviewing actual Search Console queries.

## Search Console selection

The parent agent inspected the authenticated Search Console Web report for June 14–September 13, 2026, including its displayed query table. It found relevant queries for blacksmiths, nurses, parents/mothers, and students. Blacksmith name/list searches were a substantial missed-click opportunity in that report, including a query associating Gerard with blacksmiths. That motivated a direct answer naming Dunstan and Eligius and a carefully limited clarification about Gerard Majella. The featured order is blacksmiths, nurses, parents, students, grief, and difficult decisions. Raw private analytics and metrics are intentionally not included in this public repository.

No matching grief or difficult-decision query appeared in the displayed query rows. This does not establish an absence of demand: those guides remain owner-requested exploratory topics rather than query-backed priorities. The index's old “Most searched” claim was replaced with neutral editorial language; the observed data supports prioritization, not a universal popularity ranking. Future topic selection should use an up-to-date query and landing-page report, retaining its date range and limits.

## Editorial method

Each guide has linked canonical biographies, an explanation of each connection, Church, religious-order, or Catholic institutional sources next to the relevant passage, original reflection prompts and practical steps, an explicitly original prayer, and visible questions and answers. Five have two biography links; blacksmiths has Dunstan's existing biography and external reading for Eligius, who is not in the catalog. Historical summaries are original paraphrases, not copied source passages. The guides do not assert ecclesiastical approval or human theological review.

Patronage assertions are deliberately narrow:

- Blacksmiths: Cheam Parish identifies Dunstan's traditional smith patronage; Belmont Abbey explicitly labels the devil-and-tongs stories legends. Notre Dame's FaithND documents Eligius's blacksmith and goldsmith patronage. The Redemptorist letter on Gerard Majella identifies popular devotion among expectant mothers; we make the limited statement that this research has not established his blacksmith patronage, not an absolute claim about every saint named Gerard.
- Students: Benedict XVI's June 16, 2010 audience documents Thomas Aquinas's 1880 appointment as patron of Catholic schools and universities. Francis's November 23, 2016 audience supports John Bosco's educational work, not a new patronage of exams.
- Parents: Benedict XVI's August 30, 2009 Angelus calls Monica model and patroness of Christian mothers. Patris corde supports Joseph's example of fatherhood. The guide does not assign him a newly defined patronage of every parental need.
- Nurses: the USA Camillians' account records Camillus's 1930 recognition. Their international order explains the concrete organization of nursing care. The Hospitaller Order's biography explicitly records John of God's 1930 patronage of nurses and their associations.
- Grief: Paul VI's September 14, 1975 canonization homily documents Seton's roles as wife, mother, widow, and religious. John 11 in the USCCB Bible supplies Martha's bereavement. Both are spiritual companions here; neither is newly declared official patron of grief.
- Difficult decisions: Francis's September 7, 2022 audience supplies the Ignatian connection to discernment. Patris corde supplies Joseph's responsible care. These are spiritual companions, not a claimed universal patronage of decisions.

Every source URL and descriptive title is stored beside its claim in `lib/patron-guides.ts` and rendered publicly. Sources were checked using web retrieval and search excerpts on the preparation date. Original suggested applications are editorial reflection, not quotations or historical claims about what a saint prescribed.

## Implementation

The six guides occupy existing `/patron-saint-of/[topic]` routes. A guide replaces generic topic rendering where that topic already exists. Other guide slugs are added to static generation. `PATRON_TOPICS` and its reviewed-patronage filter remain unchanged: devotional companions must not silently become official patronage associations. Guide links are a separate relationship exported through `getGuidesForSaint`.

The patronage index has six guide cards, accurate count-based copy, and neutral editorial shortcuts. Article and breadcrumb structured data match visible content. There is no claim of FAQ rich-result eligibility or guaranteed Google ranking.
