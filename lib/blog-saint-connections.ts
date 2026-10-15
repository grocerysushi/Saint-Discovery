// Canonical saint slugs and published article slugs. Order is editorial priority,
// independent of article age or incidental keywords. Missing articles are ignored.
// Add shared articles to each applicable saint; never use bare shared first names.
export const blogSaintConnections: Readonly<Record<string, readonly string[]>> = {
  "francis-of-assisi": [
    "canticle-of-the-creatures-st-francis-prayer",
    "can-lay-people-become-franciscans-secular-order",
    "what-is-transitus-st-francis-october-3",
    "why-catholics-bless-animals-st-francis",
  ],
  "francis-de-sales": ["daily-prayer-routine-busy-catholics"],
  "faustina-kowalska": ["how-to-read-saint-faustina-diary", "what-is-divine-mercy-chaplet-sunday"],
  "therese-of-lisieux": ["saint-therese-little-way-daily-life", "why-st-therese-patron-saint-missions"],
  "teresa-of-avila": ["how-to-read-interior-castle-beginners-guide", "saint-teresa-four-waters-prayer"],
  "ignatius-of-loyola": ["how-to-pray-daily-examen-five-steps"],
  "ignatius-of-antioch": ["saint-ignatius-antioch-eucharist-letters-guide"],
  "james-the-greater": ["walking-camino-de-santiago-catholic-guide"],
  "michael-the-archangel": ["michael-gabriel-raphael-archangels-feast"],
  "gabriel-the-archangel": ["michael-gabriel-raphael-archangels-feast"],
  "raphael-the-archangel": ["michael-gabriel-raphael-archangels-feast"],
  "luke-the-evangelist": ["why-saint-luke-symbol-ox", "why-saint-luke-patron-saint-artists"],
  "matthew": ["why-jesus-called-matthew-tax-collector"],
  "john-xxiii": ["why-saint-john-xxiii-feast-day-october-11"],
  "john-henry-newman": ["saint-john-henry-newman-conscience"],
  "john-leonardi": ["saint-john-leonardi-patron-saint-pharmacists"],
  "bruno": ["why-carthusians-keep-silence-saint-bruno"],
  "benedict": ["saint-benedict-rule-work-family-life"],
  "jerome": ["saint-jerome-bible-lessons-everyday-readers"],
  "wenceslaus": ["good-king-wenceslas-saint-behind-carol"],
};

// Only qualified forms that identify one person. In particular, Francis,
// Ignatius, Teresa and John alone are not aliases for a particular saint.
export const blogSaintAliases: Readonly<Record<string, readonly string[]>> = {
  "francis-of-assisi": ["francis assisi"],
  "faustina-kowalska": ["maria faustina kowalska"],
  "therese-of-lisieux": ["therese lisieux", "therese of the child jesus and the holy face"],
  "teresa-of-avila": ["teresa avila"],
  "ignatius-of-loyola": ["ignatius loyola"],
  "ignatius-of-antioch": ["ignatius antioch"],
};
