import Link from "next/link";

// These notes address source gaps found in the October 2026 Jev review.
// Patronage can be established by a decree or by a community's devotional use.
export default function PatronageContext({ slug }: { slug: string }) {
  const notes: Record<string, { heading: string; body: React.ReactNode }> = {
    "african-americans": {
      heading: "Why Benedict the African is honored as a patron",
      body: <><p>Benedict the African, also known as Benedict the Moor, was a Franciscan brother in Sicily whose parents were Africans brought there in slavery. He served his community in its kitchen and also held responsibilities as guardian and novice master. His story joins humble daily work with leadership and care for others. <a href="https://www.franciscanmedia.org/saint-of-the-day/saint-benedict-the-african/">Franciscan Media’s account</a> specifically records that African Americans honor him as a patron.</p><p>This describes an established devotional association; it does not imply that this page documents a papal decree assigning him to every African American Catholic. Read his biography to explore his Franciscan vocation, then consider how respect, patient service, and the recognition of another person’s dignity can shape your own community.</p></>,
    },
    goldsmiths: {
      heading: "Dunstan, craftsmanship, and the goldsmiths’ guild",
      body: <><p>Dunstan’s association with goldsmiths has a historical context: the <a href="https://www.newadvent.org/cathen/05199a.htm">Catholic Encyclopedia’s biography</a> describes his artistic gifts and work with his hands, and records his medieval patronage of the goldsmiths’ guild. His later leadership as Archbishop of Canterbury did not erase the memory of a monk who valued skilled craftsmanship.</p><p>The familiar story of Dunstan catching the devil with heated tongs is a later legend, which that same source distinguishes from his documented career. It should not be treated as evidence of an event witnessed during his life. For someone who makes or repairs things, his story offers a practical question: how can careful, honest work become a service to others rather than merely a display of talent?</p></>,
    },
    italy: {
      heading: "Italy has two principal patron saints",
      body: <><p>Francis of Assisi shares this patronage with <Link href="/saints/catherine-of-siena">Catherine of Siena</Link>. Pope Pius XII formally proclaimed both as Italy’s principal patrons in a <a href="https://www.vatican.va/content/pius-xii/it/briefs/documents/hf_p-xii_brief_19390618_patroni-italia.html">papal brief dated June 18, 1939</a>. The document connects Francis with evangelical life and Catherine with efforts toward peace and the Church’s unity. Their patronage is therefore more specific than a general association with the places where they lived.</p><p>Read their lives together: Francis invites reflection on simplicity and service, while Catherine invites reflection on courage and responsibility for the Church. A patron’s example can inspire a concrete act of care for your neighbors. Asking for their intercession means asking them to pray to God with you; it does not replace your own prayer or action.</p></>,
    },
    "the-americas": {
      heading: "Our Lady of Guadalupe and the peoples of the Americas",
      body: <><p>Our Lady of Guadalupe is a title of the Virgin Mary, not a separate person from Mary. In <a href="https://www.vatican.va/content/john-paul-ii/en/apost_exhortations/documents/hf_jp-ii_exh_22011999_ecclesia-in-america.html">Ecclesia in America, section 11</a>, John Paul II describes devotion to Guadalupe across the continent and the synod prayer that invokes her as patroness of all America. He also welcomes celebrating her December 12 feast throughout the continent.</p><p>Here, “the Americas” reaches beyond one nation. The devotion invites Catholics of different languages and backgrounds to seek Christ together with Mary’s help. The directory entry explains the Guadalupe tradition and its connection with Juan Diego; read it with attention to the distinction between devotional tradition and historical documentation. A useful next step is to pray for a neighboring community whose experience differs from your own and learn something about its life of faith.</p></>,
    },
  };
  const note = notes[slug];
  if (!note) return null;
  return <section aria-labelledby="patronage-context" className="mb-10 space-y-4 text-cream-dark leading-relaxed [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-4"><h2 id="patronage-context" className="text-2xl font-heading text-cream">{note.heading}</h2>{note.body}</section>;
}
