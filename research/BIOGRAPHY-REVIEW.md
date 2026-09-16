# Biography source review

Generated from checked-in data on 2026-09-16.

This is AI-assisted comparison with cited external sources, not ecclesiastical approval, scholarly peer review, or a guarantee that every historical question is settled. Source-reviewed means a source comparison was performed; legends and private revelations were not independently proven.

## Method and limits

Reviewers independently consulted external material for assigned identities, preferring Holy See and Vatican publications, dioceses, religious orders, the French bishops’ Nominis calendar, the Catholic Encyclopedia, and Orthodox church sources where appropriate. Older works can be dated, and institutional sources sometimes disagree. Biographies distinguish biblical narrative, devotional tradition, and later legend from securely established history where material.

The review compared identity, names, saint/blessed status, feast dates and calendar variants, origin, dates, and retained patronage. Unsupported quotations, attributed prayers, fun facts, and patronages were cleared rather than carried forward. Source links support the associated review, not every claim on the linked page.

The original saints.json and saint-extended.json are legacy inputs, not independent factual authorities. The former supplies the 486-slug inventory. Review overlays provide corrected biographies and explicit duplicate or unresolved classifications. The deprecated model-only generator must not overwrite these reviews.

## Reproduce the audit

```sh
node scripts/audit-biographies.mjs
node scripts/audit-biographies.mjs --require-complete
node scripts/audit-biographies.mjs --require-complete --write-report
```

The audit reads every lib/data/saint-reviews*.json file. It checks the raw inventory, repeated JSON keys, cross-file collisions, extra slugs, schema, nonempty biography paragraphs, HTTPS source URLs, and direct canonical duplicate targets. --require-complete fails for missing reviews. Explicitly unresolved identities count as completed research dispositions, not verified saints. This structural audit does not fetch sources or automatically verify historical claims.

## Current coverage

| Measure | Count |
| --- | ---: |
| Raw records | 486 |
| Review files | 5 |
| Source-reviewed | 460 |
| Duplicate redirects | 16 |
| Needs identification | 10 |
| Pending | 0 |
| Audit errors | 0 |

Review files: `saint-reviews-research1.json`, `saint-reviews-research2.json`, `saint-reviews-research3.json`, `saint-reviews-root.json`, `saint-reviews.json`.

## Unresolved identities

These records must remain visibly unresolved and be excluded from recommendations implying a confirmed saint identity. Their sources support disambiguation, not proof of nonexistence.

### Agenoria (agenoria)

The name Agenoria cannot presently be established here as that of a Christian saint. Augustine discusses Agenoria in Book IV of The City of God as a Roman divinity associated with prompting activity. His argument concerns the multiplication of pagan deities, not a Christian martyr or charitable woman. That ancient reference is directly at odds with treating the name alone as a verified saintly identity.

Searches for Agenoria with saint and Christian biography terms located this pagan identification but did not establish the person described in the earlier entry. A spelling error or confusion with another name remains possible. Until an identifiable church source supplies a Christian person, feast, and historical setting, the former biography, feast, patronages, and attributed quotations should not be presented as established facts.

