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
  "francis-of-assisi": {
    title: "St. Francis of Assisi: Birth, Life & October 4 Feast",
    description: "Francis was born in Assisi in 1181 or 1182. Explore his conversion, Franciscan vocation, October 4 feast, and the difference between his death and feast dates.",
    introduction: "Saint Francis of Assisi founded the Order of Friars Minor. Born in Assisi in late 1181 or early 1182, he turned from ambitions of wealth and military honor toward a life shaped by the Gospel, poverty and fraternity.",
    heading: "Francis of Assisi: birth, death and feast dates",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "When and where was Saint Francis of Assisi born?",
        answer: "Benedict XVI places his birth in Assisi at the end of 1181 or the beginning of 1182. That uncertainty is why reliable biographies give both years. October 4 is his feast day, not an established birthday.",
        sources: [{ title: "Benedict XVI: Francis of Assisi, January 27, 2010", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100127.html" }],
      },
      {
        question: "Why do accounts mention both October 3 and October 4?",
        answer: "Francis died on the evening of October 3, 1226, at the Portiuncula. His annual liturgical commemoration is October 4. The Franciscan remembrance of his passing, called the Transitus, concerns his death; it does not establish a second birthday or a different Francis.",
        sources: [{ title: "Benedict XVI: Francis's final years and death", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100127.html" }, { title: "USCCB: 2026 liturgical calendar", url: "https://www.usccb.org/resources/2026cal.pdf" }],
      },
      {
        question: "When was Francis canonized?",
        answer: "Pope Gregory IX canonized him in 1228, two years after his death. Learning his dates is a starting point; his own Canticle and the story of his conversion help explain the faith behind his enduring influence.",
        sources: [{ title: "Benedict XVI: canonization two years after Francis's death", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100127.html" }],
      },
    ],
    related: [{ label: "Read Francis's Canticle of the Creatures", href: "/blog/canticle-of-the-creatures-st-francis-prayer" }, { label: "Compare saints for Confirmation", href: "/confirmation-saint-guide" }],
  },
  "charles-lwanga": {
    title: "St. Charles Lwanga: Uganda Martyr & June 3 Feast",
    description: "Learn who Charles Lwanga was, how he died at Namugongo in 1886, why he is remembered with companions on June 3, and his connection to Kizito.",
    introduction: "Saint Charles Lwanga was a Christian leader among the royal pages in Buganda, in present-day Uganda. He encouraged young believers during persecution and was burned to death at Namugongo on June 3, 1886.",
    heading: "Charles Lwanga: martyrdom, companions and feast day",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "How did Charles Lwanga die, and who ordered his death?",
        answer: "Charles was burned to death at Namugongo during the persecution ordered by King Mwanga II. The king condemned Christians who would not abandon their faith. The judgment at Munyonyo and the execution at Namugongo were separate events; the place names should not be used interchangeably.",
        sources: [{ title: "Benedict XV: official beatification account (Italian)", url: "https://www.vatican.va/content/benedict-xv/it/briefs/documents/hf_ben-xv_briefs_19200606_africam-quisnam.html" }, { title: "Munyonyo Martyrs Shrine: from Munyonyo to Namugongo", url: "https://munyonyo-shrine.ug/martyrs/" }],
      },
      {
        question: "When is Saint Charles Lwanga's feast day?",
        answer: "June 3 is the Memorial of Saint Charles Lwanga and Companions, Martyrs, in the Roman Catholic calendar. The shared title remembers a community of witnesses, not Charles alone. A memorial is a liturgical rank; it does not by itself create an obligation for everyone to attend weekday Mass.",
        sources: [{ title: "USCCB: June 3 memorial", url: "https://bible.usccb.org/bible/readings/060326.cfm" }],
      },
      {
        question: "What is Charles Lwanga's connection to Saint Kizito?",
        answer: "Charles baptized Kizito and other future martyrs before their journey to Namugongo. Munyonyo Shrine commemorates those baptisms. Reading Kizito's story alongside Charles's shows how their lives were connected through teaching, encouragement and care during danger.",
        sources: [munyonyoSource],
      },
    ],
    related: [{ label: "Read the story of Saint Kizito", href: "/saints/kizito" }, { label: "Understand memorials and feast days", href: "/blog/solemnity-feast-memorial-catholic-calendar" }],
  },
  pelagia: {
    title: "St. Pelagia the Penitent: Story & October 8 Feast",
    description: "Meet Pelagia the Penitent, remembered on October 8. Understand her conversion story, its historical limits, and how she differs from other saints named Pelagia.",
    introduction: "Pelagia the Penitent is remembered on October 8 for a traditional story of conversion and a hidden life of prayer. She should be distinguished from the martyr Pelagia of Antioch and from Pelagia of Tarsus.",
    heading: "Which Saint Pelagia? Her story and its limits",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "Are Pelagia the Penitent and Pelagia the martyr the same saint?",
        answer: "The traditions should be kept distinct. The penitent's story concerns a performer, conversion through Bishop Nonnus and an ascetic life near Jerusalem. The Antiochene martyr has a different account of death under persecution. The shared name and association with Antioch can cause biographies to blend their stories.",
        sources: [{ title: "Catholic Encyclopedia: the different Pelagia traditions", url: "https://www.newadvent.org/cathen/11601d.htm" }],
      },
      {
        question: "What is known about Pelagia's birth date?",
        answer: "There is no securely established birth date for Pelagia the Penitent. Her familiar life is a devotional narrative whose historical basis is uncertain. A precise age or date taken from a different Pelagia should not be added to her biography.",
        sources: [{ title: "Catholic Encyclopedia: historical assessment of the penitent's narrative", url: "https://www.newadvent.org/cathen/11601d.htm" }],
      },
      {
        question: "When is Pelagia the Penitent commemorated?",
        answer: "October 8 is the commemoration recorded for the penitent in the sources linked here. The Orthodox Church in America's account also uses that date. This does not mean every Catholic parish celebrates her at Mass that day; the local liturgical calendar determines the celebration.",
        sources: [{ title: "Catholic Encyclopedia: Pelagia's commemoration", url: "https://www.newadvent.org/cathen/11601d.htm" }, { title: "Orthodox Church in America: Pelagia the Penitent, October 8", url: "https://www.oca.org/saints/lives/2025/10/08/102899-venerable-pelagia-the-penitent" }],
      },
    ],
    related: [{ label: "How we distinguish saint traditions and sources", href: "/editorial-policy" }, { label: "Why saint calendars can differ", href: "/editorial-policy/feast-calendars" }],
  },
  helena: {
    title: "St. Helena (Saint Helen): Constantine's Mother & Feast",
    description: "Who was St. Helena, also called Helen or Elena? Learn about Constantine's mother, her August 18 commemoration and the tradition of finding the True Cross.",
    introduction: "Saint Helena, also called Helen and known as Elena in Spanish, was the mother of Emperor Constantine. She supported Christian holy places and charitable work. Her Western commemoration is August 18.",
    heading: "Helena: names, feast dates and the True Cross",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "Do Saint Helena, Saint Helen and Santa Elena refer to the same person?",
        answer: "They can refer to this saint: the fourth-century mother of Constantine. Vatican News calls her Helena in English and Elena in Spanish. Check that family connection when comparing pages; a similar first name alone does not establish the identity of a saint or a patronage.",
        sources: [{ title: "Vatican News: Helena, empress", url: "https://www.vaticannews.va/en/saints/08/18/st---helena--empress.html" }, { title: "Vatican News: Elena, emperatriz (Spanish)", url: "https://www.vaticannews.va/es/santos/08/18/s--elena--emperatriz.html" }],
      },
      {
        question: "Is Saint Helena's feast day August 18 or May 21?",
        answer: "Vatican News identifies August 18 as her Western commemoration and May 21 as her Eastern commemoration. These reflect different calendar traditions. Follow your own parish's calendar rather than assuming one date makes the other a mistake.",
        sources: [{ title: "Vatican News: Helena's commemoration in East and West", url: "https://www.vaticannews.va/en/saints/08/18/st---helena--empress.html" }],
      },
      {
        question: "Did Saint Helena find the True Cross?",
        answer: "Christian tradition associates her with its discovery in Jerusalem. The evidence needs care: her pilgrimage and church patronage are recorded by Eusebius, while the discovery story developed in later accounts. Artwork of Helena holding a cross expresses that tradition; it is not contemporary documentation of the event.",
        sources: [{ title: "Catholic Encyclopedia: Helena and the early evidence", url: "https://www.newadvent.org/cathen/07202b.htm" }],
      },
    ],
    related: [{ label: "How we research biographies and traditions", href: "/editorial-policy" }, { label: "Explore other saints' lives", href: "/resources" }],
  },
  "jude-thaddeus": {
    title: "St. Jude Thaddeus: October 28 Feast Day & Apostle",
    description: "St. Jude Thaddeus shares his October 28 feast with Simon. Learn which apostle he is, why he is also called Thaddaeus, and where he appears in Scripture.",
    introduction: "St. Jude Thaddeus is one of Jesus' Twelve Apostles. His feast day in the Roman Catholic calendar is October 28, shared with Saint Simon. Jude is distinct from Judas Iscariot, the apostle who betrayed Jesus.",
    heading: "Jude Thaddeus: feast day, names and Scripture",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "When is Saint Jude Thaddeus' feast day?",
        answer: "October 28 is the Feast of Saints Simon and Jude, Apostles, in the Roman Catholic calendar. In 2026 it falls on a Wednesday. The celebration honors both apostles; a parish or shrine may also arrange devotional events on nearby dates. Check its published schedule for Mass or novena times.",
        sources: [{ title: "USCCB: 2026 liturgical calendar, October 28", url: "https://www.usccb.org/resources/2026cal.pdf" }],
      },
      {
        question: "Are Jude, Thaddeus and Thaddaeus the same apostle?",
        answer: "Thaddeus and Thaddaeus are spellings used for the apostle traditionally identified with Jude. Benedict XVI explains that Matthew and Mark name Thaddaeus, while Luke and Acts name Judas, son of James. This is why Catholic biographies often combine the names as Jude Thaddeus. He is not Judas Iscariot.",
        sources: [{ title: "Benedict XVI: Simon and Jude, October 11, 2006", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20061011.html" }],
      },
      {
        question: "What do we know about Jude from the Gospels?",
        answer: "The New Testament gives relatively little biographical detail about him. Benedict XVI draws attention to John 14:22–23: at the Last Supper, Jude asks why Jesus will reveal himself to the disciples rather than to the world. Jesus' reply connects love, keeping his word and communion with the Father. This passage offers a firmer starting point than treating later stories about Jude's travels as equally well documented.",
        sources: [{ title: "Benedict XVI: Jude's question at the Last Supper", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20061011.html" }],
      },
    ],
    related: [{ label: "Jude and Judas Iscariot: understand the distinction", href: "/blog/is-saint-jude-same-as-judas-iscariot" }, { label: "What makes a celebration a feast?", href: "/blog/solemnity-feast-memorial-catholic-calendar" }],
  },
  peter: {
    title: "St. Peter the Apostle: Life, Names & June 29 Feast",
    description: "Who was Saint Peter? Meet Simon Peter, the fisherman called by Jesus, understand his June 29 feast with Paul, and learn why it is not his birthday.",
    introduction: "Saint Peter the Apostle, also called Simon Peter or Cephas, was a fisherman from Bethsaida whom Jesus called to follow him. Catholics celebrate him with Saint Paul on June 29. That celebration is not a record of Peter's birthday.",
    heading: "Peter the Apostle: names, birthday and feast day",
    reviewedOn: "2026-10-22",
    questions: [
      {
        question: "When was Saint Peter born?",
        answer: "A precise birthday is not established by the Gospel accounts discussed in Benedict XVI's biography of Peter. They place him in the first-century world of Jesus and identify his home town and work, but do not supply a birth date. June 29 is his liturgical celebration with Paul; it should not be copied into a biography as his date of birth.",
        sources: [{ title: "Benedict XVI: Peter, the fisherman", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20060517.html" }, { title: "USCCB: 2026 liturgical calendar, June 29", url: "https://www.usccb.org/resources/2026cal.pdf" }],
      },
      {
        question: "Are Simon, Cephas and Peter the same person?",
        answer: "Yes, in these accounts they refer to the same apostle. Simon was his earlier name; Cephas is the Aramaic name given by Jesus, rendered Peter in Greek and associated with rock. Benedict XVI identifies him as Andrew's brother and a fisherman from Bethsaida. Simon the Zealot, another member of the Twelve, is a different apostle.",
        sources: [{ title: "Benedict XVI: Peter's names, family and home town", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20060517.html" }, { title: "Benedict XVI: Simon the Zealot and Jude", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2006/documents/hf_ben-xvi_aud_20061011.html" }],
      },
      {
        question: "When is Saint Peter's feast day?",
        answer: "June 29 is the Solemnity of Saints Peter and Paul, Apostles, in the Roman Catholic calendar. It is a shared celebration, even though Peter and Paul have distinct life stories. In 2026, June 29 falls on a Monday. This is a date for the Church's worship, not evidence of Peter's historical birthday.",
        sources: [{ title: "USCCB: liturgical calendar and celebrations of Saint Peter", url: "https://www.usccb.org/resources/2026cal.pdf" }],
      },
    ],
    related: [{ label: "Explore the lives of other saints", href: "/resources" }, { label: "Understand solemnities, feasts and memorials", href: "/blog/solemnity-feast-memorial-catholic-calendar" }],
  },
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
