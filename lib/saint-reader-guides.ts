export interface SaintReaderGuide {
  title: string;
  description: string;
  introduction: string;
  heading: string;
  reviewedOn: string;
  questions: { question: string; answer: string; sources: { title: string; url: string }[] }[];
  related: { label: string; href: string }[];
  prayer?: string;
}

const joachimSource = {
  title: "Vatican City State: Joachim and Anne, parents of Mary",
  url: "https://www.vaticanstate.va/en/component/content/article/july-26-joachim-and-anne-parents-of-the-blessed-virgin-mary.html?Itemid=216&catid=51",
};
const hedwigSource = {
  title: "John Paul II: canonization of Queen Hedwig, June 8, 1997",
  url: "https://www.vatican.va/content/john-paul-ii/en/homilies/1997/documents/hf_jp-ii_hom_19970608_cracovia.html",
};
const lukeSource = { title: "Luke 1 (NABRE), USCCB", url: "https://bible.usccb.org/bible/luke/1" };
const toribioSource = {
  title: "Vatican biography of Toribio Romo González (Spanish)",
  url: "https://www.vatican.va/news_services/liturgy/saints/ns_lit_doc_20000521_romo-gonzalez_sp.html",
};
const kizitoSource = {
  title: "Kampala Archdiocese: St. Kizito",
  url: "https://archdiocese.nswanjereseminary.ac.ug/about-us/the-uganda-martyrs/st-kizito/",
};
const munyonyoSource = {
  title: "Munyonyo Martyrs Shrine: baptism and the royal judgment",
  url: "https://munyonyo-shrine.ug/munyonyo-martyrs-minor-basilica/",
};

