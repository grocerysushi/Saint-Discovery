import fs from 'node:fs';
const candidates = JSON.parse(fs.readFileSync('research/saint-artwork/candidates.json', 'utf8'));
// Explicit editorial selections; discovery results are never accepted wholesale.
const reviewed = {
  'genoveva-torres-morales': ['Statue of Saint Genoveva Torres Morales in Valladolid', 'Iglesia en Valladolid', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'],
  'felix-of-nicosia': ['Historical devotional painting of Saint Felix of Nicosia', 'Unknown artist, nineteenth-century devotional painting', 'Public domain'],
  'germanus-of-capua': ['Medieval manuscript illustration of the tradition of Saint Germanus at the baths of Agnano', 'Medieval illustration in De Balneis Puteolanis, Biblioteca Angelica; reproduction uploaded by Denghiù', 'Public domain'],
  'finnian-of-clonard': ['Statue of Saint Finnian of Clonard holding a torch', 'Studi Nicoli, sculpture; Andreas F. Borchert, photograph', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
  'szymon-of-lipnica': ['Sculpture of Saint Szymon of Lipnica in Saint Joseph’s Church, Muszyna', 'Krzysztof Burghardt, photograph', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'],
  'angelo-of-acri': ['Portrait engraving from the 1754 biography of Saint Angelo of Acri', 'Vita del gran servo di Dio Angelo d’Acri (1754), Internet Archive / University of Illinois Urbana-Champaign', 'Public domain'],
  'rafael-guizar-valencia': ['Portrait of Saint Rafael Guízar y Valencia in the Church of Our Lady of Mount Carmel, Playa del Carmen', 'Unknown painter; Nheyob, photograph', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'],
};
const path = 'lib/data/saint-artwork-additions.json';
const additions = JSON.parse(fs.readFileSync(path, 'utf8'));
for (const [slug, [alt, credit, license, licenseUrl]] of Object.entries(reviewed)) {
  const candidate = candidates.find(c => c.slug === slug);
  if (!candidate?.image) throw Error(`Missing reviewed candidate: ${slug}`);
  additions[slug] = {
    src: candidate.image.url.replace(/\?.*$/, ''), alt, credit, license,
    source: candidate.image.descriptionurl,
    ...(licenseUrl ? { licenseUrl } : {}),
    article: `https://en.wikipedia.org/wiki/${encodeURIComponent(candidate.page.title.replaceAll(' ', '_'))}`,
    reviewedOn: '2026-10-15',
  };
}
fs.writeFileSync(path, JSON.stringify(additions, null, 2) + '\n');
console.log(`Assigned ${Object.keys(reviewed).length} reviewed historical artworks.`);
