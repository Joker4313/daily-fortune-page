// import { famousQuotes } from '@/constants'; // This line will be removed

export interface ConstellationInfo {
  name: string;
  eng: string;
  start: [number, number];
  end: [number, number];
}

export const CONSTELLATIONS_LIST: ConstellationInfo[] = [
  { name: "白羊座", eng: "Aries", start: [3, 21], end: [4, 19] },
  { name: "金牛座", eng: "Taurus", start: [4, 20], end: [5, 20] },
  { name: "双子座", eng: "Gemini", start: [5, 21], end: [6, 21] },
  { name: "巨蟹座", eng: "Cancer", start: [6, 22], end: [7, 22] },
  { name: "狮子座", eng: "Leo", start: [7, 23], end: [8, 22] },
  { name: "处女座", eng: "Virgo", start: [8, 23], end: [9, 22] },
  { name: "天秤座", eng: "Libra", start: [9, 23], end: [10, 23] },
  { name: "天蝎座", eng: "Scorpio", start: [10, 24], end: [11, 22] },
  { name: "射手座", eng: "Sagittarius", start: [11, 23], end: [12, 21] },
  { name: "摩羯座", eng: "Capricorn", start: [12, 22], end: [1, 19] },
  { name: "水瓶座", eng: "Aquarius", start: [1, 20], end: [2, 18] },
  { name: "双鱼座", eng: "Pisces", start: [2, 19], end: [3, 20] },
];

/**
 * Gets constellation information based on month and day.
 * @param month Month (1-12)
 * @param day Day of the month
 * @returns ConstellationInfo object or a default if not found.
 */
export const getConstellation = (month: number, day: number): ConstellationInfo => {
  if (CONSTELLATIONS_LIST.length === 0) {
    console.error("CONSTELLATIONS_LIST is empty.");
    return { name: "未知", eng: "Unknown", start: [0,0], end: [0,0] }; 
  }

  for (const cons of CONSTELLATIONS_LIST) {
    const { start, end } = cons;
    if (start[0] === end[0]) {
      if (month === start[0] && day >= start[1] && day <= end[1]) {
        return cons;
      }
    } else if (start[0] < end[0]) {
      if ((month === start[0] && day >= start[1]) || 
        (month === end[0] && day <= end[1]) || 
        (month > start[0] && month < end[0])) {
        return cons;
      }
    } else {
      if ((month === start[0] && day >= start[1]) ||
        (month === end[0] && day <= end[1])) {
        return cons;
      }
    }
  }
  console.warn(`No constellation found for M${month} D${day}, returning default.`);
  return CONSTELLATIONS_LIST[0]; 
};

// The getRandomQuote function below will be removed.
/*
export const getRandomQuote = (day: number) => {
    // Simple logic: use the day of the month to pick a quote
    // This ensures the quote changes daily but is consistent for the same day
    const index = day % famousQuotes.length; // famousQuotes was in constants.ts
    return famousQuotes[index];
};
*/ 