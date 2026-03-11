import type { CSSProperties } from "react";

export type LiturgicalColor = "white" | "red" | "green" | "violet";

type LiturgicalThemeDefinition = {
  color: LiturgicalColor;
  label: string;
  detail: string;
  cssVars: CSSProperties;
};

const LITURGICAL_THEMES: Record<LiturgicalColor, LiturgicalThemeDefinition> = {
  white: {
    color: "white",
    label: "White",
    detail: "Christmas or Easter celebration",
    cssVars: {
      "--color-navy": "#18212b",
      "--color-navy-light": "#24313d",
      "--color-navy-lighter": "#314250",
      "--color-gold": "#f1e5cf",
      "--color-gold-light": "#fff8eb",
      "--color-cream": "#f7f0e6",
      "--color-cream-dark": "#d6cdbf",
    } as CSSProperties,
  },
  red: {
    color: "red",
    label: "Red",
    detail: "Passion, apostolic, or martyr celebration",
    cssVars: {
      "--color-navy": "#23151a",
      "--color-navy-light": "#342028",
      "--color-navy-lighter": "#482b35",
      "--color-gold": "#cb5a5a",
      "--color-gold-light": "#e89292",
      "--color-cream": "#f7ede8",
      "--color-cream-dark": "#dbc3bb",
    } as CSSProperties,
  },
  green: {
    color: "green",
    label: "Green",
    detail: "Ordinary Time",
    cssVars: {
      "--color-navy": "#12211d",
      "--color-navy-light": "#1c332c",
      "--color-navy-lighter": "#27463c",
      "--color-gold": "#6ca47b",
      "--color-gold-light": "#9acba7",
      "--color-cream": "#edf4ee",
      "--color-cream-dark": "#c2d3c5",
    } as CSSProperties,
  },
  violet: {
    color: "violet",
    label: "Violet",
    detail: "Advent or Lent",
    cssVars: {
      "--color-navy": "#1d1628",
      "--color-navy-light": "#2c223a",
      "--color-navy-lighter": "#3c2d4f",
      "--color-gold": "#9b7ec6",
      "--color-gold-light": "#c8b2e6",
      "--color-cream": "#f2edf7",
      "--color-cream-dark": "#cfc3dd",
    } as CSSProperties,
  },
};

type CelebrationOverride = Pick<
  LiturgicalThemeDefinition,
  "color" | "label" | "detail"
>;

const FIXED_CELEBRATIONS: Record<string, CelebrationOverride> = {
  "01-01": {
    color: "white",
    label: "White",
    detail: "Mary, Mother of God",
  },
  "01-25": {
    color: "white",
    label: "White",
    detail: "Conversion of Saint Paul",
  },
  "02-02": {
    color: "white",
    label: "White",
    detail: "Presentation of the Lord",
  },
  "02-22": {
    color: "white",
    label: "White",
    detail: "Chair of Saint Peter",
  },
  "03-19": {
    color: "white",
    label: "White",
    detail: "Saint Joseph",
  },
  "04-25": {
    color: "red",
    label: "Red",
    detail: "Saint Mark the Evangelist",
  },
  "05-03": {
    color: "red",
    label: "Red",
    detail: "Saints Philip and James",
  },
  "06-11": {
    color: "red",
    label: "Red",
    detail: "Saint Barnabas",
  },
  "06-24": {
    color: "white",
    label: "White",
    detail: "Nativity of Saint John the Baptist",
  },
  "06-29": {
    color: "red",
    label: "Red",
    detail: "Saints Peter and Paul",
  },
  "07-03": {
    color: "red",
    label: "Red",
    detail: "Saint Thomas the Apostle",
  },
  "07-25": {
    color: "red",
    label: "Red",
    detail: "Saint James the Greater",
  },
  "08-15": {
    color: "white",
    label: "White",
    detail: "Assumption of Mary",
  },
  "08-24": {
    color: "red",
    label: "Red",
    detail: "Saint Bartholomew",
  },
  "09-21": {
    color: "red",
    label: "Red",
    detail: "Saint Matthew the Evangelist",
  },
  "09-29": {
    color: "white",
    label: "White",
    detail: "Saints Michael, Gabriel, and Raphael",
  },
  "10-18": {
    color: "red",
    label: "Red",
    detail: "Saint Luke the Evangelist",
  },
  "10-28": {
    color: "red",
    label: "Red",
    detail: "Saints Simon and Jude",
  },
  "11-01": {
    color: "white",
    label: "White",
    detail: "All Saints",
  },
  "11-30": {
    color: "red",
    label: "Red",
    detail: "Saint Andrew the Apostle",
  },
  "12-08": {
    color: "white",
    label: "White",
    detail: "Immaculate Conception",
  },
  "12-25": {
    color: "white",
    label: "White",
    detail: "Christmas",
  },
  "12-26": {
    color: "red",
    label: "Red",
    detail: "Saint Stephen",
  },
  "12-27": {
    color: "white",
    label: "White",
    detail: "Saint John the Evangelist",
  },
  "12-28": {
    color: "red",
    label: "Red",
    detail: "Holy Innocents",
  },
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return startOfDay(copy);
}

