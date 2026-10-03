import fs from 'node:fs';
import { loadTs } from '../../tests/load-ts.mjs';
const saints = await loadTs('lib/saints.ts').getAllSaints();
const input = JSON.parse(fs.readFileSync('research/saint-artwork/us-events.json', 'utf8'));
const normalize = text => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const aliases = {
 StsBasilGreg:['basil-the-great','gregory-of-nazianzus'], StsTimothyTitus:['timothy','titus'],
 StsPerpetuaFelicity:['perpetua','felicity'], StsPhilipJames:['philip','james-the-less'],
 StsJohnFisherThomasMore:['john-fisher','thomas-more'], StsPeterPaulAp:['peter','paul-the-apostle'],
 StsJoachimAnne:['joachim','anne'], StMartha:['martha','mary-of-bethany','lazarus'],
 StsCorneliusCyprian:['cornelius','cyprian'], StsCosmasDamian:['cosmas','damian'],
 StsArchangels:['michael-the-archangel','gabriel-the-archangel','raphael-the-archangel'],
 StsJeanBrebeuf:['john-de-brebeuf','isaac-jogues','anthony-daniel','charles-garnier','gabriel-lalemant','noel-chabanel','rene-goupil','john-de-la-lande'],
 StSimonStJudeAp:['simon','jude'], StsPaulMiki:['paul-miki'], StsCharlesLwanga:['charles-lwanga'],
 StAndrewKimTaegon:['andrew-kim-taegon','paul-chong-hasang'], StsLawrenceRuiz:['lorenzo-ruiz'],
 StAndrewDungLac:['andrew-dung-lac'], StsNereusAchilleus:['nereus','achilleus'], StsMarcellinusPeter:['marcellinus','peter-the-exorcist'],
 StsPontianHippolytus:['pontian','hippolytus'],
 StHilaryPoitiers:['hilary-of-poitiers'], StAnthonyEgypt:['anthony-the-great'], StRayPenyafort:['raymond-of-penyafort'],
 StBlase:['blaise'], StJohnBaptistDeLaSalle:['john-baptist-de-la-salle'], StMartinPope:['martin-i'],
 StAnselm:['anselm-of-canterbury'], StAdalbert:['adalbert-of-prague'], StLouisGrignionMontfort:['louis-de-montfort'],
 StPiusV:['pius-v'], StDamienVeuster:['damien-of-molokai'], StIsidore:['isidore-the-farmer'],
 StBernardineSiena:['bernardino-of-siena'], StChristopherMagallanes:['cristobal-magallanes'],
 StBedeVenerable:['bede'], StEphrem:['ephrem-the-syrian'], StHenry:['henry-ii'], StBridget:['bridget-of-sweden'],
 StSharbelMakhluf:['charbel-makhlouf'], StAlphonsusMariaDeLiguori:['alphonsus-liguori'],
 StEusebius:['eusebius-of-vercelli'], StJeanVianney:['john-vianney'], StEdithStein:['edith-stein'],
 StBernardClairvaux:['bernard-of-clairvaux'], StLouis:['louis-ix'], StAugustineHippo:['augustine-of-hippo'],
 StGregoryGreat:['gregory-the-great'], StPioPietrelcina:['padre-pio'], StDenis:['denis'], StTeresaJesus:['teresa-of-avila'],
 StHedwig:['hedwig'], StMargaretAlacoque:['margaret-mary-alacoque'], StJohnCapistrano:['john-of-capistrano'],
 StFrancesXCabrini:['frances-xavier-cabrini'], StCatherineAlexandria:['catherine-of-alexandria'],
 StJohnDamascene:['john-of-damascus'], StLucySyracuse:['lucy'], StSylvesterIPope:['sylvester'],
 StJohnKanty:['john-cantius'], StVincentDeacon:['vincent'], StJohnAvila:['john-of-vila'],
 StAndreBessette:['andr-bessette'], StMaryMagdalenePazzi:['mary-magdalene-de-pazzi'],
 StJeromeEmiliani:['jerome-emiliani'], StPaulVI:['paul-vi'], StJohnIPope:['john-i'],
 StStephenHungary:['stephen-of-hungary'], StMotherTeresa:['mother-teresa'],
 ConversionStPaul:['paul-the-apostle'], ChairStPeter:['peter'], StJosephWorker:['joseph'],
 NativityJohnBaptist:['john-the-baptist'], BeheadingJohnBaptist:['john-the-baptist'],
 StMarkEvangelist:['mark'], StThomasAp:['thomas'], StMatthiasAp:['matthias'], StBarnabasAp:['barnabas'],
 StJamesAp:['james'], StBartholomewAp:['bartholomew'], StMatthewEvangelist:['matthew'],
 StLukeEvangelist:['luke'], StAndrewAp:['andrew'], StStephenProtomartyr:['stephen'], StJohnEvangelist:['john'],
};
const dateOverrides = { StVincentDeacon:'01-23', StCamillusDeLellis:'07-18', StPaulCross:'10-20' };
Object.assign(aliases, {
 StRayPenyafort:['raymond-of-pe-afort'], StAgnes:['agnes'], StsCyrilMethodius:['cyril-and-methodius'],
 StPolycarp:['polycarp'], StJoseph:['joseph'], StMarkEvangelist:['mark-the-evangelist'], StAthanasius:['athanasius'],
 StsPhilipJames:['philip-the-apostle'], StBernardineSiena:['bernardine-of-siena'], StBedeVenerable:['bede-the-venerable'],
 StNorbert:['norbert'], StIrenaeus:['irenaeus-of-lyon'], StThomasAp:['thomas-the-apostle'],
 StAnthonyZaccaria:['anthony-mary-zaccaria'], StBenedict:['benedict'], StApollinaris:['apollinaris'],
 StDominic:['dominic'], StLawrenceDeacon:['lawrence'], StClare:['clare-of-assisi'], StMaximilianKolbe:['maximilian-kolbe'],
 StThereseChildJesus:['therese-of-lisieux'], StBruno:['bruno'], StLukeEvangelist:['luke-the-evangelist'],
 StSimonStJudeAp:['simon-the-apostle','jude-thaddeus'], StJosaphat:['josaphat'], StNicholas:['nicholas-of-myra'],
 StAmbrose:['ambrose'], StJohnEvangelist:['john-the-apostle'], StStanislaus:['stanislaus'], StJamesAp:['james-the-greater'],
 StsPerpetuaFelicity:['perpetua','felicity-of-carthage'], StsCorneliusCyprian:['cornelius','cyprian'],
 StsMarcellinusPeter:[], // Pope Marcellinus is not the martyr Marcellinus celebrated on June 2.
 StsJeanBrebeuf:['john-de-br-beuf','isaac-jogues','anthony-daniel','charles-garnier','gabriel-lalemant','noel-chabanel','rene-goupil','john-de-la-lande'],
});
const skip = new Set(['MaryMotherOfGod','NameJesus','PrayerUnborn','Presentation','OurLadyOfLourdes','SevenHolyFounders','Annunciation','OurLadyOfFatima','Visitation','FirstMartyrsRome','IndependenceDay','OurLadyOfMountCarmel','DedicationStMaryMajor','Transfiguration','Assumption','QueenshipMary','NativityVirginMary','HolyNameMary','ExaltationCross','OurLadyOfSorrows','GuardianAngels','MarieDurocher','OurLadyOfTheRosary','AllSaints','AllSouls','DedicationLateran','DedicationStsPeterPaul','PresentationMary','MiguelPro','ImmaculateConception','OurLadyOfLoreto','OurLadyOfGuadalupe','Christmas','HolyInnocents']);
const result = { reviewedOn:'2026-10-03', scope:'Recurring saint dates in the U.S. Roman Rite; discovery priority, not year-specific liturgical precedence',
 sources:[{title:'USCCB: 2026 Liturgical Calendar (February 2026 revision)',url:'https://www.usccb.org/resources/2026cal.pdf'},{title:'USCCB: 2027 Liturgical Calendar',url:'https://www.usccb.org/resources/2027cal.pdf'}],
 attribution:'Original directory identity mapping. Reduced factual dates derived from Apache-2.0 LiturgicalCalendarAPI and checked against USCCB proper/calendar corrections; no readings or calendar prose reproduced.',
 upstreamSources:input.sources, dates:{}, unmapped:[] };
