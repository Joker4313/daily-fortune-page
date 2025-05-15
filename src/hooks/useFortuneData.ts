// src/hooks/useFortuneData.ts
import { useState, useEffect, useCallback } from 'react';
import { CACHE_EXPIRY_DURATION } from '@/constants';
import { CONSTELLATIONS_LIST, getConstellation, type ConstellationInfo } from '@/lib/fortuneUtils';
import { fetchRandomQuote, type DictumItem } from '@/services/tianapi.ts';

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Types for Cache and Hook State ---
export interface CachedHoroscopeData {
    name: string;
    content: string;
    apiForecastDate: string;
}

export interface AllHoroscopesData {
    [constellationEng: string]: CachedHoroscopeData | undefined;
}

interface LunarFortuneData {
    text: string;
    error?: string;
}

interface QuoteCacheData {
    quote: DictumItem;
    fetchDate: string;
}

interface UseFortuneDataReturn {
    lunarFortuneData: LunarFortuneData | null;
    allHoroscopesData: AllHoroscopesData | null;
    selectedHoroscopeDetail: CachedHoroscopeData | null;
    isLoadingInitial: boolean; 
    isRetryingSingle: boolean; 
    error: string | null; 
    selectedAstroEng: string;
    setSelectedAstroEng: (eng: string) => void;
    retrySingleSelectedHoroscope: () => Promise<void>;
    getInitialConstellationByDate: (month: number, day: number) => ConstellationInfo;
    quoteData: DictumItem | null;
    isLoadingQuote: boolean;
}

const DEFAULT_ASTRO_ENG = CONSTELLATIONS_LIST[0].eng; // Default to first to avoid issues if list is short

