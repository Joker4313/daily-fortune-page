// src/services/tianapi.ts
const TIANAPI_BASE_URL = "https://apis.tianapi.com";
const API_KEY = import.meta.env.VITE_TIANAPI_KEY;

export interface HoroscopeItem {
    type: string;
    content: string;
    date?: string; // Date from API response
}

export interface TianApiLuanrResult {
    fitness: string;
    taboo: string;
    // Add other fields if needed from API
}

export interface TianApiHoroscopeResult {
    list: HoroscopeItem[];
    // Add other fields if needed
}

interface TianApiBaseResponse {
    code: number;
    msg: string;
}

export interface TianApiLunarResponse extends TianApiBaseResponse {
    result?: TianApiLuanrResult;
}

export interface TianApiHoroscopeResponse extends TianApiBaseResponse {
    result?: TianApiHoroscopeResult;
}

export const fetchTianApiLunar = async (dateString: string): Promise<TianApiLunarResponse> => {
    const response = await fetch(
        `https://apis.tianapi.com/lunar/index?key=${API_KEY}&date=${dateString}`
    );
    return response.json();
};

export const fetchTianApiHoroscope = async (astroEng: string, dateString: string): Promise<TianApiHoroscopeResponse> => {
    // 将星座名转为小写，确保符合API要求
    const astroLower = astroEng.toLowerCase();
    const response = await fetch(
        `https://apis.tianapi.com/star/index?key=${API_KEY}&astro=${astroLower}&date=${dateString}`
    );
    return response.json();
};

// --- Dictum (Famous Quote) API ---
export interface DictumItem {
  id: number; // Though the example shows 'id' at the top level, the list structure implies it's per item
  content: string;
  mrname: string;
}

export interface TianApiDictumResponse {
  code: number;
  msg: string;
  result: {
    list: DictumItem[];
  };
}

export const fetchRandomQuote = async (
  apiKey: string
): Promise<TianApiDictumResponse> => {
  const url = `${TIANAPI_BASE_URL}/dictum/index?key=${apiKey}&num=1`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json() as Promise<TianApiDictumResponse>;
}; 