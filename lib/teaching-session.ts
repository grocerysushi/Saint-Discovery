import content from "@/data/educator-resources.json";

// The presenter and printable lesson use the same teaching text and timing.
export const teachingStages = content.lesson.pages[1].sections.map(section => {
  const [timing, title] = section.title.split(" | ");
  return { timing, title, body: section.body };
});
export const teachingSources = content.sources;
