export interface SaintLearningGuide {
  reading: { title: string; introduction: string; exercise: string; url: string; label: string };
  prompts: string[];
  faqs: { question: string; answer: string; source: { title: string; url: string } }[];
}

const guides: Record<string, SaintLearningGuide> = {
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
