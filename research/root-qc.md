# Root batch independent QC — September 15, 2026

Focused review of the 71-record snapshot and the requested priority entries; this is not a second exhaustive review of every record added later.

## Applied data changes and citation additions

- **Pius X:** Replace the broad lifespan with `1835–1914`. The Dicastery for the Causes of Saints explicitly gives those years: https://www.causesanti.va/it/santi-e-beati/pio-x.html . The Holy See's papal entry confirms his pontificate ended August 20, 1914: https://www.vatican.va/content/vatican/en/holy-father/pio-x.html . August 21 remains the memorial.
- **Thérèse of Lisieux:** October 1 is correct. Add the direct calendar source https://www.vaticannews.va/en/saints/10/01.html ; it also supports patronage of missions.
- **Peter Canisius:** December 21 is correct. Add https://www.vaticannews.va/en/saints/12/21.html to separate liturgical evidence from the Jesuit biography's death date.
- **Roque González:** November 16 is correct for the Jesuit group commemoration, although his death was November 15. Add a feast note explaining that distinction and the Jesuit calendar source https://www.jesuitsgoa.org/uploads/publications/Praying_with_Jesuits.pdf (entry headed November 16), or https://ordo.jesuits.org/ . The existing global Jesuit biography supports life and death, but does not state the feast.
- **Toribio Romo:** Keep May 21 and the existing distinction from February 25 death. Add the USCCB calendar evidence for Christopher Magallanes and companions: https://www.usccb.org/about/divine-worship/newsletter/upload/newsletter-2016-09.pdf . A parish bulletin explicitly also celebrates Toribio on May 21: https://container.parishesonline.com/bulletins/14/1355/20250518B.pdf . Do not use canonization date alone as feast evidence.
- **Paul Miki:** February 6 is supported by the existing Vatican News calendar citation. Its heading incorrectly calls him a priest; retain the Jesuit-supported correction that he was a scholastic, not ordained. Death February 5 and feast February 6 are distinct.
- **Rose of Viterbo:** September 4 is explicitly supported by the existing Catholic Encyclopedia article. Modern Franciscan confirmation: https://www.fspa.org/stories/celebrating-the-feast-day-of-st-rose-of-viterbo . Keep uncertain chronology rather than forcing the conflicting 1251/1252 dates.
- **Pedro Calungsod:** April 2 is independently corroborated by https://scrc.org/experience/feast.php?view=95 and https://mb.com.ph/2022/4/1/feast-of-san-pedro-calungsod-on-april-2-2 . Add a calendar citation; the existing canonization homily alone chiefly supports the biography. Searches restricted to CBCP and Cebu/Manila archdiocese domains did not yield a stronger directly indexed feast page during this bounded check.

## UI inspection

- The detail-page wording is already `Venerated in Orthodox Christianity`, not Eastern Orthodox. This broad wording can encompass Oriental Orthodox Tekle Haymanot without falsely assigning him to an Eastern Orthodox church. A more specific tradition field would be a future enhancement, not a blocker.
- Quiz pool excludes unresolved records but initially still admitted observances (All Souls, All Saints and Marian celebrations), including unsupported seed genders. Parent is excluding observances.
- Email templates initially applied `St.` to every result, including Blessed figures, and displayed empty tagline quotations after review removed unsourced taglines. Bounded fixes implemented in EmailCapture, email renderer and templates: supplied display names retain correct titles, empty tagline blocks disappear, and the generic reflection no longer refers to a missing tagline. Optional prayer handling remains intact. No emails sent.

## Application and unresolved-entry check

Applied the listed citation additions for Pedro, Toribio, Therese, Peter Canisius, Roque, Pius X and Rose to the freshly read final 95-entry root file. Pius X now has lifespan 1835-1914; Roque has an explicit November 16 group/November 15 death note. Existing correctly assigned feast days were retained. Paul Miki already had the needed calendar source. Verified all 95 original keys remain and records outside the seven targeted entries are unchanged.

William clearly distinguishes the conflicting York/June 8 and Vercelli/June 25 identities; Rufinus clearly explains the mismatch with Rufina and Secunda rather than substituting them; Wasnildus explicitly treats an unsuccessful search as insufficient evidence, not proof of nonexistence, and labels its monastic calendar as contextual only. All three properly remain unresolved with unsupported facts null. No edits were needed to these descriptions.
