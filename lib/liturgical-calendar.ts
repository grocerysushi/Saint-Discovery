import data from './data/liturgical-calendar.json';

export type LiturgicalColor = 'white' | 'red' | 'green' | 'violet' | 'rose' | 'black';
export interface LiturgicalDay { celebration:string; eventKey:string; colors:LiturgicalColor[]; note?:string; optionalMemorial:boolean }
export const calendarCoverage = data.coverage;
export const calendarReviewedOn = data.reviewedOn;
export function civilDateKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function validCivilDate(value:string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function getLiturgicalDay(date:string, days:Record<string,LiturgicalDay> = data.days as Record<string,LiturgicalDay>): LiturgicalDay | null {
  return validCivilDate(date) ? days[date] ?? null : null;
}
export { millisecondsUntilLocalMidnight } from './calendar-date';
export const bannerColors:Record<LiturgicalColor,{swatch:string;label:string}> = {
  white:{swatch:'#fffdf7',label:'White'}, green:{swatch:'#236145',label:'Green'},
  violet:{swatch:'#67428b',label:'Violet'}, red:{swatch:'#a1323c',label:'Red'},
  rose:{swatch:'#be607c',label:'Rose (optional)'}, black:{swatch:'#292522',label:'Black'},
};
