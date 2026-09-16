export interface GuideSource { title: string; url: string }
export interface GuideSaint {
  slug: string;
  connection: "Documented patronage" | "Traditional patronage" | "Spiritual companion";
  relationship: string;
  explanation: string;
  reflection: string;
  sources: GuideSource[];
}
export interface PatronGuide {
  slug: string;
  label: string;
  title: string;
  description: string;
  introduction: string;
  distinction: string;
  saints: GuideSaint[];
  context?: { title: string; body: string; sources: GuideSource[] }[];
  practice: { title: string; steps: string[] };
  prayer: string;
  questions: { question: string; answer: string }[];
  reviewedOn: string;
}

// Search Console informed blacksmiths, nurses, parents, and students. Grief and
// decisions are owner-requested exploratory topics; no search-volume claims.
const guides: PatronGuide[] = [
  {
    slug: "blacksmiths", label: "Blacksmiths", title: "Patron Saints of Blacksmiths: Dunstan and Eligius",
    description: "Find the names associated with blacksmiths: Dunstan and Eligius. Learn the tradition, separate legends from history, and explore Dunstan's biography.",
    introduction: "Dunstan and Eligius, also called Eloi, are names associated with the patronage of blacksmiths and metalworkers. These connections grew around their reputations as craftsmen. Start here for an explanation of the names, the traditions behind them, and a biography of Dunstan in our directory.",
    distinction: "This guide describes traditional patronage supported by the linked Church and institutional accounts. It does not claim a modern papal appointment for either saint. Stories about miraculous smithing should be read as legends, not as documented workshop history.",
    saints: [
      { slug: "dunstan", connection: "Traditional patronage", relationship: "A traditional patron of smiths and metalworkers",
        explanation: "Dunstan was an English monk and church reformer whose story also includes skill in metalwork. Cheam Parish identifies him as patron of smiths and recounts his work rebuilding monastic life at Glastonbury before becoming Archbishop of Canterbury. His association with smithing appears in images of him holding tools. The familiar tale of his catching the devil with hot tongs belongs to the legendary tradition; Belmont Abbey explicitly introduces these encounters as legends.",
        reflection: "How can patience, honest workmanship, and attention to detail shape the work you do?",
        sources: [{ title: "Cheam Parish: A sermon for Saint Dunstan (17 May 2020)", url: "https://www.cheamparish.org.uk/post/a-sermon-for-st-dunstan-patronal-festival" }, { title: "Belmont Abbey: Saints Dunstan, Ethelwold and Oswald", url: "https://www.belmontabbey.org.uk/saint-dunstan" }] },
    ],
    context: [
      { title: "Who is Eligius, or Saint Eloi?", body: "Eligius is another traditional patron of blacksmiths and goldsmiths. The University of Notre Dame's FaithND account describes his reputation as a metalsmith and his association with the goldsmiths of Paris. Eloi is another form of his name, not a separate saint. We do not yet have a dedicated Eligius biography in this directory; the linked account offers further reading.", sources: [{ title: "University of Notre Dame, FaithND: Saint Eligius", url: "https://faith.nd.edu/saint/st-eligius/" }] },
      { title: "Is Gerard Majella a patron of blacksmiths?", body: "The Redemptorist source consulted for this guide identifies Gerard Majella with devotion among expectant mothers, not with blacksmithing. We have not established a reliable blacksmith patronage for him and do not list him as one here. If you encountered a claim about a different Saint Gerard, the full identity and source would need to be checked before making that association.", sources: [{ title: "Redemptorists: Gerard Majella and the congregation's spirituality", url: "https://www.cssr.news/2015/04/documents-and-communications-8/" }] },
    ],
    practice: { title: "Bring your work into prayer", steps: ["Name the people who depend on the quality and reliability of your work.", "Ask for patience to learn, honesty in what you promise, and attention to your responsibilities.", "Read Dunstan's biography and reflect on how practical skill can serve a wider community."] },
    prayer: "God, bless the work of my hands. Help me work carefully, learn humbly, and serve others honestly. Saint Dunstan, pray for me. Amen.",
    questions: [{ question: "What are the names of the patron saints of blacksmiths?", answer: "Dunstan and Eligius, also known as Eloi, are two traditionally associated names documented by the sources in this guide. This is a supported starting list, not a claim to exhaust every local tradition." }, { question: "Are the stories about smiths and the devil historical facts?", answer: "They belong to devotional legend. The story of Dunstan and the tongs helps explain his imagery, but it should not be presented as a verified event. His monastic and ecclesiastical work can be discussed separately from those tales." }], reviewedOn: "2026-09-16",
  },
  {
    slug: "students", label: "Students", title: "Saints for Students: Study, Exams, and Finding Your Path",
    description: "Meet Thomas Aquinas and John Bosco, explore their connections to learning, and find practical ways to bring prayer into study and exams.",
    introduction: "A student may be looking for help with an exam, the courage to ask a question, or direction after graduation. Start with the need you actually have. Thomas Aquinas offers a connection to the intellectual life; John Bosco offers an example of education that takes the whole person seriously.",
    distinction: "Thomas Aquinas has a documented patronage of Catholic schools and universities. John Bosco is included here as a spiritual companion through his work with young people; this guide does not assign him a new patronage of exams.",
    saints: [
      { slug: "thomas-aquinas", connection: "Documented patronage", relationship: "Patron of Catholic schools and universities",
        explanation: "Leo XIII declared Thomas patron of Catholic schools and universities in 1880. Benedict XVI connects that recognition with Thomas's way of bringing philosophy and theology into conversation. For a student, his example invites patient thinking: understand a question, consider the reasons offered, and pursue truth rather than a quick answer. His relevance extends beyond students who already feel confident in religious studies.",
        reflection: "Where could you replace rushing with one careful question today?",
        sources: [{ title: "Benedict XVI: Thomas Aquinas and Catholic education (16 June 2010)", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100616.html" }] },
      { slug: "john-bosco", connection: "Spiritual companion", relationship: "An educator who helped young people prepare for life",
        explanation: "John Bosco made education a practical work of mercy. Pope Francis recalls how he helped boys from the streets prepare for work through the oratory and schools. His story can speak to students who need encouragement, useful skills, and people who believe in them. It also offers a reminder to look for a teacher, mentor, or community rather than trying to manage every challenge alone.",
        reflection: "Who could help you take the next step in learning?",
        sources: [{ title: "Francis: To counsel and to instruct (23 November 2016)", url: "https://www.vatican.va/content/francesco/en/audiences/2016/documents/papa-francesco_20161123_udienza-generale.html" }] },
    ],
    practice: { title: "A simple rhythm before studying", steps: ["Name one specific task and set aside a realistic amount of time for it.", "Ask your chosen saint to pray for attention, honesty, and patience; then begin the work.", "Afterward, note what remains unclear and ask a teacher or classmate for help."] },
    prayer: "God of wisdom, help me study with attention, ask questions without fear, and use what I learn to serve others. Saint Thomas Aquinas, pray for me. Amen.",
    questions: [{ question: "Does praying to a saint guarantee that I will pass?", answer: "No. Asking for a saint's intercession is a prayer for help, not a promise of a particular grade. Preparation, rest, and asking for academic support still matter." }, { question: "Can I choose a different saint for school?", answer: "Yes. Read a biography and look for an example that speaks to your situation. A personal devotion does not require declaring that saint an official patron of your subject." }], reviewedOn: "2026-09-16",
  },
  {
    slug: "parents", label: "Parents", title: "Saints for Parents: Patience, Prayer, and Family Life",
    description: "Explore Monica and Joseph as companions for parenting, with sourced explanations, reflection questions, and a simple prayer for family life.",
    introduction: "Parenting includes ordinary responsibilities and questions that cannot be solved in a single conversation. Monica and Joseph offer different starting points: sustained prayer for a child, and faithful care expressed through everyday decisions. Their lives invite reflection without making every family's path look the same.",
    distinction: "Benedict XVI describes Monica as a model and patroness of Christian mothers. Joseph is presented here as a model of fatherhood. These connections do not imply that one saint is assigned to every parenting situation.",
    saints: [
      { slug: "monica", connection: "Documented patronage", relationship: "Model and patroness of Christian mothers",
        explanation: "Benedict XVI recalls Monica's persistent prayer for her son Augustine and identifies her as a patroness of Christian mothers. Her story can accompany parents worried about an adult child's faith or direction. The lesson is not that parents control a child's choices. It is an invitation to sustain love and prayer while remembering that another person's response cannot be forced.", reflection: "How can you express care without making every conversation a demand for change?",
        sources: [{ title: "Benedict XVI: Monica and Christian parents (30 August 2009)", url: "https://www.vatican.va/content/benedict-xvi/en/angelus/2009/documents/hf_ben-xvi_ang_20090830.html" }] },
      { slug: "joseph", connection: "Spiritual companion", relationship: "A model of caring fatherhood",
        explanation: "In Patris corde, Pope Francis describes Joseph's fatherhood through tenderness, responsibility, work, and courage. The Gospel episodes of protecting Jesus and caring for his family give this example concrete shape. Parents and guardians can reflect on Joseph when care means practical action: providing stability, listening, or taking responsibility during uncertainty. Quiet, repeated acts of love are part of this vocation.", reflection: "What small act would make someone in your care feel safer or more heard today?",
        sources: [{ title: "Francis: Patris corde (8 December 2020)", url: "https://www.vatican.va/content/francesco/en/apost_letters/documents/papa-francesco-lettera-ap_20201208_patris-corde.html" }] },
    ],
    practice: { title: "Make room for a family conversation", steps: ["Bring one concern to prayer without trying to solve every family difficulty at once.", "Choose a time to listen to your child or another family member without interruption.", "Decide on one helpful action within your responsibility, and ask for support when needed."] },
    prayer: "Loving God, give me patience to listen, courage to care, and humility to ask for help. Saint Monica and Saint Joseph, pray for our family. Amen.",
    questions: [{ question: "Which saint should I choose when I worry about my child's faith?", answer: "Monica is a natural starting point because prayer for Augustine is central to her story. Read her biography as encouragement to love and persevere, not as a timetable or guarantee for another person's conversion." }, { question: "Are these guides only for biological parents?", answer: "No. Adoptive parents, foster parents, stepparents, and guardians can also reflect on the responsibilities of care described here. Choose the story that helps you love those entrusted to you." }], reviewedOn: "2026-09-16",
  },
  {
    slug: "nurses", label: "Nurses", title: "Patron Saints of Nurses: Camillus de Lellis and John of God",
    description: "Learn why Camillus de Lellis and John of God are patrons of nurses, with sources, biographies, and a short prayer for a day of caring for others.",
    introduction: "Camillus de Lellis and John of God connect prayer with the practical work of caring for sick people. Their patronage gives nurses two well-supported starting points. Their stories can also encourage nursing students and family caregivers, while recognizing the different responsibilities each role carries.",
    distinction: "The Camillian Order documents Camillus's recognition as protector of those who nurse the sick in 1930. The Hospitaller Order records John of God's proclamation as patron of nurses and their associations that same year.",
    saints: [
      { slug: "camillus-de-lellis", connection: "Documented patronage", relationship: "Patron associated with nurses and care of the sick",
        explanation: "Camillus founded the Ministers of the Sick and made service to suffering people the heart of their vocation. His order describes detailed rules of care and a school of nursing, showing that compassion needed practical organization. The USA Camillians record his recognition by Pius XI as model and protector of those who nurse the sick in 1930. His example joins personal attention with responsibility for how care is provided.", reflection: "Where can careful attention protect the dignity of a person in your care?",
        sources: [{ title: "USA Camillians: Commitment to the dignity of work", url: "https://www.camillians.org/news-and-events/commitment-to-the-dignity-of-work" }, { title: "Ministers of the Sick: The Camillian charism", url: "https://www.camilliani.org/en/valori-ispiratori/" }] },
      { slug: "john-of-god", connection: "Documented patronage", relationship: "Patron of nurses and their associations",
        explanation: "John founded a hospital in Granada in 1539 and gathered followers whose work developed into the Hospitaller Order. The order describes his dedication to sick and poor people and records Pius XI's proclamation of his patronage of nurses in 1930. His life offers a connection to hospitality: helping a person feel received and valued alongside attending to their immediate needs.", reflection: "What would help a patient feel welcomed as a person today?",
        sources: [{ title: "Hospitaller Order: Saint John of God", url: "https://www.ohsjd.org/Objects/Pagina.asp?ID=5388" }] },
    ],
    practice: { title: "A moment before a shift", steps: ["Pause and bring the people you will care for into your prayer.", "Ask for attentiveness, sound judgment, and kindness toward patients and colleagues.", "At the end of the day, entrust unfinished concerns to God and make time for the rest and support you need."] },
    prayer: "God of mercy, help me care with skill and compassion. Give strength to those who suffer and wisdom to all who serve them. Saints Camillus and John of God, pray for us. Amen.",
    questions: [{ question: "Is there more than one patron saint of nurses?", answer: "Yes. Camillus de Lellis and John of God are both associated with this patronage in the sources linked here. You can begin with either saint rather than treating patronage as an exclusive assignment." }, { question: "Can caregivers who are not nurses pray with this guide?", answer: "Yes. Family caregivers and volunteers can ask for these saints' prayers too. Their example of care is relevant beyond one profession, without replacing the training and responsibilities of professional nursing." }], reviewedOn: "2026-09-16",
  },
  {
    slug: "grief", label: "Grief and loss", title: "Saints to Turn to in Grief and Loss",
    description: "Find companions in grief through Elizabeth Ann Seton and Martha, with sourced stories, gentle reflection, and a prayer for those mourning someone they love.",
    introduction: "When someone dies, a saint's story can offer companionship without explaining away the loss. Elizabeth Ann Seton knew widowhood; Martha brought the death of her brother directly into her conversation with Jesus. You can begin with either story and take only the next small step that is possible today.",
    distinction: "These saints are offered as spiritual companions because of experiences described in the sources. This guide does not claim that either was officially appointed patron of grief or that prayer removes the need to mourn.",
    saints: [
      { slug: "elizabeth-ann-seton", connection: "Spiritual companion", relationship: "A woman who knew marriage, motherhood, and widowhood",
        explanation: "At her canonization, Paul VI emphasized Elizabeth's life as wife, mother, widow, and religious, as well as her founding of a religious congregation in the United States. Her story can help someone who is grieving recognize that a life may hold both enduring loss and new responsibilities. Her later work does not make the bereavement insignificant or establish a schedule for another person's recovery.", reflection: "Which part of your loved one's place in your life would you like to bring to prayer?",
        sources: [{ title: "Paul VI: Canonization of Elizabeth Ann Seton (14 September 1975)", url: "https://www.vatican.va/content/paul-vi/en/homilies/1975/documents/hf_p-vi_hom_19750914.html" }] },
      { slug: "martha", connection: "Spiritual companion", relationship: "A grieving sister in the Gospel of John",
        explanation: "John 11 places Martha in mourning after the death of Lazarus. She meets Jesus with an honest statement of her loss and continues speaking with him about resurrection and faith. The chapter also describes Jesus weeping. Reading the passage can make room for grief and belief together. Martha's conversation offers a starting point when a polished prayer feels impossible.", reflection: "What would you say to Jesus if you did not need to hide your sorrow?",
        sources: [{ title: "USCCB Bible: John 11, the death and raising of Lazarus", url: "https://bible.usccb.org/bible/john/11" }] },
    ],
    practice: { title: "A gentle way to begin", steps: ["Read a short part of one saint's story; stop when you need to.", "Name the person you miss, or sit quietly if words are difficult.", "Reach out to someone you trust, a parish bereavement group, or a counselor for companionship and support."] },
    prayer: "God of compassion, receive my sorrow and hold the person I love in your mercy. Help me accept care from others. Saint Elizabeth Ann Seton and Saint Martha, pray for me. Amen.",
    questions: [{ question: "Do I need to find the one official patron saint of grief?", answer: "No. You can ask a saint to pray for you because their story helps you feel accompanied. Here the connections are widowhood and the death of a sibling, rather than a claim of formal patronage." }, { question: "What if I cannot find words to pray?", answer: "You can sit quietly, name the person you miss, or ask someone to pray with you. This guide offers optional starting points; it does not set a timetable for grief." }], reviewedOn: "2026-09-16",
  },
  {
    slug: "difficult-decisions", label: "Difficult decisions", title: "Saints for Difficult Decisions and Discernment",
    description: "Explore Ignatius of Loyola and Joseph as companions for difficult choices, with sourced reflections, practical questions, and a prayer for discernment.",
    introduction: "A difficult choice may concern work, family responsibilities, or the direction of your life. A saint can be a companion as you pray and think. Ignatius offers a tradition of discernment; Joseph offers an example of accepting responsibility when the future is uncertain.",
    distinction: "These are suggested companions for discernment, not a claim that the Church has appointed one universal patron saint of difficult decisions. Their examples invite reflection rather than providing predictions or guaranteed signs.",
    saints: [
      { slug: "ignatius-of-loyola", connection: "Spiritual companion", relationship: "A teacher of discernment",
        explanation: "Pope Francis describes how Ignatius, while recovering from injury, noticed that different thoughts left different effects on him afterward. This attention became important in his approach to discernment. The point is more demanding than choosing whatever feels pleasant in the moment: notice where a thought leads over time. His example can encourage patient reflection before making a commitment.", reflection: "After the initial excitement or fear fades, what direction does each option draw you toward?",
        sources: [{ title: "Francis: Discernment and Ignatius of Loyola (7 September 2022)", url: "https://www.vatican.va/content/francesco/en/audiences/2022/documents/20220907-udienza-generale.html" }] },
      { slug: "joseph", connection: "Spiritual companion", relationship: "An example of responsible action amid uncertainty",
        explanation: "Patris corde portrays Joseph as accepting responsibility and responding with courage to the needs of Mary and Jesus. This can help frame a choice around the people affected by it, rather than only personal preference. His story invites a question about faithful action with the circumstances at hand; it is not a promise that every decision will arrive through a dream.", reflection: "Who depends on this decision, and what responsibility can you honestly take now?",
        sources: [{ title: "Francis: Patris corde (8 December 2020)", url: "https://www.vatican.va/content/francesco/en/apost_letters/documents/papa-francesco-lettera-ap_20201208_patris-corde.html" }] },
    ],
    practice: { title: "Give the decision some structure", steps: ["Write the choice clearly, including the facts you still need to learn.", "Consider your responsibilities, the people affected, and the reasons for each option.", "Pray, allow time where possible, and discuss the decision with a trusted person or spiritual director.", "Choose a responsible next step; revisit the decision if important new information emerges."] },
    prayer: "God of wisdom, help me see clearly, seek good counsel, and choose with love and courage. Saint Ignatius and Saint Joseph, pray for me. Amen.",
    questions: [{ question: "Is an immediate feeling of peace enough to decide?", answer: "A feeling is worth noticing, but this guide does not treat it as proof of God's will. Consider facts, responsibilities, and wise counsel as well as what you notice in prayer over time." }, { question: "Can a quiz tell me what God wants me to do?", answer: "No. The Saint Discovery quiz is a way to meet saints whose stories may interest you. It cannot determine a vocation, predict an outcome, or replace your judgment and spiritual guidance." }], reviewedOn: "2026-09-16",
  },
];

const guideOrder = ["blacksmiths", "nurses", "parents", "students", "grief", "difficult-decisions"];
export const PATRON_GUIDES = [...guides].sort((a, b) => guideOrder.indexOf(a.slug) - guideOrder.indexOf(b.slug));

export function getPatronGuide(slug: string): PatronGuide | null {
  return PATRON_GUIDES.find(guide => guide.slug === slug) ?? null;
}

export function getGuidesForSaint(slug: string): PatronGuide[] {
  return PATRON_GUIDES.filter(guide => guide.saints.some(saint => saint.slug === slug));
}