export const useFortuneData = (): UseFortuneDataReturn => {
    const [lunarFortuneData, setLunarFortuneData] = useState<LunarFortuneData | null>(null);
    const [allHoroscopesData, setAllHoroscopesData] = useState<AllHoroscopesData | null>(null);
    const [selectedAstroEng, setSelectedAstroEngState] = useState<string>(DEFAULT_ASTRO_ENG);
    const [selectedHoroscopeDetail, setSelectedHoroscopeDetail] = useState<CachedHoroscopeData | null>(null);

    const [isLoadingLunar, setIsLoadingLunar] = useState<boolean>(true);
    const [isLoadingAllHoroscopes, setIsLoadingAllHoroscopes] = useState<boolean>(true);
    const [isRetryingSingle, setIsRetryingSingle] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [quoteData, setQuoteData] = useState<DictumItem | null>(null);
    const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(true);

    const getTodayDateString = useCallback(() => {
        const today = new Date();
        return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`;
    }, []);

    const processLunarData = useCallback(async () => {
        setIsLoadingLunar(true);
        try {
            const response = await fetch('/api/lunar');
            const data = await response.json();

            if (response.ok) {
                setLunarFortuneData({ text: data.text });
            } else {
                const errorMsg = `农历运势获取失败: ${data.error || '未知错误'}`;
                setLunarFortuneData({ text: errorMsg, error: errorMsg });
            }
        } catch (err) {
            console.error("Error processing lunar data:", err);
            const errorMsg = "农历运势加载出错";
            setLunarFortuneData({ text: errorMsg, error: errorMsg });
            setError("无法加载农历数据");
        } finally {
            setIsLoadingLunar(false);
        }
    }, []);

    const processAllHoroscopes = useCallback(async () => {
        setIsLoadingAllHoroscopes(true);
        setError(null);
        try {
            const response = await fetch('/api/horoscopes');
            const data: AllHoroscopesData = await response.json();

            if (response.ok) {
                setAllHoroscopesData(data);
            } else {
                const errorMsg = (data as any).error || `星座运势获取失败 (HTTP ${response.status})`;
                console.error("Error fetching all horoscopes:", errorMsg);
                setError(prev => prev ? `${prev}\\n${errorMsg}` : errorMsg);
                setAllHoroscopesData(null);
            }
        } catch (err) {
            console.error("Error processing all horoscopes:", err);
            const errorMsg = "星座运势加载出错 (网络或其他客户端错误)";
            setError(prev => prev ? `${prev}\\n${errorMsg}` : errorMsg);
            setAllHoroscopesData(null);
        } finally {
            setIsLoadingAllHoroscopes(false);
        }
    }, []);

    const retrySingleSelectedHoroscope = useCallback(async () => {
        console.log("Retrying all horoscopes due to single selected horoscope retry request.");
        setIsRetryingSingle(true);
        await processAllHoroscopes();
        setIsRetryingSingle(false);
    }, [processAllHoroscopes]);
    
    const setSelectedAstroEngCallback = useCallback((eng: string) => {
        setSelectedAstroEngState(eng);
    }, []);

    const getInitialConstellationByDateCallback = useCallback((month: number, day: number) => {
        return getConstellation(month, day);
    }, []);

    const fetchAndCacheDailyQuote = useCallback(async () => {
        setIsLoadingQuote(true);

        try {
            const response = await fetch('/api/quote');
            const data: DictumItem | { error: string } = await response.json();

            if (response.ok) {
                if (!('error' in data)) {
                    setQuoteData(data as DictumItem);
                } else {
                    const errorDetail = (data as { error: string }).error || '获取名言响应格式错误';
                    console.error("Failed to fetch quote (unexpected format with ok status):", errorDetail);
                    setQuoteData({ id: 0, content: "今日名言加载异样，请稍后再试。", mrname:"系统提示"});
                    setError(prev => prev ? `${prev}\\n名言加载异样: ${errorDetail}` : `名言加载异样: ${errorDetail}`);
                }
            } else {
                const errorDetail = (data as { error: string }).error || `名言获取API失败 (HTTP ${response.status})`;
                console.error("Failed to fetch quote:", errorDetail);
                setQuoteData({ id: 0, content: "今日名言加载失败，请稍后再试。", mrname:"系统提示"});
                setError(prev => prev ? `${prev}\\n名言加载失败: ${errorDetail}` : `名言加载失败: ${errorDetail}`);
            }
        } catch (err: any) {
            console.error("Error fetching daily quote:", err);
            const errorMsg = (err as Error).message || "网络请求错误";
            setQuoteData({ id: 0, content: "名言加载出错，请检查网络。", mrname:"系统提示"});
            setError(prev => prev ? `${prev}\\n名言加载出错: ${errorMsg}` : `名言加载出错: ${errorMsg}`);
        } finally {
            setIsLoadingQuote(false);
        }
    }, []);

    useEffect(() => {
        if (import.meta.env.VITE_TIANAPI_KEY) {
            processLunarData();
            processAllHoroscopes();
            fetchAndCacheDailyQuote();
        } else {
            setError("服务未正确配置或API Key缺失。部分功能可能无法使用。");
            setIsLoadingLunar(false);
            setIsLoadingAllHoroscopes(false);
            setIsLoadingQuote(false);
            setLunarFortuneData({ text: "服务未配置，无法加载农历运势", error: "服务未配置" });
            const todayStr = getTodayDateString();
            setAllHoroscopesData(CONSTELLATIONS_LIST.reduce((acc, astro) => {
                acc[astro.eng] = { name: astro.name, content: "服务未配置", apiForecastDate: todayStr };
                return acc;
            }, {} as AllHoroscopesData));
            setQuoteData({ id: 0, content: "服务未配置，无法加载名言", mrname: "系统提示" });
        }
    }, [processLunarData, processAllHoroscopes, fetchAndCacheDailyQuote, getTodayDateString]);

    useEffect(() => {
        if (allHoroscopesData && selectedAstroEng) {
            const matchedData = allHoroscopesData[selectedAstroEng];
            if (matchedData) {
                setSelectedHoroscopeDetail(matchedData);
            } else {
                const currentAstroInfo = CONSTELLATIONS_LIST.find(c => c.eng === selectedAstroEng);
                setSelectedHoroscopeDetail({
                    name: currentAstroInfo ? currentAstroInfo.name : selectedAstroEng,
                    content: "当前星座数据未能加载。",
                    apiForecastDate: getTodayDateString()
                });
            }
        } else {
            setSelectedHoroscopeDetail(null);
        }
    }, [selectedAstroEng, allHoroscopesData, getTodayDateString]);

    const isLoadingInitial = isLoadingLunar || (isLoadingAllHoroscopes && !allHoroscopesData) || (isLoadingQuote && !quoteData);

    return {
        lunarFortuneData,
        allHoroscopesData,
        selectedHoroscopeDetail,
        isLoadingInitial,
        isRetryingSingle,
        error,
        selectedAstroEng,
        setSelectedAstroEng: setSelectedAstroEngCallback,
        retrySingleSelectedHoroscope,
        getInitialConstellationByDate: getInitialConstellationByDateCallback,
        quoteData,
        isLoadingQuote,
    };
}; 