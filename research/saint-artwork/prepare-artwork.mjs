import fs from 'node:fs';
const candidates = JSON.parse(fs.readFileSync('research/saint-artwork/candidates.json', 'utf8'));
const rejected = {
 'helena':'Search resolved to the South Atlantic territory, not the saint.',
 'maria-yi-yon-hui':'Image depicts a shrine to Andrew Kim; it does not identify this martyr.',
 'germanus-of-capua':'Book illustration of a bath has no clear depiction of this saint.',
 'hormisdas':'Generic table of popes, with no usable identification or attribution.',
 'odo-of-cluny':'Description identifies the sitter as either Odo or Peter the Venerable.',
 'felix-of-nicosia':'File name and description identify Philip of Nicosia rather than Felix.',
 'charles-lwanga':'Modern 1962 artwork: free-use claim lacks corroborated rights-holder permission.',
 'gregory-of-nazianzus':'File marked as needing source review, unknown origin and blanket free-use claim.',
 'luigi-scrosoppi':'Blessing ceremony, not a verified likeness of this saint.',
 'agatha-yi-kyong-i':'Modern shrine painting; photo license alone does not establish painting rights.',
 'agatha-kwon-chin-i':'Modern shrine painting; photo license alone does not establish painting rights.',
 'barbara-choe-yong-i':'Modern shrine painting; photo license alone does not establish painting rights.',
 'john-yi-yun-il':'Modern shrine painting; photo license alone does not establish painting rights.',
 'john-calabria':'Private-collection portrait; artist and separate artwork rights unresolved.',
 'claudine-thevenet':'Photo of a painting; artist and separate artwork rights unresolved.',
 'simon-de-rojas':'Vatican reproduction without clear original artist or artwork date.',
 'pauline-agonizing-heart-jesus':'Copied painted likeness with insufficient underlying artwork metadata.',
 'hannibal-mary-di-francia':'Extracted painted likeness with insufficient underlying artwork metadata.',
 'genoveva-torres-morales':'Modern statue: sculpture rights not established by photo metadata.',
 'luigi-orione':'20th-century statue with unresolved sculpture rights.',
 'finnian-of-clonard':'Modern statue: sculpture rights not established by photo metadata.',
 'maria-crocifissa-di-rosa':'Description gives only a location; pictured identity cannot be confirmed.',
 'nicetius-of-lyon':'Statue date and underlying sculpture rights unresolved.',
 'szymon-of-lipnica':'Statue date and underlying sculpture rights unresolved.',
 'george-preca':'Modern outdoor statue; underlying sculpture rights unresolved.',
 'ludovico-of-casoria':'Interior with portrait; underlying portrait rights and date unclear.',
 'solomon-leclercq':'Modern altar decoration; underlying artwork rights and date unclear.',
 'rafael-guizar-valencia':'Unknown painter: separate portrait rights and date unresolved.',
 'nazaria-ignacia-march-mesa':'Painted likeness: separate portrait rights and date unresolved.',
 'gaetano-errico':'Painted likeness: separate portrait rights and date unresolved.',
 'joseph-vaz':'Painted likeness: separate portrait rights and date unresolved.',
 'john-de-brito':'Painted likeness: separate portrait rights and date unresolved.',
 'angelo-of-acri':'No-known-restrictions classification is not an explicit reusable license.',
};
const plain = html => (html ?? '').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').replace(/Unknown author Unknown author/g,'Unknown artist').trim();
const output = {};
const audit = [];
for (const candidate of candidates) {
 const { slug, name, page, image } = candidate;
 const meta = image.extmetadata;
 const license = plain(meta.LicenseShortName?.value);
 const tags = plain(meta.Categories?.value);
 const reason = rejected[slug] ?? (/disputed copyright|deletion requests|copyright violations|requiring source and license check/i.test(tags) ? 'Commons identifies disputed or unreviewed rights.' : !/^(Public domain|CC0|CC BY|FAL|Attribution)/.test(license) ? 'No supported explicit reusable license.' : null);
 if(reason) { audit.push({slug,status:'rejected',reason,file:page.pageimage,source:image.descriptionurl}); continue; }
 const group = page.pageimage === 'North_American_Martyrs.jpg';
 const context = slug === 'vladimir-of-kiev' ? 'Historical coin associated with Vladimir the Great' : slug === 'jadwiga-of-poland' ? 'Historical seal of Jadwiga of Poland' : slug === 'oswald-of-worcester' ? 'Medieval manuscript illustration associated with Oswald of Worcester and Eadnoth' : group ? `Historical group artwork of the North American Martyrs, including ${name}` : `Artwork depicting ${name}`;
 output[slug] = {
  src:image.thumburl ?? image.url,
  alt:context,
  credit:plain(meta.Artist?.value) || 'Artist not recorded · Wikimedia Commons',
  license, source:image.descriptionurl,
  ...(meta.LicenseUrl?.value ? {licenseUrl:meta.LicenseUrl.value} : {}),
  article:`https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ','_'))}`,
  reviewedOn:'2026-10-03',
 };
 audit.push({slug,status:'accepted',identityPage:page.title,identityDescription:page.pageprops?.['wikibase-shortdesc']??null,file:page.pageimage,source:image.descriptionurl,license,licenseUrl:meta.LicenseUrl?.value??null,credit:output[slug].credit,artworkDate:plain(meta.DateTimeOriginal?.value),description:plain(meta.ImageDescription?.value),limitations:group?'Shared historical group artwork; no individual face identification claimed.':'Source metadata comparison, not independent copyright clearance or qualified human review.'});
}
fs.writeFileSync('lib/data/saint-artwork-additions.json',JSON.stringify(output,null,2)+'\n');
fs.writeFileSync('research/saint-artwork/selection-record.json',JSON.stringify({reviewedOn:'2026-10-03',accepted:Object.keys(output).length,rejected:audit.filter(x=>x.status==='rejected').length,entries:audit},null,2)+'\n');
console.log(JSON.stringify({accepted:Object.keys(output).length,rejected:audit.filter(x=>x.status==='rejected').length}));