// Editorial answers to observed reader questions. Keep these separate from
// identity/patronage records; query demand is not evidence for a historical claim.
const guides: Record<string, SaintReaderGuide> = {
  joachim: {
    title: "St. Joachim: Mary's Father, Tradition & Feast Day",
    description: "Who was St. Joachim? Learn why Catholics honor him as Mary's father, what the Bible does and does not say, and why he shares July 26 with St. Anne.",
    introduction: "St. Joachim is honored in Christian tradition as Mary's father, St. Anne's husband and Jesus' maternal grandfather. The Gospels do not name Mary's parents. His shared memorial with Anne is July 26.",
    heading: "Joachim, Mary's father: what do we know?",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "Is Saint Joachim in the Bible?",
        answer: "The canonical Gospels do not identify Mary's father as Joachim. His name and the familiar stories about him and Anne come from Christian tradition and apocryphal writings outside the biblical canon. A Gospel genealogy should not be treated as a biography of Mary's parents.",
        sources: [joachimSource],
      },
      {
        question: "When was Joachim born, and how old was he?",
        answer: "There is no securely established birth date or age to give. Stories about the couple's long wait for a child belong to the devotional tradition, not a dated historical record. It is more accurate to acknowledge that limit than to supply a precise year or lifespan.",
        sources: [joachimSource],
      },
      {
        question: "Why are Joachim and Anne remembered together?",
        answer: "The Church honors them together as the parents of the Blessed Virgin Mary on July 26. Their place in devotion draws attention to the generations before Jesus and the passing on of faith within a family. That religious meaning does not require treating every later story as established history.",
        sources: [joachimSource],
      },
    ],
    related: [{ label: "Explore the saints directory", href: "/resources" }, { label: "Understand feast days and local calendars", href: "/editorial-policy/feast-calendars" }],
  },
  "jadwiga-of-poland": {
    title: "St. Jadwiga of Poland (Hedwig): Queen, Life & Legacy",
    description: "Meet St. Jadwiga, also called Hedwig, the queen of Poland canonized in 1997. Explore her support for learning, Catholic faith and her commemoration dates.",
    introduction: "St. Jadwiga of Poland, also known as Queen Hedwig, was a 14th-century ruler remembered for supporting Christian faith and education. Pope John Paul II canonized her in Kraków on June 8, 1997.",
    heading: "Jadwiga of Poland: her name, sainthood and legacy",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "Are Jadwiga and Hedwig the same saint?",
        answer: "In this biography, yes: Jadwiga is the Polish name of the queen called Hedwig in English Vatican texts. The reference to Poland's queen matters because Saint Hedwig of Silesia is a different, earlier saint. Look for the person's place and historical setting when comparing accounts.",
        sources: [hedwigSource, { title: "Nominis: Hedwig, Queen of Poland, and the distinct Hedwig of Silesia", url: "https://nominis.cef.fr/contenus/saint/10259/Sainte-Hedwige.html" }],
      },
      {
        question: "What is Saint Jadwiga known for?",
        answer: "Her legacy includes support for the Christianization of Lithuania and for learning at Kraków. John Paul II emphasized her efforts to establish a theology faculty, approved by Pope Boniface IX in 1397. Her support for education offers a concrete way to understand her influence beyond her royal title.",
        sources: [hedwigSource, { title: "John Paul II: Jadwiga and the Kraków theology faculty", url: "https://www.vatican.va/content/john-paul-ii/en/speeches/1997/june/documents/hf_jp-ii_spe_19970608_ato-academico.html" }],
      },
      {
        question: "When was she canonized, and why is June 8 associated with her?",
        answer: "John Paul II canonized her on June 8, 1997. June 8 is also a Polish liturgical celebration of Saint Jadwiga; for example, the Diocese of Sandomierz lists it for the parish dedicated to her. The July 17 commemoration recorded above and a local celebration need not be the same date. Follow the calendar used by your parish.",
        sources: [hedwigSource, { title: "Diocese of Sandomierz: parish of Saint Jadwiga the Queen (Polish)", url: "https://diecezjasandomierska.pl/ostrowiec-sw-sw-jadwigi-krolowej/" }],
      },
    ],
    related: [{ label: "Compare saints for Confirmation", href: "/confirmation-saint-guide" }, { label: "Why commemoration dates can differ", href: "/editorial-policy/feast-calendars" }],
  },
  "gabriel-the-archangel": {
    title: "St. Gabriel the Archangel: Bible Role & Feast Day",
    description: "St. Gabriel announces Jesus' birth to Mary in Luke 1. Explore his biblical appearances and the September 29 feast with Michael and Raphael.",
    introduction: "St. Gabriel is God's angelic messenger in Scripture, best known for announcing the birth of Jesus to Mary. Catholics celebrate Gabriel with Michael and Raphael on September 29. He is an angel, not a human saint with a birth or death date.",
    heading: "Gabriel in the Bible and the Catholic calendar",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "When is Saint Gabriel's feast day?",
        answer: "September 29 is the Feast of Saints Michael, Gabriel and Raphael, Archangels, in the General Roman Calendar. The Annunciation is a different celebration, normally on March 25: it commemorates the announcement to Mary and the Incarnation, rather than serving as Gabriel's own feast.",
        sources: [{ title: "USCCB: September 29, Feast of the Archangels", url: "https://bible.usccb.org/bible/readings/092926.cfm" }, { title: "Vatican News: Gabriel and the Annunciation (Portuguese)", url: "https://www.vaticannews.va/pt/santo-do-dia/09/29/san-gabriel-arcanjo.html" }],
      },
      {
        question: "Where does Gabriel appear in the Bible?",
        answer: "Start with Daniel 8:15–19, where Gabriel helps Daniel understand a vision. Then read Luke 1:11–20, where he announces John the Baptist's birth to Zechariah, and Luke 1:26–38, where he announces Jesus' birth to Mary. These passages explain his role more directly than later artistic symbols do.",
        sources: [{ title: "Daniel 8 (NABRE), USCCB", url: "https://bible.usccb.org/bible/daniel/8" }, lukeSource],
      },
      {
        question: "What did Gabriel announce to Mary?",
        answer: "In Luke's account, Gabriel tells Mary that she will bear a son named Jesus and explains the action of the Holy Spirit. Read the whole exchange in Luke 1:26–38, including Mary's question and response. The scene concerns God's initiative and Mary's response, not a promise that every reader will receive an angelic message.",
        sources: [lukeSource],
      },
    ],
    related: [{ label: "Meet Michael the Archangel", href: "/saints/michael-the-archangel" }, { label: "Meet Raphael the Archangel", href: "/saints/raphael-the-archangel" }],
  },
  "toribio-romo-gonz-lez": {
    title: "St. Toribio Romo González: Life, Martyrdom & Feast Day",
    description: "Who was Santo Toribio Romo? Read about the Mexican priest's life in Jalisco, his death on February 25, 1928, and his May 21 commemoration.",
    introduction: "St. Toribio Romo González, often called Santo Toribio Romo, was a Mexican parish priest from Jalisco. He was killed on February 25, 1928, during religious persecution and is commemorated with Christopher Magallanes and companions on May 21.",
    heading: "Toribio Romo: the priest behind the name",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "When and where was Toribio Romo born?",
        answer: "The Vatican biography records his birth on April 16, 1900, in Santa Ana de Guadalupe, in the parish of Jalostotitlán, Jalisco, Mexico. His later parish responsibilities took him to Tequila, also in Jalisco.",
        sources: [toribioSource],
      },
      {
        question: "How did Toribio Romo die?",
        answer: "On February 25, 1928, armed men entered the room where he was resting at a refuge near Tequila and shot him. The Vatican account places his final night in the ordinary work of a priest: he had been updating parish records and intended to celebrate Mass. He was 27 years old.",
        sources: [toribioSource],
      },
      {
        question: "Why are both February 25 and May 21 associated with him?",
        answer: "February 25 is the anniversary of his death. May 21 is the calendar memorial of Saint Christopher Magallanes and companions, the group of Mexican martyrs with whom he is commemorated. A death anniversary and the liturgical date chosen for a group can differ.",
        sources: [toribioSource, { title: "USCCB: May 21 memorial of Christopher Magallanes and companions", url: "https://bible.usccb.org/bible/readings/0521-memorial-christopher-magallanes.cfm" }],
      },
    ],
    related: [{ label: "Understand memorials and commemoration dates", href: "/editorial-policy/feast-calendars" }, { label: "Find another saint's biography", href: "/resources" }],
  },
  kizito: {
    title: "St. Kizito: Young Uganda Martyr, Story & Feast Day",
    description: "Discover St. Kizito's story: his baptism by Charles Lwanga, martyrdom at about 14 in Namugongo, and June 3 memorial with the Uganda martyrs.",
    introduction: "St. Kizito was the youngest of the Catholic Uganda martyrs, about 14 when he died at Namugongo on June 3, 1886. A page in the royal court of Buganda, he was baptized by Charles Lwanga shortly before his martyrdom.",
    heading: "Kizito's story: age, martyrdom and remembrance",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "Who ordered Kizito's death, and how did he die?",
        answer: "King Mwanga II ordered the execution of Christian subjects who would not renounce their faith. Kizito was burned to death with companions at Namugongo on June 3, 1886. The king's order and the execution are distinct events; the account does not mean the king personally carried out the killing.",
        sources: [munyonyoSource, kizitoSource],
      },
      {
        question: "How old was Kizito, and who baptized him?",
        answer: "The Kampala account places his birth around 1872 and his age at death at about 14. Charles Lwanga baptized him during the persecution in May 1886. Munyonyo Shrine preserves the memory of that baptism; Namugongo is the place of his martyrdom. Keeping the two places distinct helps make sense of his final days.",
        sources: [kizitoSource, munyonyoSource],
      },
      {
        question: "When is Saint Kizito's feast day?",
        answer: "Kizito is remembered on June 3 with Saint Charles Lwanga and companions. In the General Roman Calendar this celebration is a memorial. His witness can be honored through prayer and care for vulnerable young people; it is not a reason to encourage children to put themselves in danger.",
        sources: [{ title: "USCCB: June 3 memorial of Charles Lwanga and companions", url: "https://bible.usccb.org/bible/readings/060326.cfm" }],
      },
    ],
    prayer: "God of mercy, help us protect children and stand beside those who are afraid. Through Saint Kizito's intercession, give us courage to do what is right and wisdom to seek help when we need it. Amen.",
    related: [{ label: "Read about Charles Lwanga, Kizito's teacher", href: "/saints/charles-lwanga" }, { label: "Explore saints with your class or group", href: "/resources/teachers" }],
  },
};

export function getSaintReaderGuide(slug: string): SaintReaderGuide | undefined {
  return guides[slug];
}