function isSameDate(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function isWithin(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function getMonthDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function getSundayOnOrAfter(year: number, month: number, day: number): Date {
  const date = new Date(year, month, day);
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() + 1);
  }
  return startOfDay(date);
}

function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getBaptismOfTheLord(year: number): Date {
  const epiphany = getSundayOnOrAfter(year, 0, 2);
  return epiphany.getDate() >= 7 ? addDays(epiphany, 1) : addDays(epiphany, 7);
}

function getAdventStart(year: number): Date {
  return getSundayOnOrAfter(year, 10, 27);
}

function getCelebrationOverride(date: Date): CelebrationOverride | null {
  const year = date.getFullYear();
  const easter = getEasterSunday(year);
  const palmSunday = addDays(easter, -7);
  const goodFriday = addDays(easter, -2);
  const pentecost = addDays(easter, 49);
  const trinitySunday = addDays(easter, 56);

  if (isSameDate(date, palmSunday)) {
    return {
      color: "red",
      label: "Red",
      detail: "Palm Sunday",
    };
  }

  if (isSameDate(date, goodFriday)) {
    return {
      color: "red",
      label: "Red",
      detail: "Good Friday",
    };
  }

  if (isSameDate(date, pentecost)) {
    return {
      color: "red",
      label: "Red",
      detail: "Pentecost Sunday",
    };
  }

  if (isSameDate(date, trinitySunday)) {
    return {
      color: "white",
      label: "White",
      detail: "Most Holy Trinity",
    };
  }

  return FIXED_CELEBRATIONS[getMonthDayKey(date)] ?? null;
}

export function getLiturgicalTheme(date = new Date()): LiturgicalThemeDefinition {
  const day = startOfDay(date);
  const year = day.getFullYear();
  const easter = getEasterSunday(year);
  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const christmasStart = new Date(year, 11, 25);
  const baptismThisYear = getBaptismOfTheLord(year);
  const baptismNextYear = getBaptismOfTheLord(year + 1);
  const adventStart = getAdventStart(year);
  const christmasEnd = day >= christmasStart ? baptismNextYear : baptismThisYear;
  const override = getCelebrationOverride(day);

  if (override) {
    const theme = LITURGICAL_THEMES[override.color];
    return {
      ...theme,
      label: override.label,
      detail: override.detail,
    };
  }

  if (
    (day >= christmasStart && day <= christmasEnd)
    || isWithin(day, new Date(year - 1, 11, 25), baptismThisYear)
  ) {
    return LITURGICAL_THEMES.white;
  }

  if (isWithin(day, ashWednesday, addDays(easter, -1))) {
    return LITURGICAL_THEMES.violet;
  }

  if (isWithin(day, easter, pentecost)) {
    return LITURGICAL_THEMES.white;
  }

  if (isWithin(day, adventStart, new Date(year, 11, 24))) {
    return LITURGICAL_THEMES.violet;
  }

  return LITURGICAL_THEMES.green;
}

export function getMillisecondsUntilNextMidnight(date = new Date()): number {
  const nextMidnight = new Date(date);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - date.getTime();
}
