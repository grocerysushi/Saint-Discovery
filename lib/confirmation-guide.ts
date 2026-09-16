export const CONFIRMATION_THEMES = [
  "All", "Everyday faith", "Service", "Courage", "Prayer", "Seeking understanding",
] as const;

// Editorial reading suggestions, not declarations of official patronage.
export const CONFIRMATION_PICKS = [
  { slug: "carlo-acutis", theme: "Everyday faith", reason: "Bring faith into school, friendships, and the way you use technology." },
  { slug: "pier-giorgio-frassati", theme: "Everyday faith", reason: "Explore a life of friendship, outdoor adventure, prayer, and practical generosity." },
  { slug: "francis-of-assisi", theme: "Service", reason: "Reflect on simplicity, fraternity, and learning to serve people in poverty." },
  { slug: "catherine-of-siena", theme: "Service", reason: "Consider how prayer can sustain care for others and a voice in the Church." },
  { slug: "joan-of-arc", theme: "Courage", reason: "Read about conviction under pressure, with attention to her trial and historical setting." },
  { slug: "maximilian-kolbe", theme: "Courage", reason: "Consider what sacrificial love can ask of a person in extreme circumstances." },
  { slug: "therese-of-lisieux", theme: "Prayer", reason: "Discover how small, ordinary actions can become expressions of love." },
  { slug: "monica", theme: "Prayer", reason: "Explore patient prayer and concern for the people closest to you." },
  { slug: "thomas-aquinas", theme: "Seeking understanding", reason: "Meet a teacher who devoted his life to the study of Christian faith." },
  { slug: "ignatius-of-loyola", theme: "Seeking understanding", reason: "Learn about conversion, reflection, and discerning how to follow Christ." },
] as const;

export const REFLECTION_PROMPTS = [
  "What event in this saint’s life stays with me?",
  "What virtue do I want to practice, and what will I do this week?",
  "How could this saint help me follow Jesus?",
  "What do I want to ask my sponsor or catechist?",
];

export const CONFIRMATION_FAQS = [
  { q: "Do I have to choose a new name?", a: "Begin by asking your parish. The US Catholic Catechism for Adults recognizes the connection between Confirmation and using a name received at Baptism. You may already have a patron saint to learn about; follow your parish’s instructions about names and preparation." },
  { q: "How do I know which saint is right for me?", a: "Look for someone whose life helps you follow Jesus. That may be someone who shares your interests, or someone whose virtues challenge you to grow. Read beyond a short summary, pray, and talk through your choice with your sponsor. You do not need a perfect personality match." },
  { q: "Can I choose someone listed as Blessed?", a: "Ask your parish before settling on a name. Blessed and Saint are different titles in the Catholic Church. Our suggestions below are saints recognized in the Catholic Church; the wider directory also includes blesseds, Orthodox figures, and observances, so a directory entry alone is not confirmation-name approval." },
  { q: "Can the personality quiz choose for me?", a: "Use it as a starting point for reading and reflection. A quiz result is not a spiritual judgment, a requirement, or parish approval. Compare its suggestion with other lives and discuss your choice with your sponsor or catechist." },
  { q: "What should I write in my saint report?", a: "Follow your parish’s assignment first. A useful outline includes the saint’s name and historical setting, a few well-sourced events, a virtue you admire, why you chose this person, and one practical way you will imitate that virtue. Include your sources and distinguish later traditions from documented history." },
];