const seen = new Set();
for (const event of [...input.events, {date:'10-09',key:'StJohnHenryNewman',name:'John Henry Newman',grade:2}, {date:'01-23',key:'StMarianneCope',name:'Marianne Cope',grade:2}, {date:'10-05',key:'FrancisSeelos',name:'Francis Xavier Seelos',grade:2}, {date:'04-02',key:'StFrancisPaola',name:'Francis of Paola',grade:2}, {date:'04-04',key:'StIsidoreSeville',name:'Isidore of Seville',grade:2}, {date:'04-05',key:'StVincentFerrer',name:'Vincent Ferrer',grade:2}, {date:'04-11',key:'StStanislaus',name:'Stanislaus of Szczepanów',grade:3}]) {
 if (skip.has(event.key) || seen.has(event.key)) continue;
 seen.add(event.key);
 const date = dateOverrides[event.key] ?? event.date;
 const name = normalize(event.name.replace(/^\[.*?\]\s*/, '').replace(/^Saints?\s+|^Blessed\s+/, '').split(',')[0]);
 const mapped = aliases[event.key] ?? saints.filter(s=>[s.name,...(s.alternate_names??[])].some(n=>normalize(n.replace(/^Saint\s+/,''))===name)).map(s=>s.slug);
 const slugs = mapped.filter(slug=>saints.some(s=>s.slug===slug));
 if (!slugs.length) { result.unmapped.push(event); continue; }
 const rank = ['StJoseph','NativityJohnBaptist','StsPeterPaulAp'].includes(event.key)?6 : ['StMaryMagdalene','ConversionStPaul','ChairStPeter'].includes(event.key)?4 : ['StBoniface','StAnthonyPadua','StsPerpetuaFelicity','StPolycarp'].includes(event.key)?3 : Math.max(event.grade,2);
 for(const slug of slugs) (result.dates[date]??=[]).push({slug,rank});
}
for(const entries of Object.values(result.dates)) entries.sort((a,b)=>b.rank-a.rank || a.slug.localeCompare(b.slug));
fs.writeFileSync('research/saint-artwork/uscc-basis.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({dates:Object.keys(result.dates).length,mapped:Object.values(result.dates).flat().length,unmapped:result.unmapped},null,2));
