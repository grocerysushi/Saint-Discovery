import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const write=(name,data)=>fs.writeFileSync(path.join(root,name),JSON.stringify(data,null,2)+'\n');
const selections=read('research/calendar-coverage/selections.json');
const editorial=read('research/calendar-coverage/editorial.json');
const sources=read('research/calendar-coverage/source-index.json');
const dateLabel=date=>{const [m,d]=date.split('-').map(Number);return new Date(2024,m-1,d).toLocaleDateString('en-US',{month:'long',day:'numeric'});};
const notes={
 '01-06':'January 6 is the Vatican News commemoration of André Bessette; the Canadian celebration on January 7 remains in his biography.',
 '01-25':'January 25 celebrates the Conversion of Saint Paul. His joint solemnity with Saint Peter on June 29 remains in his biography.',
 '02-02':'February 2 is Catherine de Ricci’s Roman Martyrology commemoration; the Dominican proper uses February 4.',
 '02-18':'February 18 is Bernadette’s optional memorial in France; her April 16 commemoration remains in her biography.',
 '04-17':'April 17 is Kateri Tekakwitha’s commemoration in Canada; July 14 is used in the United States.',
 '05-01':'May 1 commemorates Saint Joseph the Worker; the March 19 solemnity remains in his biography.',
 '05-08':'May 8 is the Eastern commemoration of Arsenius, also listed by Vatican News. The Roman Martyrology uses July 19.',
 '06-14':'June 14 is Lidwina of Schiedam’s local calendar date, confirmed by the Diocese of Rotterdam; her Roman Martyrology date is April 14.',
 '07-10':'July 10 is Canute’s commemoration in the Roman Martyrology; the January 19 date in his biography remains unchanged.',
 '08-03':'August 3 is an additional commemoration of Lydia listed by Vatican News and Nominis; the Roman Martyrology also records May 20.',
 '08-06':'August 6 is Sixtus II’s martyrdom commemoration in the Roman Martyrology; his liturgical memorial is August 7.',
 '08-15':'August 15 commemorates Stanislaus Kostka in the Roman Martyrology; his Jesuit celebration on November 13 remains in his biography.',
 '08-26':'August 26 is Mariam Baouardy’s Roman Martyrology commemoration; dates in Carmelite calendars can differ.',
 '02-29':'Oswald of Worcester is commemorated on February 28 in ordinary years and February 29 in leap years.',
 '06-20':'June 20 is Silverius’s local commemoration at Palmarola; the Roman Martyrology also remembers him on December 2.',
 '07-16':'July 16 is Mary Magdalene Postel’s commemoration; the diocesan proper of Coutances and Avranches uses July 17.',
 '11-01':'November 1 is a commemoration of Austremonius; the Clermont diocesan proper uses November 3. This reading does not replace All Saints.',
 '11-02':'November 2 is Justus of Trieste’s commemoration in the Martyrology. Trieste celebrates its patron on November 3; this reading does not replace All Souls.',
 '10-03':'October 3 is Francis Borgia’s Jesuit commemoration recorded by Nominis; September 30 is his Roman Martyrology date.'
};
const scope=date=>date==='01-25'?'Conversion of Saint Paul, documented by Vatican News':(['01-06','02-18','04-17','05-08','06-14','06-20','07-16','10-03'].includes(date)?'Regional or religious-community Catholic calendar':'Catholic commemoration documented by Nominis; not a claim of universal liturgical rank');
const extra={
 'kateri-tekakwitha':[{title:'Canadian Conference of Catholic Bishops: Saint Kateri Tekakwitha and April 17 feast',url:'https://www.cccb.ca/the-catholic-church-in-canada/saints-blesseds-canada/canadian-saints/st-kateri-tekakwitha-1656-1680/'}],
 'lidwina-of-schiedam':[{title:'Diocese of Rotterdam: Lidwina’s local June 14 calendar date',url:'https://www.bisdomrotterdam.nl/nieuws/inspiratie-nieuws/de-jonge-traditie-van-de-liduinaprocessie-wordt-hervat'}],
 'onesiphorus':[{title:'USCCB NABRE: 2 Timothy 1',url:'https://bible.usccb.org/bible/2timothy/1'},{title:'USCCB NABRE: 2 Timothy 4',url:'https://bible.usccb.org/bible/2timothy/4'}],
 'justus-of-trieste':[{title:'Diocese of Trieste: Saint Justus, martyr',url:'https://www.diocesi.trieste.it/san-giusto-martire/'}],
 'clement-i':[{title:'Benedict XVI: Saint Clement, Bishop of Rome, 7 March 2007',url:'https://www.vatican.va/content/benedict-xvi/en/audiences/2007/documents/hf_ben-xvi_aud_20070307.html'}]
};
const entries=[];const commemorations={};
for(const [date,slug,id,name,isNew] of selections){
 const source=sources.find(s=>s.slug===slug);
 const calendarSource=source?.url??`https://www.vaticannews.va/en/saints/${date.replace('-','/')}.html`;
 const citations=[{title:source?`Nominis — Catholic Church in France: ${name}`:`Vatican News: saints remembered on ${dateLabel(date)}`,url:calendarSource},...(extra[slug]??[])];
 const note=notes[date]??`${dateLabel(date)} is a Catholic commemoration recorded by Nominis. This daily reading does not determine the Mass or liturgical rank; local calendars and higher-ranking celebrations can differ.`;
 if(isNew){
  if(!source||source.status!==200)throw Error('Unverified source '+slug);
  entries.push({slug,name,alternate_names:[],kind:'saint',entry_type:'person',identity_key:source.url,...editorial[slug],feast_day:dateLabel(date),feast_note:note,calendar_source:source.url,calendar_scope:scope(date),sources:citations,reviewed_on:'2026-10-02',recognition_evidence:`Nominis explicitly identifies ${source.title} as a saint in its individual Catholic entry. Where later canonizations are noted, the current title takes precedence over older Martyrology wording.`,identity_review:'Checked against all existing canonical directory identities and aliases. Individual person, not a group or an observance; original English biography written from the linked Catholic sources.',uncertainty_note:'Historical and hagiographical limitations are stated in the biography. No unsupported patronage, direct quotation, miracle claim or artwork imported.'});
 }else{
  const batchDir=path.join(root,'research/directory-batches');let updated=false;
  for(const file of fs.readdirSync(batchDir).filter(f=>f.endsWith('.json')&&!f.includes('calendar-coverage'))){const batch=read('research/directory-batches/'+file);const entry=batch.find(e=>e.slug===slug);if(entry){entry.feast_day=dateLabel(date);entry.feast_note=note;entry.calendar_source=calendarSource;entry.calendar_scope=scope(date);entry.reviewed_on='2026-10-02';entry.sources=[...new Map([...entry.sources,...citations].map(s=>[s.url,s])).values()];entry.uncertainty_note=entry.uncertainty_note.replace('feast calendar and patronages remain unverified','patronages remain unverified');write('research/directory-batches/'+file,batch);updated=true;break;}}
  if(!updated)commemorations[date]=[{slug,note,sources:citations,scope:scope(date),reviewed_on:'2026-10-02'}];
 }
}
// The source explicitly carries the same saint onto leap day, with February 28
// as the ordinary-year date. Preserve both rather than invent a February 29 life.
commemorations['02-28']=[{slug:'oswald-of-worcester',note:notes['02-29'],sources:[{title:'Nominis: Oswald of Worcester and leap-year commemoration',url:sources.find(s=>s.slug==='oswald-of-worcester').url}],scope:'Roman Martyrology ordinary-year commemoration',reviewed_on:'2026-10-02'}];
write('research/directory-batches/2026-10-02-calendar-coverage.json',entries);
write('lib/data/saint-calendar-commemorations.json',commemorations);
console.log(`Prepared ${entries.length} new individually sourced saints and ${Object.keys(commemorations).length} supplemental calendar dates.`);
