"use client";
import { useState, useSyncExternalStore } from 'react';
import { subscribeToLocalDate } from '@/lib/calendar-date';
import { bannerColors, civilDateKey, getLiturgicalDay, calendarReviewedOn, calendarCoverage } from '@/lib/liturgical-calendar';

const getSnapshot = () => `${civilDateKey()}|${Intl.DateTimeFormat().resolvedOptions().timeZone}`;
const serverSnapshot = () => '';
export default function LiturgicalBanner() {
  const snapshot = useSyncExternalStore(subscribeToLocalDate,getSnapshot,serverSnapshot);
  const [preview,setPreview] = useState('');
  const [today,zone] = snapshot.split('|');
  const date = preview || today;
  const day = date ? getLiturgicalDay(date) : null;
  const dateLabel = date ? new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US',{timeZone:'UTC',month:'long',day:'numeric',year:'numeric'}) : 'Your local date';
  const year = date?.slice(0,4);
  return <section className="liturgical-banner" aria-labelledby="liturgical-title" data-calendar-date={date || undefined} data-liturgical-color={day?.colors[0] || 'unavailable'}>
    <div className="liturgical-date"><span>{preview ? 'Calendar preview' : 'Today in the Church'}</span><time dateTime={date || undefined}>{dateLabel}</time></div>
    <div className="liturgical-celebration"><h2 id="liturgical-title">{day ? day.celebration : date ? 'Calendar unavailable for this date' : 'The rhythm of the liturgical year'}</h2><p>U.S. Roman Rite · Ascension on Sunday</p></div>
    <div className="liturgical-colors" aria-label="Liturgical color">{day ? day.colors.map(color=><span className="liturgical-color" key={color}><span className="liturgical-swatch" style={{background:bannerColors[color].swatch}} aria-hidden />{bannerColors[color].label}</span>) : <span>{date ? 'Color not verified' : 'Checking your local day'}</span>}</div>
    <details className="liturgical-details"><summary>About this calendar{preview ? ' · return to today' : ''}</summary><div>
      <p>{day?.note || (day?.optionalMemorial ? 'The weekday is shown; an optional memorial may use another color.' : 'The principal celebration is shown. Local calendars and optional celebrations can differ.')}</p>
      <p>Uses your local civil date{zone ? ` (${zone})` : ''}, from midnight to midnight, rather than the evening vigil of the next day. White is shown as an outlined ivory swatch; gold is a site accent, not a separate daily calendar value.</p>
      <p>Reviewed {calendarReviewedOn} for {calendarCoverage.join('–')}. {date && !day ? 'This date has no reviewed cached entry; no color has been guessed. ' : ''}<a href={`https://www.usccb.org/resources/${calendarCoverage.includes(Number(year)) ? year : calendarCoverage[0]}cal.pdf`}>USCCB calendar</a> · <a href="https://www.usccb.org/prayer-and-worship/the-mass/general-instruction-of-the-roman-missal/girm-chapter-6">Color guidance</a> · <a href="https://github.com/Liturgical-Calendar/LiturgicalCalendarAPI">Calendar engine</a> · <a href="/licenses/liturgical-calendar-api.txt">License</a></p>
      <label>Explore another date<input aria-label="Preview calendar date" type="date" value={preview || today || ''} onChange={event=>setPreview(event.target.value)} /></label>{preview && <button type="button" onClick={()=>setPreview('')}>Return to today</button>}
    </div></details>
  </section>;
}
