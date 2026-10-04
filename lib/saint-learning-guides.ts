export interface SaintLearningGuide {
  reviewedOn?: string;
  sourceContext?: string;
  reading: { title: string; introduction: string; exercise: string; url: string; label: string };
  prompts: string[];
  faqs: { question: string; answer: string; source: { title: string; url: string } }[];
}

const guides: Record<string, SaintLearningGuide> = {
  "francis-of-assisi": {
    reviewedOn: "2026-10-04",
    sourceContext: "Benedict XVI's 2010 audience is a modern Catholic interpretation of Francis's life. It draws on earlier Franciscan accounts and writings; it is not an eyewitness record. Its treatment of reported visions should be read as religious tradition, with the pope's interpretation distinguished from the events described.",
    reading: {
      title: "Follow the changing meaning of rebuilding",
      introduction: "Read the account of San Damiano in Benedict XVI's audience, then continue to Francis's relationship with his companions and the Church. Notice how repairing a building becomes a way of discussing renewal in a community.",
      exercise: "Make a small diagram with three headings: building, community, personal response. Under the first two, record what the audience actually says; under the third, propose one modest responsibility you could take on in your parish or neighborhood. Mark that last item as your application, not an instruction Francis gave.",
      url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100127.html",
      label: "Read Benedict XVI on Francis and renewal",
    },
    prompts: ["Which part of this account changes your picture of Francis beyond familiar animal imagery?", "What would serving a community require of you besides pointing out what is wrong?", "Name one possession, commitment, or habit you could simplify to make room for that responsibility."],
    faqs: [{ question: "Did Francis seek renewal apart from the Church?", answer: "Benedict XVI presents Francis's renewal as taking place within the Church. He describes Francis seeking the pope's approval for his community and links his Gospel commitment with the Eucharist and communion with the Church.", source: { title: "Read the audience on Francis and the Church", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100127.html" } }],
  },
  "ignatius-of-loyola": {
    reviewedOn: "2026-10-04",
    sourceContext: "The Jesuit Conference provides a modern institutional overview of its founder. The Office of Ignatian Spirituality explains how the Spiritual Exercises are used today. These introductions help orient a reader; neither replaces Ignatius's own text or an accompanied retreat.",
    reading: {
      title: "Notice what follows an ambition",
      introduction: "Read the recovery episode in the Jesuit Conference's account of Ignatius. Pay attention to the different aftereffects of his daydreams, and then follow the account into his pilgrimage and studies rather than treating one feeling as the whole story.",
      exercise: "Draw a short sequence of the changes the biography describes. Beside each, note what Ignatius noticed and what he did next, leaving a blank when the source does not say. Then write one question you would want to discuss with a trusted spiritual guide about a decision of your own. This reading exercise is not the Spiritual Exercises or a test that reveals God's will.",
      url: "https://www.jesuits.org/about-us/ignatius-of-loyola/",
      label: "Read the Jesuit Conference's account of Ignatius",
    },
    prompts: ["How does looking at the effects of a choice over time differ from following your first reaction?", "Which part of Ignatius's journey involved learning from another person?", "What information or counsel would help you examine a decision more patiently?"],
    faqs: [{ question: "Are the Spiritual Exercises a book to read straight through?", answer: "The Office of Ignatian Spirituality describes them as a handbook for a guided process of prayer, rather than ordinary continuous reading. Retreat formats include a concentrated 30-day retreat and an extended retreat alongside daily responsibilities, with guidance from a spiritual director.", source: { title: "Read the Office of Ignatian Spirituality's introduction", url: "https://www.jesuitseastois.org/spiritualexercises" } }],
  },
  "catherine-of-siena": {
    reviewedOn: "2026-10-04",
    sourceContext: "Benedict XVI's 2010 audience introduces Catherine's teaching through her writings and Raymond of Capua's biography. It is a later papal catechesis, not a contemporary transcript of her life. The reported visions belong to that spiritual testimony and should not be treated as independently documented public events.",
    reading: {
      title: "Trace Catherine's image of a bridge",
      introduction: "Near the end of the audience below, Benedict XVI explains Catherine's image of Christ as a bridge in the Dialogue. Read that explanation alongside the earlier account of her care for sick people and her work for peace.",
      exercise: "Sketch the bridge and label its three stages using the explanation in the audience. Beside the sketch, write one question the image helps you ask and one point you still do not understand. Then find an example of practical service in the same reading. Discuss how that example might relate to the teaching without assuming your connection is Catherine's own explanation.",
      url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20101124.html",
      label: "Read an introduction to Catherine's life and teaching",
    },
    prompts: ["What is easier for you to notice in this reading: its vivid spiritual language or its practical demands?", "How could a firm request for change also show care for the person receiving it?", "Which of Catherine's writings would you investigate next, and what question would you bring to it?"],
    faqs: [{ question: "Did Catherine live in a cloistered convent?", answer: "Benedict XVI describes her as a member of the Dominican Third Order's Mantellate who lived at home. Her vocation included prayer, service to sick people, spiritual guidance, and journeys for peace and Church reform.", source: { title: "Read the audience on Catherine's Dominican vocation", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20101124.html" } }],
  },
  "peter-faber": {
    reviewedOn: "2026-10-04",
    sourceContext: "The Society of Jesus page reproduces Adolfo Nicolás's letter of 17 December 2013 celebrating Faber's canonization. It cites Faber's Memorial and accounts by his companions, but selects them for a spiritual reflection. Francis's 2014 homily likewise interprets Faber's example; neither is a complete critical biography.",
    reading: {
      title: "Study the work behind a gentle conversation",
      introduction: "Read the sections on friendship and reconciliation in the Jesuit letter about Faber. Look for concrete practices connected with his gentleness, including conversation, prayer, and attention to the people around him.",
      exercise: "Choose one passage the letter attributes to Faber or a companion. Note who is speaking, then separate that testimony from Nicolás's modern commentary. For a low-stakes disagreement of your own, draft a question that would help you understand the other person's position before responding. This is your practice in listening, not a reconstructed quotation from Faber.",
      url: "https://www.jesuits.global/saint-blessed/saint-peter-faber/",
      label: "Read the Jesuit letter on Faber's example",
    },
    prompts: ["Which action in the account makes gentleness more concrete than simply being agreeable?", "When have you understood a disagreement differently after asking a careful question?", "What would it mean to hold a conviction clearly while speaking with respect?"],
    faqs: [{ question: "Did Faber's gentleness mean avoiding difficult commitments?", answer: "Francis's 2014 homily presents Faber's sensitivity alongside his capacity to make decisions, travel, and proclaim the Gospel. Its portrait connects gentle dialogue with committed action, rather than with having no convictions.", source: { title: "Read Francis's homily on Peter Faber", url: "https://www.vatican.va/content/francesco/en/homilies/2014/documents/papa-francesco_20140103_omelia-santissimo-nome-gesu.html" } }],
  },
  "hildegard-of-bingen": {
    reading: {
      title: "Begin with Hildegard’s world of symbols",
      introduction: "Start with Benedict XVI’s introduction to her writings below. It distinguishes her major books and places their images in a Christian account of creation and salvation. Then choose one work to explore in an annotated edition.",
      exercise: "For a class or reading group, make two columns: what an image describes, and what the author says it means. Keep your own interpretation separate. Compare your notes before looking for a modern application; a vivid image is not automatically a prediction.",
      url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2010/documents/hf_ben-xvi_aud_20100908.html",
      label: "Read the introduction to Hildegard’s writings",
    },
    prompts: ["Which part of Hildegard’s work interests you most: theology, music, or community leadership? What would you need to learn to understand it in its own setting?", "Hildegard sought advice about her experiences. Who helps you examine an important conviction rather than simply affirming it?", "Choose one way to use a creative skill in service this week. Name the person or community it could help."],
    faqs: [{ question: "Why is Hildegard a Doctor of the Church?", answer: "Benedict XVI recognized the significance of her spiritual teaching in 2012. The title concerns her contribution to Christian understanding; it is not a medical qualification or clinical endorsement of medieval remedies.", source: { title: "Read the 2012 declaration", url: "https://www.vatican.va/content/benedict-xvi/en/apost_letters/documents/hf_ben-xvi_apl_20121007_ildegarda-bingen.html" } }],
  },
  "augustine-of-hippo": {
    reading: {
      title: "Read the Confessions as a conversation",
      introduction: "Use Benedict XVI’s overview of Augustine’s writings to orient yourself, then begin Book I of the Confessions in a complete translation. Notice that Augustine addresses God rather than simply giving a report to the reader.",
      exercise: "Read one short passage twice. First identify what happens or what question is raised. Then identify what Augustine asks of God. In a group, compare those answers before discussing whether you recognize the experience. Do not pressure anyone to disclose a personal struggle.",
      url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2008/documents/hf_ben-xvi_aud_20080220.html",
      label: "Explore Augustine’s books and their purposes",
    },
    prompts: ["Which person or book helped Augustine reconsider a belief? What makes you willing to listen when you think you already understand?", "Augustine revisited his earlier writings. Is there a judgment you would express more carefully today?", "Consider his responsibilities during the siege. What obligation to another person needs your attention this week?"],
    faqs: [{ question: "Is the Confessions only about Augustine’s conversion?", answer: "No. It includes his conversion but also explores memory, time, and creation. Its thirteen books take the form of an address to God, combining acknowledgment of failure with praise and thanksgiving.", source: { title: "Read Benedict XVI on the Confessions", url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2008/documents/hf_ben-xvi_aud_20080220.html" } }],
  },
  "teresa-of-avila": {
    reading: {
      title: "Choose a Teresa book for your question",
      introduction: "Use the overview below to choose a starting point: the Life for her experience, the Way of Perfection for counsel on prayer, or the Interior Castle for her extended image of spiritual growth. You do not need to read all three at once.",
      exercise: "With a short passage from your chosen book, ask: who is Teresa addressing, what difficulty is she naming, and what response does she propose? Write one sentence for each. If you are studying in a group, distinguish her advice to a Carmelite community from your own proposed application at home or work.",
      url: "https://www.vatican.va/content/benedict-xvi/en/audiences/2011/documents/hf_ben-xvi_aud_20110202.html",
      label: "Read an introduction to Teresa’s books",
    },
    prompts: ["Where might you be separating prayer from a practical responsibility that needs attention?", "How could you respond kindly when someone interrupts the time you hoped to keep for yourself?", "Choose a manageable time for prayer and one act of service. At the end of the week, reflect on how they affected each other."],
    faqs: [{ question: "Must I have mystical experiences to follow Teresa’s teaching?", answer: "No. Pope Francis cautions against treating her extraordinary experiences as a pattern everyone must copy. Her teaching directs readers toward love of God expressed in concrete charity toward others.", source: { title: "Read Francis on Teresa’s example", url: "https://www.vatican.va/content/francesco/en/messages/pont-messages/2021/documents/papa-francesco_20210415_videomessaggio-mujer-excepcional.html" } }],
  },
  "therese-of-lisieux": {
    reading: {
      title: "Read the little way without reducing it to a slogan",
      introduction: "Begin with paragraphs 14–24 of C’est la confiance, linked below. Then read a passage from Story of a Soul with that explanation in mind. Look for the relationship between receiving mercy and responding with love.",
      exercise: "For personal or group study, describe one ordinary situation: a shared chore, an unwelcome interruption, or a conversation with someone you find difficult. Write a concrete loving response that does not depend on being noticed. Keep this as an exercise in applying the reading, not a quotation or rule attributed to Thérèse.",
      url: "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2023/10/15/231015a.html",
      label: "Read Francis’s explanation of the little way",
    },
    prompts: ["When do you measure your worth by visible achievements? How might receiving love change that habit?", "What useful, unnoticed act could you do for someone with whom you share daily life?", "Who serves others in a setting you cannot reach? Consider one realistic way to support that person."],
    faqs: [{ question: "Does Thérèse’s little way mean making no effort?", answer: "No. Her emphasis is on trusting God’s grace rather than depending on personal achievement. That confidence supports love in daily life; it does not excuse neglecting other people or one’s responsibilities.", source: { title: "Read C’est la confiance, paragraphs 14–24", url: "https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2023/10/15/231015a.html" } }],
  },
};

export function getSaintLearningGuide(slug: string): SaintLearningGuide | undefined {
  return guides[slug];
}