- [Augustine: City of God IV, chapter 16](https://www.newadvent.org/fathers/120104.htm)

### Bakhita of Olossio (bakhita-of-olossio)

The identity Bakhita of Olossio has not been established from an independent ecclesiastical or historical source. Searches of the exact name and of Vatican material about Bakhita did not substantiate the earlier account of a Nigerian catechist or religious sister. The exact-name result located the same Saint Discovery material being reviewed, which cannot independently validate its own claims.

The Vatican does document Josephine Bakhita, a Sudanese woman formerly enslaved who became a Canossian sister in Italy. Her documented life does not support silently assigning the Olossio entry to her. This record therefore remains unresolved, rather than asserting that no such person ever existed. Its former dates, Nigerian origin, feast, patronages, quotations, and religious affiliation require evidence before they can be restored.

- [Holy See: Mother Josephine Bakhita](https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20001001_giuseppina-bakhita_en.html)

### Cuan (cuan)

Cuan is a name borne by more than one saint in Irish local tradition, and the earlier entry does not supply enough detail to identify which was intended. Searches for its December 15 feast did not establish a matching identity. Irish folklore collections instead record a Cuan associated with Ahascragh and an October observance, and a Cuan connected with Mothel and a July observance.

These records demonstrate real local traditions but do not justify combining their details into one biography. The name also overlaps with forms such as Mochua, which adds further ambiguity. A parish, monastery, early calendar notice, or fuller name is needed before this entry can carry a reliable feast or life story. Its former raven symbolism and attributed sayings remain unverified.

- [Dúchas: Cuan, patron of Ahascragh](https://www.duchas.ie/en/cbes/4583292/4577054/4591432)
- [Dúchas: Saints Cuan and Brogan of Mothel](https://www.duchas.ie/en/cbes/4428165/4383072/4448973)

### Julia (identity unresolved) (julia)

The original entry combines the name Julia, an April 8 feast, and a story of martyrdom in North Africa without a supporting source. Those details do not securely identify a single person. Julia of Corsica is traditionally associated with Carthage but is commemorated on May 22 in the West, while Julie Billiart, commemorated on April 8, was a modern French religious foundress.

Searches for Julia as an April 8 African martyr and comparison with the Vatican's Julia of Corsica profile and the Sisters of Notre Dame de Namur's account of Julie Billiart did not resolve the conflict. This is an identification gap, not proof that no other martyr named Julia existed. The supplied dates, patronages, quotations, and narrative should remain unpublished until a specific source establishes the intended person.

- [Vatican News: Julia of Corsica](https://www.vaticannews.va/en/saints/05/22/st--julia--virgin-and-martyr-of-corsica.html)
- [Sisters of Notre Dame de Namur: Julie Billiart](https://www.sndden.org/who-we-are/st-julie-billiart/)

### Nemesius (nemesius)

The supplied entry combines a bishop and philosophical writer with the December 19 feast of an Alexandrian martyr. Nemesius of Emesa and Nemesion of Alexandria are different historical identities; the current record cannot reliably choose between them.

The December martyr suffered under Decius, whereas the bishop of Emesa belongs to a later theological setting. Searches for Nemesius, Emesa, Alexandria, and the December 19 commemoration produced these distinct candidates. Their dates, roles, and places must not be merged. Until the intended person is established, this record withholds a biographical identification and feast day.

- [www.newadvent.org: identity disambiguation](https://www.newadvent.org/cathen/05402a.htm)
- [nominis.cef.fr: identity disambiguation](https://nominis.cef.fr/contenus/saint/10388/Saint-N%C3%A9m%C3%A9sion.html)

### Nicholas of Toledo (nicholas-of-toledo)

The supplied name and description identify a twelfth-century Spanish priest, but the September 10 feast points toward Nicholas of Tolentino, an Italian Augustinian who lived from 1245 to 1305. The consulted Augustinian sources establish the latter saint, not the Spanish biography.

A Metropolitan Museum print is catalogued as Saint Nicholas of Toledo, showing that this wording exists, but its catalogue supplies no biography establishing the supplied Spanish priest. Searches for the name and September 10 instead chiefly identified Tolentino or repeated the site's own unsupported text. Further identification is necessary before assigning a life, dates, or patronages.

- [augustinian.org: identity disambiguation](https://augustinian.org/september-10-2/)
- [Metropolitan Museum of Art: print titled Saint Nicholas of Toledo (name evidence only)](https://www.metmuseum.org/art/collection/search/713363)

### Nina, alleged modern Georgian martyr (nina-martyr-of-georgia)

The supplied record describes a Georgian woman supposedly killed in Soviet repression in 1938, but it provides no surname or traceable account of her recognition. Searches combining Nina, Georgia, martyr, 1938, and December 15 did not establish that particular identity.

A reliable Orthodox source assigns December 15 in Western tradition to the ancient evangelizer Nino or Nina, also called Christina. That fourth-century figure is not a modern Soviet martyr. The similar names and mismatched feast suggest conflation, but do not prove that no modern woman of this name existed. A specific surname or church canonization record is needed before a biography can be assigned.

- [www.goarch.org: identity disambiguation](https://www.goarch.org/chapel/saints?contentid=2463&language=en)
- [www.oca.org: identity disambiguation](https://www.oca.org/saints/lives/2024/01/14/100191-saint-nino-nina-equal-of-the-apostles-enlightener-of-georgia)

### Rufinus (rufinus)

The earlier entry combined the name Rufinus, a July 10 feast, and a generic story about an early fourth-century martyr. The sources checked do not establish that combination. Several saints bear similar names; the July 10 Roman commemoration concerns Rufina and Secunda, who should not be silently substituted for this person.

Rufinus of Assisi and other martyrs named Rufinus have distinct traditions and feast days. Without a location, companion, or reliable biographical source identifying the intended individual, the original narrative cannot responsibly be retained as verified history. This entry remains under identification review, with its previous dates and patronage withdrawn.

- [Vatican State: Rufina and Secunda, a distinct July 10 commemoration](https://www.vaticanstate.va/en/state-and-government/general-informations/saint-of-the-day/2254-july-10-saints-rufina-and-secunda-martyrs.html)

### Wasnildus (wasnildus)

The original catalog described Wasnildus as a European monk celebrated on September 7, but supplied no monastery, period, or historical source that would establish his identity. Searches for the exact name and spelling variants did not locate an independent biographical source sufficient to verify that account.

An unsuccessful search does not prove that no such person existed. It does mean that the generic story, feast day, and other personal claims should not be published as established history. This record is retained to explain the uncertainty while a reliable identification is sought; the cited monastic calendar provides research context, not confirmation of this name.

- [Mount Angel Abbey: Martyrology, contextual reference](https://amcass.org/documents/signin/monastic-life/Martyrology-Complete.pdf)

### William — identity under review (william)

The original William entry mixes incompatible clues: its June 25 feast belongs to William of Vercelli, founder of Montevergine, while its description identifies a bishop of York. William of York is a different person, celebrated on June 8, and already has a separate biography in this directory.

Neither a first name alone nor a contradictory generated description is sufficient to decide which saint was intended. The earlier biographical claims are therefore withdrawn rather than joined into a new composite. Readers can consult the separate William of York biography or the cited Vatican account of William of Vercelli while this legacy entry remains unresolved.

- [Vatican News: William of Vercelli, June 25](https://www.vaticannews.va/en/saints/06/25.html)
- [Catholic Encyclopedia: William of York, June 8](https://www.newadvent.org/cathen/15628c.htm)

## Duplicate aliases

| Alias | Canonical record | Reason |
| --- | --- | --- |
| adrian-of-nicomedia | adrian | Adrian and Hadrian are alternative names for the martyr described in the cited Catholic Encyclopedia entry. |
| aidan-of-lindisfarne | aidan | The cited biography identifies the two catalog names as the same person. |
| albertus-magnus | albert-the-great | The cited biography identifies the two catalog names as the same person. |
| alexis-of-rome | alexis | The cited biography identifies the two catalog names as the same person. |
| alphonsus-maria-de-liguori | alphonsus-liguori | The cited biography identifies the two catalog names as the same person. |
| cuthbert | cuthbert-of-lindisfarne | The monk and bishop of Lindisfarne is the same Cuthbert described by the Catholic Encyclopedia, https://www.newadvent.org/cathen/04578a.htm. |
| douard | edward-the-confessor | Édouard is the French form of Edward; the earlier biography explicitly identifies Edward the Confessor, whose Westminster history is documented at https://www.westminster-abbey.org/abbey-commemorations/royals/edward-the-confessor-and-edith. |
| genevi-ve | genevieve | Accented French spelling of the same Geneviève of Nanterre/Paris, commemorated January 3; the French bishops' biography is cited in the canonical record. |
| john-of-kanty | john-cantius | John Cantius and John of Kanty are variant names of the Kraków scholar from Kęty, explicitly identified together by the St. John Cantius Church biography: https://www.cantius.org/patron-saint/1000 |
| kate-of-siena | catherine-of-siena | The legacy account describes Catherine of Siena, including her Dominican affiliation, Dialogue, and role during the Western Schism; it is not a separate identity. |
| lydwine-of-schiedam | lidwina-of-schiedam | Lydwine is a spelling of Lidwina of Schiedam, as shown by the Catholic Encyclopedia bibliography (https://www.newadvent.org/cathen/09233a.htm); it does not identify another saint. |
| nicholas | nicholas-of-myra | The bishop of Myra and December 6 gift-giving saint is the same Nicholas described at https://www.newadvent.org/cathen/11063b.htm. |
| oswald | oswald-of-northumbria | Both supplied descriptions identify the Northumbrian king supported by https://www.newadvent.org/cathen/11348c.htm; neither February feast is correct for him. |
| paul | paul-the-apostle | The June 29 apostle is Paul of Tarsus, celebrated with Peter; see https://www.vaticannews.va/en/liturgical-holidays/saints-peter-and-paul.html. |
| sharbel-makhlouf | charbel-makhlouf | The legacy account describes Charbel Makhlouf. December 24 is his death anniversary, not evidence of a separate saint. |
| teresa-benedicta | edith-stein | Teresa Benedicta of the Cross is the religious name of Edith Stein. |

## Pending records

None.

## Validation findings

No structural errors found.

## Maintenance

For additions and corrections, inspect external sources, write original prose, explain material uncertainty, and retain calendar qualifications. Keep exactly one review per slug. Direct aliases to source-reviewed canonical records without chains. Re-run the audit and regenerate this report after dataset changes. Human subject-matter review remains valuable, especially for sparse early lives, disputed identities, and local calendars.
